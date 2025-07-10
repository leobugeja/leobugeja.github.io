/* global d3 */

// set the dimensions and margins of the graph
var margin = {top: 20, right: 0, bottom: 30, left: 40},
   width = 800 - margin.left - margin.right,
   height = 400 - margin.top - margin.bottom;

function responsive(svg) {
   const container = d3.select(svg.node().parentNode),
      width = parseInt(svg.style('width'), 10),
      height = parseInt(svg.style('height'), 10),
      aspect = width / height;

   svg.attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMinYMid')
      .call(resize);

   d3.select(window).on('resize.' + container.attr('id'), resize);

   function resize() {
      const w = parseInt(container.style('width'));
      svg.attr('width', w);
      svg.attr('height', Math.round(w / aspect));

   }
}

// append the svg object to the body of the page
var svg = d3.select('#my_dataviz')
   .append('svg')
   .attr('width', width + margin.left + margin.right)
   .attr('height', height + margin.top + margin.bottom)
   .call(responsive) // this is all it takes to make the chart responsive
   .append('g')
   .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    

//Read the data
d3.csv('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/heatmap_data.csv', function(data) {

   // Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
   var myGroups = d3.map(data, function(d){return d.group;}).keys()
   var myVars = d3.map(data, function(d){return d.variable;}).keys()

   // Build X scales and axis:
   var x = d3.scaleBand()
      .range([ 0, width ])
      .domain(myGroups)
      .padding(0.03);
   svg.append('g')
      .style('font-size', 22)
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x).tickSize(0))
      .select('.domain').remove()

   // Build Y scales and axis:
   var y = d3.scaleBand()
      .range([ height, 0 ])
      .domain(myVars)
      .padding(0.06);
   svg.append('g')
      .style('font-size', 22)
      .call(d3.axisLeft(y).tickSize(0))
      .select('.domain').remove()

   // Build color scale
   var myColor = d3.scaleSequential()
      .interpolator(d3.interpolateBrBG)
      .domain([1,100])

   // Three function that change the tooltip when user hover / move / leave a cell
   var mouseover = function(d) {
      d3.select(this)
      //   .style("stroke", "black")
         .style('opacity', 0.7)
   }

   var mouseleave = function(d) {
      d3.select(this)
         .style('stroke', 'none')
         .style('opacity', 1)
   }

   // add the squares
   svg.selectAll()
      .data(data, function(d) {return d.group+':'+d.variable;})
      .enter()
      .append('rect')
      .attr('x', function(d) { return x(d.group) })
      .attr('y', function(d) { return y(d.variable) })
   //   .attr("rx", 4)
   //   .attr("ry", 4)
      .attr('width', x.bandwidth() )
      .attr('height', y.bandwidth() )
      .style('fill', function(d) { return myColor(d.value)} )
      .style('stroke-width', 3)
      .style('stroke', 'none')
      .style('opacity', 1)
      .on('mouseover', mouseover)
      .on('mouseleave', mouseleave)
})


