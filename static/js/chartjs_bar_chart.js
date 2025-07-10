Chart.defaults.font.family = 'Roboto';

const ctx = document.getElementById('myChart');

new Chart(ctx, {
   type: 'bar',
   data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [{
         label: '# of Votes',
         data: [12, 19, 3, 5, 2, 3],
         borderWidth: 0
      }]
   },
   options: {
      animation: true,
      plugins: {
         legend: {
            display: false
         },
         tooltip: {
            enabled: false
         }
      },
      scales: {
         y: {
            beginAtZero: true
         }
      }
   }
});