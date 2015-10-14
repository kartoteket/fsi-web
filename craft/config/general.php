<?php

/**
 * General Configuration
 *
 * All of your system's general configuration settings go in here.
 * You can see a list of the default settings in craft/app/etc/config/defaults/general.php
 */

return array(

    '*' => array(
        // ...
    ),

    '.dev' => array(

        'siteUrl' => 'http://tjnn.dev/',
        'environmentVariables' => array(
            'basePath' => '/Users/svale/Repositories/tjnn-fsi/public_html',
            'baseUrl'  => 'http://tjnn.dev/',
        )
    ),

    '.no' => array(

        'siteUrl' => 'http://fsi2015.taxjustice.no/',
        'environmentVariables' => array(
            'basePath' => '/storage/av12345/www/public_html/',
            'baseUrl'  => 'http://fsi2015.taxjustice.no/',
        )
    )
);