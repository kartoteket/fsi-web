/*jslint browser: true, unused: false*/
/*global d3 */

/********************************** */
// D3 (testing)
/********************************** */

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
function barchart(input){

  var margin = {top: 40, right: 80, bottom: 30, left: 40},
      width = 600 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

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
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // load data
  d3.tsv(input, function(error, data) {

    if (error) {
      throw error;
    }

    // force int ??!
    data.forEach(function(d) {
      d.score = +d.score;
    });

    // sort ascending
    data.sort(
      function(a, b) { return b.score - a.score; }
      );

  // console.log(data);

    // map quantative domain (the minimum and maximum value) to the x scale
    x.domain([0, 100 /*d3.max(data, function(d) { return d.score; })*/]);

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
        .text('Secrecy Score')
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
        .text('FSI Rank');

    // paint the bars
    svg.selectAll('.bar')
        .data(data)
        .enter()
          .append('rect')
            .attr('class', 'bar')
            .attr('y', function(d) { return y(d.rank); })
            .attr('height', '1em')
            // .attr('x', function(d) { return x(d.score); })
            // .attr('width', function(d) { return width - x(d.score); });
            .attr('x', 2)
            .attr('width', function(d) { return x(d.score); });


    // add the labels
    svg.selectAll('.text')
        .data(data)
        .enter()
          .append('text')
            .text(function(d) {return d.country; })
            .attr('x', function(d) { return (x(d.score)+10); })
            .attr('y', function(d) { return y(d.rank); })
            .attr('dy', y.rangeBand())
            .attr('class', 'label');

  });
}