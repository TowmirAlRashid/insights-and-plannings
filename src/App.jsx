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

  const [monthRank, setMonthRank] = useState()
  const [yearRank, setYearRank] = useState()

  useEffect(() => { // initialize the app
    ZOHO.embeddedApp.on("PageLoad", function (data) { 
      setInitialized(true)
    });

    ZOHO.embeddedApp.init()
  }, [])

  const getCurrentMonth = () => { // get the current month in string value
    const date = new Date()

    switch(date.getMonth()){
        case 0: return 'Jan';
        case 1: return 'Feb';
        case 2: return 'Mar';
        case 3: return 'Apr';
        case 4: return 'May';
        case 5: return 'Jun';
        case 6: return 'Jul';
        case 7: return 'Aug';
        case 8: return 'Sep';
        case 9: return 'Oct';
        case 10: return 'Nov';
        default: return 'Dec'
    }
}

  useEffect(() => { // gets all data
    const fetchData = async () => {
      if(initialized) {
        const salesOwnersResp = await ZOHO.CRM.API.getAllRecords({Entity:"Sales_Goals",sort_order:"asc",per_page:200,page:1}) // gets name and id for all the users with sales goals
        setSalesGoalOwnersUnfiltered(salesOwnersResp?.data)
        const userSalesGoals = (salesOwnersResp?.data?.filter(sales => sales?.Name !== "Company" && sales?.Year === (new Date().getFullYear()).toString()))
        setSalesGoalOwners(userSalesGoals)

        const monthlyRank = salesGoalOwners?.sort((sales1, sales2) => sales2?.[`${getCurrentMonth()}_Actual`] - sales1?.[`${getCurrentMonth()}_Actual`]).map(sales => sales?.Owner?.name)
        setMonthRank(monthlyRank)

        const yearlyRank = salesGoalOwners?.sort((sales1, sales2) => sales2?.Annual_Actuals - sales1?.Annual_Actuals).map(sales => sales?.Owner?.name)
        setYearRank(yearlyRank)
      }
    }

    fetchData()

  }, [initialized])

  // console.log(salesGoalOwners)

  
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
          monthRank={monthRank}
          yearRank={yearRank}
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
