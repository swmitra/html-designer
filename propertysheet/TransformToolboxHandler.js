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
       lastSelectedRuleset = rulesetref;
    });
    
    $(document).on("click","#transform-toolbox-anchor",function(event){
        $("#transform-editor").show();
        event.preventDefault();
        event.stopPropagation();
    });
    
    $(document).on("click","#transform-editor-close",function(event){
        $("#transform-editor").hide();
        event.preventDefault();
        event.stopPropagation();
        
    });
    
    function _getRotation(){
        var rotateStr = "";
        var angle = $("#rotation-input").val();
        if(angle){
            rotateStr = rotateStr + ' rotate('+angle+'deg)';
        }
        return rotateStr;
    }
    
    function _getSkewX(){
        var skewStr = "";
        var angle = $("#skewx-input").val();
        if(angle){
            skewStr = skewStr + ' skewX('+angle+'deg)'
        }
        return skewStr;
    }
    
    function _getSkewY(){
        var skewStr = "";
        var angle = $("#skewy-input").val();
        if(angle){
            skewStr = skewStr + ' skewY('+angle+'deg)'
        }
        return skewStr;
    }
    
    function _apply3DTransform(){
        lastSelectedRuleset.css('-webkit-transform',_getRotateX()+_getRotateY()+_getRotateZ());
        lastSelectedRuleset.persist();
        $("#html-design-editor").trigger('refresh.element.selection');
    }
    
    function _apply2DTransform(){
        lastSelectedRuleset.css('-webkit-transform',_getRotation()+_getSkewX()+_getSkewY());
        lastSelectedRuleset.persist();
        $("#html-design-editor").trigger('refresh.element.selection');
    }
    
    function _getRotateX(){
        var rotateStr = "";
        var angle = parseInt($("#rotationX-input").val());
        if(angle){
            rotateStr = rotateStr + ' rotateX('+angle+'deg)'
        }
        return rotateStr;
    }
    
    function _getRotateY(){
        var rotateStr = "";
        var angle = parseInt($("#rotationY-input").val());
        if(angle){
            rotateStr = rotateStr + ' rotateY('+angle+'deg)'
        }
        return rotateStr;
    }
    
    function _getRotateZ(){
        var rotateStr = "";
        var angle = parseInt($("#rotationZ-input").val());
        if(angle){
            rotateStr = rotateStr + ' rotateZ('+angle+'deg)'
        }
        return rotateStr;
    }
    
    AppInit.appReady(function () {        
        $("#rotation-input").knob({
            'change' : function (v) { 
                $("#rotation-input").val(v);
                _apply2DTransform();
            }
        });
        
        $("#rotationX-input").knob({
            'change' : function (v) { 
                $("#rotationX-input").val(v);
                _apply3DTransform();
            }
        });
        
        $("#rotationY-input").knob({
            'change' : function (v) { 
                $("#rotationY-input").val(v);
                _apply3DTransform();
            }
        });
        
        $("#rotationZ-input").knob({
            'change' : function (v) { 
                $("#rotationZ-input").val(v);
                _apply3DTransform();
            }
        });
        
        $("#skewx-input").knob({
            'change' : function (v) { 
                $("#skewx-input").val(v);
                _apply2DTransform();
            }
        });
        
        $("#skewy-input").knob({
            'change' : function (v) { 
                $("#skewy-input").val(v);
                _apply2DTransform();
            }
        });
        
    });
    
    $(document).on("change","#rotation-input",function(){
        _apply2DTransform();
    });
    
    $(document).on("keyup","#rotation-input",function(){
        $(this).trigger('change');
    });
    
    $(document).on("keyup",".skewControlInput",function(){
        $(this).trigger('change');
    });
    
     $(document).on("change","#skewx-input",function(){
        _apply2DTransform();
    }); 
    
     $(document).on("change","#skewy-input",function(){
        _apply2DTransform();
    }); 
            
});