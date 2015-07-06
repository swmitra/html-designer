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
    
    /*$(document).on("click","#bg-gradient-toolbox-anchor",function(event){
        $('.property-toolbox').trigger('hide'); 
        $("#gradient-editor").show();
        event.preventDefault();
        event.stopPropagation();
    });
    
    $(document).on("hide",".property-toolbox",function(event){
        $("#gradient-editor").hide();
    });
    
    $(document).on("click","#gradient-editor-close",function(event){
        $("#gradient-editor").hide();
        event.preventDefault();
        event.stopPropagation();
        
    });*/
    
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
        $("#gradient-start-color").ColorPicker({
            onShow: function (colpkr) {
                $(colpkr).fadeIn(500);
                return false;
            },
            onHide: function (colpkr) {
                $(colpkr).fadeOut(500);
                return false;
            },
            onSubmit: function(hsb, hex, rgb, el) {
                $(el).val(hex);
                $(el).ColorPickerHide();
            },
            onBeforeShow: function () {
                $(this).ColorPickerSetColor(this.value);
            },
            onChange: function (hsb, hex, rgb) {
                $("#gradient-start-color").val('#' + hex);
                _applyGradient();
            }
        })
        .bind('keyup', function(){
            $(this).ColorPickerSetColor(this.value);
        });
        
        $("#gradient-end-color").ColorPicker({
            onShow: function (colpkr) {
                $(colpkr).fadeIn(500);
                return false;
            },
            onHide: function (colpkr) {
                $(colpkr).fadeOut(500);
                return false;
            },
            onSubmit: function(hsb, hex, rgb, el) {
                $(el).val(hex);
                $(el).ColorPickerHide();
            },
            onBeforeShow: function () {
                $(this).ColorPickerSetColor(this.value);
            },
            onChange: function (hsb, hex, rgb) {
                $("#gradient-end-color").val('#' + hex);
                _applyGradient();
            }
        })
        .bind('keyup', function(){
            $(this).ColorPickerSetColor(this.value);
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
        
    
    $(document).on("change","#gradient-start-color",_applyGradient);
    $(document).on("change","#gradient-end-color",_applyGradient);
    $(document).on("change","#start-position-input",_applyGradient);
    $(document).on("change","#end-position-input",_applyGradient);
    $(document).on("change","#angle-input",_applyGradient);
        
});