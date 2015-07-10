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
    
    $(document).on("click","#border-radius-toolbox-anchor",function(event){
        $(".borderRadius").removeClass("activeBorderRadius");
        $("#border-radius-all").addClass("activeBorderRadius");
        $("#border-radius-editor").show();
        $("#border-editor").hide();
        $("#html-design-editor").trigger("border-radius-mode-on");
        event.preventDefault();
        event.stopPropagation();
    });
    
    $(document).on("click",".borderRadius",function(event){
        $(".borderRadius").removeClass("activeBorderRadius");
        $(this).addClass("activeBorderRadius");
        //$("#border-radius").val(lastSelectedRuleset.css($(".activeBorderRadius").data('key')));
        event.preventDefault();
        event.stopPropagation();
    });
    
    $(document).on("blur change","#border-radius",function(event){
        if(lastSelectedRuleset){           
            lastSelectedRuleset.css($(".activeBorderRadius").data('key'),$("#border-radius").val());
            lastSelectedRuleset.persist();
            $("#html-design-editor").trigger($(".activeBorderRadius").data('key')+'-changed');
            event.preventDefault();
            event.stopPropagation();
        }
    });
        
    $(document).on("click","#border-radius",function(event){
        event.preventDefault();
        event.stopPropagation();
    });
        
});