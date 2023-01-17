import { Box } from '@mui/material'
import React from 'react'

import Chart from 'chart.js/auto';
import { Bar } from 'react-chartjs-2'

const BarChart = () => {
    const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const data = {
    labels: labels,
    datasets: [
        {
        label: 'Goal',
        data: [100, 300, 200, 150, 95, 100, 300, 200, 150, 95, 75, 95],
        borderColor: "blue",
        backgroundColor: "blue",
        },
        {
        label: 'Actual',
        data: [50, 140, 400, 290, 75, 120, 150, 250, 170, 35, 100, 75],
        borderColor: "green",
        backgroundColor: "green",
        },
        {
        label: 'Previous',
        data: [80, 270, 150, 170, 25, 300, 200, 230, 180, 75, 25, 150],
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