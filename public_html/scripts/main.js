/*jslint browser: true, camelcase: false, latedef: nofunc  */
/*global L, Ractive, d3, topojson, queue, _, barchart */


(function (window, document, L, Ractive, d3, topojson, queue, _, barchart, undefined) {

  'use strict';

  L.TopoJSON = L.GeoJSON.extend({
    addData: function(jsonData) {
      if (jsonData.type === 'Topology') {
        for (var key in jsonData.objects) {
          var geojson = topojson.feature(jsonData, jsonData.objects[key]);
          L.GeoJSON.prototype.addData.call(this, geojson);
        }
      }
      else {
        L.GeoJSON.prototype.addData.call(this, jsonData);
      }

      return this;
    }
  });
  // Copyright (c) 2013 Ryan Clark

  Ractive.DEBUG = /unminified/.test(function(){/*unminified*/});

  var storyTeller = new Ractive({

    template : '#baseTemplate',
    el: '#storyteller',
    data: {
      loading : true,
      current : 0,
      next: 1,
    },

    map : {},
    // topoJson : true,
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



    /**
     * [oninit description]
     * @return {[type]} [description]
     */
    oninit : function() {

      // load json data
      this.loadJson();

      var that = this,
          devMode = true;

      // initiate Leaflet map
      L.Icon.Default.imagePath = 'images/';

      this.map = L.map('map', {zoomControl: devMode, dragging: devMode, touchZoom: devMode, scrollWheelZoom: devMode, doubleClickZoom: devMode});


         // L.tileLayer('http://{s}.tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png',
      // L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
         {
          // attribution: '&copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        subdomains: 'abcd',
        unloadInvisibleTiles: !devMode,    // doc: http://mourner.github.io/Leaflet/reference.html#tilelayer-unloadinvisibletiles
        reuseTiles: devMode                // doc: http://mourner.github.io/Leaflet/reference.html#tilelayer-reusetiles
      }).addTo(this.map);

      this.mapMarkers.addTo(this.map);
      this.mapGeoJSON.addTo(this.map);

      // Events (obsoloete - replaced by router)
      // this.on( 'goto', function ( event, index ) {
      //   this.transitionStart();
      //   this.set('current', index);
      // });

      // dodgy, but best I have
      this.map.on('zoomend', function() {
        setTimeout( function() { that.transitionEnd(); }, 100);   // Race-condition: Jeg trenger et lite delay here, slik at ractive har oppdatert domen skikklig før evt callbacks blir kalt i transitionEnd
      });

      this.observe( 'current', function ( newValue, oldValue, keypath ) {
        if(newValue !== undefined && newValue !== oldValue && this.get('loading') === false) { // if loading is true, we wait for it to complete and the trigger the got from there
          this.goto( newValue );
        }
      });
    },

    goto : function( index ){

        this.transitionStart();

        var slide,
            slides = this.get('slides'),
            lastSlide = this.get('total')-1;

        // loop
        if(index < 0) {
          index = lastSlide;
        } else if( index > lastSlide) {
          index = 0;
        }

        // get new slide
        slide = slides[index];

        // positoning (work in progress...)
        slide.pos = this.positions[slide.size][slide.position];

        // update ractive data
        var promise = this.set({
          // current: index,
          next: index+1,
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



    /**
     * [updateMap description]
     * @return {[type]} [description]
     */
    updateMap : function() {

      var that = this,
          slideMap  = this.get('slide.map'),
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

      // geoJson Layers | TODO: Better defier / wait function
      if(_.has(slideMap,'highlights')) {
          this.higlightCountries(slideMap.highlights);
        // if(!!this.topoJson) {
        //   this.higlightCountries(slideMap.highlights);
        // } else {
        //  setTimeout(this.higlightCountries(slideMap.highlights),1000);
        // }
      }
    },


    /**
     * [higlightCountries description]
     * @param  {[type]} highlights [description]
     * @return {[type]}            [description]
     */
    higlightCountries : function( highlights ) {

      // TODO, better defer/ wait function
      // if(!!this.topoJson) {

        // clone.... TODO: Better to send highlights ass paramtere to topoLayer.addData() and filter there...
        var topoLayer = new L.TopoJSON();
        var x = JSON.parse(JSON.stringify(this.topoJson));

        // filter if not show all
        if(!highlights.hasOwnProperty('all'))
        {
          x.objects.subunits.geometries = _.filter(this.topoJson.objects.subunits.geometries, function(c){
            return highlights.hasOwnProperty(c.id);
          });
        }

        // add data, set styles and bind popup
        topoLayer.addData(x)
          .setStyle(styleGeoJSON)
          .eachLayer(function (layer){
            layer.bindPopup(layer.feature.properties.name);
          });

        // add layer to map
        this.mapGeoJSON.addLayer(topoLayer);
      // }
    },


    /**
     * Start tranistion between slides
     */
    transitionStart : function( ) {
      // console.log('Start tranistion');
      this.set('chartEnabled', false); // hide chart for each slide, re-enable if needed
      this.set('visible', false);
    },



    /**
     * Transition Complete
     */
    transitionEnd : function() {

      var that = this;

      this.set('visible', true).then( function () {

        // if a function is defined in the slide-data, call it now
        var slideCallBack = that.get('slide.callback');
        if(slideCallBack) {
          that[slideCallBack]();
        }
      });

      // console.log('End tranistion');

    },


    /**
     * Loads the topojson and extends it with the fsi data
     * @return {[type]} [description]
     */
    loadJson : function() {

      var that = this;

      queue()
          .defer(d3.json, '/slides.json')
          .defer(d3.json, '/data/all.json')
          .defer(d3.json, '/fsi/2015.json?limit=102')
          .await(_loadJson);

      function _loadJson(error, slides, topoJson, fsi) {

        if (error) {
          return console.error(error);
        }

        that.set({
          'loading' : false,
          'slides' : slides.data,
          'total' : slides.data.length
        });

        // extend topjson with dataset properties
        for (var key in topoJson.objects) {
          for(var feature in topoJson.objects[key].geometries) {
            var obj = topoJson.objects[key].geometries[feature];
            var props = _.find(fsi, function(c){ return c.countryCode === obj.id; });
            _.extend(obj.properties, _.pick(props,'rank','score','value'));
           }
        }
        that.topoJson = topoJson;

        // and now we can load a slide... 
        that.goto( that.get('current') );

      }
    },


    /**
     * [callbackChartView description]
     * @return {[type]} [description]
     */
    callbackChartView : function() {

      // inject the bar chart
      this.set('chartEnabled', true);
      barchart('/fsi/2015.json?limit=10');

    },

  });

    window.storyTeller = storyTeller;




  /**
   * [description]
   * @param  {[type]} response) {                              var xhr [description]
   * @param  {[type]} });                    } [description]
   * @return {[type]}           [description]
   */
  //  loadJSON(function(response) {

  //   var xhr = response.data;
  //   var storyTeller = new StoryTeller({
  //     el: '#storyteller',
  //     data: {
  //       visible : true,
  //       slides : xhr,
  //     },
  //   });
  //   window.storyTeller = storyTeller;

  // });


    // var storyTeller = new StoryTeller({
    //   el: '#storyteller',
    //   data: {
    //     loading : true,
    //     current : 0,
    //     next: 2,
    //   }
    // });



/**
 * ****************************
 * Helpers
 * ****************************
 */


function getColor(d) {
// TODO: Replace....
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
        fillColor: getColor(feature.properties.score),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}


// function eventGeoJson(feature, layer) {
// if (feature.properties && feature.properties.jurisdiction) {
//         layer.bindPopup(feature.properties.jurisdiction);
//     }
// }



// from: http://codepen.io/KryptoniteDove/post/load-json-file-locally-using-pure-javascript
// TODO: Replace with d3 .json()
 // function loadJSON(callback) {

 //    var xobj = new XMLHttpRequest();

 //    xobj.overrideMimeType('application/json');  // Svale: needed ??!?
 //    xobj.responseType = 'json';

 //    xobj.open('GET', '/slides.json', true);
 //    xobj.onreadystatechange = function () {
 //          if (xobj.readyState === 4 && xobj.status === 200) {
 //            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
 //            callback(xobj.response);
 //          }
 //    };
 //    xobj.send(null);
 // }


}(window, document, L, Ractive, d3, topojson, queue, _, barchart));
