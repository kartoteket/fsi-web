<?php
namespace Craft;

// https://github.com/benjamminf/craft-coordinates
function getLocation($address){

        $adrEncoded = urlencode($address);
        $geoLocations = [];

        // get cached locations
        if(craft()->cache->get('geoLocations'))
        {
            $geoLocations = craft()->cache->get('geoLocations');
        }

// print_r($geoLocations);

        // is cached, use this
        if(array_key_exists($adrEncoded, $geoLocations))
        {
            $location = $geoLocations[$adrEncoded];
        }


        // else lookup new adress
        else {
            $googleResult = file_get_contents('http://maps.googleapis.com/maps/api/geocode/json?address=' . $adrEncoded);
            $googleResult = json_decode($googleResult);
            if($googleResult->status == 'OK' && !empty($googleResult->results))
            {
                $location = $googleResult->results[0]->geometry->location;
                $geoLocations[$adrEncoded] = $location;
                craft()->cache->set('geoLocations', $geoLocations);
            }
        }

        return is_null($location) ? array(0,0) : array($location->lat,$location->lng);
}


return [
    'endpoints' => [
        'slides.json' => [
            'elementType' => 'Entry',
            'criteria' => [
                'section' => 'slides',
                'order' => 'postDate'
            ],
            'paginate' => false,
            'cache' => false,
            'transformer' => function(EntryModel $entry) {

                // basic data
                $return = [
                    'title' => $entry->title,
                    'subtitle' => $entry->subTitle,
                    'text' => (string) $entry->text,
                    'position' => $entry->position->value,
                    'size' => $entry->size->value,
                    'url' => $entry->url,
                    'jsonUrl' => UrlHelper::getUrl("slides/{$entry->id}.json"),
                ];

                // animations
                $animations = [];
                foreach ($entry->animateTo->type('animation') as $i => $animation) {
                    $animations[$i]['position'] = $animation->position->value;
                    $animations[$i]['size'] = $animation->size->value;
                    $animations[$i]['duration'] = (int) $animation->duration;
                };
                if(!empty($animations)) {
                    $return['animateTo'] = $animations[0]; // might be multiple ??!?
                }

                // markers
                $markers = [];
                foreach ($entry->markers as $marker) {

                    if(!empty($marker['lat']) && !empty($marker['long'])) {
                        $markers[] = array((float) $marker['lat'] , (float) $marker['long']);
                    }

                    if(!empty($marker['address'])) {
                        $markers[] = getLocation($marker['address']);
                    }

                }

                // map
                $map = [
                    'position' => getLocation($entry->mapCenter),
                    'zoom' => (int) $entry->mapZoom['value'],
                ];
                if(!empty($markers)) {
                    $map['markers'] = $markers;
                }
                $return['map'] = $map;

                // callback
                if(!empty($entry->callback)) {
                    $return['callback'] = $entry->callback;
                }


                // return
                return $return;

            },
        ],
        'slides/<entryId:\d+>.json' => function($entryId) {
            return [
                'elementType' => 'Entry',
                'criteria' => ['id' => $entryId],
                'first' => true,
                'transformer' => function(EntryModel $entry) {

                // basic data
                $return = [
                    'title' => $entry->title,
                    'subtitle' => $entry->subTitle,
                    'text' => (string) $entry->text,
                    'position' => $entry->position->value,
                    'size' => $entry->size->value,
                    'url' => $entry->url,
                    'jsonUrl' => UrlHelper::getUrl("slides/{$entry->id}.json"),
                ];

                // animations
                $animations = [];
                foreach ($entry->animateTo->type('animation') as $i => $animation) {
                    $animations[$i]['position'] = $animation->position->value;
                    $animations[$i]['size'] = $animation->size->value;
                    $animations[$i]['duration'] = (int) $animation->duration;
                };
                if(!empty($animations)) {
                    $return['animateTo'] = $animations[0]; // might be multiple ??!?
                }

                // markers
                $markers = [];
                foreach ($entry->markers as $marker) {

                    if(!empty($marker['lat']) && !empty($marker['long'])) {
                        $markers[] = array((float) $marker['lat'] , (float) $marker['long']);
                    }

                    if(!empty($marker['address'])) {
                        $markers[] = getLocation($marker['address']);
                    }

                }


                // map
                $map = [
                    'position' => getLocation($entry->mapCenter),
                    'zoom' => (int) $entry->mapZoom['value'],
                ];
                if(!empty($markers)) {
                    $map['markers'] = $markers;
                }
                $return['map'] = $map;


                // callback
                if(!empty($entry->callback)) {
                    $return['callback'] = $entry->callback;
                }


                // return
                return $return;

                },
            ];
        },

        'fsi.json' => [
            'elementType' => 'Entry',
            'criteria' => ['section' => 'fsi'],
            // 'first' => true,
            'transformer' => function(EntryModel $entry) {
                return  [
                    'title' => $entry->title,
                    'url' => $entry->url,
                    'jsonUrl' => UrlHelper::getUrl("fsi/{$entry->slug}.json"),
                ];
            },
        ],

        'fsi/<slug:\w+>.json' => function($slug) {


            return [
                'elementType' => 'Entry',
                'criteria' => ['slug' => $slug],
                'first' => true,
                'transformer' => function(EntryModel $entry) {

                    // limit table rows by query paramater.
                    // can be set with a default (second paramteter in getParam())
                    $limit = craft()->request->getParam('limit', null);
                    $rows = $entry->fsiTable;
                    if($limit) {
                        $rows = array_slice($rows,0,$limit);
                    }
                    return $rows;

                },
            ];
        },


        'news.json' => [
            'elementType' => 'Entry',
            'criteria' => ['section' => 'news'],
            'transformer' => function(EntryModel $entry) {
                return [
                    'title' => $entry->title,
                    'url' => $entry->url,
                    'jsonUrl' => UrlHelper::getUrl("news/{$entry->id}.json"),
                ];
            },
        ],
        'news/<entryId:\d+>.json' => function($entryId) {
            return [
                'elementType' => 'Entry',
                'criteria' => ['id' => $entryId],
                'first' => true,
                'transformer' => function(EntryModel $entry) {
                    return [
                        'title' => $entry->title,
                        'url' => $entry->url,
                        'body' => $entry->body,
                    ];
                },
            ];
        },



    ]
];