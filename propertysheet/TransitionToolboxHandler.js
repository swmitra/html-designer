/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var AppInit       = brackets.getModule("utils/AppInit");
    var FileUtils = brackets.getModule("file/FileUtils");
    var RuleSetCreator = require("stylemodule/RuleSetCreator");
    var RuleSetFinder = require("stylemodule/RuleSetFinder");
    
    var CSSProperties = require("text!propertysheet/CSSProperties.json"),
        properties = JSON.parse(CSSProperties);
    
    var inCaptureMode = false;
    
    var $hLayer1,
        $hLayer2,
        $vLayer1,
        $vLayer2,
        $xOffsetAxisGrid,
        $yOffsetAxisGrid;
    
    var PropTemplate = "<button id='{{id}}' class='topcoat-button' style='float:left;'>{{name}}</button>";
    var ChangeSetEntryTemplate = "<div id='{{id}}' style='float:left;width:99%;'><span style='float:left;width:40%;margin-top:4px;'>{{name}}</span><input class='topcoat-text-input changeset-value' style='float:left;width:50% !important' value='{{value}}' data-key='{{name}}'></div>";
    
    var simulationSelectorName = null;
    
    var proprtyNames = [];
    var capturedDef = {};
    var ruleName;
    for (ruleName in properties) {
        if (properties.hasOwnProperty(ruleName)) {
            proprtyNames.push(ruleName);
        }
    }
    
    var canvas,context; 
    
    var lastSelectedRuleset = null;
    
    $(document).on("click","#transition-toolbox-anchor",function(event){
        $("#transition-editor").show();
        _valueToBeizerCurveControls("0.250, 0.100, 0.250, 1.000");
        event.preventDefault();
        event.stopPropagation();
    });
    
    $(document).on("click","#transition-editor-close",function(event){
        $("#transition-editor").hide();
        event.preventDefault();
        event.stopPropagation();
    });
    
    $(document).on("ruleset-wrapper.created ruleset-wrapper.refreshed","#html-design-editor",function(event,rulesetref){
        var asynchPromise = new $.Deferred();
        lastSelectedRuleset = rulesetref;
        asynchPromise.resolve();
        return asynchPromise.promise();
    });
    
    $(document).on("focus","#trn-property-input",function(event){
        $("#trn-property-input").keydown();
        event.preventDefault();
        event.stopPropagation();
    });
    
    $(document).on("change","#timing-fn-select",function(event){
        $("#timing-fn-value").val($("#timing-fn-select").val());
        _valueToBeizerCurveControls($("#timing-fn-select").val());
        event.preventDefault();
        event.stopPropagation();
    });
    
    $(document).on("change","#timing-fn-value",function(event){
        _valueToBeizerCurveControls($("#timing-fn-value").val());
        event.preventDefault();
        event.stopPropagation();
    });
    
    function _createCurvePoint(xValue,yValue){
        return {
                x:parseFloat(xValue)*100*2,
                y:parseFloat(yValue)*100*2
            };
    }
    
    function _updateBezierControlPoints(cp1,cp2){
        $("#bezier-cp1").css("left",cp1.x-0).css("top",cp1.y-0);
        $("#bezier-cp2").css("left",cp2.x-0).css("top",cp2.y-0);
    }
    
    function _valueToBeizerCurveControls(value){
        var params = value.split(", ");
        var cp1 = _createCurvePoint(params[0],params[1]),
            cp2 = _createCurvePoint(params[2],params[3]);
        _drawCurve(cp1,cp2);
        _updateBezierControlPoints(cp1,cp2);
    }
    
    function _getCubicBezierPointsValue(cp1,cp2){
        return (cp1.x/100/2).toFixed(3)+", "+(cp1.y/100/2).toFixed(3)+", "+(cp2.x/100/2).toFixed(3)+", "+(cp2.y/100/2).toFixed(3);
    }
    
    function _captureCSSChanges(event,key,value){
        capturedDef[key]= value;
        $("#properties-container").find("#prop-"+key).remove();
        $(ChangeSetEntryTemplate.split("{{name}}").join(key).split("{{id}}").join("prop-"+key).split("{{value}}").join(value)).appendTo("#properties-container");
    }
    
    function _drawCurve(ctrp1,ctrp2){
        context.clearRect(0,0,canvas.width,canvas.height);
        context.strokeStyle = "#288edf";
        context.lineWidth = 3;
        context.beginPath();
        context.moveTo(0, 200);
        context.bezierCurveTo(ctrp1.x,ctrp1.y,ctrp2.x,ctrp2.y, 200, 0);
        context.stroke();
        
        // draw control point lines
        context.strokeStyle = 'gray';
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(0, 200);
        context.lineTo(ctrp1.x, ctrp1.y);
        context.moveTo(200,0);
        context.lineTo(ctrp2.x, ctrp2.y);
        context.stroke();
    }
    
    $(document).on("change",".changeset-value",function(){
        var key = $(this).data("key");
        capturedDef[key] = $(this).val();
    });
    
    $(document).on("click","#stop-capture-property-changes",function(){
        $("#stop-capture-property-changes").removeClass("blinkingcaptureindicator");
        $("#html-design-editor").off("css-prop-modification css-prop-addition css-prop-removal", _captureCSSChanges);
        lastSelectedRuleset.rollBack();
        inCaptureMode = false;
    });
    
    $(document).on("click","#capture-property-changes",function(){
        capturedDef = {};
        $("#properties-container").html("");
        if(inCaptureMode){
           lastSelectedRuleset.rollBack(); 
        } else {
            $("#stop-capture-property-changes").addClass("blinkingcaptureindicator");
            $("#html-design-editor").on("css-prop-modification css-prop-addition css-prop-removal", _captureCSSChanges);
            $("#changeset-selector-name").removeAttr("disabled");
        }
        
        lastSelectedRuleset.createSavePoint();
        inCaptureMode = true;
    });
    
    $(document).on("drag",".beziercontrolpoint",function(){
        var cp1 = {x:parseInt($("#bezier-cp1").css("left"))+0,y:parseInt($("#bezier-cp1").css("top"))+0},
            cp2 = {x:parseInt($("#bezier-cp2").css("left"))+0,y:parseInt($("#bezier-cp2").css("top"))+0};
        
        _drawCurve(cp1,cp2);
        $("#timing-fn-value").val(_getCubicBezierPointsValue(cp1,cp2));
    });
    
    function _getTransitionConfigAsText(){
        var config = "all "
                    +($("#trn-duration-input").val() || 0)+"ms "
                    +"cubic-bezier("+$("#timing-fn-value").val()+") "
                    +($("#trn-delay-input").val() || 0)+"ms";
        return config;
    }
    
    function _showSelection(){
        $("#selection-outline").show();
        $hLayer1.show();
        $hLayer2.show();
        $vLayer1.show();
        $vLayer2.show();
        $xOffsetAxisGrid.show();
        $yOffsetAxisGrid.show();
    }
    
    function _hideSelection(){
        $("#selection-outline").hide();
        $hLayer1.hide();
        $hLayer2.hide();
        $vLayer1.hide();
        $vLayer2.hide();
        $xOffsetAxisGrid.hide();
        $yOffsetAxisGrid.hide();
    }
    
    $(document).on("click","#preview-trn-animation",function(){
        var trigger = $("#item-state-selector").val();
        if(trigger === 'custom'){
            $(lastSelectedRuleset.element).one("transitionend webkitTransitionend",function(){
                $(lastSelectedRuleset.element).removeClass(simulationSelectorName.replace(".",""));
            });
            $(lastSelectedRuleset.element).addClass(simulationSelectorName.replace(".",""));
            _hideSelection();
            window.setTimeout(function(){
                _showSelection();
            },($("#trn-duration-input").val() || 1)*2);
        } else {
            if(trigger === 'hover'){
                $(lastSelectedRuleset.element).triggerHandler("mouseover");
            } else if(trigger === 'focus'){
                lastSelectedRuleset.element.focus();
            }
            $("#selection-outline").hide();
            window.setTimeout(function(){
                $("#selection-outline").show();
            },($("#trn-duration-input").val() || 1)*2);
        }
    });
    
    function _getCapturedChangesAsRuleDef(){
        var text= "{ ";
        for(var key in capturedDef){
            text = text + key + ":"+capturedDef[key]+ " !important;";
        }
        text = text + " }";
        return text;
    }
    
    $(document).on("click","#apply-transition-animation",function(){
        lastSelectedRuleset.css("transition",_getTransitionConfigAsText());
        lastSelectedRuleset.persist();
    });
    
    $(document).on("click","#save-changeset",function(){
        var selectorText = $("#changeset-selector-name").val();
        if(selectorText){
            var cssDef = _getCapturedChangesAsRuleDef();
            var cssText = selectorText + " "+cssDef;
            
            var info = RuleSetFinder.findRuleByName(selectorText);
            if(info){
                RuleSetCreator.updateRule(info[0],cssText,info[1]);
            } else {
                RuleSetCreator.createNewRule(null,cssText,0);
            }
            simulationSelectorName = selectorText;
        }
        
    });
    
    AppInit.appReady(function () {
        $("#trn-property-input").autocomplete({
            source: proprtyNames,
            minLength: 0
        });
        
        canvas = document.getElementById("cubic-bezier-curve");
        context = canvas.getContext("2d");
        
        $(".beziercontrolpoint")
            .draggable({handle:'.beziercontroldragger',
                        containment : '#cubic-bezier-container'
                     });
        
        $hLayer1 = $("#h-layer1");
        $hLayer2 = $("#h-layer2");
        $vLayer1 = $("#v-layer1");
        $vLayer2 = $("#v-layer2");
        $xOffsetAxisGrid = $(".offsetHAxis");
        $yOffsetAxisGrid = $(".offsetVAxis");
    
    });
      
});