/* global Highcharts */
import { Slider } from '/js/range_slider.js';

// MSE optimization chart
var mseChart = Highcharts.chart('mse-optimisation', {
   chart: {
      type: 'spline',
      marginBottom: 100,
      backgroundColor: 'transparent',
   },
   title: {
      text: null
   },
   subtitle: {
      text: 'Use slider below to adjust calorie deficit/surplus'
   },
   xAxis: {
      title: {
         text: null
      },
      min: 1,
      max: 90,
      labels: {
         format: '{value} days',
      }
   },
   yAxis: {
      title: {
         text: 'MSE'
      },
      labels: {
         enabled: false
      },
      lineColor: '#000000',
      lineWidth: 1
   },
   series: [],
   credits: { enabled: false },
   legend: {
      enabled: true,
      position: 'top',
   },
   tooltip: {
      formatter: function() {
         return '<b>Days:</b> ' + this.x + ' days<br/>' +
                '<b>MSE:</b> ' + this.y.toFixed(4) + ' kg²<br/>' +
                '<b>Calorie Deficit/Surplus:</b> ' + currentCdeficit + ' cal/day';
      }
   }
});

let currentCdeficit = 250; // Default value

// Function to calculate MSE for given days and calorie deficit
function calculateMSE(days, cdeficit) {
   const varianceTerm = Math.pow(0.35 / Math.sqrt(days), 2);
   const biasTerm = Math.pow((days / 2) * cdeficit * 0.00013, 2);
   return varianceTerm + biasTerm;
}

// Function to find minimum MSE and corresponding days
function findMinimumMSE(cdeficit) {
   let minMSE = Infinity;
   let minDays = 1;
   
   // Search through days 1 to 90 (chart range)
   for (let days = 1; days <= 90; days++) {
      const mse = calculateMSE(days, cdeficit);
      if (mse < minMSE) {
         minMSE = mse;
         minDays = days;
      }
   }
   
   return { minMSE, minDays };
}

// Function to plot MSE curve
function plotMSECurve(cdeficit) {
   currentCdeficit = cdeficit;
   
   // Generate data points with high density for early days
   const data = [];
   
   // Very high density for the steepest part (1-4 days) - every 0.25 days
   for (let days = 1; days <= 4; days += 0.25) {
      const mse = calculateMSE(days, cdeficit);
      data.push([days, mse]);
   }
   
   // Lower density for the rest (5-90 days) - every 2 days
   for (let days = 5; days <= 90; days += 2) {
      const mse = calculateMSE(days, cdeficit);
      data.push([days, mse]);
   }
   
   // Find minimum
   const { minMSE, minDays } = findMinimumMSE(cdeficit);
   
   // Remove existing series
   while (mseChart.series.length > 0) {
      mseChart.series[0].remove(false);
   }
   
   // Remove existing annotations
   if (mseChart.annotations && mseChart.annotations.length > 0) {
      mseChart.annotations.forEach(annotation => {
         annotation.destroy();
      });
   }
   
   // Add MSE curve
   mseChart.addSeries({
      name: 'MSE',
      data: data,
      tooltip: { valueSuffix: ' kg²' },
      marker: {
         enabled: false
      },
      lineWidth: 3,
      color: 'rgba(124, 125, 125, 0.8)'
   }, false);
   
   // Add minimum point
   mseChart.addSeries({
      name: `Minimum at ${minDays} days`,
      data: [[minDays, minMSE]],
      tooltip: { valueSuffix: ' kg²' },
      marker: {
         enabled: true,
         radius: 6,
         symbol: 'circle',
         fillColor: 'rgba(255, 99, 71, 1)',
         lineColor: 'rgba(255, 99, 71, 1)',
         lineWidth: 2
      },
      lineWidth: 0,
      color: 'rgba(255, 99, 71, 1)'
   }, false);
   
   // Keep subtitle as static instruction
   mseChart.setTitle(null, { text: 'Use slider below to adjust calorie deficit/surplus' });
   
   mseChart.redraw();
}

// Initialize chart with default value
plotMSECurve(currentCdeficit);

// Slider callback to update calorie deficit
new Slider('cdeficit_slider', 
   function (cdeficit) {
      // Round to nearest integer
      cdeficit = Math.round(cdeficit);
      plotMSECurve(cdeficit);
   },
   currentCdeficit,
   1,
   500
); 