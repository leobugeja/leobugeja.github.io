/* global Highcharts */

// put legend on top of the chart
var bodyWeightHistoryChart = Highcharts.chart('body-weight-history', {
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

Highcharts.ajax({
   url: '/data/body_weight_article/bodyweight.csv',  
   dataType: 'text',
   success: function (data) {  
      var lines = data.split('\n');  
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
      Highcharts.charts[0].addSeries({  
         name: 'Measured Body Weight',  
         data: seriesData,  
         // Add kg suffix to y axis labels
         tooltip: { valueSuffix: ' kg' },
         marker: {
            enabled: true,
            radius: 3,
            symbol: 'circle'
         },
         lineWidth: 0,
         color: 'rgba(124, 125, 125, 0.7)'
      });  
   },
   error: function (e, t) {  
      console.error(e, t);  
   }
});



// set chart x axis limit from Jan 2024 to May 2024
bodyWeightHistoryChart.xAxis[0].setExtremes(Date.UTC(2024, 0, 1), Date.UTC(2024, 4, 31));

// import from data/netcalories.csv its in format dd/mm/yyyy,netcalories
// Calculate the day by day calories i.e. sum the current day net calories to all the previous day net calories
// Then convert this sum of net calories to a weight in kg and plot on the same chart
Highcharts.ajax({
   url: '/data/body_weight_article/netcalories.csv',  
   dataType: 'text',
   success: function (data) {  
      var lines = data.split('\n');
      var seriesData = [];
      // on first day of plot the start weight should be the first weight 63.5kg
      var totalCalories = 0;  
      var initialWeight = 68; // Starting weight in kg
      for (var i = 1; i < lines.length; i++) {  
         var parts = lines[i].split(',');  
         if (parts.length === 2) {  
            var dateParts = parts[0].split('/');  
            var date = Date.UTC(dateParts[2], dateParts[1] - 1, dateParts[0]); // Convert to UTC timestamp
            var netCalories = parseFloat(parts[1]);  
            totalCalories += netCalories;  
            // Convert net calories to weight change in kg (assuming 7700 calories per kg)
            var weightChange = totalCalories / 7700;  
            seriesData.push([date, initialWeight + weightChange]);  
         }  
      }
      bodyWeightHistoryChart.addSeries({  
         name: 'Energy Balance Weight Prediction',  
         data: seriesData,  
         tooltip: {
            valueSuffix: ' kg',
            pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y:.2f} kg</b><br/>'
         },
         lineWidth: 4,
         color: 'rgba(255, 99, 71, 0.8)'
      });  
   },
   error: function (e, t) {  
      console.error(e, t);  
   }
});