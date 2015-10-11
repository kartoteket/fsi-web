/*jslint browser: true*/
/*global L, Ractive, Slides, _, barchart, countryData */

(function (window, document, L, Ractive, Slides, _, barchart, countryData, undefined) {

  'use strict';


/********************************** */
// Ractive
/********************************** */
Ractive.load.baseUrl = 'components/';

Ractive.load( 'base.html' ).then( function ( BaseComponent ) {

  var slideIndex = 0,
      slide = Slides[slideIndex],
      firstSlide = 0,
      lastSlide = Slides.length-1,
      ractive,
      cloropleth,
      map,
      mapTiles,
      mapMarker,
      mapOptions = {
          center: Slides[0].map.position,
          zoom: Slides[0].map.zoom,
          zoomControl: false,
          dragging: false,
          touchZoom: false,
          scrollWheelZoom: false,
          doubleClickZoom: false
      },
      panOptionsDefault = {};  // for overriding defaults
      // scopert = {
      //   chartView: function (e) {
      //     ractive.set('visible', true);
      //     console.log(e);
      //   }
      //}

  // initialize ractive component
  ractive = new BaseComponent({

    el: '#main',

    data: {
      'slide' : slide,
      'visible' : true
    },

    oninit : function() {

        // initalize map layer
        L.Icon.Default.imagePath = 'images/';
        map = L.map('map', mapOptions);

        mapTiles = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
          subdomains: 'abcd',
          unloadInvisibleTiles: false,    // doc: http://mourner.github.io/Leaflet/reference.html#tilelayer-unloadinvisibletiles
          reuseTiles: true                // doc: http://mourner.github.io/Leaflet/reference.html#tilelayer-reusetiles
        }).addTo(map);


        mapMarker = L.marker([52.5, 13.4]).addTo(map);

    },

    onrender : function(){
      this.on( 'step', function ( event, direction ) {

        map.removeLayer(mapMarker);
        if(map.hasLayer(cloropleth)) {
          map.removeLayer(cloropleth);
        }
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

          if(_.has(slide,'extend')) {

            ractive[slide.extend](slideIndex);

          } else {
            ractive.set('visible', true);

            if(_.has(slide.map,'marker')) {
              mapMarker = L.marker(slide.map.marker).addTo(map);
            }
          }

        });

        // control map
        map.flyTo(slide.map.position, slide.map.zoom, _.extend(panOptionsDefault, slide.map.panOptions));

      });
    },


    testChartView : function(e) {
      ractive.set('visible', true);
      barchart('data/test-data.tsv');
      cloropleth = L.geoJson(countryData, {style: ractive.style}).addTo(map);
      console.log(e);
    },

    getColor : function(d) {
      return d > 77 ? '#800026' :
             d > 73  ? '#BD0026' :
             d > 70  ? '#E31A1C' :
             d > 60  ? '#FC4E2A' :
             d > 50   ? '#FD8D3C' :
             d > 40   ? '#FEB24C' :
             d > 30   ? '#FED976' :
                        '#FFEDA0';
    },

    style : function(feature) {
        return {
            fillColor: ractive.getColor(feature.properties.fsi_score),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    }


  });

});
}(window, document, L, Ractive, Slides, _, barchart, countryData));
