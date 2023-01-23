import { Box, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid';
import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'

import Logo from "../assets/user-thumbnail.png";
import BarChart from './BarChart';

const ZOHO = window.ZOHO;



const UserDetails = ({ owner }) => {
    const [currentUserSalesInfo, setCurrentUserSalesInfo] = useState() // get the current user's sales goal info
    const [currentUserDeals, setCurrentUserDeals] = useState() // gets all the deals of the current user

    useEffect(() => {
        const fetchData = async () => {
            const conn_name = "zoho_crm_conn";
            let req_data_goals = {
                parameters: {
                  select_query:
                    `select id, Annual, Annual_Actuals, Apr, Apr_Actual, Aug, Aug_Actual, Dec, Dec_Actual, Feb, Feb_Actual, Jan, Jan_Actual, Jul, Jul_Actual, Jun, Jun_Actual, Mar, Mar_Actual, May, May_Actual, Nov, Nov_Actual, Oct, Oct_Actual, Sep, Sep_Actual from Sales_Goals where (Owner = '${owner?.["Owner.id"]}' and Year = ${new Date().getFullYear()})`,
                },
                method: "POST",
                url: "https://www.zohoapis.com/crm/v4/coql",
                param_type: 2,
              }
      
              const staticDataResp = await ZOHO.CRM.CONNECTION.invoke(conn_name, req_data_goals) // target goals module values collected
              setCurrentUserSalesInfo(staticDataResp?.details?.statusMessage?.data?.[0])


              let req_data_deals = { 
                parameters: {
                  select_query:
                    `select id, Deal_Name, Account_Name, Account_Name.Account_Name, Amount, Probability, Potential_Close, Last_Follow_Up_Date, Next_Step from Deals where ((Owner = '${owner?.["Owner.id"]}' and Potential_Close = 'true') and limit 0, 200)`,
                },
                method: "POST",
                url: "https://www.zohoapis.com/crm/v4/coql",
                param_type: 2,
              }
      
              const dealsResp = await ZOHO.CRM.CONNECTION.invoke(conn_name, req_data_deals) // target deals collected
              console.log(dealsResp)
              setCurrentUserDeals(dealsResp?.details?.statusMessage?.data)
        }

        fetchData()
    }, [owner])

    const formatter = new Intl.NumberFormat('en-US', { // js formatter for currency
        style: 'currency',
        currency: 'USD',
      });

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
        case 1: totalForPreviousMonths += currentUserSalesInfo?.Jan; break;
        case 2: totalForPreviousMonths += currentUserSalesInfo?.Jan + currentUserSalesInfo?.Feb; break;
        case 3: totalForPreviousMonths += currentUserSalesInfo?.Jan + currentUserSalesInfo?.Feb + currentUserSalesInfo?.Mar; break;
        case 4: totalForPreviousMonths += currentUserSalesInfo?.Jan + currentUserSalesInfo?.Feb + currentUserSalesInfo?.Mar + currentUserSalesInfo?.Apr; break;
        case 5: totalForPreviousMonths += currentUserSalesInfo?.Jan + currentUserSalesInfo?.Feb + currentUserSalesInfo?.Mar + currentUserSalesInfo?.Apr + currentUserSalesInfo?.May; break;
        case 6: totalForPreviousMonths += currentUserSalesInfo?.Jan + currentUserSalesInfo?.Feb + currentUserSalesInfo?.Mar + currentUserSalesInfo?.Apr + currentUserSalesInfo?.May + currentUserSalesInfo?.Jun; break;
        case 7: totalForPreviousMonths += currentUserSalesInfo?.Jan + currentUserSalesInfo?.Feb + currentUserSalesInfo?.Mar + currentUserSalesInfo?.Apr + currentUserSalesInfo?.May + currentUserSalesInfo?.Jun + currentUserSalesInfo?.Jul; break;
        case 8: totalForPreviousMonths += currentUserSalesInfo?.Jan + currentUserSalesInfo?.Feb + currentUserSalesInfo?.Mar + currentUserSalesInfo?.Apr + currentUserSalesInfo?.May + currentUserSalesInfo?.Jun + currentUserSalesInfo?.Jul + currentUserSalesInfo?.Aug; break;
        case 9: totalForPreviousMonths += currentUserSalesInfo?.Jan + currentUserSalesInfo?.Feb + currentUserSalesInfo?.Mar + currentUserSalesInfo?.Apr + currentUserSalesInfo?.May + currentUserSalesInfo?.Jun + currentUserSalesInfo?.Jul + currentUserSalesInfo?.Aug + currentUserSalesInfo?.Sep; break;
        case 10: totalForPreviousMonths += currentUserSalesInfo?.Jan + currentUserSalesInfo?.Feb + currentUserSalesInfo?.Mar + currentUserSalesInfo?.Apr + currentUserSalesInfo?.May + currentUserSalesInfo?.Jun + currentUserSalesInfo?.Jul + currentUserSalesInfo?.Aug + currentUserSalesInfo?.Sep + currentUserSalesInfo?.Oct; break;
        default: totalForPreviousMonths += currentUserSalesInfo?.Jan + currentUserSalesInfo?.Feb + currentUserSalesInfo?.Mar + currentUserSalesInfo?.Apr + currentUserSalesInfo?.May + currentUserSalesInfo?.Jun + currentUserSalesInfo?.Jul + currentUserSalesInfo?.Aug + currentUserSalesInfo?.Sep + currentUserSalesInfo?.Oct + currentUserSalesInfo?.Nov; 
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
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            flexDirection: "row",
            gap: 1
        }}
    >
        <Box    // holds the performance and snapshot details
          sx={{
            width: {
              xl: "22%",
              lg: "22%",
              md: "48%"
            },
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

          <Box // holds the left side table
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
                    <TableCell sx={{ fontWeight: "bold", padding: "8px 10px" }}>{owner?.Name}</TableCell>
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

          <Box
            sx={{
              width: "96%",
              mb: "1.5rem",
              ml: "1.5rem",
              height: `calc(111px + ${10 * 42}px)`
            }}
          >
            <DataGrid
              rows={currentUserDeals || []}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10]}
              disableSelectionOnClick
              rowHeight={42}
            />
          </Box>
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
  )
}

export default UserDetails