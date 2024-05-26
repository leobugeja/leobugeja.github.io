// Work in progress

// set the dimensions and margins of the graph

function importData() {
  let input = document.createElement('input');
  input.type = 'file';
  input.onchange = _ => {
    // you can use this method to get file and perform respective operations
            let file = input.files[0];

            // let lines = data.split('\n');  
            // lines.forEach(function(line, lineNo) { 
            const reader = new FileReader();
            reader.readAsText(file);

            reader.onload = function() {
              console.log(reader.result);
              let dist_func = calc_calorie_dist_chart('calorie-distribution-uploaded');
              dist_func(reader.result);
            };
          
            reader.onerror = function() {
              console.log(reader.error);
            };
        };
  
  input.click();
}

function getTimeBucket(time, num_buckets) {
  const t = time.split(' ');
  const t2 = t[0].split(':');
  let hours = parseFloat(t2[0]);
  let minutes = hours * 60 + parseFloat(t2[1]);
  const isEvening = (t[1] == 'PM') && (hours != 12);
  if (isEvening) {
    minutes += 12 * 60;
  }
  let x = parseInt(num_buckets * minutes / (24 * 60));
  return x;
}

function getBucketTime(encoded_time, num_buckets) {
  let minutes = parseInt(1440 * (encoded_time/num_buckets) % 60).toString();
  let hours = parseInt(24 * (encoded_time/num_buckets)).toString(); 
  minutes = minutes.padStart(2, '0');
  hours = hours.padStart(2, '0');
  return `${hours}:${minutes}`;
}

function getCalorieDensityBucket(calorie_fraction, num_buckets) {
  if (calorie_fraction == 1) {
    return num_buckets - 1;
  }
  return parseInt(calorie_fraction * num_buckets);
}

function createDayEmptyBuckets(num_buckets, default_value) {
  buckets = {};
  for (let d = 0; d < num_buckets; d++) {
    buckets[d] = structuredClone(default_value);
  }
  return buckets;
}

function cumulativeAdd(bucket_dict, start_offset) {
  for (const day in bucket_dict) {
    let bucket_len = Object.keys(bucket_dict[day]).length;
    for (let t = 1; t < bucket_len; t++) {
      curr = (start_offset + t) % bucket_len;
      prev = (start_offset + t - 1) % bucket_len;
      bucket_dict[day][curr] += bucket_dict[day][prev];
    }
  }
  return bucket_dict;
}

function normalizeByDay(bucket_dict, start_offset) {
  for (const day in bucket_dict) {
    day_total = bucket_dict[day][start_offset-1];

    for (let t = 0; t < Object.keys(bucket_dict[day]).length; t++) {
      bucket_dict[day][t] /= day_total;
    }
  }   

  return bucket_dict;
}

function timeCalorieDensity(bucket_dict, num_time_buckets, num_calorie_buckets) {
  empty_calorie_buckets = {}
  for (let i = 0; i < num_calorie_buckets; i++) {
    empty_calorie_buckets[i] = 0;
  }

  let density_dict = createDayEmptyBuckets(num_time_buckets, empty_calorie_buckets)

  let num_days = Object.keys(bucket_dict).length;
  for (const day in bucket_dict) {
    for (const [t, time_fraction] of Object.entries(bucket_dict[day])) {
      calorie_fraction = getCalorieDensityBucket(time_fraction, num_calorie_buckets);
      density_dict[t][calorie_fraction] += 1;
    }
  }

  return density_dict
}

function convertToHeatmapFormat(bucket_dict, start_offset, num_time_buckets) {
  let heatmap_data = [];
  for (const time in bucket_dict) {
    for (const [cal_bucket, calorie_fraction] of Object.entries(bucket_dict[time])) {
      let x_pos = ((parseInt(time) - start_offset) % num_time_buckets + num_time_buckets) % num_time_buckets;
      heatmap_data.push([parseInt(x_pos), parseInt(cal_bucket), calorie_fraction]);
    }
  }
  return heatmap_data;
}

function getMeanDensityPerTime(bucket_dict, start_offset, num_time_buckets) {
  let mean_data = [];
  for (const time in bucket_dict) {
    let weighted_sum = 0;
    let record_sum = 0;
    for (const [cal_bucket, calorie_fraction] of Object.entries(bucket_dict[time])) {
      weighted_sum += parseInt(cal_bucket) * calorie_fraction;
      record_sum += parseInt(calorie_fraction);
    }
    weighted_sum /= record_sum;
    // weighted_sum -= 0.05;
    // weighted_sum /= 1;
    let x_pos = ((parseInt(time) - start_offset) % num_time_buckets + num_time_buckets) % num_time_buckets;
    mean_data.push([parseInt(x_pos), weighted_sum]);
  }
  mean_data.sort((a, b) => a[0] - b[0]);
  return mean_data;
}

let options = {
  chart: {
      marginTop: 40,
      marginBottom: 80,
      backgroundColor: "#eceff1",
  },
  title: {
      text: null
  },
  xAxis: {
    categories: [],
    tickInterval: 4
  },
  yAxis: {
      title: {
          text: 'Daily Calorie Intake (%)'
      },
      categories: [],
      tickInterval: 2
  },
  series: [],
  credits: { enabled: false },
  legend: { enabled: false },
  colorAxis: {
    min: 0,
    // minColor: '#FFFFFF',
    // maxColor: Highcharts.getOptions().colors[0]
    stops: [
      [0, '#ffffff'], //white
      [0.1, '#eaf6fb'], 
      [0.5, '#3fb0d9'],
      [1, Highcharts.getOptions().colors[0]] //blue
    ]
  },
  tooltip: {
    format: '<b>{point.value}</b> % chance<br>' +
        '<b>{series.yAxis.categories.(point.y)}</b> % of calories<br>' +
        'eaten by <b>{series.xAxis.categories.(point.x)}</b>'
},
};


Highcharts.ajax({  
  url: '/data/servings.csv',  
  dataType: 'text',
  success: calc_calorie_dist_chart('calorie-distribution'),
  error: function (e, t) {  
      console.error(e, t);  
  },
});

// var chart = Highcharts.chart('calorie-distribution-uploaded', {
//   chart: {
//       type: 'pie'
//   },
//   credits: {
//     enabled: false
//   },
//   title: {
//     text: 'Fruits Distribution'
//   },
//   series: [{
//       name: 'Fruits',
//       data: [['Apple',89], ['Orange',71], ['Banana',16], ['Grapes',12], ['Others',14]]
//   }]
// });

function calc_calorie_dist_chart(chart_div_name) {
  return (data) => {
    let dict = {};
    let num_time_buckets = 96;
    let num_calorie_buckets = 20;

    let x_categories = []
    let y_categories = []
    let calorie_field_index = 0;
    let date_field_index = 0;
    let time_field_index = 0;

    let lines = data.split('\n');  
    lines.forEach(function(line, lineNo) { 
      let items = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);  
        
      // header line containes categories  
      if (lineNo == 0) {  
          items.forEach((item, item_num) => {
              // if (itemNo > 0) options.xAxis.categories.push(item);
              if (item == "Energy (kcal)") {
                calorie_field_index = item_num;
              } else if (item == "Day") {
                date_field_index = item_num;
              } else if (item == "Time") {
                time_field_index = item_num;
              }
          });  
      }  
        
      // the rest of the lines contain data with their name in the first position  
      if (lineNo > 0 && items !== null) {  
        let cal = parseFloat(items[calorie_field_index]);
        let day = items[date_field_index];
        let time = items[time_field_index];

        if (!isNaN(cal)) {      
          bucket = getTimeBucket(time, num_time_buckets);
          if (!(day in dict)) { 
            dict[day] = createDayEmptyBuckets(num_time_buckets, 0);
          }
          dict[day][bucket] += cal;
        }
      }
    });

    let start_offset = getTimeBucket("04:00", num_time_buckets);
    let cumulative_dict = cumulativeAdd(dict, start_offset);
    let normalized_dict = normalizeByDay(cumulative_dict, start_offset);
    let time_calorie_density = timeCalorieDensity(normalized_dict, num_time_buckets, num_calorie_buckets);
    let heatmap_data = convertToHeatmapFormat(time_calorie_density, start_offset, num_time_buckets);
    let mean_line_data = getMeanDensityPerTime(time_calorie_density, start_offset, num_time_buckets);


    for (let x = 0; x < num_time_buckets; x++) {
      let time_mod = (parseInt(x) + start_offset) % num_time_buckets;
      x_categories.push(getBucketTime(time_mod, num_time_buckets));
    }

    for (let y = 0; y <= num_calorie_buckets; y++) {
      y_categories.push(y / num_calorie_buckets);
    }

    options.xAxis.categories = x_categories;
    options.yAxis.categories = y_categories;


    let heatmap_series = {   
      type: 'heatmap',
      data: heatmap_data,
      turboThreshold: 5000,
    };

    let line_series = {
      lineWidth: 3,
      lineColor: '#707070',
      type: 'spline',
      data: mean_line_data
    };

    options.series.push(heatmap_series);  
    options.series.push(line_series);  
        
    Highcharts.chart(chart_div_name, options);
  }
}