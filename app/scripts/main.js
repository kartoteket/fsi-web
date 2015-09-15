/*jslint browser: true*/
/*global L, Ractive, Slides, _, d3 */

  'use strict';

  // Leaflet
  L.Icon.Default.imagePath = 'images/';

  /********************************** */
  /* create leaflet map */
  /********************************** */
  var map,
    mapTiles,
    mapMarker,
    panOptionsDefault = {},  // for overriding defaults
    initialSlide = Slides[0];

  console.log(initialSlide);

  // initalize map layer
  map = L.map('map', {
    center: initialSlide.map.position,
    zoom: initialSlide.map.zoom,
    zoomControl: false,
    dragging: false,
    touchZoom: false,
    scrollWheelZoom: false,
    doubleClickZoom: false

  });

  mapTiles = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    subdomains: 'abcd',
    unloadInvisibleTiles: false,    // doc: http://mourner.github.io/Leaflet/reference.html#tilelayer-unloadinvisibletiles
    reuseTiles: true                // doc: http://mourner.github.io/Leaflet/reference.html#tilelayer-reusetiles
  });


  mapMarker = L.marker([52.5, 13.4]);


  mapTiles.addTo(map);
  mapMarker.addTo(map);


  /********************************** */
  // Ractive
  /********************************** */
  Ractive.load.baseUrl = 'components/';
  Ractive.load( 'base.html' ).then( function ( BaseComponent ) {

    var slideIndex = 0,
        slide = Slides[slideIndex],
        firstSlide = 0,
        lastSlide = Slides.length-1,
        ractive;

    // initialize ractive component
    ractive = new BaseComponent({

      el: '#main',
      data: {
        'slide' : slide,
        'visible' : true
      },

      // oninit : function() {
      //  alert('x');
      // }

    });


     // shift slide
    ractive.on( 'step', function ( event, direction ) {

      map.removeLayer(mapMarker);
      ractive.set('visible', false);

      //increment or decrement with 1
      if(direction === 'next') {
        slideIndex += 1;
      } else {
        slideIndex -=1;
      }


      // update slideIndex. Reset the lopp if over one edge.
      switch(slideIndex) {
        case firstSlide-1:
          slideIndex = lastSlide;
          break;
        case lastSlide+1:
          slideIndex = firstSlide;
          break;
      }

      // switch slide in DOm
      slide = Slides[slideIndex];
      ractive.set('slide', slide);

      map.on('zoomend', function() {
            ractive.set('visible', true);
            mapMarker = L.marker(slide.map.marker).addTo(map);
      });

      // control map
      map.flyTo(slide.map.position, slide.map.zoom, _.extend(panOptionsDefault, slide.map.panOptions));


    });

});


/********************************** */
// D3 (testing)
/********************************** */

var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// quantitative scale for x-axis
var x = d3.scale.linear()
    .range([0, width]);

// ordinal scale for y-axis
var y = d3.scale.ordinal()
    .rangeRoundBands([0, height], .2);

// graph X axis for quanttitative values
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(10, "%");

// graph Y axis for ordinal values
var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

// create SVG object
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// load data
d3.tsv("data/test-data.tsv", type, function(error, data) {

  if (error) throw error;


  // sort ascending
  data.sort(
    function(a, b) { return b.frequency - a.frequency; }
    );

// console.log(data);

  // map quantative domain (the minimum and maximum value) to the x scale
  x.domain([0, d3.max(data, function(d) { return d.frequency; })]);

  // map ordinal domain (names) to the y scale
  y.domain(data.map(function(d) { return d.letter; }));

  // paint the x axis
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      // .attr("transform", "rotate(-90)")
      .attr("y", 10)
      .attr("dy", "1em")
      .attr("class", "label")
      .style("text-anchor", "middel")
      .text("Frequency");

  // paint the y axis
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  // paint the bars
  svg.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("y", function(d) { return y(d.letter); })
      .attr("height", y.rangeBand())
      // .attr("x", function(d) { return x(d.frequency); })
      // .attr("width", function(d) { return width - x(d.frequency); });
      .attr("x", 0)
      .attr("width", function(d) { return x(d.frequency); });
});

// jeg tror dette er for å tvinge til int
function type(d) {
  d.frequency = +d.frequency;
  return d;
}