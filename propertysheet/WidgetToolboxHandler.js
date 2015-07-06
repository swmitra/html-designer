/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    $(document).on("click","#widget-toolbox-anchor",function(event){
        $("#widget-toolbox").show();
        event.preventDefault();
        event.stopPropagation();
    });
    
    $(document).on("click","#widget-toolbox-close",function(event){
        $("#widget-toolbox").hide();
        event.preventDefault();
        event.stopPropagation();
    });
           
});