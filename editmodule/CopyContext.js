/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var lastContext = null;
    
    $(document).on("copy-element","#html-design-editor", function(event){
        $("#html-design-editor").trigger("add-to-clipboard",["copyContext",lastContext]);
    });
    
    $(document).on("targetdom.contextmenu","#html-design-editor", function(e,elem,point){
        lastContext = elem;
    });

});