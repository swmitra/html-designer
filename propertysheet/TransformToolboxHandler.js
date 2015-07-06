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
        //var currentmatrix = new WebKitCSSMatrix(lastSelectedRuleset.css('-webkit-transform'));
        
        event.preventDefault();
        event.stopPropagation();
    });
    
    $(document).on("click","#transform-editor-close",function(event){
        $("#transform-editor").hide();
        event.preventDefault();
        event.stopPropagation();
        
    });
    
    function _applyRotation(){
        var angle = $("#rotation-input").val();
        if(angle){
            lastSelectedRuleset.css('-webkit-transform','rotate('+angle+'deg)');
            lastSelectedRuleset.persist();
            $("#html-design-editor").trigger('refresh.element.selection');
        }
    }
    
    function _applySkewX(){
        var angle = $("#skewx-input").val();
        if(angle){
            lastSelectedRuleset.css('-webkit-transform','skewX('+angle+'deg)');
            lastSelectedRuleset.persist();
            $("#html-design-editor").trigger('refresh.element.selection');
        }
    }
    
    function _applySkewY(){
        var angle = $("#skewy-input").val();
        if(angle){
            lastSelectedRuleset.css('-webkit-transform','skewY('+angle+'deg)');
            lastSelectedRuleset.persist();
            $("#html-design-editor").trigger('refresh.element.selection');
        }
    }
    
    AppInit.appReady(function () {        
        $("#rotation-input").knob({
            'change' : function (v) { 
                $("#rotation-input").val(v);
                _applyRotation();
            }
        });
        
        //$("#rotation-rotary-container").hide();
        
        $("#skewx-input").knob({
            'change' : function (v) { 
                $("#skewx-input").val(v);
                _applySkewX();
            }
        });
        
        $("#skewy-input").knob({
            'change' : function (v) { 
                $("#skewy-input").val(v);
                _applySkewY();
            }
        });
        
    });
    
    $(document).on("change","#rotation-input",function(){
        _applyRotation();
    });
    
    $(document).on("keyup","#rotation-input",function(){
        $(this).trigger('change');
    });
    
    $(document).on("keyup",".skewControlInput",function(){
        $(this).trigger('change');
    });
    
     $(document).on("change","#skewx-input",function(){
        _applySkewX();
    }); 
    
     $(document).on("change","#skewy-input",function(){
        _applySkewY();
    }); 
            
});