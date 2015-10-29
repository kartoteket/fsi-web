/*global window, d3, _ */
(function (window, d3, _, undefined) {
    'use strict';

    var Utils = {

        createColorScale : function(scores) {

              // filter out NaN
              var _scores = _.filter(scores, function(score){ return !isNaN(score); });

              // get min max for quantile, use _score directly for quantize
              var domain = [d3.min(_scores), d3.max(_scores)];

              // we use 7 buttons since TJN does in their FSI, duplicating colors for bucket 3 and 7
              var range = ['#ffffb2', '#fecc5c', '#fd8d3c', '#fd8d3c', '#f03b20', '#bd0026', '#bd0026']; // http://colorbrewer2.org/?type=sequential&scheme=YlOrRd&n=5

              console.log(_scores);

              return d3.scale.quantize()
                      .domain(domain)
                      .range(range);
        }
    };

    window.Utils = Utils;


})(window, d3, _);