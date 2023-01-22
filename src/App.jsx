import { Box, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import BarChart from './components/BarChart';

import Logo from "./assets/user-thumbnail.png"
import CompanyLogo from "./assets/pro-logo.jpg"

import TabsUI from './components/Tabs';


const ZOHO = window.ZOHO;

function App() {
  const [initialized, setInitialized] = useState(false) // initialize the widget
  const [currentUser, setCurrentUser] = useState() // owner of the deals
  const [currentUserSalesInfo, setCurrentUserSalesInfo] = useState() // get the current user's sales goal info
  const [currentUserDeals, setCurrentUserDeals] = useState() // gets all the deals of the current user

  const [salesGoalOwners, setSalesGoalOwners] = useState() // gets all the sales goal owners by name and id

  useEffect(() => { // initialize the app
    ZOHO.embeddedApp.on("PageLoad", function (data) { 
      setInitialized(true)
    });

    ZOHO.embeddedApp.init()
  }, [])

  // const todayFormat = () => { //current day in "yyyy-mm-dd" format
  //   let date = new Date()
  //   let year = date.getFullYear()
  //   let month = date.getMonth()
  //   let days = date.getDate()
  //   return `${year}-${month + 1 < 10 ? `0${month + 1}` : month + 1}-${days < 10 ? `0${days}` : days}`;
  // }

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
        setSalesGoalOwners(salesOwnersResp?.details?.statusMessage?.data)
        console.log(salesOwnersResp?.details?.statusMessage?.data)

        
        let req_data_goals = {
          parameters: {
            select_query:
              `select id, Annual, Annual_Actuals, Apr, Apr_Actual, Aug, Aug_Actual, Dec, Dec_Actual, Feb, Feb_Actual, Jan, Jan_Actual, Jul, Jul_Actual, Jun, Jun_Actual, Mar, Mar_Actual, May, May_Actual, Nov, Nov_Actual, Oct, Oct_Actual, Sep, Sep_Actual from Sales_Goals where (Owner = '${currentUserResp?.users?.[0]?.id}')`,
          },
          method: "POST",
          url: "https://www.zohoapis.com/crm/v4/coql",
          param_type: 2,
        }

        const staticDataResp = await ZOHO.CRM.CONNECTION.invoke(conn_name, req_data_goals) // target goals module values collected
        setCurrentUserSalesInfo(staticDataResp?.details?.statusMessage?.data?.[0])

        let current_user = "2728756000175227017"; // fixed for now

        let req_data_deals = { 
          parameters: {
            select_query:
              `select id, Deal_Name, Account_Name, Account_Name.Account_Name, Amount, Probability, Potential_Close, Last_Follow_Up_Date, Next_Step from Deals where (Owner = '${current_user}')`,
          },
          method: "POST",
          url: "https://www.zohoapis.com/crm/v4/coql",
          param_type: 2,
        }

        const dealsResp = await ZOHO.CRM.CONNECTION.invoke(conn_name, req_data_deals) // target deals collected
        setCurrentUserDeals(dealsResp?.details?.statusMessage?.data)
      }
    }

    fetchData()

  }, [initialized])

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

  const formatter = new Intl.NumberFormat('en-US', { // js formatter for currency
    style: 'currency',
    currency: 'USD',
  });

  const monthlyDatewiseTarget = () => { // gets the dynamic target goal amount for days passed in this month till today
    let monthTarget = currentUserSalesInfo?.[getCurrentMonth()];
    let currentMonth = new Date().getMonth()
    let totalDaysOfThisMonthInNumber = new Date(new Date().getFullYear(), currentMonth, 0).getDate()
    let currentDaysOfThisMonth = new Date().getDate()

    let currentTarget = (monthTarget / totalDaysOfThisMonthInNumber) * currentDaysOfThisMonth;

    return currentTarget;
  }

  const getTotalForPreviousMonths = (currentMonth = new Date().getMonth()) => { // gets the total goal for the previous months of the current year
    let totalForPreviousMonths = 0; 
    switch(currentMonth){
      case 0: totalForPreviousMonths += 0; break;
      case 1: totalForPreviousMonths += currentUser?.Jan; break;
      case 2: totalForPreviousMonths += currentUser?.Jan + currentUser?.Feb; break;
      case 3: totalForPreviousMonths += currentUser?.Jan + currentUser?.Feb + currentUser?.Mar; break;
      case 4: totalForPreviousMonths += currentUser?.Jan + currentUser?.Feb + currentUser?.Mar + currentUser?.Apr; break;
      case 5: totalForPreviousMonths += currentUser?.Jan + currentUser?.Feb + currentUser?.Mar + currentUser?.Apr + currentUser?.May; break;
      case 6: totalForPreviousMonths += currentUser?.Jan + currentUser?.Feb + currentUser?.Mar + currentUser?.Apr + currentUser?.May + currentUser?.Jun; break;
      case 7: totalForPreviousMonths += currentUser?.Jan + currentUser?.Feb + currentUser?.Mar + currentUser?.Apr + currentUser?.May + currentUser?.Jun + currentUser?.Jul; break;
      case 8: totalForPreviousMonths += currentUser?.Jan + currentUser?.Feb + currentUser?.Mar + currentUser?.Apr + currentUser?.May + currentUser?.Jun + currentUser?.Jul + currentUser?.Aug; break;
      case 9: totalForPreviousMonths += currentUser?.Jan + currentUser?.Feb + currentUser?.Mar + currentUser?.Apr + currentUser?.May + currentUser?.Jun + currentUser?.Jul + currentUser?.Aug + currentUser?.Sep; break;
      case 10: totalForPreviousMonths += currentUser?.Jan + currentUser?.Feb + currentUser?.Mar + currentUser?.Apr + currentUser?.May + currentUser?.Jun + currentUser?.Jul + currentUser?.Aug + currentUser?.Sep + currentUser?.Oct; break;
      default: totalForPreviousMonths += currentUser?.Jan + currentUser?.Feb + currentUser?.Mar + currentUser?.Apr + currentUser?.May + currentUser?.Jun + currentUser?.Jul + currentUser?.Aug + currentUser?.Sep + currentUser?.Oct + currentUser?.Nov; 
    }

    return totalForPreviousMonths;
  }

  const yearlyTargetToDate = () => { // gets the total goal for the current month including the total goal of the previous months of the current year
    let targetToDateForCurrentMonth  = currentUserSalesInfo?.[getCurrentMonth()] * (monthlyDatewiseTarget() / currentUserSalesInfo?.[getCurrentMonth()]); // gets the date wise target for the current month
    let targetToDateForPreviousMonths = getTotalForPreviousMonths()

    return targetToDateForCurrentMonth + targetToDateForPreviousMonths;
  }

  const columns = [ // custom columns for the top 10 deals
    {
      field: 'Deal_Name',
      headerName: 'Deal name',
      flex: 2.5,
    },
    {
      field: 'Account_Name.Account_Name',
      headerName: 'Account',
      flex: 2,
    },
    {
      field: 'Amount',
      headerName: 'Amount',
      renderCell: (params) => (
        <Typography sx={{ fontSize: "small", color: "green" }}>
            {formatter.format(params.value)}
        </Typography>
      ),
      flex: 1
    },
    {
      field: 'Probability',
      headerName: 'Probability',
      renderCell: (params) => (
        <Typography sx={{ fontSize: "small" }}>
            {formatter.format(params.value)}
        </Typography>
      ),
      flex: 1
    },
    {
      field: 'Potential_Close',
      headerName: 'Potential',
      flex: 1
    },
    {
      field: 'Last_Follow_Up_Date',
      headerName: 'Last Contact',
      renderCell: (params) => (
        <Box>
            <Typography fontSize="small" sx={{ color: `${(params.value === null ||  (((new Date() - new Date(params.value)) / (1000 * 60 * 60 * 24)) > 45)) ? "red" : "black"}` }}>
                {params.value === null ? "Needs Update" : params.value}
            </Typography>
        </Box>
      ),
      flex:1
    },
    {
      field: 'Next_Step',
      headerName: 'Next Activity',
      flex: 1
    }
  ];


  
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

      {
        <TabsUI 
          salesGoalOwners={salesGoalOwners}
        />
      }

      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          flexDirection: "row",
          // flexWrap: "wrap",
          gap: 1
        }}
      >
        <Box
          sx={{
            width: {
              xl: "22%",
              lg: "22%",
              md: "48%"
            },
            // backgroundColor: "yellowgreen",s
            // overflow: "auto"
          }}
        >
          <Typography variant='h5' sx={{  // top title
            fontWeight: "bold",
            mb: "1.2rem",
            ml: "1.5rem",
            mt: "1rem"
          }}>
            Performance & Goal Snapshot
          </Typography>

          <Box
            sx={{
              width: "92%",
              mb: "1.5rem",
              ml: "1.5rem"
            }}
          >
            <TableContainer>
              <Table sx={{
                width: "100%"
              }}>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", padding: "8px 10px" }}>{currentUser?.currentUserName}</TableCell>
                    <TableCell sx={{ fontWeight: "bold", padding: "8px 10px" }}>Month Goal</TableCell>
                    <TableCell sx={{ fontWeight: "bold", padding: "8px 10px" }}>Year Goal</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell sx={{ padding: "8px 10px" }} rowSpan={5}>
                      <img 
                        src={Logo}
                        alt="user logo"
                        style={{ width: "100%" }}
                      />
                    </TableCell>
                    <TableCell sx={{ padding: "8px 10px", fontSize: "1.1rem" }}>{formatter.format(currentUserSalesInfo?.[getCurrentMonth()])}</TableCell>
                    <TableCell sx={{ padding: "8px 10px", fontSize: "1.1rem" }}>{formatter.format(currentUserSalesInfo?.Annual)}</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", padding: "8px 10px" }}>Month Actual</TableCell>
                    <TableCell sx={{ fontWeight: "bold", padding: "8px 10px" }}>Year Actual</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell sx={{ padding: "8px 10px", fontSize: "1.1rem" }}>{formatter.format(currentUserSalesInfo?.[`${getCurrentMonth()}_Actual`])}</TableCell>
                    <TableCell sx={{ padding: "8px 10px", fontSize: "1.1rem" }}>{formatter.format(currentUserSalesInfo?.Annual_Actuals)}</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", padding: "8px 10px" }}>% Month Goal</TableCell>
                    <TableCell sx={{ fontWeight: "bold", padding: "8px 10px" }}>% Year Goal</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell sx={{ padding: "8px 10px", fontSize: "1.1rem" }}>{`${((currentUserSalesInfo?.[`${getCurrentMonth()}_Actual`] / currentUserSalesInfo?.[getCurrentMonth()]) * 100).toFixed(0)}%`}</TableCell>
                    <TableCell sx={{ padding: "8px 10px", fontSize: "1.1rem" }}>{`${((currentUserSalesInfo?.Annual_Actuals / currentUserSalesInfo?.Annual) * 100).toFixed(0)}%`}</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", padding: "8px 10px" }}>Month Rank</TableCell>
                    <TableCell sx={{ fontWeight: "bold", padding: "8px 10px" }}>MTD Goal</TableCell>
                    <TableCell sx={{ fontWeight: "bold", padding: "8px 10px" }}>YTD Goal</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell sx={{ padding: "8px 10px", fontSize: "1.1rem" }}>1</TableCell>
                    <TableCell sx={{ padding: "8px 10px", fontSize: "1.1rem" }}>{formatter.format(monthlyDatewiseTarget())}</TableCell>
                    <TableCell sx={{ padding: "8px 10px", fontSize: "1.1rem" }}>{formatter.format(yearlyTargetToDate())}</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", padding: "8px 10px" }}>Year Rank</TableCell>
                    <TableCell sx={{ fontWeight: "bold", padding: "8px 10px" }}>MTD PERF</TableCell>
                    <TableCell sx={{ fontWeight: "bold", padding: "8px 10px" }}>YTD PERF</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell sx={{ padding: "8px 10px", fontSize: "1.1rem" }}>{2}</TableCell>
                    <TableCell sx={{ color: `${currentUserSalesInfo?.[`${getCurrentMonth()}_Actual`] / monthlyDatewiseTarget() < 1 ? "red" : "green"}`, padding: "8px 10px", fontSize: "1.1rem"}}>{`${((currentUserSalesInfo?.[`${getCurrentMonth()}_Actual`] / monthlyDatewiseTarget()) * 100).toFixed(0)}%`}</TableCell>
                    <TableCell sx={{ color: `${currentUserSalesInfo?.Annual_Actuals / yearlyTargetToDate() < 1 ? "red" : "green"}`, padding: "8px 10px", fontSize: "1.1rem" }}>{`${((currentUserSalesInfo?.Annual_Actuals / yearlyTargetToDate()) * 100).toFixed(0)}%`}</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", padding: "8px 10px" }}>Project Close</TableCell>
                    <TableCell sx={{ fontWeight: "bold", padding: "8px 10px" }}>Project Total</TableCell>
                    <TableCell sx={{ fontWeight: "bold", padding: "8px 10px" }}>Project Perf</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell sx={{ padding: "8px 10px", fontSize: "1.1rem" }}>{formatter.format(55000)}</TableCell>
                    <TableCell sx={{ padding: "8px 10px", fontSize: "1.1rem" }}>{formatter.format(100000)}</TableCell>
                    <TableCell sx={{ color: `${55000 / 100000 < 1 ? "red" : "green"}`, padding: "8px 10px", fontSize: "1.1rem" }}>{`${((55000 / 100000) * 100).toFixed(0)}%`}</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", padding: "8px 10px" }}>Daily Close</TableCell>
                    <TableCell sx={{ padding: "8px 10px", fontSize: "1.1rem" }}>{formatter.format(5000)}</TableCell>
                    <TableCell sx={{ fontWeight: "bold", padding: "8px 10px" }}>Total</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>

        <Box
          sx={{
            width: "50%",
            backgroundColor: "rgba(250, 250, 250, 0.9)",
            // overflow: "auto"
          }}
        >
          <Typography variant='h5' sx={{  // top title
            fontWeight: "bold",
            mb: "1.2rem",
            ml: "1.5rem",
            mt: "1rem"
          }}>
            Potential Sales
          </Typography>

          {/* <Box
            sx={{
              width: "96%",
              mb: "1.5rem",
              ml: "1.5rem",
              height: `calc(111px + ${10 * 42}px)`
            }}
          >
            <DataGrid
              rows={currentUserDeals}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10]}
              disableSelectionOnClick
              rowHeight={42}
            />
          </Box> */}
        </Box>

        <Box
          sx={{
            width: {
              xl: "27%",
              lg: "27%",
              md: "50%",
            },
            // backgroundColor: "navajowhite",
            overflow: "auto",
          }}
        >
          <Typography variant='h5' sx={{  // top title
            fontWeight: "bold",
            mb: "1.2rem",
            ml: "1.5rem"
          }}>
            Graph of Performance
          </Typography>

          <Box
            sx={{
              width: "94%",
              mb: "1.5rem",
              ml: "1.5rem",
              mt: "1rem"
            }}
          >
            <BarChart />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default App;
