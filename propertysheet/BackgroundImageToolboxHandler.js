/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var AppInit       = brackets.getModule("utils/AppInit");
    var FileSystem = brackets.getModule("filesystem/FileSystem");
    var lastSelectedRuleset = null;
    
    $(document).on("ruleset-wrapper.created ruleset-wrapper.refreshed","#html-design-editor",function(event,rulesetref){
       lastSelectedRuleset = rulesetref;
    });
    
    $(document).on("click","#bg-toolbox-anchor",function(event){
        //$('.property-toolbox').trigger('hide'); 
        $("#background-image-editor").show();        
        event.preventDefault();
        event.stopPropagation();
    });
    
    /*$(document).on("hide",".property-toolbox",function(event){
        $("#background-image-editor").hide();
    });*/
    
    $(document).on("click","#background-image-editor-close",function(event){
        $("#background-image-editor").hide();
        event.preventDefault();
        event.stopPropagation();
    });
    
    $(document).on("click", "#bg-button-browse", function(event){
        FileSystem.showOpenDialog(false, false, "Please Select file", '', null,
            function (err, files) {
                if (!err) {
                    $("input#bg-image-url").val(files[0]);
                    _applyBackground();
                } else {
                //    result.reject();
                }
            });
    
    });
    
    function _applyBackground(){
        var bgImageURL = "url('" + $("#bg-image-url").val() + "')";
        var bgRepeat = $("#bg-repeat-menu-dropdown").find(":selected").text();
        var backgroundPosX = $("#bg-image-position-x").val();
        var backgroundPosY = $("#bg-image-position-y").val();
        
        if(bgImageURL && bgRepeat && backgroundPosX && backgroundPosY){
            lastSelectedRuleset.css("background",bgImageURL+' '+bgRepeat+' '+backgroundPosX+' '+backgroundPosY);
            lastSelectedRuleset.persist();
        }
    }
    
    AppInit.appReady(function () {
        
    });
    
    function _stopPropagation(event){
        event.preventDefault();
        event.stopPropagation();
    }
        
    
    $(document).on("change","#bg-image-position-x",_applyBackground);
    $(document).on("change","#bg-image-position-y",_applyBackground);
    $(document).on("change","#bg-repeat-menu-dropdown",_applyBackground);
    $(document).on("change","#bg-image-url",_applyBackground);
    
    $(document).on("click","#bg-image-position-x",_stopPropagation);
    $(document).on("click","#bg-image-position-y",_stopPropagation);
    $(document).on("click","#bg-repeat-menu-dropdown",_stopPropagation);
    $(document).on("click","#bg-image-url",_stopPropagation);
    
});