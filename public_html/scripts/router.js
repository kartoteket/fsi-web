/*global window, Router, storyTeller */
(function (window, Router, storyTeller, undefined) {
    'use strict';

    // We're using https://github.com/flatiron/director for routing
    var router = new Router({
        '/page/:slideId': function (slideId) {
            storyTeller.set('current', +slideId); // cast string-parameter to number
        }
    });

    router.configure({
        notfound: function () {
            window.location.hash = '';
            storyTeller.set('current', 1);
        }
    });

    router.init();

})(window, Router, storyTeller);