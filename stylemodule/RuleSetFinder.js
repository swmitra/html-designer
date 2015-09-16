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
    
    var selectorOccurence = {};
    var mediaOccurence = {};
    
    var currentActiveMedia = null;
    
    $(document).on("activemedia-found","#html-design-editor",function(event,media){
        currentActiveMedia = media;
    });
    
    $(document).on("element.selected","#html-design-editor",function(event,element){
        var asynchPromise = new $.Deferred();
        lastSelection = element;
        _findCSSRuleSets(element);
        asynchPromise.resolve();
        return asynchPromise.promise();
    });
    
    $(document).on("element.selection.refreshed","#html-design-editor",function(event,element){
        var asynchPromise = new $.Deferred();
        _findCSSRuleSets(element,true);
        asynchPromise.resolve();
        return asynchPromise.promise();
    });
    
    $(document).on('multiselect.done',"#html-design-editor",function(event,elements){
        lastSelection = elements;
        _findGroupCSSRuleSets(elements);
     });
    
    function _findStyleSheet(curSelector) {
        var styleSheets = document.getElementById('htmldesignerIframe').contentWindow.document.styleSheets;
        var sheetCount, setCount, styleSheet, ruleSets, ruleSet;
        var ref;
        for (sheetCount = 0; sheetCount < styleSheets.length && !ref; sheetCount++) {
            styleSheet = styleSheets[sheetCount];
            ruleSets = styleSheet.rules;
            for (setCount = 0; setCount < ruleSets.length && !ref; setCount++) {
                ruleSet = ruleSets[setCount];
                if (ruleSet === curSelector) {
                    ref = styleSheet;
                    break;
                }
            }
        }
        return [ref,setCount];
    }
    
    function _findMediaAndStyleSheet(curSelector) {
        var styleSheets = document.getElementById('htmldesignerIframe').contentWindow.document.styleSheets;
        var sheetCount, setCount, styleSheet, ruleSets, ruleSet,ruleCount,mediaRules,mediaRule;
        var ref;
        for (sheetCount = 0; sheetCount < styleSheets.length && !ref; sheetCount++) {
            styleSheet = styleSheets[sheetCount];
            ruleSets = styleSheet.rules;
            for (setCount = 0; setCount < ruleSets.length && !ref; setCount++) {
                ruleSet = ruleSets[setCount];
                if(ruleSet.media && ruleSet === curSelector.parentRule){
                    mediaRules = curSelector.parentRule.cssRules;
                    for (ruleCount = 0; ruleCount < mediaRules.length && !ref; ruleCount++) {
                        mediaRule = mediaRules[ruleCount];
                        if (mediaRule === curSelector) {
                            ref = styleSheet;
                            break;
                        }
                    }
                }
            }
        }
        return [ref,ruleCount];
    }
    
    function _findSpecificRuleSet(sets,lastSelectedElement){
        var rule = null;
        var toBeReturned = null;
        var count;
        var elementID = $(lastSelectedElement).attr('id');
        if(elementID && sets && sets.length>0){
            toBeReturned = sets[sets.length -1];
            if(toBeReturned.selectorText.indexOf(elementID) < 0 ){
               toBeReturned = null;
            }
        }
        return toBeReturned;
    }
    
    function _fetchSelectableTargetRulesets(ruleSets){
        var rule;
        var options = [];
        selectorOccurence = {};
        mediaOccurence = {};
        for(var i=0;ruleSets && i<ruleSets.length;i++){
            rule = ruleSets[i];
            if(rule.parentRule){
                options.push([rule,_findMediaAndStyleSheet(rule)]);
            } else {
                options.push([rule,_findStyleSheet(rule)]);
            }
        }
        return options;
    }
    
    function _contains(ruleSets,ruleset){
        var rule;
        var contains = false;
        for(var i=0;ruleSets && i<ruleSets.length;i++){
            rule = ruleSets[i];
            if(rule === ruleset){
                contains = true;
                break;
            }
        }
        return contains;
    }
    
    function _findRuleByName(name,isKeyframe){
        var styleSheets = document.getElementById('htmldesignerIframe').contentWindow.document.styleSheets;
        var sheetCount, setCount, styleSheet, ruleSets, ruleSet;
        var ref;
        var foundInfo = null;
        for (sheetCount = 0; sheetCount < styleSheets.length && !ref; sheetCount++) {
            styleSheet = document.getElementById('htmldesignerIframe').contentWindow.document.styleSheets[sheetCount];
            ruleSets = styleSheet.rules;
            for (setCount = 0; setCount < ruleSets.length; setCount++) {
                ruleSet = ruleSets[setCount];
                if ((isKeyframe && ruleSet.name === name) || ruleSet.selectorText === name) {
                    foundInfo =[];
                    foundInfo.push(styleSheet);
                    foundInfo.push(setCount);
                }
            }
        }
        return foundInfo;
    }
    
    function _findKeyFrameDefinitions(){
        var styleSheets = document.getElementById('htmldesignerIframe').contentWindow.document.styleSheets;
        var sheetCount, setCount, styleSheet, ruleSets, ruleSet;
        var ref;
        var foundInfo = [];
        for (sheetCount = 0; sheetCount < styleSheets.length && !ref; sheetCount++) {
            styleSheet = document.getElementById('htmldesignerIframe').contentWindow.document.styleSheets[sheetCount];
            ruleSets = styleSheet.rules;
            for (setCount = 0; setCount < ruleSets.length; setCount++) {
                ruleSet = ruleSets[setCount];
                if (ruleSet.name && ruleSet.cssText.indexOf("keyframes ") >= 0 ) {
                    foundInfo.push(ruleSet);
                }
            }
        }
        return foundInfo;
    }
    
    function _findPseudoRulesets(lastSelectedElement,refresh){
        var afterRuleSets = document.getElementById('htmldesignerIframe').contentWindow.getMatchedCSSRules(lastSelectedElement, ':after');
        var beforeRuleSets = document.getElementById('htmldesignerIframe').contentWindow.getMatchedCSSRules(lastSelectedElement, ':before');
        selectorOccurence = {};
        mediaOccurence = {};
        return [_fetchSelectableTargetRulesets(afterRuleSets), _fetchSelectableTargetRulesets(beforeRuleSets)];
        
    }
    
    function _isApplied(element,selector){
        var applied = false;
        try {
            applied = $(element).is(selector);
        } catch(err) {
        }
        return applied;
    }
    
    function _findEmptyMatchedRuleSets(rulesets,element){
        var emptyMatchedSet = [];
        var elementID = element.id;
        var styleSheets = document.getElementById('htmldesignerIframe').contentWindow.document.styleSheets;
        var sheetCount, setCount, styleSheet, ruleSets, ruleSet,ruleCount,mediaRules,mediaRule;
        var ref;
        for (sheetCount = 0; sheetCount < styleSheets.length; sheetCount++) {
            styleSheet = styleSheets[sheetCount];
            ruleSets = styleSheet.rules;
            for (setCount = 0; setCount < ruleSets.length; setCount++) {
                ruleSet = ruleSets[setCount];
                if(ruleSet.media && (ruleSet.media[0] === currentActiveMedia)){
                    mediaRules = ruleSet.cssRules;
                    for (ruleCount = 0; ruleCount < mediaRules.length; ruleCount++) {
                        mediaRule = mediaRules[ruleCount];
                        if(_isApplied(element,mediaRule.selectorText) && !_contains(rulesets,mediaRule)){
                            emptyMatchedSet.push(mediaRule);
                            //rulesets = rulesets.item(mediaRule);
                        }
                    }
                } else if(_isApplied(element,ruleSet.selectorText) && !_contains(rulesets,ruleSet)){
                    emptyMatchedSet.push(ruleSet);
                    //rulesets = rulesets.item(ruleSet);
                } 
            }
        }
        return emptyMatchedSet;
    }
    
    function _ruleSetAsArray(ruleSets){
        var arr = [];
        for(var i=0;ruleSets && i<ruleSets.length;i++){
            arr.push(ruleSets[i]);
        }
        return arr;
    }
    
    function _findCSSRuleSets(lastSelectedElement,refresh){
        var ruleSets = document.getElementById('htmldesignerIframe').contentWindow.getMatchedCSSRules(lastSelectedElement);
        var emptyRuleSets = _findEmptyMatchedRuleSets(ruleSets,lastSelectedElement);
        ruleSets = emptyRuleSets.concat(_ruleSetAsArray(ruleSets));
        selectorOccurence = {};
        mediaOccurence = {};
        var ruleSet = _findSpecificRuleSet(ruleSets,lastSelectedElement);
        if(ruleSet){
            var ref = ruleSet.parentRule ? _findMediaAndStyleSheet(ruleSet) : _findStyleSheet(ruleSet);
            lastSelectedRuleset = [lastSelectedElement,ruleSet,ref];
            if(refresh){
                $("#html-design-editor").trigger("cssselector.refreshed",[lastSelectedElement,ruleSet,ref,_fetchSelectableTargetRulesets(ruleSets),_findPseudoRulesets(lastSelectedElement,refresh)]);
            } else {
                $("#html-design-editor").trigger("cssselector.found",[lastSelectedElement,ruleSet,ref,_fetchSelectableTargetRulesets(ruleSets),_findPseudoRulesets(lastSelectedElement,refresh)]);
            }
        }else{
            lastSelectedRuleset = [lastSelectedElement,null,[null,null]];
            if(refresh){
                $("#html-design-editor").trigger("cssselector.refreshed",[lastSelectedElement,null,[null,null],_fetchSelectableTargetRulesets(ruleSets),_findPseudoRulesets(lastSelectedElement,refresh)]);
            } else {
                $("#html-design-editor").trigger("cssselector.found",[lastSelectedElement,null,[null,null],_fetchSelectableTargetRulesets(ruleSets),_findPseudoRulesets(lastSelectedElement,refresh)]);
            }
        }
    }
    
    function _findGroupCSSRuleSets(elements){
        var groupSets = [];
        var count = 0;
        for(count = 0; count< elements.length; count++){
            var lastSelectedElement = elements[count];
            var ruleSets = document.getElementById('htmldesignerIframe').contentWindow.getMatchedCSSRules(lastSelectedElement);
            selectorOccurence = {};
            mediaOccurence = {};
            var ruleSet = _findSpecificRuleSet(ruleSets,lastSelectedElement);
            if(ruleSet){
                var ref = ruleSet.parentRule ? _findMediaAndStyleSheet(ruleSet) : _findStyleSheet(ruleSet);
                groupSets.push([lastSelectedElement,ruleSet,ref]);
            }else{
                groupSets.push([lastSelectedElement,null,[null,null]]);
            }
        }
        $("#html-design-editor").trigger("groupcssselector.found",[groupSets]);
    }
    
    exports.findRuleByName = _findRuleByName;
    exports.findKeyFrameDefinitions = _findKeyFrameDefinitions;
        
});