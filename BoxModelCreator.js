/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    /*Box Model 
    {
        position : { left: null, right: null, top: null, bottom: null },
        margin : { left: null, right: null, top: null, bottom: null },
        border : { left: null, right: null, top: null, bottom: null },
        padding : { left: null, right: null, top: null, bottom: null }
    }*/
    
    function _createPositionBox(element){
        return { 
                    left : $(element).css('left')
                  , right : $(element).css('right')
                  , top : $(element).css('top')
                  , bottom : $(element).css('bottom')
        };
    }
    
    function _createMarginBox(element){
         return { 
                    left : parseInt($(element).css('margin-left'))
                  , right : parseInt($(element).css('margin-right'))
                  , top : parseInt($(element).css('margin-top'))
                  , bottom : parseInt($(element).css('margin-bottom'))
        };
    }
    
    function _createBorderBox(element){
        return { 
                    left : $(element).css('border-left-width')
                  , right : $(element).css('border-right-width')
                  , top : $(element).css('border-top-width')
                  , bottom : $(element).css('border-bottom-width')
        };
    }
    
    function _createPaddingBox(element){
        return { 
                    left : parseInt($(element).css('padding-left'))
                  , right : parseInt($(element).css('padding-right'))
                  , top : parseInt($(element).css('padding-top'))
                  , bottom : parseInt($(element).css('padding-bottom'))
        };
    }
    
    function _createSizeBox(element){
        return { 
                    width : $(element).css('width')
                  , height : $(element).css('height')
        };
    }
    
    function _createBoxModel(ruleSet){
        return {
                    targetElement: ruleSet.element
                  , cssRuleSet : ruleSet
                  , position : _createPositionBox(ruleSet.element)
                  , margin : _createMarginBox(ruleSet.element)
                  , border : _createBorderBox(ruleSet.element)
                  , padding : _createPaddingBox(ruleSet.element)
                  , size : _createSizeBox(ruleSet.element)
                  , boundingRect : ruleSet.element.getBoundingClientRect()
        };
        
    }
    
    $(document).on("ruleset-wrapper.created","#html-design-editor",function(event,rulesetref){
        if(rulesetref.isGroup()){
            var modelArray = [];
            var rulesets = rulesetref.getRuleSets();
            var index = 0;
            for(index = 0;index<rulesets.length;index++){
                modelArray.push(_createBoxModel(rulesets[index]));
            }
            $("#html-design-editor").trigger('groupmodel.created',[modelArray]);
        } else {
            $("#html-design-editor").trigger('boxmodel.created',[_createBoxModel(rulesetref)]);
        }
    });
    
    $(document).on("ruleset-wrapper.refreshed","#html-design-editor",function(event,rulesetref){
        var asynchPromise = new $.Deferred();
        $("#html-design-editor").trigger('boxmodel.refreshed',[_createBoxModel(rulesetref)]);
        asynchPromise.resolve();
        return asynchPromise.promise();
    });
    
});