/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var AppInit       = brackets.getModule("utils/AppInit");
    var lastSelectedRuleset = null;
    
    $(document).on("ruleset-wrapper.created ruleset-wrapper.refreshed","#html-design-editor",function(event,rulesetref){
       lastSelectedRuleset = rulesetref;
    });
    
    function _applyGradient(){
        var startColor = $("#gradient-start-color").val();
        var endColor = $("#gradient-end-color").val();
        var startPos = $("#start-position-input").val();
        var endPos = $("#end-position-input").val();
        var angle = $("#angle-input").val();
        if(startColor && endColor && startPos && endPos && angle){
           lastSelectedRuleset.css('background','linear-gradient('+angle+'deg, '+startColor+' '+startPos+'%, '+endColor+' '+endPos+'%)');
           lastSelectedRuleset.persist();
        }
    }
    
    AppInit.appReady(function () {
        $("#gradient-start-color").colorpicker().on('changeColor.colorpicker', function(event){
          _applyGradient();
        });
        
        $("#gradient-end-color").colorpicker().on('changeColor.colorpicker', function(event){
          _applyGradient();
        });
        
        $("#angle-input").knob({
            'change' : function (v) { 
                $("#angle-input").val(v).trigger('change');
            }
        });
        
    });
    
    $(document).on("input","#start-position-range-input",function(){
        $("#start-position-input").val(this.value);
        _applyGradient();
    });
    
    $(document).on("input","#end-position-range-input",function(){
        $("#end-position-input").val(this.value);
        _applyGradient();
    });
    
    $(document).on("input change","#angle-input",function(){
        _applyGradient();
    });
        
    
    //$(document).on("change","#gradient-start-color",_applyGradient);
    //$(document).on("change","#gradient-end-color",_applyGradient);
    $(document).on("change","#start-position-input",_applyGradient);
    $(document).on("change","#end-position-input",_applyGradient);
    $(document).on("change","#angle-input",_applyGradient);
        
});