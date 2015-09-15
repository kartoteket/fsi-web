/*jslint browser: true*/
/*global L, Ractive, Slides, _ */

	'use strict';

	// Leaflet
	L.Icon.Default.imagePath = 'images/';

	/********************************** */
	/* create leaflet map */
	/********************************** */
	var map,
		mapTiles,
		mapMarker,
		panOptionsDefault = {
		};

	map = L.map('map', {
		center: [52.5377, 13.3958],
		zoom: 8,
		zoomControl: false,
		dragging: false,
		touchZoom: false,
		scrollWheelZoom: false,
		doubleClickZoom: false

	});

	mapTiles = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
		subdomains: 'abcd',
		maxZoom: 19
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
		 	ractive = new BaseComponent({

		  el: '#main',
		  data: {'slide' : slide},

		  // oninit : function() {
		  // 	alert('x');
		  // }

		});


		 // shift slide
		ractive.on( 'step', function ( event, direction ) {

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

			// control map
			map.flyTo(slide.map.position, slide.map.zoom, _.extend(panOptionsDefault, slide.map.panOptions));
			map.removeLayer(mapMarker);
			mapMarker = L.marker(slide.map.marker).addTo(map);

		});

    });

