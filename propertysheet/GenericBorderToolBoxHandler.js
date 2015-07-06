/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var AppInit       = brackets.getModule("utils/AppInit");
    var lastSelectedRuleset = null;
    
    $(document).on("click","#generic-border-toolbox-anchor",function(event){ 
        $("#border-toolbox").show();
        $("#border-toolbox-anchor").click();
        event.preventDefault();
        event.stopPropagation();
    });
    
    $(document).on("click","#border-toolbox-close",function(event){
        $("#border-toolbox").hide();
        event.preventDefault();
        event.stopPropagation();
        
    });
        
});