/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var CSSCloner = require("stylemodule/CSSRulesetCloneHandler");
    var IDGen = require("widgetprofiles/UIDGenerator");
    
    var clipBoardItem = null;
    var pasteLocation = null;
    var toBePastedIn = null;
    var currentLayout = null;
    var currentContext = null;
    
    var contextToFunctionMap = {};
    
    contextToFunctionMap.copyContext = function (){
        var decendents = $(clipBoardItem).find("[id]");
        if(clipBoardItem.id){
            decendents.push(clipBoardItem);
        }
        var newElementTemplate = clipBoardItem.outerHTML;
        var decendent = null;
        var newID = null;
        var idMap = {};
        for(var count=0;count<decendents.length;count++){
            decendent = decendents[count];
            newID = decendent.tagName.toLowerCase()+IDGen.getID()+"-"+count;
            newElementTemplate = newElementTemplate.split(decendent.id).join(newID);
            idMap[decendent.id] = newID;
        } 
        var newTarget = $(newElementTemplate)
            .appendTo(toBePastedIn);
        CSSCloner.cloneCSSRules(decendents,idMap);

        $("#html-design-editor").trigger("select.element",[newTarget[0]]);
        setTimeout(function(){
                _bringElementToContextLocation();
                newTarget.show();
            },20);
    }
    
    contextToFunctionMap.cutContext = function (){
        var element = $(clipBoardItem).detach();
        var newTarget = $(element).appendTo(toBePastedIn);
        
        $("#html-design-editor").trigger("select.element",[newTarget[0]]);
        setTimeout(function(){
                _bringElementToContextLocation();
                $("#html-design-editor").trigger("element-cut-completed");
            },20);
    }
    
    function _bringElementToContextLocation(){
        if(currentLayout){
            currentLayout.changeLeftTo(pasteLocation.x);
            currentLayout.changeTopTo(pasteLocation.y);
            currentLayout.refresh();
        }
    }
    
    $(document).on("added-to-clipboard","#html-design-editor", function(event,element,context){
        $("#context-paste-element").parent().removeClass("disabledli");
        clipBoardItem = element;
        currentContext = context;
        //pasteLocation = null;
        toBePastedIn = null;
    });
    
    $(document).on("clipboard-cleared","#html-design-editor", function(event,element,context){
        $("#context-paste-element").parent().addClass("disabledli");
        clipBoardItem = null;
        currentContext = null;
        //pasteLocation = null;
        toBePastedIn = null;
    });
    
    $(document).on("paste-element","#html-design-editor", function(event){
        contextToFunctionMap[currentContext].apply();
        $("#html-design-editor").trigger('html.element.dropped');
    });
    
    $(document).on("targetdom.contextmenu","#html-design-editor", function(e,elem,point){
        pasteLocation = point;
        toBePastedIn = elem;
    });
    
    $(document).on("layout.decision","#html-design-editor", function(event,layoutObj){
        currentLayout = layoutObj;
     });

});