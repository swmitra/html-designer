/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var AppInit       = brackets.getModule("utils/AppInit");
    
    var lastSelectedRuleset = null;
    
    $(document).on("ruleset-wrapper.created","#html-design-editor",function(event,rulesetref){
        var asynchPromise = new $.Deferred();
       lastSelectedRuleset = rulesetref;
       $("#bg-color-toolbox-anchor").val(lastSelectedRuleset.css('background-color'));
        return asynchPromise.promise();
    });
    
    $(document).on("ruleset-wrapper.refreshed","#html-design-editor",function(event,rulesetref){
        var asynchPromise = new $.Deferred();
       lastSelectedRuleset = rulesetref;
        return asynchPromise.promise();
    });
        
    AppInit.appReady(function () {
        $("#bg-color-toolbox-anchor").colorpicker().on('changeColor.colorpicker', function(event){
          lastSelectedRuleset.css('background-color',$("#bg-color-toolbox-anchor").val());
          lastSelectedRuleset.persist();
        });
    });    
});