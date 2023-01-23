import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import BarChart from './components/BarChart';

import CompanyLogo from "./assets/pro-logo.jpg"

import TabsUI from './components/Tabs';


const ZOHO = window.ZOHO;

function App() {
  const [initialized, setInitialized] = useState(false) // initialize the widget
  const [currentUser, setCurrentUser] = useState() // owner of the deals

  const [salesGoalOwners, setSalesGoalOwners] = useState() // gets all the sales goal owners by name and id

  useEffect(() => { // initialize the app
    ZOHO.embeddedApp.on("PageLoad", function (data) { 
      setInitialized(true)
    });

    ZOHO.embeddedApp.init()
  }, [])

  useEffect(() => { // gets all data
    const fetchData = async () => {
      if(initialized) {
        const currentUserResp = await ZOHO.CRM.CONFIG.getCurrentUser(); // getting the full name and id for current user
        setCurrentUser({
          currentUserId: currentUserResp?.users?.[0]?.id,
          currentUserName: currentUserResp?.users?.[0]?.full_name,
        })

        const conn_name = "zoho_crm_conn";
        let req_sales_owners_data = {
          parameters: {
            select_query:
              `select Owner.id, Name from Sales_Goals where (Name != 'Company' and Year = ${new Date().getFullYear()})`,
          },
          method: "POST",
          url: "https://www.zohoapis.com/crm/v4/coql",
          param_type: 2,
        }

        const salesOwnersResp = await ZOHO.CRM.CONNECTION.invoke(conn_name, req_sales_owners_data) // gets name and id for all the users with sales goals
        console.log({salesOwnersResp})
        setSalesGoalOwners(salesOwnersResp?.details?.statusMessage?.data)
        // console.log(salesOwnersResp?.details?.statusMessage?.data)
      }
    }

    fetchData()

  }, [initialized])


  
  if(initialized){
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          p: "1rem"
        }}
      >
        <Box // top logo and text
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: "2rem",
            pb: "1.5rem"
          }}
        >
          <Box>
            <img src={CompanyLogo} alt="logo" width="130px" height="70px" />
          </Box>
  
          <Typography variant='h4' sx={{  // top title
            textAlign: "center",
            fontWeight: "bold",
            mb: "1.5rem",
          }}>
            Account Exectutive's Insights & Planning
          </Typography>
        </Box>
  
        <TabsUI 
          salesGoalOwners={salesGoalOwners}
        />
      </Box>
    )
  } else {
    return (
      <h1>Loading...</h1>
    )
  }
}

export default App;
