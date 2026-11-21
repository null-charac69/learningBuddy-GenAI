


import React from 'react';

import { Line } from 'react-chartjs-2';

import {

  Chart as ChartJS,

  CategoryScale,

  LinearScale,

  PointElement,

  LineElement,

  Title,

  Tooltip,

  Legend,

} from 'chart.js';



ChartJS.register(

  CategoryScale,

  LinearScale,

  PointElement,

  LineElement,

  Title,

  Tooltip,

  Legend

);



const ProgressChart = ({ data }) => {

  const chartData = {

    labels: data.map(item => item.topic),

    datasets: [

      {

        label: 'Quiz Scores',

        data: data.map(item => item.score),

        fill: false,

        borderColor: '#4F46E5',

        tension: 0.1,

      },

    ],

  };



  const options = {

    scales: {

      y: {

        ticks: {

          color: 'white',

        }

      },

      x: {

        ticks: {

          color: 'white',

        }

      }

    },

    plugins: {

      legend: {

        labels: {

          color: 'white'

        }

      }

    }

  };



  return <Line data={chartData} options={options} />;

};



export default ProgressChart;
