/**
 * @author Swagatam Mitra
  
 */

define(function (require, exports, module) {
    "use strict";
    
     var AppInit       = brackets.getModule("utils/AppInit"),
        FileUtils   = brackets.getModule("file/FileUtils"),
        DocumentManager = brackets.getModule("document/DocumentManager"),
        EditorManager = brackets.getModule("editor/EditorManager");
    
    var ConversionUtils = require("propertysheet/UnitConversionUtils");
    var ActiveBreakpointListner = require("responsive/ActiveBreakpointListner");
    
    var CSSNodeFormatter = require('stylemodule/CSSNodeFormatter');
    var currentApplication = null;
    var priority = '';
    var lastRuleSet = null;
    var lastTransitionState = undefined;
    
    function _forceCSSReflow(element){
       /* element.offsetHeight = element.offsetHeight;*/
    }
    
    function _disableTransition(ruleSet){
        /*lastTransitionState = ruleSet.element.style['transition'];
        $(ruleSet.element).css('transition', "none !important");
        _forceCSSReflow(ruleSet.element);*/ // Trigger a css reflow, force flushing the CSS changes
    }
    
    function _restoreTransition(ruleSet){
        //_forceCSSReflow(ruleSet.element); // Trigger a css reflow, force flushing the CSS changes made after disabling animation
        /*$(ruleSet.element).css('transition', lastTransitionState || '');*/
    }
    
    function _parse(prop){
        var p = parseFloat(prop), q = prop.replace(/^[\-\d\.]+/,'');
        return isNaN(p) ? { v: q, u: ''} : { v: p, u: q };
    }
    
    function _getConvertedValue(element,current,toBeset,type,key){
       var value = toBeset;
       var parsedExpr;
       var base,operator,comp;
       var convertedComp;
       
       toBeset = _parse(toBeset+'');
       if(!toBeset.u){
           toBeset.u = 'px';
       }
       
       if(current && ConversionUtils.hasCalc(current)){
           parsedExpr = ConversionUtils.parseCalcExpression(current);
           if(parsedExpr.length === 3){
             base = parsedExpr[0];
             operator = parsedExpr[1];
             comp = parsedExpr[2];
           } 
           
           value = toBeset.v - parseInt($(element).css(key));            
           convertedComp = ConversionUtils.getUnits(element,value,'px',comp.unit,type);
           convertedComp = comp.unit === 'px' ? parseInt(convertedComp) : parseFloat(convertedComp);
           var newComp;
           
           //compute a signed value
           newComp = comp.value - value;
           
           //sign merging
           /*if(newComp < 0 && operator === '-'){
               operator = '+';
               newComp = 0 - newComp;
           }else if(newComp < 0 && operator === '+'){
               operator = '-';
               newComp = 0 - newComp;
           }*/
           
           value = 'calc('+base.value+base.unit+' '+operator+' '+newComp+comp.unit+')';
       }
       
       if(!comp){
         current = !current || parseFloat(current) === NaN ? $(element).css(key) : current;
         current = _parse(current+'');       
         if(current.u && current.u !== toBeset.u){
             if(current.u === '%' || current.u === 'em' || current.u === 'rem'){
                 var diff = toBeset.v - parseInt($(element).css(key));
                 value = ConversionUtils.getUnits(element,diff,toBeset.u || 'px',current.u,type);
                 value = (current.v + parseFloat(value))+current.u;
             } else {
                value = ConversionUtils.getUnits(element,toBeset.v,toBeset.u || 'px',current.u,type);
             }
         } else {
             value = toBeset.v+toBeset.u;
         }
       }
       return value;
   }
    
    //ADCSSRuleSet prototype
    function ADCSSRuleSet(cssRuleSet,lastSelectedElement,ref,allOptions,pseudoOptions){
        this.ruleSet = cssRuleSet;
        this.element = lastSelectedElement;
        this.styleSheetRef = ref[0];
        this.ruleSetPos = ref[1];
        this.editableRuleSets = allOptions;
        if(pseudoOptions){
            this.pseudoAfterRuleSets = pseudoOptions[0];
            this.pseudoBeforeRuleSets = pseudoOptions[1];
        }
        if(this.ruleSet && this.ruleSet.parentRule){
            $("#css-target-select").css('border-left','15px solid '+ActiveBreakpointListner.getAccentColor(this.ruleSet.parentRule.media[0]));
        } else {
            $("#css-target-select").css('border-left','');
        }
        //this.pendingUpdates = [];
    }
    
    ADCSSRuleSet.prototype.update = function (cssRuleSet,ref,allOptions,pseudoOptions){
        this.ruleSet = cssRuleSet;
        this.styleSheetRef = ref[0];
        this.ruleSetPos = ref[1];
        this.editableRuleSets = allOptions;
        if(pseudoOptions){
            this.pseudoAfterRuleSets = pseudoOptions[0];
            this.pseudoBeforeRuleSets = pseudoOptions[1];
        }
    }
    
    ADCSSRuleSet.prototype.createSavePoint = function(){
        var option;
        var rollbackDef = [];
        rollbackDef[0] = this.element.style.cssText;
        for(var i=0;i<this.editableRuleSets.length;i++){
            option = this.editableRuleSets[i];
            rollbackDef[i+1] = option[0].cssText;
        }
        this.savepoint = rollbackDef;
        return this.savepoint;
    }
    
    ADCSSRuleSet.prototype.rollBack = function(savePnt){
        var option;
        this.savepoint = savePnt || this.savepoint;
        if(this.savepoint){
            this.element.style.cssText = this.savepoint[0];
            for(var i=0;i<this.editableRuleSets.length;i++){
                option = this.editableRuleSets[i];
                if(this.ruleSet.parentRule){
                     this.parentRule.insertRule(this.ruleSet.cssText, this.ruleSetPos);
                     this.parentRule.deleteRule(this.ruleSetPos+1);
                     option[1].parentRule.insertRule(this.savepoint[i+1], option[1][1]);
                     option[1].parentRule.deleteRule(option[1][1] + 1);
                 } else {
                     option[1][0].insertRule(this.savepoint[i+1], option[1][1]);
                     option[1][0].deleteRule(option[1][1] + 1);
                 }
                var styleText = CSSNodeFormatter.formatCSSAsText(option[1][0],!option[1][0].href);
                if(!option[1][0].href){
                     option[1][0].ownerNode.innerText = styleText;
                     $("#html-design-editor").trigger('html.element.updated');
                 } else {
                      DocumentManager.getDocumentForPath(option[1][0].href.replace(brackets.platform === 'mac' ? 'file://' : 'file:///','').split('?')[0].split("%20").join(" "))
                        .done(function (doc) {
                            $("#html-design-editor").trigger('before.cssdoc.save');
                            doc.setText(styleText);
                            $("#html-design-editor").trigger("cssdoc.changed",[currentApplication,doc]);
                            $("#html-design-editor").trigger('after.cssdoc.save');
                        });
                 }
            }
            $("#html-design-editor").trigger('html.element.updated');
            $("#html-design-editor").trigger("refresh.element.selection");
        }
    }
    
    ADCSSRuleSet.prototype.boxModelCSS = function(key,value, type ,passThrough){
        var asynchPromise = new $.Deferred();
        if(value !== undefined){
            //_disableTransition(this);
            value = passThrough? value : _getConvertedValue(this.element,this.getPropertyValue(key),value,type,key);
            if(this.ruleSet){
                 priority = this.ruleSet.style.getPropertyPriority(key) || "";
                 this.ruleSet.style.removeProperty(key);
                 this.ruleSet.style.setProperty(key,value, priority);
                 this.ruleSet.style.cssText = this.ruleSet.style.cssText;
                 /*if(!this.ruleSet.parentRule) {
                     this.styleSheetRef.insertRule(this.ruleSet.cssText, this.ruleSetPos);
                     this.styleSheetRef.deleteRule(this.ruleSetPos+1);
                 }*/
            }else{
                 priority = this.element.style.getPropertyPriority(key) || "";
                 this.element.style.removeProperty(key);
                 this.element.style.setProperty(key,value, priority);
                 this.element.style.cssText = this.element.style.cssText;
            }
            //_restoreTransition(this);
        }
        $("#html-design-editor").trigger("css-prop-modification",[key,$(this.element).css(key)]);
        asynchPromise.resolve();
        return asynchPromise.promise();
    }
    
    ADCSSRuleSet.prototype.boxModelHCSS = function(key,value,passThrough){
        this.boxModelCSS(key,value,'h',passThrough);
    }
    
    ADCSSRuleSet.prototype.boxModelVCSS = function(key,value,passThrough){
        this.boxModelCSS(key,value,'v',passThrough);
    }
    
    ADCSSRuleSet.prototype.css = function(key,value){
        if(value !== undefined){
            _disableTransition(this);
            if(this.ruleSet){
                 priority = this.ruleSet.style.getPropertyPriority(key) || "";
                 this.ruleSet.style.removeProperty(key);
                 this.ruleSet.style.setProperty(key,value, priority);
                 this.ruleSet.style.cssText = this.ruleSet.style.cssText;
                 /*if(!this.ruleSet.parentRule) {
                     this.styleSheetRef.insertRule(this.ruleSet.cssText, this.ruleSetPos);
                     this.styleSheetRef.deleteRule(this.ruleSetPos+1);
                 }*/
            }else{
                 priority = this.element.style.getPropertyPriority(key) || "";
                 this.element.style.removeProperty(key);
                 this.element.style.setProperty(key,value, priority);
                 this.element.style.cssText = this.element.style.cssText;
            }
            _restoreTransition(this);
            $("#html-design-editor").trigger("css-prop-modification",[key,$(this.element).css(key)]);
        } else {
            return $(this.element).css(key);
        }
    }
    
    ADCSSRuleSet.prototype.getDefinitePropertyValue = function(key){
        var value = this.getAcceptedPropertyValue(key);
        if(!value) {
            value =  $(this.element).css(key);
        }
        return value;
    }
    
    ADCSSRuleSet.prototype.getAcceptedPropertyValue = function(key){
        
        var lastSelectorUsed;
        var lastPriorityUsed;
        
        var value = null,tmpValue;
        var isPrioritySet = false;
        var rule;
        value = this.element.style.getPropertyValue(key);
        var isDefaultPrioritySet = this.element.style.getPropertyPriority(key);
        lastPriorityUsed = isDefaultPrioritySet;
        
        for(var i=0;i<this.editableRuleSets.length && !isDefaultPrioritySet;i++){
            rule = this.editableRuleSets[i][0];
            tmpValue = rule.style.getPropertyValue(key);
            isPrioritySet = rule.style.getPropertyPriority(key);
            if(tmpValue){
                if(!value){
                    value = tmpValue;
                    lastSelectorUsed = rule.selectorText;
                    lastPriorityUsed = isPrioritySet;
                } else {
                    if(lastSelectorUsed === rule.selectorText){
                        if(isPrioritySet || (!isPrioritySet && !lastPriorityUsed)){
                            value = tmpValue;
                            lastSelectorUsed = rule.selectorText;
                            lastPriorityUsed = isPrioritySet;
                        }
                    } else if(isPrioritySet){
                        if(!lastPriorityUsed){
                            value = tmpValue;
                            lastSelectorUsed = rule.selectorText;
                            lastPriorityUsed = isPrioritySet;
                        }
                    }
                }
            }
        }
        return value;
    }
    
    ADCSSRuleSet.prototype.pseudoaftercss = function(key,value){
        var localRuleSet = null;
        var styleSheetTmp = null;
        var position = -1;
        if(this.pseudoAfterRuleSets[0] && this.pseudoAfterRuleSets[0][0]){
            localRuleSet = this.pseudoAfterRuleSets[0][0];
            styleSheetTmp = this.pseudoAfterRuleSets[0][1][0];
            position = this.pseudoAfterRuleSets[0][1][1];
        }
        if(value !== undefined ){
            if(localRuleSet){
                 priority = localRuleSet.style.getPropertyPriority(key) || "";
                 localRuleSet.style.removeProperty(key);
                 localRuleSet.style.setProperty(key,value, priority);
                 localRuleSet.style.cssText = localRuleSet.style.cssText;
                 styleSheetTmp.insertRule(localRuleSet.cssText, position);
                 styleSheetTmp.deleteRule(position+1);
            }
        } 
    }
    
    ADCSSRuleSet.prototype.pseudobeforecss = function(key,value){
        var localRuleSet = null;
        var styleSheetTmp = null;
        var position = -1;
        if(this.pseudoBeforeRuleSets[0] && this.pseudoBeforeRuleSets[0][0]){
            localRuleSet = this.pseudoBeforeRuleSets[0][0];
            styleSheetTmp = this.pseudoBeforeRuleSets[0][1][0];
            position = this.pseudoBeforeRuleSets[0][1][1];
        }
        if(value !== undefined ){
            if(localRuleSet){
                 priority = localRuleSet.style.getPropertyPriority(key) || "";
                 localRuleSet.style.removeProperty(key);
                 localRuleSet.style.setProperty(key,value, priority);
                 localRuleSet.style.cssText = localRuleSet.style.cssText;
                 styleSheetTmp.insertRule(localRuleSet.cssText, position);
                 styleSheetTmp.deleteRule(position+1);
            }
        } 
    }
    
    ADCSSRuleSet.prototype.pseudobeforepersist = function(){
        var localRuleSet = null;
        var styleSheetTmp = null;
        var position = -1;
        if(this.pseudoBeforeRuleSets[0] && this.pseudoBeforeRuleSets[0][0]){
            localRuleSet = this.pseudoBeforeRuleSets[0][0];
            styleSheetTmp = this.pseudoBeforeRuleSets[0][1][0];
            position = this.pseudoBeforeRuleSets[0][1][1];
        }
        var styleText = CSSNodeFormatter.formatCSSAsText(styleSheetTmp,!styleSheetTmp.href);
        if(!styleSheetTmp.href){
             styleSheetTmp.ownerNode.innerText = styleText;
             $("#html-design-editor").trigger('html.element.updated');
             $("#html-design-editor").trigger("refresh.element.selection");
         } else {
              DocumentManager.getDocumentForPath(styleSheetTmp.href.replace(brackets.platform === 'mac' ? 'file://' : 'file:///','').split('?')[0].split("%20").join(" "))
                .done(function (doc) {
                    $("#html-design-editor").trigger('before.cssdoc.save');
                    doc.setText(styleText);
                    $("#html-design-editor").trigger("cssdoc.changed",[currentApplication,doc]);
                    $("#html-design-editor").trigger('after.cssdoc.save');
                });
         }
    }
    
    ADCSSRuleSet.prototype.pseudoafterpersist = function(){
        var localRuleSet = null;
        var styleSheetTmp = null;
        var position = -1;
        if(this.pseudoAfterRuleSets[0] && this.pseudoAfterRuleSets[0][0]){
            localRuleSet = this.pseudoAfterRuleSets[0][0];
            styleSheetTmp = this.pseudoAfterRuleSets[0][1][0];
            position = this.pseudoAfterRuleSets[0][1][1];
        }
        var styleText = CSSNodeFormatter.formatCSSAsText(styleSheetTmp,!styleSheetTmp.href);
        if(!styleSheetTmp.href){
             styleSheetTmp.ownerNode.innerText = styleText;
             $("#html-design-editor").trigger('html.element.updated');
             $("#html-design-editor").trigger("refresh.element.selection");
         } else {
              DocumentManager.getDocumentForPath(styleSheetTmp.href.replace(brackets.platform === 'mac' ? 'file://' : 'file:///','').split('?')[0].split("%20").join(" "))
                .done(function (doc) {
                    $("#html-design-editor").trigger('before.cssdoc.save');
                    doc.setText(styleText);
                    $("#html-design-editor").trigger("cssdoc.changed",[currentApplication,doc]);
                    $("#html-design-editor").trigger('after.cssdoc.save');
                });
         }
    }
    
    ADCSSRuleSet.prototype.setPropertyValue = function(key,value,priorityparam){
        if(value !== undefined){
            if(this.ruleSet){
                 this.ruleSet.style.removeProperty(key);
                 this.ruleSet.style.setProperty(key,value, priorityparam);
                 this.ruleSet.style.cssText = this.ruleSet.style.cssText;
                 /*if(!this.ruleSet.parentRule) {
                     this.styleSheetRef.insertRule(this.ruleSet.cssText, this.ruleSetPos);
                     this.styleSheetRef.deleteRule(this.ruleSetPos+1);
                 }*/
            } else {
                 this.element.style.removeProperty(key);
                 this.element.style.setProperty(key,value, priorityparam);
                 this.element.style.cssText = this.element.style.cssText;
            }
            $("#html-design-editor").trigger("css-prop-modification",[key,$(this.element).css(key)]);
        }
    }
    
    ADCSSRuleSet.prototype.getPropertyValue = function(key){
        if(this.ruleSet){
             return this.ruleSet.style.getPropertyValue(key);
        } else {
             return this.element.style.getPropertyValue(key);
        }
    }
    
    ADCSSRuleSet.prototype.addPropertyValue = function(key,value,priorityparam){
        if(value !== undefined){
            if(this.ruleSet){
                 this.ruleSet.style.setProperty(key,value, priorityparam);
                 this.ruleSet.style.cssText = this.ruleSet.style.cssText;
                 if(!this.ruleSet.parentRule) {
                     this.styleSheetRef.insertRule(this.ruleSet.cssText, this.ruleSetPos);
                     this.styleSheetRef.deleteRule(this.ruleSetPos+1);
                 }
            } else{
                 this.element.style.setProperty(key,value, priorityparam);
                 this.element.style.cssText = this.element.style.cssText;
            }
            $("#html-design-editor").trigger("css-prop-addition",[key,$(this.element).css(key)]);
        }
    }
    
    
    
    ADCSSRuleSet.prototype.getRuleAsText = function(){
        var cssText = '{}';
        if(this.ruleSet){
             cssText = ' { '+this.ruleSet.style.cssText.replace(this.ruleSet.selectorText,'')+' }'; 
        } else {
            cssText = ' { '+this.element.style.cssText+' }';
        }
        return cssText;
    }
    
    ADCSSRuleSet.prototype.updatePropertyPriority = function(key,value,priorityparam){
        this.setPropertyValue(key,value,priorityparam);
    }
    
    ADCSSRuleSet.prototype.removeProperty = function(key){
        if(this.ruleSet){
             this.ruleSet.style.removeProperty(key);
             this.ruleSet.style.cssText = this.ruleSet.style.cssText;
             if(!this.ruleSet.parentRule) {
                 this.styleSheetRef.insertRule(this.ruleSet.cssText, this.ruleSetPos);
                 this.styleSheetRef.deleteRule(this.ruleSetPos+1);
             }
        } else {
             this.element.style.removeProperty(key);
             this.element.style.cssText = this.element.style.cssText;
        }
        $("#html-design-editor").trigger("css-prop-removal",[key,$(this.element).css(key)]);
    }
    
    ADCSSRuleSet.prototype.changeTargetSelector = function(selectorKey){
        var option,targetOption;
        var targetFile = null;
        var filters = selectorKey.split('{sep}');
        if(filters[2]){
            targetFile = filters[2];
        }
            
        if(filters[0] === 'element.style'){
            this.ruleSet = null;
            this.styleSheetRef = null;
            this.ruleSetPos = null;
            $("#css-target-select").css('border-left','');
        } else {
            option = this.editableRuleSets[parseInt(filters[4])];
            this.ruleSet = option[0];
            this.styleSheetRef = option[1][0];
            this.ruleSetPos = option[1][1];
            if(this.ruleSet.parentRule){
                $("#css-target-select").css('border-left','15px solid '+ActiveBreakpointListner.getAccentColor(this.ruleSet.parentRule.media[0]));
            } else {
                $("#css-target-select").css('border-left','');
            }                               
        }
        $("#html-design-editor").trigger("target-selector-changed",[this]);
    }
    
    ADCSSRuleSet.prototype.getPreferredSelectorValue = function(){
        var prefferedValue = ['element.style','element.style{sep}0{sep}'+FileUtils.getBaseName(currentApplication.split('?')[0])];
        var counter;
        if(this.ruleSet){
           for(counter = 0;counter<this.editableRuleSets.length;counter++){
               if(this.editableRuleSets[counter][0] === this.ruleSet){
                   break;
               }
           }
           var mediaString = this.ruleSet.parentRule ? "(Media)" : "";
           prefferedValue = [this.ruleSet.selectorText+mediaString,this.ruleSet.selectorText+'{sep}'+this.ruleSetPos+'{sep}'+((this.styleSheetRef ? this.styleSheetRef.href : '') || '')+'{sep}'+ (this.ruleSet.parentRule ? this.ruleSet.parentRule.media[0] : "")+'{sep}'+counter];
        }
        return prefferedValue;
    }
    
    ADCSSRuleSet.prototype.getTargetSelectorOptions = function(){
        var selectorList = [];
        var mediaString = "";
        for(var i=0;i<this.editableRuleSets.length;i++){
            mediaString = this.editableRuleSets[i][0].parentRule ? "(Media)" : "";
            selectorList.push([this.editableRuleSets[i][0].selectorText+mediaString
                               ,(this.editableRuleSets[i][0].selectorText+'{sep}'+this.editableRuleSets[i][1][1]+'{sep}'+((this.editableRuleSets[i][1][0] ? this.editableRuleSets[i][1][0].href : '') || '')+'{sep}'+ (this.editableRuleSets[i][0].parentRule ? this.editableRuleSets[i][0].parentRule.media[0] : "")+'{sep}'+i)+'']);
        }
        selectorList.push(['element.style','element.style{sep}0{sep}'+FileUtils.getBaseName(currentApplication.split('?')[0])]);
        return selectorList;
    }
    
    ADCSSRuleSet.prototype.isGroup = function(){
        return false;
    }
    
    ADCSSRuleSet.prototype.persist = function(){
        if(this.ruleSet){
            //deferred media write
            if(this.ruleSet.parentRule){
                 this.ruleSet.parentRule.insertRule(this.ruleSet.cssText, this.ruleSetPos);
                 this.ruleSet.parentRule.deleteRule(this.ruleSetPos+1);
             } else {
                 this.styleSheetRef.insertRule(this.ruleSet.cssText, this.ruleSetPos);
                 this.styleSheetRef.deleteRule(this.ruleSetPos+1);
             }
             var styleText = CSSNodeFormatter.formatCSSAsText(this.styleSheetRef,!this.styleSheetRef.href);

             if(!this.styleSheetRef.href){
                 this.styleSheetRef.ownerNode.innerText = styleText;
                 $("#html-design-editor").trigger('html.element.updated');
                 $("#html-design-editor").trigger("element.selected",[this.element]);
             } else {
                  DocumentManager.getDocumentForPath(this.styleSheetRef.href.replace(brackets.platform === 'mac' ? 'file://' : 'file:///','').split('?')[0].split("%20").join(" "))
                    .done(function (doc) {
                        $("#html-design-editor").trigger('before.cssdoc.save');
                        doc.setText(styleText);
                        $("#html-design-editor").trigger("cssdoc.changed",[currentApplication,doc]);
                        $("#html-design-editor").trigger('after.cssdoc.save');
                    });
             }
        } else {
             $("#html-design-editor").trigger('html.element.updated');
        }
        $("#html-design-editor").trigger("refresh.element.selection");
    } 
    
   
    //ADCompositeCSSRuleSet prototype
    function ADCompositeCSSRuleSet(cssRuleSets){
        var groupSets = [];
        var set;
        var count = 0;
        for (count=0;count<cssRuleSets.length;count++){
            set = cssRuleSets[count];
            groupSets.push(new ADCSSRuleSet(set[1],set[0],set[2]));
        }
        this.ruleSets = groupSets;
    }
    
    ADCompositeCSSRuleSet.prototype.css = function(key,value){
        if(value !== undefined){
            for (var i in this.ruleSets) {
                if(this.ruleSets[i].css){
                    this.ruleSets[i].css(key,value);
                }
            }
        } else {
            return this._groupCssGet(key);
        }
    }
    
    ADCompositeCSSRuleSet.prototype._groupCssGet = function(key){
        var values = [];
        for (var i in this.ruleSets) {
            if(this.ruleSets[i].css){
                if(values.indexOf(this.ruleSets[i].css(key)) < 0){
                    values.push(this.ruleSets[i].css(key));
                }
            }
        }
        if(values.length === 1){
           return values[0]; 
        } else {
            return null;
        }
    }
    
    ADCompositeCSSRuleSet.prototype.getRuleAsText = function(){
        var cssText = '{}';
        return cssText;
    }
    
    ADCompositeCSSRuleSet.prototype.getPreferredSelectorValue = function(){
        return null;
    }
    
    ADCompositeCSSRuleSet.prototype.getTargetSelectorOptions = function(){
        return [];
    }
    
    ADCompositeCSSRuleSet.prototype.isGroup = function(){
        return true;
    }
    
    ADCompositeCSSRuleSet.prototype.getRuleSets = function(){
        return this.ruleSets;
    }
    
    ADCompositeCSSRuleSet.prototype.persist = function(){
        for (var i in this.ruleSets) {
            if(this.ruleSets[i].css){
                this.ruleSets[i].persist();
            }
        }
    }
    
    function _getRuleSetWrapper(ruleset,element,ref,options,pseudoOptions){
        if(lastRuleSet && lastRuleSet.element === element){
            lastRuleSet.update(ruleset,ref,options,pseudoOptions);
        } else {
            lastRuleSet = new ADCSSRuleSet(ruleset,element,ref,options,pseudoOptions);
        }
        return lastRuleSet;
    }
    
    function _getGroupRuleSetWrapper(group){
        return new ADCompositeCSSRuleSet(group);
    }
                                         
    $(document).on("cssselector.found","#html-design-editor", function(event,element,ruleset,ref,options,pseudoOptions){
         $("#html-design-editor").trigger('ruleset-wrapper.created',[_getRuleSetWrapper(ruleset,element,ref,options,pseudoOptions)]);
    });
    
    $(document).on("cssselector.refreshed","#html-design-editor", function(event,element,ruleset,ref,options,pseudoOptions){
         $("#html-design-editor").trigger('ruleset-wrapper.refreshed',[_getRuleSetWrapper(ruleset,element,ref,options,pseudoOptions)]);
    });
    
    $(document).on("groupcssselector.found","#html-design-editor", function(event,groupRuleSet){
         $("#html-design-editor").trigger('ruleset-wrapper.created',[_getGroupRuleSetWrapper(groupRuleSet)]);
    });
    
    $(document).on("deselect.all","#html-design-editor", function(event,groupRuleSet){
         lastRuleSet = null;
    });
    
    $(document).on("application.context","#html-design-editor", function(event,applicationKey){
         currentApplication = applicationKey;
    });
    
    exports.ADCSSRuleSet = ADCSSRuleSet;
     
});
