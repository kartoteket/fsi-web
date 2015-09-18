/*jslint browser: true*/
/*global L, Ractive, Slides, _, barchart, countryData */

(function (window, document, L, Ractive, Slides, _, barchart, countryData, undefined) {

  'use strict';

  var StoryTeller = Ractive.extend({

    template : '#baseTemplate',

    map : {},
    mapMarkers : L.layerGroup(),    // group for all markes
    mapGeoJSON : L.layerGroup(),    // group for all geoJSON layers


    positions : {
        'center' : {'top' : 30, 'left' : 30, 'bottom' : 30, 'right' : 30 },
        'tl' : {'top' : 5, 'left' : 5, 'bottom' : 55, 'right' : 55 },
        'tr' : {'top' : 5, 'left' : 55, 'bottom' : 55, 'right' : 5 },
        'br' : {'top' : 55, 'left' : 55, 'bottom' : 5, 'right' : 5 },
        'bl' : {'top' : 55, 'left' : 5, 'bottom' : 5, 'right' : 55 },
    },

    oninit : function() {

      var that = this;

      // initiate Leaflet map
      L.Icon.Default.imagePath = 'images/';

      this.map = L.map('map', {zoomControl: false, dragging: false, touchZoom: false, scrollWheelZoom: false, doubleClickZoom: false});

      L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        subdomains: 'abcd',
        unloadInvisibleTiles: false,    // doc: http://mourner.github.io/Leaflet/reference.html#tilelayer-unloadinvisibletiles
        reuseTiles: true                // doc: http://mourner.github.io/Leaflet/reference.html#tilelayer-reusetiles
      }).addTo(this.map);

      this.mapMarkers.addTo(this.map);
      this.mapGeoJSON.addTo(this.map);

      // Events
      this.on( 'goto', function ( event, index ) {
        this.transitionStart();
        this.goto( index );
      });

      this.map.on('zoomend', function() {
        that.transitionEnd();
      });

      // start with the first slide
      this.goto( 0 );

    },


    // onrender : function(){
    //    console.log('Storyteller.onrender()');
    //    console.log(this.map);
    // }


    goto : function( index ){

        var slide,
            slides = this.get('slides'),
            lastSlide = slides.length-1;

        // loop
        if(index < 0) {
          index = lastSlide;
        } else if( index > lastSlide) {
          index = 0;
        }

        slide = slides[index];

        // positoning (work in progress...)
        slide.pos = this.positions[slide.position];

        // update ractive data
        this.set({
          current: index,
          slide : slide
        });

        // update map
        this.updateMap();

    },

    updateMap : function() {

      var slideMap  = this.get('slide.map'),
          panOptionsDefault = {};

      // Clear Layers to clean up map
      this.mapMarkers.clearLayers();
      this.mapGeoJSON.clearLayers();

      // center / zoom
      if(this.map.getZoom() === undefined) {                  // initial state, nothing is set
        this.map.setView(slideMap.position, slideMap.zoom);
      } else {                                                // we can fly
        this.map.flyTo(slideMap.position, slideMap.zoom, _.extend(panOptionsDefault, slideMap.panOptions));
      }

      // marker Layers
      if(_.has(slideMap,'marker')) {
        this.mapMarkers.addLayer(L.marker(slideMap.marker));
      }

      // geoJson Layers
      // todo ?!?

    },

    transitionStart : function() {
      this.set('visible', false);
    },

    transitionEnd : function() {

      this.set('visible', true);

      // if a function is defined in the slide-data, call it now
      var slideCallBack = this.get('slide.callback');
      if(slideCallBack) {
        this[slideCallBack]();
      }

    },


    callbackChartView : function() {

      var that = this;


      // apply cloropleth
      this.mapGeoJSON.addLayer(L.geoJson(countryData, {style : styleGeoJSON}));

      // inject the bar chart
      barchart('data/test-data.tsv');

      // re-position
      setTimeout(function(){

        that.animate(
          {
            'slide.pos.top' : 5,
            'slide.pos.left': 5,
            'slide.pos.bottom': 55,
            'slide.pos.right': 55,
          },
          {
            'duration' : 1000,
            'easing' : 'easeInOut',
            'complete' : function() {
                that.set('slide.position','tl');
            }
          });
      }, 1000);

    },


  });


  var storyTeller = new StoryTeller({

    el: '#storyteller',
    data: {
      visible : true,
      slides : Slides,
    },

  });


/**
 * ****************************
 * Helpers
 * ****************************
 */


function getColor(d) {
    return d > 1000 ? '#800026' :
           d > 500  ? '#BD0026' :
           d > 200  ? '#E31A1C' :
           d > 100  ? '#FC4E2A' :
           d > 50   ? '#FD8D3C' :
           d > 20   ? '#FEB24C' :
           d > 10   ? '#FED976' :
                      '#FFEDA0';
}

function styleGeoJSON(feature) {
      return {
          fillColor: getColor(feature.properties.fsi_score),
          weight: 2,
          opacity: 1,
          color: 'white',
          dashArray: '3',
          fillOpacity: 0.7
      };
  }



}(window, document, L, Ractive, Slides, _, barchart, countryData));
