/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var AppInit       = brackets.getModule("utils/AppInit");
    
    AppInit.appReady(function () {
        $(".property-toolbox")
            .draggable({handle:'.propertyToolboxHeader',
                        containment : '#info-overlay-plane'
                     });
        $("#design-toolbox").show();
    });
        
});