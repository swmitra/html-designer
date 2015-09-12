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
        var asynchPromise = new $.Deferred();
        if(rulesetref /*&& rulesetref !== lastSelectedRuleset*/){
            $("#bg-color-toolbox-anchor").val(rulesetref.css('background-color'));
                //$("#bg-color-toolbox-anchor").colorpicker('setValue', rulesetref.css('background-color'));
        }
        lastSelectedRuleset = rulesetref;
        asynchPromise.resolve();
        return asynchPromise.promise();
    });
    
    function _changeBGColor(){
        window.setTimeout(function(){
            lastSelectedRuleset.css('background-color',$("#bg-color-toolbox-anchor").val());
            lastSelectedRuleset.persist();
        },1);
    }
    
    $(document).on('focus',"#bg-color-toolbox-anchor",function(event){
        $("#bg-color-toolbox-anchor").colorpicker('setValue', lastSelectedRuleset.css('background-color'));
    });
        
    AppInit.appReady(function () {
        $("#bg-color-toolbox-anchor").colorpicker()
            .on('changeColor.colorpicker', _changeBGColor);
    });    
});