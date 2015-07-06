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
    
    function _buildPropertyEntryFragment(key,value){
       var entry = $(PropertyTemplate).appendTo("#ruleset-editor");
       entry.find(".css-property-key").val(key);
       entry.find(".css-property-value").val(value);
       entry.find(".apply-rule-key").unbind();
       entry.find(".apply-rule-key").data('checked','ckecked');
       entry.find(".apply-rule-key").on('click',function(){
           if($(this).data('checked')){
               $(this).data('checked','');
               entry.find(".topcoat-icon").addClass("disabledProperty");
               lastSelectedRuleset.removeProperty(key);
               $("#html-design-editor").trigger("select.element",[lastSelectedRuleset.element]);
           } else {
               $(this).data('checked','ckecked');
               entry.find(".topcoat-icon").removeClass("disabledProperty");
               var currentVal = entry.find(".css-property-value").val();
               lastSelectedRuleset.addPropertyValue(key,currentVal.split('!')[0],currentVal.split('!')[1] || '');
               $("#html-design-editor").trigger("select.element",[lastSelectedRuleset.element]);
           }
           $("#save-ruleset").data('disabled','');
           $("#save-ruleset").css('opacity',1);
       });
       entry.find(".css-property-value").on('change',function(){
           var currentVal = $(this).val();
           lastSelectedRuleset.setPropertyValue(key,currentVal.split('!')[0],currentVal.split('!')[1] || '');
           lastSelectedRuleset.persist();
           $("#html-design-editor").trigger("refresh.element.selection");
           $("#html-design-editor").trigger("select.element",[lastSelectedRuleset.element]);
       });
       return entry;
    }
    
    function _buildPropEditorUI(){
        $("#ruleset-editor").html("");
        $("#save-ruleset").data('disabled','disabled');
        $("#save-ruleset").css('opacity',0.2);
        var propText = lastSelectedRuleset.getRuleAsText();
        var props = _parseRules(propText);
        var prop;
        for (prop in props) {
            if (props.hasOwnProperty(prop)) {
                _buildPropertyEntryFragment(prop,props[prop]);
            }
        }
    }
    
    function _createNewRuleProperty(){
       var entry = $(NewPropertyTemplate).appendTo("#ruleset-editor");
       entry.find(".apply-rule-key").unbind();
       entry.find(".apply-rule-key").data('checked','ckecked');
       entry.find(".apply-rule-key").on('click',function(){
           if($(this).data('checked')){
               $(this).data('checked','');
               entry.find(".topcoat-icon").addClass("disabledProperty");
               lastSelectedRuleset.removeProperty(key);
           } else {
               $(this).data('checked','ckecked');
               entry.find(".topcoat-icon").removeClass("disabledProperty");
               var currentVal = entry.find(".css-property-value").val();
               lastSelectedRuleset.addPropertyValue(key,currentVal.split('!')[0],currentVal.split('!')[1] || '');
           }
       });
       entry.find(".css-property-value").on('change blur',function(){
           var currentVal = $(this).val();
           lastSelectedRuleset.setPropertyValue(entry.find(".css-property-key").val(),currentVal.split('!')[0],currentVal.split('!')[1] || '');
           
           if(lastSelectedRuleset.getPropertyValue(entry.find(".css-property-key").val())){
              entry.find(".apply-rule-key").css('opacity',1);
              entry.find(".css-property-key").attr('disabled','disabled');
               lastSelectedRuleset.persist();
               $("#html-design-editor").trigger("refresh.element.selection");
           } else {
              entry.remove(); 
           }
       });
        var proprtyNames = [];
        var ruleName;
        for (ruleName in properties) {
            if (properties.hasOwnProperty(ruleName)) {
                proprtyNames.push(ruleName);
            }
        }
        
        entry.find(".css-property-key").on("focus", function () {
            entry.find(".css-property-key").keydown();
        });

        entry.find(".css-property-key").autocomplete({
            source: proprtyNames,
            minLength: 0
        });
        entry.find(".css-property-key").focus();
       
       return entry;
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
    
    $(document).on("click","#new-ruleset-property",function(event,rulesetref){
       _createNewRuleProperty();
    });
    
    $(document).on("click","#save-ruleset",function(event,rulesetref){
        if(!$("#save-ruleset").data('disabled')){
            $("#save-ruleset").data('disabled','disabled');
            $("#save-ruleset").css('opacity',0.2);
            lastSelectedRuleset.persist();
        }
    });
    
    $(document).on("refresh-ruleset-properties","#html-design-editor",function(event,rulesetref){
       lastSelectedRuleset = rulesetref;
       _buildPropEditorUI();
    });
        
});