/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    $(document).on("click","#designer-context-menu li a",function(event){
        $("#html-design-editor").trigger($(this).data('action'));
        $("#html-design-editor").trigger("hide.contextmenu");
        event.preventDefault();
        event.stopPropagation();
    });
    
});