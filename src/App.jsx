import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import BarChart from './components/BarChart';

import CompanyLogo from "./assets/pro-logo.jpg"

import TabsUI from './components/Tabs';


const ZOHO = window.ZOHO;

function App() {
  const [initialized, setInitialized] = useState(false) // initialize the widget

  const [salesGoalOwners, setSalesGoalOwners] = useState() // gets all the sales goal owners by name and id
  const [salesGoalOwnersUnfiltered, setSalesGoalOwnersUnfiltered] = useState() // gets all the sales goal owners by name and id

  useEffect(() => { // initialize the app
    ZOHO.embeddedApp.on("PageLoad", function (data) { 
      setInitialized(true)
    });

    ZOHO.embeddedApp.init()
  }, [])

  useEffect(() => { // gets all data
    const fetchData = async () => {
      if(initialized) {
        const salesOwnersResp = await ZOHO.CRM.API.getAllRecords({Entity:"Sales_Goals",sort_order:"asc",per_page:200,page:1}) // gets name and id for all the users with sales goals
        setSalesGoalOwnersUnfiltered(salesOwnersResp?.data)
        const userSalesGoals = (salesOwnersResp?.data?.filter(sales => sales?.Name !== "Company" && sales?.Year === (new Date().getFullYear()).toString()))
        setSalesGoalOwners(userSalesGoals)
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
          salesGoalOwnersUnfiltered={salesGoalOwnersUnfiltered}
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
