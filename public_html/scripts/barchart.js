/*jslint browser: true, unused: false*/
/*global d3 */

/**
 * Wraps d3 text elemnt
 * @param  {[type]} text  d3 node
 * @param  {[type]} width 
 * @return {[type]}       returns nothing, appends tspans to text-node
 */
function wrap(text, width) {
  text.each(function() {

    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr('y'),
        dy = parseFloat(text.attr('dy')),
        tspan = text.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em');

    while (words.length) {
      word = words.pop();
      line.push(word);
      tspan.text(line.join(' '));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(' '));
        line = [word];
        tspan = text.append('tspan').attr('x', 0).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
      }
    }

  });
}

/**
 * [barchart description]
 * @param  {[type]} input [description]
 * @return {[type]}       [description]
 */
function barchart(input, limit){

  var data = input.slice(0, limit-1);

  var margin = {top: 40, right: 80, bottom: 40, left: 20},
      width = 600 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom,
      viewBox = '0 0 600 400';

  // color scale
  var colorScale = d3.scale.quantile()
          .domain(data.map(function(d) { return d.score; }))
          .range(['#ffffb2', '#fecc5c', '#fd8d3c', '#f03b20', '#bd0026']); // http://colorbrewer2.org/?type=sequential&scheme=YlOrRd&n=5

  // quantitative scale for x-axis
  var x = d3.scale.linear()
      .range([0, width]);

  // ordinal scale for y-axis
  var y = d3.scale.ordinal()
      .rangeRoundBands([0, height], 0.2);

  // graph X axis for quanttitative values
  var xAxis = d3.svg.axis()
      .scale(x)
      .orient('bottom')
      .ticks(10);

  // graph Y axis for ordinal values
  var yAxis = d3.svg.axis()
      .scale(y)
      .orient('left');

  // create SVG object

  var svg = d3.select('.chart').append('svg')
      // .attr('width', width + margin.left + margin.right)
      // .attr('height', height + margin.top + margin.bottom)
      .attr('viewBox', viewBox)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


    // force int ??!
    data.forEach(function(d) {
      d.score = +d.score;
      d.value = +d.value;
    });

    // sort ascending
    data.sort(
      function(a, b) { return a.rank - b.rank; }
      );

    // map quantative domain (the minimum and maximum value) to the x scale
    // x.domain([0, 100]);
    x.domain([0, d3.max(data, function(d) { return d.value; })]);

    // map ordinal domain (names) to the y scale
    y.domain(data.map(function(d) { return d.rank; }));

    // paint the x axis
    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)
      .append('text')
        .attr('transform', 'translate(' + (width+50) + ', 0)')
        .attr('y', 0)
        .attr('dy', 0)
        .attr('text-anchor','middle')
        .attr('class', 'label label--x')
        .text('FSI-verdi')
        .call(wrap, 60);

    // paint the y axis
    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis)
      .append('text')
        .attr('y', 0)
        .attr('dy', -10)
        .attr('text-anchor','middle')
        .attr('class', 'label label--y')
        .text('Plassering');

    // paint the bars
    svg.selectAll('.bar')
        .data(data)
        .enter()
          .append('rect')
            .attr('class', 'bar')
            .style('fill', function(d) { return colorScale(d.score); })
            .attr('y', function(d) { return y(d.rank); })
            .attr('height', y.rangeBand())
            .attr('x', 2)
            .attr('width', function(d) { return x(d.value); });


    // add the labels
    svg.selectAll('.text')
        .data(data)
        .enter()
          .append('text')
            .text(function(d) {return d.jurisdiction; })
            .attr('x', function(d) { return (x(d.value)+10); })
            .attr('y', function(d) { return y(d.rank); })
            .attr('dy', y.rangeBand()/1.8)
            .attr('class', 'label');

}