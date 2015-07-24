/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var AppInit       = brackets.getModule("utils/AppInit");
    var lastSelectedRuleset = null;
    
    var ConversionUtils = require("propertysheet/UnitConversionUtils");
    
    $(document).on("ruleset-wrapper.created ruleset-wrapper.refreshed","#html-design-editor",function(event,rulesetref){
        var asynchPromise = new $.Deferred();
        if(rulesetref && rulesetref !== lastSelectedRuleset){
            lastSelectedRuleset = rulesetref;
             _parseSetValue();
        }
        lastSelectedRuleset = rulesetref;
        asynchPromise.resolve();
        return asynchPromise.promise();
    });
    
    function _parseSetValue(){
        var valString = lastSelectedRuleset.css('box-shadow');
        if(valString && valString !== 'none'){
            valString = valString.split(' ');
            var index = 0;
                        
            $("#element-shadow-color").val(valString[index++]+valString[index++]+valString[index++]);
            $("#element-shadow-xoffset").val(parseInt(valString[index++]));
            $("#element-shadow-yoffset").val(parseInt(valString[index++]));
            $("#element-shadow-blur").val(parseInt(valString[index++]));
            $("#element-shadow-spread").val(parseInt(valString[index++]));
            
            if(valString.length === 8){
                $("#element-shadow-style").val(valString[index++]);
            } else {
                $("#element-shadow-style").val('outset');
            }
            
        } else {
            $("#element-shadow-style").val('outset');
            $("#element-shadow-color").val('');
            $("#element-shadow-xoffset").val(5);
            $("#element-shadow-yoffset").val(5);
            $("#element-shadow-blur").val(0);
            $("#element-shadow-spread").val(0);
        }    
    }
    
    $(document).on("click","#shadow-toolbox-anchor",function(event){
        $("#shadow-editor").show();
        event.preventDefault();
        event.stopPropagation();
    });
    
    $(document).on("click","#shadow-editor",function(event){
        event.preventDefault();
        event.stopPropagation();
        
    });
    
    $(document).on("click","#shadow-editor-close",function(event){
        $("#shadow-editor").hide();
        event.preventDefault();
        event.stopPropagation();
        
    });
    
    function _applyShadow(){
        var shadowColor = $("#element-shadow-color").val();
        var xoffset = $("#element-shadow-xoffset").val();
        var yoffset = $("#element-shadow-yoffset").val();
        var spread = $("#element-shadow-spread").val();
        var blur = $("#element-shadow-blur").val();
        var inset = $("#element-shadow-style").val();
        if(shadowColor){
            if(inset === 'inset'){
                lastSelectedRuleset.css('box-shadow','inset '+xoffset+'px '+yoffset+'px '+blur+'px '+spread+'px '+shadowColor);
            }else {
                lastSelectedRuleset.css('box-shadow',xoffset+'px '+yoffset+'px '+blur+'px '+spread+'px '+shadowColor);
            }
            lastSelectedRuleset.persist();
        }
    }
    
    AppInit.appReady(function () {
        $("#element-shadow-color").colorpicker({format:"rgb"}).on('changeColor.colorpicker', function(event){
          _applyShadow();
        });
    });
    
    $(document).on("input","#element-shadow-xoffset",function(){
        _applyShadow();
    });
    
    $(document).on("input","#element-shadow-yoffset",function(){
        _applyShadow();
    });
    
    $(document).on("input","#element-shadow-spread",function(){
        _applyShadow();
    });
    
    $(document).on("input","#element-shadow-blur",function(){
        _applyShadow();
    });
    
    $(document).on("change","#element-shadow-style",function(){
        _applyShadow();
    });        
});