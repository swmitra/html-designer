/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var AppInit       = brackets.getModule("utils/AppInit");
    var ConversionUtils = require("propertysheet/UnitConversionUtils");
    
    var lastSelectedRuleset = null;
    
    $(document).on("ruleset-wrapper.created ruleset-wrapper.refreshed","#html-design-editor",function(event,rulesetref){
        var asynchPromise = new $.Deferred();
       lastSelectedRuleset = rulesetref;
       $("#bg-color-toolbox-anchor").val(lastSelectedRuleset.css('background-color'));
        return asynchPromise.promise();
    });
    
    $(document).on("change","#bg-color-toolbox-anchor",function(){
        lastSelectedRuleset.css('background-color',$("#bg-color-toolbox-anchor").val());
        lastSelectedRuleset.persist();
    });
        
    AppInit.appReady(function () {
        $("#bg-color-toolbox-anchor").ColorPicker({
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
                lastSelectedRuleset.persist();
            },
            onBeforeShow: function () {
                if(this.value && this.value.indexOf('rgb')>=0){
                    $(this).ColorPickerSetColor(ConversionUtils.rgb2hex(this.value));
                } else {
                    $(this).ColorPickerSetColor(this.value);
                }
            },
            onChange: function (hsb, hex, rgb) {
                $("#bg-color-toolbox-anchor").val('#' + hex);
                lastSelectedRuleset.css('background-color',$("#bg-color-toolbox-anchor").val());
            }
        })
        .bind('keyup', function(){
            $(this).ColorPickerSetColor(this.value);
        });
    });    
});