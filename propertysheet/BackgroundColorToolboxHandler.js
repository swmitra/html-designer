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
        if(rulesetref && rulesetref !== lastSelectedRuleset){
            $("#bg-color-toolbox-anchor").val(rulesetref.css('background-color'));
        }
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