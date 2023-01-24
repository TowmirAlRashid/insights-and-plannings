import { Box } from '@mui/material'
import React from 'react'

import Chart from 'chart.js/auto';
import { Bar } from 'react-chartjs-2'

const BarChart = ({ currentUserSalesInfo, lastYearDecActual }) => {
    const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const data = {
    labels: labels,
    datasets: [
        {
        label: 'Goal',
        data: [currentUserSalesInfo?.Jan, currentUserSalesInfo?.Feb, currentUserSalesInfo?.Mar, currentUserSalesInfo?.Apr, currentUserSalesInfo?.May, currentUserSalesInfo?.Jun, currentUserSalesInfo?.Jul, currentUserSalesInfo?.Aug, currentUserSalesInfo?.Sep, currentUserSalesInfo?.Oct, currentUserSalesInfo?.Nov, currentUserSalesInfo?.Dec],
        borderColor: "blue",
        backgroundColor: "blue",
        },
        {
        label: 'Actual',
        data: [currentUserSalesInfo?.Jan_Actual, currentUserSalesInfo?.Feb_Actual, currentUserSalesInfo?.Mar_Actual, currentUserSalesInfo?.Apr_Actual, currentUserSalesInfo?.May_Actual, currentUserSalesInfo?.Jun_Actual, currentUserSalesInfo?.Jul_Actual, currentUserSalesInfo?.Aug_Actual, currentUserSalesInfo?.Sep_Actual, currentUserSalesInfo?.Oct_Actual, currentUserSalesInfo?.Nov_Actual, currentUserSalesInfo?.Dec_Actual],
        borderColor: "green",
        backgroundColor: "green",
        },
        {
        label: 'Previous',
        data: [lastYearDecActual?.Jan_Actual, lastYearDecActual?.Feb_Actual, lastYearDecActual?.Mar_Actual, lastYearDecActual?.Apr_Actual, lastYearDecActual?.May_Actual, lastYearDecActual?.jun_Actual, lastYearDecActual?.Jul_Actual, lastYearDecActual?.Aug_Actual, lastYearDecActual?.Sep_Actual, lastYearDecActual?.Oct_Actual, lastYearDecActual?.Nov_Actual, lastYearDecActual?.Dec_Actual],
        borderColor: "yellow",
        backgroundColor: "yellow",
        },
    ]
    };

  return (
    <Box
        sx={{
            width: "100%",
            height: "540px",
        }}
    >
        <Bar 
            data={data}
            options={{
                title:{
                    display:true,
                    text:'Monthly Performance',
                    fontSize:20
                },
                maintainAspectRatio: false,
                legend:{
                    display:true,
                    position:'bottom'
                },
                scales: {
                    xAxes: [
                      {
                        stacked: true,
                        barPercentage: 0.2,
                      },
                    ],
                    yAxes: [
                      {
                        stacked: true,
                        barPercentage: 0.2,
                      },
                    ],
                  },
            }}
        />
    </Box>
  )
}

export default BarChart