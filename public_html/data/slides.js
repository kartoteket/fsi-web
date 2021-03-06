/*jslint browser: true, unused: false */

'use strict';

var Slides = [
    {
        'title' : 'Financial Secrecy Index 2015',
        'subTitle'  : 'Tax Justice Network',
        'text' : '<p>Financial Secrecy Index (FSI) rangerer verdens 60 skatteparadis. USA og Storbritannia kommer ut som to av de aller verste.</p><p>Skatteparadis er land eller områder som kjennetegnes ved at de har forskjellige skattesystemer for lokale innbyggere og utlendinger. Skatteparadis tilbyr ikke bare utlendinger lav eller ingen skatt, men også anonymitet og enkle, raske og fleksible regler for registrering. Dette er en grunn til at de også går under navnet ”secrecy jurisdictions”.</p>',
        'position' : 'center',
        'size' :  'medium',
        'map' : {
            'position' : [24.498300, -77.461427],
            'zoom' : 3,
            'panOptions' : {},
            'marker' : [52.5, 13.4]
        }
    },
    {
        'title' : 'Top 10 + norden',
        'subTitle'  : '',
        'text' : '<div class="chart"></div>',
        'position' : 'center',
        'size' :  'medium',
        'animateTo' : {
            'position' : 'tl',
            'size' : 'large',
            'duration' : 300,
        },
        'map' : {
            'position' : [52.521331, 13.414150],
            'zoom' : 3,
            'panOptions' : {},
            // 'marker' : [24.498300, -77.461427]
        },
        'callback' : 'callbackChartView'
    },
    {
        'title' : 'TEST',
        'subTitle'  : '',
        'text' : '<div class="chart"></div>',
        'position' : 'center',
        'size' :  'large',
        'map' : {
            'position' : [52.521331, 13.414150],
            'zoom' : 3,
            'panOptions' : {},
            // 'marker' : [24.498300, -77.461427]
        },
        'callback' : ''
    },
/*
    {
        'title' : 'Slide 2',
        'subTitle'  : 'SubTitle for second slide',
        'text' : 'Jippi!',
        'position' : 'tr',
        'size' : 'medium',
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
        'size' : 'medium',
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
        'size' : 'medium',
        'map' : {
            'position' : [40.718927, -74.001654],
            'zoom' : 12,
            'panOptions' : {},
            'marker' : [40.718927, -74.001654],
        }
    },
*/
];