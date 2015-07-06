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
    
    var canvas,context; 
    
    var lastSelectedRuleset = null;
    
    $(document).on("click","#keyframe-toolbox-anchor",function(event){
        $("#keyframe-associate-editor").show();
        $("#keyframe-timeline-editor").show();
        $("#keyframe-timeline-editor").trigger("panelResizeUpdate");
        _valueToBeizerCurveControls("0.250, 0.100, 0.250, 1.000");
        event.preventDefault();
        event.stopPropagation();
    });
    
    $(document).on("click","#keyframe-associate-editor-close",function(event){
        $("#keyframe-associate-editor").hide();
        $("#keyframe-timeline-editor").hide();
        event.preventDefault();
        event.stopPropagation();
    });
    
    $(document).on("ruleset-wrapper.created ruleset-wrapper.refreshed","#html-design-editor",function(event,rulesetref){
        var asynchPromise = new $.Deferred();
        lastSelectedRuleset = rulesetref;
        asynchPromise.resolve();
        return asynchPromise.promise();
    });
    
    $(document).on("change","#keyframe-timing-fn-select",function(event){
        $("#timing-fn-value").val($("#keyframe-timing-fn-select").val());
        _valueToBeizerCurveControls($("#keyframe-timing-fn-select").val());
        event.preventDefault();
        event.stopPropagation();
    });
    
    $(document).on("change","#keyframe-timing-fn-value",function(event){
        _valueToBeizerCurveControls($("#keyframe-timing-fn-value").val());
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
        $("#kf-bezier-cp1").css("left",cp1.x-0).css("top",cp1.y-0);
        $("#kf-bezier-cp2").css("left",cp2.x-0).css("top",cp2.y-0);
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
    
    $(document).on("drag",".beziercontrolpointkf",function(){
        var cp1 = {x:parseInt($("#kf-bezier-cp1").css("left"))+0,y:parseInt($("#kf-bezier-cp1").css("top"))+0},
            cp2 = {x:parseInt($("#kf-bezier-cp2").css("left"))+0,y:parseInt($("#kf-bezier-cp2").css("top"))+0};
        
        _drawCurve(cp1,cp2);
        $("#keyframe-timing-fn-value").val(_getCubicBezierPointsValue(cp1,cp2));
    });
    
    function _getTransitionConfigAsText(){
        var config = "all "
                    +($("#animation-duration-input").val() || 0)+"ms "
                    +"cubic-bezier("+$("#keyframe-timing-fn-value").val()+") "
                    +($("#animation-delay-input").val() || 0)+"ms";
        return config;
    }
    
    
    function _getCapturedChangesAsRuleDef(){
        var text= "{ ";
        for(var key in capturedDef){
            text = text + key + ":"+capturedDef[key]+ " !important;";
        }
        text = text + " }";
        return text;
    }
        
    $(document).on("click","#timeline-anchor",function(){
        $("#keyframe-timeline-editor").show();
        $("#keyframe-timeline-editor").trigger("panelResizeUpdate");
    });
    
    $(document).on("click","#keyframe-timeline-editor-close",function(){
        $("#keyframe-timeline-editor").hide();
    });
    
    AppInit.appReady(function () {
        canvas = document.getElementById("cubic-bezier-curve-keyframe");
        context = canvas.getContext("2d");
        
        $(".beziercontrolpointkf")
            .draggable({handle:'.beziercontroldraggerkf',
                        containment : '#keyframe-cubic-bezier-container'
                     });
    
    });
      
});