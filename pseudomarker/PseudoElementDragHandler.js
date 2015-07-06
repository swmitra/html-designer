/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var AppInit       = brackets.getModule("utils/AppInit");
    var lastSelectedRuleset = null;
    
    function _dragAfterPseudo(){
        lastSelectedRuleset.pseudoaftercss('left',$("#pseudo-after-outline").css("left"));
        lastSelectedRuleset.pseudoaftercss('top',$("#pseudo-after-outline").css("top"));                                   
    }
    
    function _dragBeforePseudo(){
        lastSelectedRuleset.pseudobeforecss('left',$("#pseudo-before-outline").css("left"));
        lastSelectedRuleset.pseudobeforecss('top',$("#pseudo-before-outline").css("top"));                                   
    }
    
    $(document).on("ruleset-wrapper.created ruleset-wrapper.refreshed","#html-design-editor",function(event,rulesetref){
        var asynchPromise = new $.Deferred();
        lastSelectedRuleset = rulesetref;
        asynchPromise.resolve();
        return asynchPromise.promise();
    });
    
    function _refreshSelectionForAfter(){
        lastSelectedRuleset.pseudoafterpersist();
        $("#html-design-editor").trigger("refresh.element.selection");
    }
    
    function _refreshSelectionForBefore(){
        lastSelectedRuleset.pseudobeforepersist();
        $("#html-design-editor").trigger("refresh.element.selection");
    }
    
    AppInit.appReady(function () {
        $("#pseudo-after-outline").draggable(
            { handle:".pseudodraghandle",
             containment: "#info-overlay-plane",
             drag: _dragAfterPseudo,
             stop: _refreshSelectionForAfter
            }
        );
        
        $("#pseudo-before-outline").draggable(
            { handle:".pseudodraghandle",
             containment: "#info-overlay-plane",
             drag: _dragAfterPseudo,
             stop: _refreshSelectionForBefore
            }
        );
        
    });
        
});