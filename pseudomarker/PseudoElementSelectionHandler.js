/**
 * @author Swagatam Mitra
  
 */

define(function (require, exports, module) {
    "use strict";
    
    var lastRuleSet = null;
    var lastTransitionState = undefined;
    
    require("pseudomarker/PseudoElementDragHandler");
    
    
    //ADCSSRuleSet prototype
    function ADCSSRuleSet(cssRuleSet,lastSelectedElement,ref,allOptions,pseudoOptions){
        this.ruleSet = cssRuleSet;
        this.element = lastSelectedElement;
        this.styleSheetRef = ref[0];
        this.ruleSetPos = ref[1];
        this.editableRuleSets = allOptions;
        this.pseudoAfterRuleSets = pseudoOptions[0];
        this.pseudoBeforeRuleSets = pseudoOptions[1];
    }
    
    function _applyPositionalParams($element,rule){
        var left = rule.getPropertyValue("left"),
            top = rule.getPropertyValue("top"),
            width = rule.getPropertyValue("width"),
            height = rule.getPropertyValue("height");
        
        $element
            .css("top",top)
            .css("left",left)
            .css("width",width)
            .css("height",height);
    }
    
    function _showAfterPseudoMarker(){
        if(lastRuleSet.pseudoAfterRuleSets[0] && lastRuleSet.pseudoAfterRuleSets[0][0]){
            _applyPositionalParams($("#pseudo-after-outline"),lastRuleSet.pseudoAfterRuleSets[0][0].style);
            $("#pseudo-after-outline").show();
        } else {
            $("#pseudo-after-outline").hide();
        }
    }
    
    function _showBeforePseudoMarker(){
        
    }
                                         
    $(document).on("ruleset-wrapper.created","#html-design-editor", function(event,ruleset){
        lastRuleSet = ruleset;
        _showAfterPseudoMarker();
    });
    
    $(document).on("ruleset-wrapper.refreshed","#html-design-editor", function(event,ruleset){
         lastRuleSet = ruleset;
    });
    
});
