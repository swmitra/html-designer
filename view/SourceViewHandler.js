/**
 * @author Swagatam Mitra
  
 */


/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";

    var AppInit = brackets.getModule("utils/AppInit"),
        Resizer = brackets.getModule("utils/Resizer"),
        HTMLUtils = brackets.getModule("language/HTMLUtils"),
        DocumentManager = brackets.getModule("document/DocumentManager"),
        EditorManager = brackets.getModule("editor/EditorManager");
    
    var CodeMirror = brackets.getModule("thirdparty/CodeMirror2/lib/codemirror");
    
    var ViewPresentationPresets = require("view/ViewPresentationPresets");

    var sourceEditor;
    var currentInlineEditor = null;
    var editorMap = {};
    var isFragmentModeOn = false;
    var HTMLDOMParser = null;
    
    /*$(document).on('click',"#source-editor-minimize",function(){
        $("#styles-editor-maximize").click();
        ViewPresentationPresets.applyDesignAndStylesSplit();
        $("#source-editor-container").addClass("minimizedSourceView");
    });
    
    $(document).on('click',"#source-editor-maximize",function(){
        $("#source-editor-container").removeClass("minimizedSourceView");
    });*/
    
    $(document).on('click',"#source-editor-close",function(){
        $("#source-editor-container").hide();
    });
    
    $(document).on('fragmentDesignModeon',"#html-design-editor",function(){
        isFragmentModeOn = true;
    });
    
    $(document).on('design-dom-changed',"#html-design-editor",function(){
        isFragmentModeOn = false;
    });
    
    $(document).on('before.save.dom',"#html-design-editor",function(){
        if(sourceEditor){
            sourceEditor.off("change",_synchDesignWithCode);
        }
    });
    
    $(document).on('after.save.dom',"#html-design-editor",function(){
        if(sourceEditor){
            sourceEditor.on("change",_synchDesignWithCode);
        }
    });

    function _showSourceView() {
        $("#source-editor-container").show();
        _setupLiveEdit();
    }
    
    function _quitSourceView() {
        $("#source-editor-container").hide();
        if(sourceEditor){
            sourceEditor.off("change",_synchDesignWithCode);
        }
    }
    
    function _synchDesignWithCode(cm, change){
        var toBeUpdated = document.getElementById('htmldesignerIframe').contentWindow.document;
        $("#html-design-editor").trigger("deselect.all");
        if(isFragmentModeOn === true){
            $(toBeUpdated).find("#ad-fragment-container").html(sourceEditor.getDoc().getValue());
        } else {
            _dynamicUpdateHandler(cm, change);
        }
        //$("#html-design-editor").trigger("design-dom-changed");
    }    
    
    function _setupLiveEdit(){
        var doc = DocumentManager.getCurrentDocument();
        if(currentInlineEditor){
            currentInlineEditor.setVisible(false,true);
        }
        
        currentInlineEditor = editorMap[doc];
        
        if(!currentInlineEditor){
            currentInlineEditor = EditorManager
            .createInlineEditorForDocument(
                doc
                , null
                , $("#html-inline-editor")[0]
            ).editor;
            editorMap[doc] = currentInlineEditor;
            currentInlineEditor.focus();
            doc.addRef();
        } else {
            currentInlineEditor.focus();
        }
        $("#html-inline-editor > *").css('height', '100%');
        
        sourceEditor = currentInlineEditor._codeMirror;
        if(sourceEditor){
            sourceEditor.off("change",_synchDesignWithCode);
            sourceEditor.refresh();
            sourceEditor.on("change",_synchDesignWithCode);
            //sourceEditor.focus();
        }
    }
    
    $(document).on("refresh-split-view","#html-design-editor",function(){
        sourceEditor.refresh();
    });
    
    function _getXPath( element ){
        var xpath = '';
        for ( ; element && element.nodeType == 1; element = element.parentNode )
        {
            var id = $(element.parentNode).children(element.tagName).index(element) + 1;
            id > 1 ? (id = ':nth-of-type(' + id + ')') : (id = '');
            xpath = ' ' + element.tagName.toLowerCase() + id + xpath;
        }
        return xpath;
    }
    
    function _handleHEADUpdate(before,after,text){
          var updateType = "";
          //Check if this is an attribute change
          var htmlContext = _isTagAttributeChange(); 
          if(htmlContext){
              updateType = _handleAttributeChange(htmlContext,before,after,text);
          } else {
              var fragmentDOM = HTMLDOMParser.parseFromString(before,'text/html');
              var breakPointElm = $(fragmentDOM).find("head").children().last()[0]; 
              if(breakPointElm && breakPointElm.parentElement.tagName !== 'HEAD'){
                  var elementXPath = _getXPath(breakPointElm);
                  var sourceDOM = HTMLDOMParser.parseFromString(before+text+after,'text/html');
                  var toBeModified = $(document.getElementById('htmldesignerIframe').contentWindow.document).find(elementXPath);                                                             
                  var toBeModifiedWith = $(sourceDOM).find(elementXPath);
                  if(toBeModified[0]){
                      toBeModified[0].outerHTML = toBeModifiedWith[0].outerHTML;
                  } else {
                        if($(toBeModifiedWith).prev()[0]){
                            elementXPath = _getXPath($(toBeModifiedWith).prev()[0]);
                            toBeModified = $(document.getElementById('htmldesignerIframe').contentWindow.document).find(elementXPath); 
                            $(toBeModified).after(toBeModifiedWith[0].outerHTML);
                        } else {
                            elementXPath = _getXPath($(toBeModifiedWith).parent()[0]);
                            toBeModified = $(document.getElementById('htmldesignerIframe').contentWindow.document).find(elementXPath);
                            toBeModified.append(toBeModifiedWith[0].outerHTML);
                        }

                  }
                  updateType = toBeModifiedWith[0].tagName;
              }
          }
        return updateType;
    }
    
    function _isTagAttributeChange(){
          var tagInfo = HTMLUtils.getTagInfo(currentInlineEditor,sourceEditor.getCursor());
          if(tagInfo.tagName){
              return tagInfo;
          } else {
              return null;
          } 
    }
    
    function _handleAttributeChange(tagInfo,before,after,text){
          var breakPointFragment = before+"\"><breakpoint id='ad-breakpoint'></breakpoint>";
          var fragmentDOM = HTMLDOMParser.parseFromString(breakPointFragment,'text/html');
          var breakPointElm = $(fragmentDOM).find("#ad-breakpoint")[0]; 
          var updateType = "";
          if(breakPointElm){
              var elementXPath = _getXPath(breakPointElm.parentElement);
              var sourceDOM = HTMLDOMParser.parseFromString(before+text+after,'text/html');
              var toBeModified = $(document.getElementById('htmldesignerIframe').contentWindow.document).find(elementXPath);                                                              
              var toBeModifiedWith = $(sourceDOM).find(elementXPath);
              if(toBeModified[0] && tagInfo.attr.name){
                  if(tagInfo.attr.valueAssigned){
                      toBeModified.attr(tagInfo.attr.name,toBeModifiedWith.attr(tagInfo.attr.name) || '');
                  } else {
                      toBeModified.removeAttr(tagInfo.attr.name);
                  } 
              } 
              updateType = toBeModified[0].tagName;
          }
        return updateType;
    }
    
    function _handleBODYUpdate(before,after,text){
          var updateType = "";
          //Check if this is an attribute change
          var htmlContext = _isTagAttributeChange(); 
          if(htmlContext){
              updateType = _handleAttributeChange(htmlContext,before,after,text);
          } else {
              var breakPointFragment = before+"<breakpoint id='ad-breakpoint'></breakpoint>";
              var fragmentDOM = HTMLDOMParser.parseFromString(breakPointFragment,'text/html');
              var breakPointElm = $(fragmentDOM).find("#ad-breakpoint")[0]; 

              if(breakPointElm && breakPointElm.parentElement.tagName !== 'BODY'){
                  var elementXPath = _getXPath(breakPointElm.parentElement);
                  var sourceDOM = HTMLDOMParser.parseFromString(before+text+after,'text/html');
                  var toBeModified = $(document.getElementById('htmldesignerIframe').contentWindow.document).find(elementXPath);                                                              
                  var toBeModifiedWith = $(sourceDOM).find(elementXPath);
                  if(toBeModified[0]){
                      toBeModified[0].outerHTML = toBeModifiedWith[0].outerHTML;
                  } else {
                        if($(toBeModifiedWith).prev()[0]){
                            elementXPath = _getXPath($(toBeModifiedWith).prev()[0]);
                            toBeModified = $(document.getElementById('htmldesignerIframe').contentWindow.document).find(elementXPath); 
                            $(toBeModified).after(toBeModifiedWith[0].outerHTML);
                        } else {
                            elementXPath = _getXPath($(toBeModifiedWith).parent()[0]);
                            toBeModified = $(document.getElementById('htmldesignerIframe').contentWindow.document).find(elementXPath);
                            toBeModified.append(toBeModifiedWith[0].outerHTML);
                        }
                  }
                  updateType = toBeModifiedWith[0].tagName;
              }
          }
        return updateType;
    }
    
    function _dynamicUpdateHandler(cm, change){ 
          var from = change.from;
          var text = change.text.join("\n");
          var removed = change.removed.join("\n");
          if(text === "\n" || removed === "\n"){
              return;
          }
          var to =  cm.posFromIndex(cm.indexFromPos(from) + text.length);
          var before = cm.getRange({ line: 0, ch: 0 }, from);
          var after = cm.getRange(to, { line: cm.lineCount() + 1, ch: 0 });
          var partialDOM = HTMLDOMParser.parseFromString(before+"\">",'text/html');
          var updateType = "";
          if($(partialDOM).find('body').children().length === 0){
             if($(partialDOM).find('head').children().length > 0 ){
                updateType = _handleHEADUpdate(before,after,text);
             }
          } else {
              updateType = _handleBODYUpdate(before,after,text);
          }
        
         if(updateType === 'BODY'){
            $(document.getElementById('htmldesignerIframe').contentWindow.document).find('head').not('head:first').remove();
            $(document.getElementById('htmldesignerIframe').contentWindow.document).find('body').not('body:first').remove();
         }
        
         if(updateType === "LINK"){
             $("#html-design-editor").trigger("design-dom-changed");
         }
    }
    
    $(document).on('source-file-select-requested',"#html-design-editor",function(event,value){
        if(value){
            _showSourceView();
        }
    });

    function _init() {
        Resizer.makeResizable($("#source-editor-container")[0], Resizer.DIRECTION_HORIZONTAL, Resizer.POSITION_RIGHT, 250, false, undefined, false);
        Resizer.makeResizable($("#source-editor-container")[0], Resizer.DIRECTION_VERTICAL, Resizer.POSITION_BOTTOM, 250, false, undefined, false);
        $("#source-editor-container").on("panelResizeUpdate", function () {
            if(sourceEditor){
                sourceEditor.refresh();
            }
        });
        HTMLDOMParser = new DOMParser();
    }
    
    exports.launch = _showSourceView;
    exports.hide = _quitSourceView;
    exports.init = _init;
});