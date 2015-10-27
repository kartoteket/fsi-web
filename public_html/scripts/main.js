/*jslint browser: true, camelcase: false, latedef: nofunc  */
/*global L, Ractive, d3, topojson, queue, _, barchart */


(function (window, document, L, Ractive, d3, topojson, queue, _, barchart, undefined) {

  'use strict';

//  L.AwesomeMarkers.Icon.prototype.options.prefix = 'ion';

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

    scoreToColor : false,
    map : {},
    fsi : {},
    // topoJson : true,

    mapOverlays : L.layerGroup(),
    // mapMarkers : L.layerGroup(),    // group for all markes
    // mapGeoJSON : L.layerGroup(),    // group for all geoJSON layers
    // mapLines : L.layerGroup(),      // group alle lines

    awsomeIcon : L.AwesomeMarkers.icon({
      prefix: 'ion',
      icon: 'locked', // ios-locked | ios-locked-outline | ion-social-usd
      markerColor: '#bd0026'
    }),

    divIcon : L.divIcon({
      className: 'my-div-icon',
      iconSize : [10,10]
    }),


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

      // this.mapMarkers.addTo(this.map);
      // this.mapGeoJSON.addTo(this.map);
      // this.mapLines.addTo(this.map);
      this.mapOverlays.addTo(this.map);


      // Events (obsoloete - replaced by router)
      // this.on( 'goto', function ( event, index ) {
      //   this.transitionStart();
      //   this.set('current', index);
      // });

      // dodgy, but best I have
      this.map.on('zoomend', function() {
        setTimeout( function() { that.transitionEnd(); }, 100);   // Race-condition: Jeg trenger et lite delay here, slik at ractive har oppdatert domen skikklig før evt callbacks blir kalt i transitionEnd
      });

      // obeservs current slides and triggers a goto when changed (after everything is loaded)
      this.observe( 'current', function ( newValue, oldValue, keypath ) {
        if(newValue !== undefined && newValue !== oldValue && this.get('loading') === false) { // if loading is true, we wait for it to complete and the trigger the got from there
          this.goto( newValue );
        }
      });

      // pick up lat/long on click when in devMode
      if(devMode) {
        this.map.on('click', function(e) {
            console.log('[' + e.latlng.lat + ', ' + e.latlng.lng + ']');
        });
      }

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
      // this.mapMarkers.clearLayers();
      // this.mapGeoJSON.clearLayers();
      this.mapOverlays.clearLayers();
      that.divIcon.options.html = '';

      // center / zoom
      if(this.map.getZoom() === undefined) {                  // initial state, nothing is set
        this.map.setView(slideMap.position, slideMap.zoom);
      } else {                                                // we can fly
        this.map.flyTo(slideMap.position, slideMap.zoom, _.extend(panOptionsDefault, slideMap.panOptions));
      }

      // marker Layers
      if(_.has(slideMap,'markers')) {
        _.each(slideMap.markers, function(marker){
          if(marker.label) {
            that.divIcon.options.html = '<h2>' + marker.label + '</h2>';
          }
          that.mapOverlays.addLayer(L.marker(marker.point, {icon: that.divIcon}));
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
        this.mapOverlays.addLayer(topoLayer);
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

        that.fsi = fsi;

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

        // create a color scale using d3
        that.scoreToColor = createColorScale(_.pluck(fsi, 'score'));

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
      // barchart('/fsi/2015.json?limit=10');
      barchart(this.fsi, 10);

    },

    /**
     * Draw mulitople polylines
     * http://leafletjs.com/reference.html#polyline
     */
    callbackdrawUKLines : function() {

      var uk_point,
          latlngs,
          polyline_options,
          polyline;

      // Create array of lat,lon points.
      uk_point = [51.50729340171854, -0.12767851352691653];
      latlngs = [
        [uk_point, [4.434044005032582, 114.60937500000001]],  // brunei
        [uk_point, [-20.4167169889457, 57.48046875000001]],   // Mauritius
        [uk_point, [32.30106302536928, -64.76440429687501]],  // bermuda
        [uk_point, [24.567108352576, -77.92602539062501]],    // bahamas
        [uk_point, [19.290405639498005, -81.29882812500001]], // cayman islands
        [uk_point, [18.46918890441719, -64.37988281250001]],  // british Virgin is
        [uk_point, [17.088291217955476, -61.77612304687501]], // Antigua and Barb
        [uk_point, [16.70986293320658, -62.20458984375001]],  // Montserrat
        [uk_point, [17.151288449816747, -62.57812500000001]], // St. Kitts and Nevis
        [uk_point, [18.245003052249718, -63.00659179687501]], // Anguilla
        [uk_point, [15.355707666100942, -61.32843017578126]], // Dominica
        [uk_point, [13.93140140744916, -60.94665527343751]],  // St lucia
        [uk_point, [13.250639570043104, -61.18835449218751]], // St. Vin. and Gren.
        [uk_point, [12.076924304193847, -61.66900634765626]], // grenada
        [uk_point, [49.48061694200378, -2.5762939453125004]], // guernsey
        [uk_point, [49.19785878427575, -2.0352172851562504]], // jersey
        [uk_point, [54.25238930276849, -4.592285156250001]],  // Isle of man
        [uk_point, [36.12414877519126, -5.346221923828126]],  // gibralter
        [uk_point, [21.476672479184234, -71.14870548248292]], // Turks & Caicos Islands
        [uk_point, [-21.22218129956861, -159.7892761230469]]  // Cook Islands
      ];

      // Define polyline options
      polyline_options = {
          color: '#bd0026'
      };

      polyline = L.polyline(latlngs, polyline_options).addTo(this.map);
      this.mapOverlays.addLayer(polyline);

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

function createColorScale(scores) {
  return d3.scale.quantile()
          .domain(scores)
          .range(['#ffffb2', '#fecc5c', '#fd8d3c', '#f03b20', '#bd0026']); // http://colorbrewer2.org/?type=sequential&scheme=YlOrRd&n=5
}

function styleGeoJSON(feature) {
    return {
        fillColor: storyTeller.scoreToColor(feature.properties.score),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

// function getColor(d) {
// // TODO: Replace....
// // console.log(d);
//       return d > 77 ? '#800026' :
//              d > 73  ? '#BD0026' :
//              d > 70  ? '#E31A1C' :
//              d > 60  ? '#FC4E2A' :
//              d > 50   ? '#FD8D3C' :
//              d > 40   ? '#FEB24C' :
//              d > 30   ? '#FED976' :
//                         '#FFEDA0';
// }

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
