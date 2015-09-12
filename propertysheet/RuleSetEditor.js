/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var CSSProperties = require("text!propertysheet/CSSProperties.json"),
        properties = JSON.parse(CSSProperties);
    
    var PropertyTemplate = require("text!toolboxhtml/cssPropertyTemplate.html");
    var NewPropertyTemplate = require("text!toolboxhtml/cssNewPropertyTemplate.html");
    
    var lastSelectedRuleset = null;
    
    var allowReconstruction = true;
    
    function _buildPropertyEntryFragment(key,value){
       var entry = $(PropertyTemplate).appendTo("#ruleset-editor");
       entry.find(".css-property-key").val(key);
       entry.find(".css-property-value").val(value);
       entry.find(".css-property-value").data('key',key);
       entry.find(".apply-rule-key").data('key',key);
       return entry;
    }
    
    $(document).on('change blur',".css-property-value",function(){
       allowReconstruction = false;
       var currentVal = $(this).val();
       var key = $(this).data('key');
       var entry = $(this).parent();
       lastSelectedRuleset.setPropertyValue(key,currentVal.split('!')[0],currentVal.split('!')[1] || '');
       if(lastSelectedRuleset.getPropertyValue(key)){
            entry.find(".css-property-key").attr('disabled','disabled');
            lastSelectedRuleset.persist();
       } else {
          $(this).css('background','rgba(255,0,0,0.3)');
       }
       $("#html-design-editor").trigger("refresh.element.selection");
       window.setTimeout(function(){
           allowReconstruction = true;
       },100);
    });

    $(document).on('change blur',".css-property-key",function(){
        var currentVal = $(this).val();
        var entry = $(this).parent();
        if(currentVal){
            entry.find(".css-property-value").data('key',currentVal);
            entry.find(".css-property-value").focus();
            $(this).attr('disabled','disabled');
        } else {
            entry.remove();
        }
    });

    $(document).on('focus',".css-property-key",function(){
        $(this).keydown();
    });
    
    $(document).on('click',".apply-rule-key",function(){
        allowReconstruction = false;
        var key = $(this).data('key');
        lastSelectedRuleset.removeProperty(key);
        lastSelectedRuleset.persist();
        $(this).parent().remove();
        $("#html-design-editor").trigger("refresh.element.selection");
        window.setTimeout(function(){
           allowReconstruction = true;
       },100);
    });
    
    function _buildPropEditorUI(){
        $("#ruleset-editor").empty("");
        var propText = lastSelectedRuleset.getRuleAsText();
        var props = _parseRules(propText);
        var prop;
        var index = 0;
        for (prop in props) {
            if (props.hasOwnProperty(prop)) {
                _buildPropertyEntryFragment(prop,props[prop]);
                index++;
            }
        }
    }
    
    function _createNewRuleProperty(){
        var entry = $(NewPropertyTemplate).appendTo("#ruleset-editor");
        var proprtyNames = [];
        var ruleName;
        for (ruleName in properties) {
            if (properties.hasOwnProperty(ruleName)) {
                proprtyNames.push(ruleName);
            }
        }

        entry.find(".css-property-key").autocomplete({
            source: proprtyNames,
            minLength: 0
        });
        
        entry.find(".css-property-key").focus();
    }
    
    function _parseRules(cssText) {
        var returnObj = {};
        if (cssText !== "" && cssText !== undefined && cssText.split(' ').join('') !== "{}") {
            cssText = cssText.replace(/; \}/g, "}")
                .replace(/ \{ /g, "{\"")
                .replace(/: /g, "\":\"")
                .replace(/; /g, "\",\"")
                .replace(/\}/g, "\"}");
            returnObj = JSON.parse(cssText);
        }
        if (cssText === " { }") {
            returnObj = JSON.parse(cssText);
        }
        return returnObj;
    }
    
    $(document).on("click","#new-ruleset-property",function(event/*,rulesetref*/){
       _createNewRuleProperty();
    });
    
    
    $(document).on("refresh-ruleset-properties","#html-design-editor",function(event,rulesetref){
        if(allowReconstruction){
           lastSelectedRuleset = rulesetref;
           _buildPropEditorUI();
        }
    });
    
    $(document).on("deselect.all","#html-design-editor",function(event){
       $("#ruleset-editor").empty("");
       lastSelectedRuleset = null;
    });
        
});