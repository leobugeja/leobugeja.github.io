/* global Highcharts */
import { Slider } from '/js/range_slider.js';

// put legend on top of the chart
var movingAverageChart = Highcharts.chart('body-weight-moving-average', {
   chart: {
      type: 'line',
      marginBottom: 100,
      backgroundColor: 'transparent',
   },
   title: {
      text: null
   },
   xAxis: {
      type: 'datetime',
      // dateTimeLabelFormats: { day: '%e %b' },
      // tickInterval: 28 * 24 * 3600 * 1000
   },
   yAxis: {
      title: {
         text: 'Body Weight',
      },
      labels: {
         format: '{value} kg',
      },
   },
   series: [],
   credits: { enabled: false },
   legend: {
      enabled: true,
      position: 'top',
   },
});

let rawSeriesData = []; // Store the raw data for re-use
let lastMovingAverageDays = 14; // Default value

function calculateMovingAverage(data, days) { // data in format [value]
   if (!data.length || days < 1) return [];
   let result = [];
   for (let i = 0; i < data.length; i++) {
      if (i < days - 1) {
         result.push([data[i][0], null]);
         continue;
      }
      let sum = 0;
      for (let j = i - days + 1; j <= i; j++) {
         sum += data[j][1];
      }
      let avg = sum / days;
      result.push([data[i][0], parseFloat(avg.toFixed(2))]);
   }
   return result;
}

function plotMovingAverageHistory(movingAverageData, movingAverageDays = lastMovingAverageDays) {
   lastMovingAverageDays = movingAverageDays;
   var lines = movingAverageData.split('\n');
   var seriesData = [];
   for (var i = 1; i < lines.length; i++) {
      var parts = lines[i].split(',');
      if (parts.length === 2) {
         var dateParts = parts[0].split('/');
         var date = Date.UTC(dateParts[2], dateParts[1] - 1, dateParts[0]); // Convert to UTC timestamp
         var weight = parseFloat(parts[1]);
         seriesData.push([date, weight]);
      }
   }
   rawSeriesData = seriesData; // Save for slider updates

   // Remove existing series
   while (movingAverageChart.series.length > 0) {
      movingAverageChart.series[0].remove(false);
   }

   // Add measured data
   movingAverageChart.addSeries({
      name: 'Measured Body Weight',
      data: seriesData,
      tooltip: { valueSuffix: ' kg' },
      marker: {
         enabled: true,
         radius: 3,
         symbol: 'circle'
      },
      lineWidth: 0,
      color: 'rgba(124, 125, 125, 0.7)'
   }, false);

   // Calculate and add moving average
   const movingAvgData = calculateMovingAverage(seriesData, movingAverageDays);
   movingAverageChart.addSeries({
      name: `${movingAverageDays}-Day Moving Average`,
      data: movingAvgData,
      tooltip: { valueSuffix: ' kg' },
      marker: {
         enabled: false,
         radius: 3,
         symbol: 'circle'
      },
      lineWidth: 4,
      color: 'rgba(255, 99, 71, 0.8)'
   }, false);

   movingAverageChart.redraw();
}

// For initial load, fetch CSV and plot
Highcharts.ajax({
   url: '/data/body_weight_article/bodyweight.csv',
   dataType: 'text',
   success: function (csv) {
      plotMovingAverageHistory(csv, lastMovingAverageDays);
   },
   error: function (e, t) {
      console.error(e, t);
   }
});

let lastSliderValue = lastMovingAverageDays; // Track last integer value used

// Slider callback to update moving average
new Slider('moving_day_average', 
   function (days) {
      if (rawSeriesData.length === 0) return;
      // Round days to nearest integer
      days = Math.round(days);
      // Only update if the value changed
      if (days === lastSliderValue) return;
      lastSliderValue = days;
      // Only remove the moving average series (assume it's always the last series)
      if (movingAverageChart.series.length > 1) {
         movingAverageChart.series[movingAverageChart.series.length - 1].remove(false);
      }
      // Add new moving average
      const movingAvgData = calculateMovingAverage(rawSeriesData, days);
      movingAverageChart.addSeries({
         name: `${days}-Day Moving Average`,
         data: movingAvgData,
         tooltip: { valueSuffix: ' kg' },
         marker: {
            enabled: false,
            radius: 3,
            symbol: 'circle'
         },
         lineWidth: 4,
         color: 'rgba(255, 99, 71, 0.8)'
      }, false);
      movingAverageChart.redraw();
   },
   lastMovingAverageDays,
   2,
   30
);

// set chart x axis limit from Jan 2024 to May 2024
movingAverageChart.xAxis[0].setExtremes(Date.UTC(2024, 0, 1), Date.UTC(2024, 4, 31));