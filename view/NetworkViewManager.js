/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict"; 
    
    function _showNWPanel(){
        $("#nw-resource-url")[0].value = "";
        $("#network-resource-bar").show();
    }
    
    function _hideNWPanel(){
        $("#network-resource-bar").hide();
    }
        
    $(document).on("change","#nw-resource-url", function(){
        _hideNWPanel();
        $("#html-design-editor").trigger("open-nw-resource",[$(this).val()]);
    });
    
    $(document).on("targetdom.element.click","#html-design-editor", _hideNWPanel);
    
    $(document).on("click", "#close-nw-panel",  _hideNWPanel);
    
    $(document).on("click", "#open-network-page",  _showNWPanel);
});