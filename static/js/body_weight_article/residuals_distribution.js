/* global Highcharts */
Highcharts.ajax({
   url: '/data/body_weight_article/residuals.csv', // FIXED: use the correct CSV file
   dataType: 'csv',
   success: function(data) {
      // Parse the CSV residuals from /data/body_weight_article/residuals.csv
      var residuals = [];
      var lines = data.split('\n');
      for (var idx = 1; idx < lines.length; idx++) { // use idx instead of i
         var parts = lines[idx].split(',');
         if (parts.length === 2) {
            residuals.push(parseFloat(parts[1]));
         }
      }

      // Create the histogram data
      var minRange = -1.25;
      var maxRange = 1.25;
      var binSize = 0.25 / 4;
      var numBins = Math.ceil((maxRange - minRange) / binSize);
      var histogramData = [];
      for (var bin = 0; bin < numBins; bin++) {
         histogramData.push({
            x: minRange + (bin + 0.5) * binSize, // bin center
            y: 0
         });
      }
      for (var resIdx = 0; resIdx < residuals.length; resIdx++) {
         var binIndex = Math.floor((residuals[resIdx] - minRange) / binSize);
         if (binIndex >= 0 && binIndex < histogramData.length) {
            histogramData[binIndex].y++;
         }
      }
      // Calculate the mean and standard deviation of the residuals
      var mean = residuals.reduce((a, b) => a + b, 0) / residuals.length;
      var stdDev = Math.sqrt(residuals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / residuals.length);

      // Generate normal distribution curve data
      var normalData = [];
      var totalCount = residuals.length;
      for (var n = 0; n < 200; n++) {
         var x = minRange + (n / 199) * (maxRange - minRange);
         // Normal PDF
         var y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
         // Scale to histogram frequency
         y = y * binSize * totalCount;
         normalData.push([x, y]);
      }

      // Add the histogram data and normal curve to the chart
      Highcharts.chart('residuals-distribution', {
         chart: {
            backgroundColor: 'transparent',
            type: 'column',
         },
         title: false,
         legend: {
            enabled: true,
            labelFormatter: function() {
               if (this.name === 'Normal Distribution') {
                  return 'Normal Distribution<br>μ = ' + mean.toFixed(2) + ' kg, σ = ' + stdDev.toFixed(2) + ' kg';
               }
               if (this.name === 'Residuals') {
                  return 'Residuals Histogram <br>n = ' + totalCount;
               }
               return this.name;
            }
         },
         xAxis: {
            title: {
               text: 'Daily Weight Fluctuation (kg)'
            },
            labels: {
               format: '{value} kg'
            },
         },
         yAxis: {
            title: {
               text: 'Frequency'
            },
         },
         series: [
            {
               name: 'Residuals',
               type: 'column',
               data: histogramData,
               color: '#7cb5ec',
               pointRange: binSize,
            },
            {
               name: 'Normal Distribution',
               type: 'spline',
               data: normalData,
               color: 'rgba(124, 125, 125, 0.9)',
               marker: { enabled: false },
               enableMouseTracking: false,
               grouping: false,
            }
         ],
         tooltip: {
            formatter: function() {
               if (this.series.name === 'Residuals') {
                  return '<b>Residual:</b> ' + this.x.toFixed(2) + '<br/>' +
                        '<b>Frequency:</b> ' + this.y;
               } else {
                  return false;
               }
            }
         },
         plotOptions: {
            column: {
               borderWidth: 1,
               shadow: false,
               borderRadius: 0,
               groupPadding: 0,
               pointPadding: 0,
            },
            spline: {
               lineWidth: 4,
               states: {
                  hover: {
                     lineWidth: 2
                  }
               },
               grouping: false,
            }
         },
         credits: {
            enabled: false
         },
      });
   }
});