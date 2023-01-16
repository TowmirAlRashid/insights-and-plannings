import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useEffect, useState } from 'react';


const ZOHO = window.ZOHO;

function App() {
  const [initialized, setInitialized] = useState(false) // initialize the widget
  const [currentUser, setCurrentUser] = useState() // owner of the deals
  const [currentUserSalesInfo, setCurrentUserSalesInfo] = useState() // get the current user's sales goal info

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


  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        p: "1rem"
      }}
    >
      <Typography variant='h4' sx={{  // top title
        textAlign: "center",
        fontWeight: "bold",
        mb: "1.5rem"
      }}>
        Account Exectutive's Insights & Planning
      </Typography>

      <Typography variant='h5' sx={{  // top title
        fontWeight: "bold",
        mb: "1.2rem",
        ml: "1.5rem"
      }}>
        Performance & Goal Snapshot
      </Typography>
      {/* {(currentUserSalesInfo?.[`${getCurrentMonth()}_Actual`] / currentUserSalesInfo?.[getCurrentMonth()])} */}

      <Box
        sx={{
          width: "70%",
          mb: "1.5rem",
          ml: "1.5rem"
        }}
      >
        <TableContainer>
          <Table sx={{
            width: "100%"
          }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Account Owner</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Month Goal</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Year Goal</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Month Actual</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Year Actual</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              <TableRow>
                <TableCell>{currentUser?.currentUserName}</TableCell>
                <TableCell>{formatter.format(currentUserSalesInfo?.[getCurrentMonth()])}</TableCell>
                <TableCell>{formatter.format(currentUserSalesInfo?.Annual)}</TableCell>
                <TableCell>{formatter.format(currentUserSalesInfo?.[`${getCurrentMonth()}_Actual`])}</TableCell>
                <TableCell>{formatter.format(currentUserSalesInfo?.Annual_Actuals)}</TableCell>
              </TableRow>
            </TableBody>

            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>% Month Goal</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>% Year Goal</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>MTD Goal</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>YTD Goal</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>MTD PERF</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>YTD PERF</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              <TableRow>
                <TableCell>{`${((currentUserSalesInfo?.[`${getCurrentMonth()}_Actual`] / currentUserSalesInfo?.[getCurrentMonth()]) * 100).toFixed(0)}%`}</TableCell>
                <TableCell>{`${((currentUserSalesInfo?.Annual_Actuals / currentUserSalesInfo?.Annual) * 100).toFixed(0)}%`}</TableCell>
                <TableCell>{formatter.format(monthlyDatewiseTarget())}</TableCell>
                <TableCell>{formatter.format(yearlyTargetToDate())}</TableCell>
                <TableCell sx={{ color: `${currentUserSalesInfo?.[`${getCurrentMonth()}_Actual`] / monthlyDatewiseTarget() < 1 ? "red" : "green"}`}}>{`${((currentUserSalesInfo?.[`${getCurrentMonth()}_Actual`] / monthlyDatewiseTarget()) * 100).toFixed(0)}%`}</TableCell>
                <TableCell sx={{ color: `${currentUserSalesInfo?.Annual_Actuals / yearlyTargetToDate() < 1 ? "red" : "green"}`}}>{`${((currentUserSalesInfo?.Annual_Actuals / yearlyTargetToDate()) * 100).toFixed(0)}%`}</TableCell>
              </TableRow>
            </TableBody>

            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Project Close</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Project Total</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Project Perf</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              <TableRow>
                <TableCell>{formatter.format(55000)}</TableCell>
                <TableCell>{formatter.format(100000)}</TableCell>
                <TableCell sx={{ color: `${55000 / 100000 < 1 ? "red" : "green"}`}}>{`${((55000 / 100000) * 100).toFixed(0)}%`}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Typography variant='h5' sx={{  // top title
        fontWeight: "bold",
        mb: "1.2rem",
        ml: "1.5rem"
      }}>
        Potential Sales
      </Typography>
    </Box>
  );
}

export default App;
