/*jslint browser: true*/
/*global L, Ractive */

(function (window, document, L, Ractive, undefined) {
	'use strict';

	L.Icon.Default.imagePath = 'images/';

	/* create leaflet map */
	var map = L.map('map', {
		center: [52.5377, 13.3958],
		zoom: 4
	});

	var mapTiles = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
		subdomains: 'abcd',
		maxZoom: 19
	});

	mapTiles.addTo(map);

	/* add default stamen tile layer */
	// new L.tileLayer('http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png', {
	// 	minZoom: 0,
	// 	maxZoom: 18,
	// 	attribution: 'Map data © <a href="http://www.openstreetmap.org">OpenStreetMap contributors</a>'
	// }).addTo(map);


	L.marker([52.5, 13.4]).addTo(map);

}(window, document, L));

(function (window, document, Ractive, undefined) {

	var ractive = new Ractive({
	  el: '#container',
	  template: '#template',
	  data: { name: 'world' }
	});

}(window, document, Ractive));