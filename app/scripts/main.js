/*jslint browser: true*/
/*global L, Ractive, _ */

	'use strict';

	var slides = [
		{
			'title' : 'Slide 1',
			'subTitle'  : 'SubTitle for first slide',
			'text' : 'Lorem Ipsum',
			'position' : 'tl',
			'map' : {
				'position' : [24.498300, -77.461427],
				'zoom' : 9,
				'panOptions' : {},
				'marker' : [24.498300, -77.461427]
			}
		},
		{
			'title' : 'Slide 2',
			'subTitle'  : 'SubTitle for second slide',
			'text' : 'Jippi!',
			'position' : 'tr',
			'map' : {
				'position' : [24.498300, -77.461427],
				'zoom' : 10,
				'panOptions' : {},
				'marker' : [24.498300, -77.461427],
			}
		},
		{
			'title' : 'Slide 3',
			'subTitle'  : 'SubTitle for third slide',
			'text' : 'Lorem Ipsum',
			'position' : 'br',
			'map' : {
				'position' : [52.521331, 13.414150],
				'zoom' : 11,
				'panOptions' : {},
				'marker' : [52.521331, 13.414150],
			}
		},
		{
			'title' : 'Slide 4',
			'subTitle'  : 'SubTitle for third slide',
			'text' : 'Lorem Ipsum',
			'position' : 'bl',
			'map' : {
				'position' : [40.718927, -74.001654],
				'zoom' : 12,
				'panOptions' : {},
				'marker' : [40.718927, -74.001654],
			}
		},
	];


	// Leaflet
	L.Icon.Default.imagePath = 'images/';

	/********************************** */
	/* create leaflet map */
	/********************************** */
	var map,
		mapTiles,
		mapMarker,
		panOptionsDefault = {
			animate: true,
			duration: 1.0,
			easeLinearity: 0.15,
			noMoveStart: false
		},
		zoomOptionsDefault = {
			animate: true,
		};


	map = L.map('map', {
		center: [52.5377, 13.3958],
		zoom: 8,
		zoomControl: false
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
			slide = slides[slideIndex],
			firstSlide = 0,
			lastSlide = slides.length-1,
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
			slide = slides[slideIndex];
			ractive.set('slide', slide);

			// control map
			map.flyTo(slide.map.position, slide.map.zoom); // _.extend(panOptionsDefault, slide.map.panOptions)



			// map
			// 	.panTo(slide.map.position, _.extend(panOptionsDefault, slide.map.panOptions))
			// 	.setZoom(slide.map.zoom, zoomOptionsDefault)
			// ;
			// map.setZoom(slide.map.zoom, zoomOptionsDefault).whenReady(function(){
			// 	this.panTo(slide.map.position, _.extend(panOptionsDefault, slide.map.panOptions));
			// });
			// map.panTo(slide.map.position, _.extend(panOptionsDefault, slide.map.panOptions));

			map.removeLayer(mapMarker);
			mapMarker = L.marker(slide.map.marker).addTo(map);

		});

    });

