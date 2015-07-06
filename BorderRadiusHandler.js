/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    require("borderradiusresizer/TopRightCornerRadiusHandler");
    require("borderradiusresizer/BottomRightCornerRadiusHandler");
    
    require("borderradiusresizer/TopLeftCornerRadiusHandler");
    require("borderradiusresizer/BottomLeftCornerRadiusHandler");
    
    function _showRadiusEditMode(event){
        $("#border-outline").show();
        $("#selection-outline").addClass('multiSelectStyle');
        $(".dragResizer").hide();
        $("#element-Settings").hide();
        $("#position-tooltip-display").hide();
        event.preventDefault();
        event.stopPropagation(); 
    }
    
    function _hideRadiusEditMode(event){
        $("#border-outline").hide();
        $("#selection-outline").removeClass('multiSelectStyle');
        $(".dragResizer").show();
        $("#element-Settings").show();
        $("#position-tooltip-display").show();
    }
    
    $(document).on("border-radius-mode-on","#html-design-editor",_showRadiusEditMode);
    
    $(document).on("border-radius-mode-off","#html-design-editor",_hideRadiusEditMode);
    
});