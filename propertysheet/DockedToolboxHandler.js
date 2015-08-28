/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    $(document).on("click","#launch-toolbox",function(event){
        $("#docked-toolbox,#html-design-editor,#grid-settings-container").toggleClass('toolboxDocked');
        $(this).toggleClass('activated');
        event.preventDefault();
        event.stopPropagation();
    }); 
});