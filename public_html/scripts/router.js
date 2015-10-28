/*global window, Router, storyTeller */
(function (window, Router, storyTeller, undefined) {
    'use strict';


    // We're using https://github.com/flatiron/director for routing
    var router = new Router({
        '/page/:index': function (index) {

            var total = storyTeller.get('total');
            index = +index;                         // cast string-parameter to number

            if(index < 1) {                         // never go below page 1
                index = 1;
            }
            else if (total && index > total) {      // never go abowe the total max
                storyTeller.set('current', 1);
                window.location.hash = '';
            }

            storyTeller.set('current', index);
        }
    });

    router.configure({
        notfound: function () {
            storyTeller.set('current', 1);
            window.location.hash = '';
        }
    });

    router.init();

})(window, Router, storyTeller);