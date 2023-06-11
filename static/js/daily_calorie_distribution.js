
// set the dimensions and margins of the graph

// append the svg object to the body of the page
// 

function getTimeBucket(time, num_buckets) {
  const t = time.split(' ');
  const isEvening = (t[1] == 'PM');
  const t2 = t[0].split(':');
  let minutes = parseFloat(t2[0]) * 60 + parseFloat(t2[1]);
  if (isEvening) {
    minutes += 12 * 60;
  }
  let x = parseInt(num_buckets * minutes / (24 * 60));
  return x;
}

function createDayEmptyBuckets(num_buckets) {
  buckets = {};
  for (let d = 0; d < num_buckets; d++) {
    buckets[d] = 0;
  }
  return buckets;
}

d3.csv("/data/servings.csv", function(data) {
  // for (const row in data) {
  //   console.log(row);
  // }
  var dict = {};
  num_buckets = 24;

  sum = 0;
  for (const i in data) {

    cal = parseFloat(data[i]['Energy (kcal)']);
    day = data[i]['Day'];
    time = data[i]['Time'];
    
    if (!isNaN(cal)) {
      sum += cal;

      bucket = getTimeBucket(time, num_buckets);
      if (!(day in dict)) { 
        dict[day] = createDayEmptyBuckets(num_buckets);
      }
      dict[day][bucket] += cal;
    }

  }
  console.log("Final Sum:")
  console.log(sum);

  console.log("Dict:");
  console.log(dict);
})

var svg2 = d3.select("#calorie-distribution")
            .append("svg")
            .attr("width", 300)
            .attr("height", 200)
            .append("g")
