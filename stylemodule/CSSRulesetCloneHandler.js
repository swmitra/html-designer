/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var AppInit       = brackets.getModule("utils/AppInit");
    var lastSelection = null;
    var lastSelectedRuleset = null;
    var RuleSetCreator = require("stylemodule/RuleSetCreator");
    
    var selectorOccurence = {};
    
    function _findStyleSheet(curSelector) {
        if(selectorOccurence[curSelector.selectorText]){
           selectorOccurence[curSelector.selectorText] = parseInt(selectorOccurence[curSelector.selectorText]) + 1; 
        } else {
           selectorOccurence[curSelector.selectorText] = 1; 
        }
        var occurenceIndex = 1;
        var styleSheets = document.getElementById('htmldesignerIframe').contentWindow.document.styleSheets;
        var sheetCount, setCount, styleSheet, ruleSets, ruleSet;
        var ref;
        for (sheetCount = 0; sheetCount < styleSheets.length && !ref; sheetCount++) {
            styleSheet = document.getElementById('htmldesignerIframe').contentWindow.document.styleSheets[sheetCount];
                ruleSets = styleSheet.rules;
                for (setCount = 0; setCount < ruleSets.length && !ref; setCount++) {
                    ruleSet = ruleSets[setCount];
                    if (ruleSet.selectorText === curSelector.selectorText) {
                        if(occurenceIndex === selectorOccurence[curSelector.selectorText]){
                            ref = styleSheet;
                            break;
                        } else {
                            occurenceIndex++;
                        }
                    }
                }
        }
        return [ref,setCount];
    }
    
    function _fetchClonableTargetRulesets(ruleSets,elementID){
        var rule;
        var options = [];
        selectorOccurence = {};
        for(var i=0;ruleSets && i<ruleSets.length;i++){
            rule = ruleSets[i];
            if(rule.selectorText.indexOf(elementID) > 0){
                options.push([rule,_findStyleSheet(rule)]);
            }
        }
        return options;
    }
    
    function _findGroupCSSRuleSets(elements){
        var groupSets = [];
        var count = 0;
        for(count = 0; count< elements.length; count++){
            var lastSelectedElement = elements[count];
            var ruleSets = document.getElementById('htmldesignerIframe').contentWindow.getMatchedCSSRules(lastSelectedElement);
            var id = $(lastSelectedElement).attr('id');
            var ruleGroup = _fetchClonableTargetRulesets(ruleSets,id);
            groupSets.push([lastSelectedElement,ruleGroup]);
        }
        return groupSets;
    }
    
    function _cloneCSSSelectors(elements, idMap){
        var ruleSets = _findGroupCSSRuleSets(elements);
        var group = null;
        var targetID = null;
        var sourceID = null;
        var element = null;
        var set = null;
        var cssText = null;
        for(var count = 0;count<ruleSets.length;count++){
            group = ruleSets[count];
            element = group[0];
            if(element){
                set = group[1];
                sourceID = element.id;
                targetID = idMap[sourceID];
                for(var index=0;index<set.length;index++){
                    cssText = set[0][0].cssText.split(sourceID).join(targetID);
                    RuleSetCreator.createNewRule(set[0][1][0],cssText,set[0][1][1]);
                }
            }
        }
    }
    
    AppInit.appReady(function () {
        
    });
    
    exports.cloneCSSRules = _cloneCSSSelectors;
        
});