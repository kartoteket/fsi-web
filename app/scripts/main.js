/*jslint browser: true*/
/*global L, Ractive, Slides, _, barchart, countryData */

(function (window, document, L, Ractive, Slides, _, barchart, countryData, undefined) {

  'use strict';

  var StoryTeller = Ractive.extend({

    template : '#baseTemplate',

    map : {},
    mapMarkers : L.layerGroup(),    // group for all markes
    mapGeoJSON : L.layerGroup(),    // group for all geoJSON layers

    // N-W-S-E coordinates for slides that in sum set size and position
    // todo, move to config object
    positions : {
        'small' : {
          'center' : {'top' : 40, 'left' : 40, 'bottom' : 40, 'right' : 40 },
          'tl' : {'top' : 5, 'left' : 5, 'bottom' : 70, 'right' : 70 },
          'tr' : {'top' : 5, 'left' : 70, 'bottom' : 70, 'right' : 5 },
          'br' : {'top' : 70, 'left' : 70, 'bottom' : 5, 'right' : 5 },
          'bl' : {'top' : 70, 'left' : 5, 'bottom' : 5, 'right' : 70 },
        },
        'medium' : {
          'center' : {'top' : 30, 'left' : 30, 'bottom' : 30, 'right' : 30 },
          'tl' : {'top' : 5, 'left' : 5, 'bottom' : 55, 'right' : 55 },
          'tr' : {'top' : 5, 'left' : 55, 'bottom' : 55, 'right' : 5 },
          'br' : {'top' : 55, 'left' : 55, 'bottom' : 5, 'right' : 5 },
          'bl' : {'top' : 55, 'left' : 5, 'bottom' : 5, 'right' : 55 },
        },
        'large' : {
          'center' : {'top' : 20, 'left' : 20, 'bottom' : 20, 'right' : 20 },
          'tl' : {'top' : 5, 'left' : 5, 'bottom' : 40, 'right' : 40 },
          'tr' : {'top' : 5, 'left' : 40, 'bottom' : 40, 'right' : 5 },
          'br' : {'top' : 40, 'left' : 40, 'bottom' : 5, 'right' : 5 },
          'bl' : {'top' : 40, 'left' : 5, 'bottom' : 5, 'right' : 40 },
        },
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

      // dodgy, but best I have
      this.map.on('zoomend', function() {
        setTimeout( function() { that.transitionEnd(); }, 100);   // Race-condition: Jeg trenger et lite delay here, slik at ractive har oppdatert domen skikklig før evt callbacks blir kalt i transitionEnd
      });

      // start with the first slide
      this.goto( 0 );

    },


    // onrender : function(){
    //    console.log('Storyteller.onrender()');
    //    console.log(this.map);
    // }

    // TODO, funker ikke ??!?!?
    restart: function() {
        // this.reset(
        //   {
        //         visible : true,
        //         slides : Slides,
        //       }
        //   );
    },

    goto : function( index ){

        var slide,
            slides = this.get('slides'),
            lastSlide = slides.length-1;

        // loop
        if(index < 0) {
          index = lastSlide;
        } else if( index > lastSlide) {
          index = 0;
          // this.restart();  // reset all data for next loop | not in use
        }

        // set new current slide
        slide = slides[index];

        // positoning (work in progress...)
        slide.pos = this.positions[slide.size][slide.position];

        // update ractive data
        var promise = this.set({
          current: index,
          slide : slide
        });

        promise.then( this.updateMap() );

        // if animate to new positions      => TODO: Dette bør heller evt (kanskje ikke) være en animert overgang mellom (alle?) slidene, med evt global switch on/off
        if( _.has(slide, 'animateTo') ) {
            this.animateSlide();
        }

        // update map
        // this.updateMap();

    },

    animateSlide : function() {
      var that = this,
          animateTo = this.get('slide.animateTo');

      setTimeout(function(){
        that.animate({
          'slide.pos' : that.positions[animateTo.size][animateTo.position],
          'slide.size' : animateTo.size
          },
          {
            'duration' : 800,
            'easing' : 'easeInOut',
            // 'complete' : function() {
            //     that.set('slide.position','tl');
            // }
          });
      }, this.get('slide.animateTo.duration'));

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
      if(_.has(slideMap,'markers')) {
        _.each(slideMap.markers, function(marker){
          that.mapMarkers.addLayer(L.marker(marker));
        });
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

      // var that = this;


      // apply cloropleth
      this.mapGeoJSON.addLayer(L.geoJson(countryData, {style : styleGeoJSON}));

      // inject the bar chart
      // barchart('data/test-data.tsv');
      barchart('http://craft.dev/fsi.json');

    },


  });


  // var storyTeller = new StoryTeller({
    new StoryTeller({

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
// console.log(d);
      return d > 77 ? '#800026' :
             d > 73  ? '#BD0026' :
             d > 70  ? '#E31A1C' :
             d > 60  ? '#FC4E2A' :
             d > 50   ? '#FD8D3C' :
             d > 40   ? '#FEB24C' :
             d > 30   ? '#FED976' :
                        '#FFEDA0';
}

function styleGeoJSON(feature) {
      return {
          fillColor: getColor(feature.properties.fsiScore),
          weight: 2,
          opacity: 1,
          color: 'white',
          dashArray: '3',
          fillOpacity: 0.7
      };
  }



}(window, document, L, Ractive, Slides, _, barchart, countryData));
