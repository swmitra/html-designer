/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var AppInit       = brackets.getModule("utils/AppInit");
    //var ADProjectManager = brackets.getModule("appdesigner/ProjectManager");
    var DocumentManager = brackets.getModule("document/DocumentManager");
    var FileUtils   = brackets.getModule("file/FileUtils");
    var ProjectManager = brackets.getModule("project/ProjectManager");
    var lastSelection = null;
    var lastSelectedRuleset = null;
    var defaultStyleSheet = null;
    
    var CSSNodeFormatter = require('stylemodule/CSSNodeFormatter');
    
    var currentApplication = null;
    
    $(document).on("default-stylesheet-path","#html-design-editor", function(event,defaultPath){
        defaultStyleSheet = defaultPath;
    });
    
    $(document).on("element.added","#html-design-editor",function(event,element){
        var styleSheet = _findDefaultStyleSheet(element.id,null/*ADProjectManager.getConfig('default-stylesheet')*/);
        if(!styleSheet){
            styleSheet = _findDefaultStyleSheet(element.id,null);
        }
        var css = element.style.cssText;
        styleSheet.insertRule('#'+element.id+' { '+css+' }', 0);
        element.style.cssText = '';
        var styleText ;
        if(styleSheet.href){
            DocumentManager.getDocumentForPath(styleSheet.href.replace(brackets.platform === 'mac' ? 'file://' : 'file:///' ,'').split('?')[0].split("%20").join(" "))
                    .done(function (doc) {
                        $("#html-design-editor").trigger('before.cssdoc.save');
                        styleText = CSSNodeFormatter.formatCSSAsText(styleSheet,false);
                        doc.setText(styleText);
                        $("#html-design-editor").trigger('after.cssdoc.save');
                        $("#html-design-editor").trigger("cssdoc.changed",[currentApplication,doc]);
                    });
        } else {
             styleText = CSSNodeFormatter.formatCSSAsText(styleSheet,true);
             styleSheet.ownerNode.innerText = styleText;
             $("#html-design-editor").trigger('html.element.updated');
        }
    });
    
    function _createNewRule(styleSheetParam,cssText,index){
        var styleSheet /*= styleSheetParam || _findDefaultStyleSheet(null,ADProjectManager.getConfig('default-stylesheet'))*/;
        if(!styleSheet){
            styleSheet = _findDefaultStyleSheet();
        }
        var styleText = null;
        styleSheet.insertRule(cssText, index);
        if(styleSheet.href){
            DocumentManager.getDocumentForPath(styleSheet.href.replace(brackets.platform === 'mac' ? 'file://' : 'file:///' ,'').split('?')[0])
                    .done(function (doc) {
                        $("#html-design-editor").trigger('before.cssdoc.save');
                        styleText = CSSNodeFormatter.formatCSSAsText(styleSheet,false);
                        doc.setText(styleText);
                        $("#html-design-editor").trigger('after.cssdoc.save');
                        $("#html-design-editor").trigger("cssdoc.changed",[currentApplication,doc]);
                    });
        } else {
             styleText = CSSNodeFormatter.formatCSSAsText(styleSheet,true);
             styleSheet.ownerNode.innerText = styleText;
             $("#html-design-editor").trigger('html.element.updated');
        }
        return [styleSheet,index];
    }
    
    function _updateRule(styleSheetParam,cssText,index){
        var styleSheet = styleSheetParam;
        var styleText = null;
        styleSheet.insertRule(cssText, index);
        styleSheet.deleteRule(index+1);
        if(styleSheet.href){
            DocumentManager.getDocumentForPath(styleSheet.href.replace(brackets.platform === 'mac' ? 'file://' : 'file:///' ,'').split('?')[0])
                    .done(function (doc) {
                        $("#html-design-editor").trigger('before.cssdoc.save');
                        styleText = CSSNodeFormatter.formatCSSAsText(styleSheet,false);
                        doc.setText(styleText);
                        $("#html-design-editor").trigger('after.cssdoc.save');
                        $("#html-design-editor").trigger("cssdoc.changed",[currentApplication,doc]);
                    });
        } else {
             styleText = CSSNodeFormatter.formatCSSAsText(styleSheet,true);
             styleSheet.ownerNode.innerText = styleText;
             $("#html-design-editor").trigger('html.element.updated');
        } 
    }
    
    function _createNewStyleSheet(sheetPath){
        var linkNode =  document.getElementById('htmldesignerIframe').contentWindow.document.createElement('LINK');
        var projectRoot = ProjectManager.getProjectRoot()._path;
        linkNode.href = FileUtils.getRelativeFilename(FileUtils.getDirectoryPath(currentApplication.replace(projectRoot,'')),sheetPath);
        linkNode.rel = 'stylesheet';
        $(linkNode).appendTo(document.getElementById('htmldesignerIframe').contentWindow.document.head)[0];
    }
    
    function _findDefaultStyleSheet(elementid,sheetPath) {
        //defaultStyleSheet = sheetPath;
        var styleSheets = document.getElementById('htmldesignerIframe').contentWindow.document.styleSheets;
        var sheetCount, styleSheet, targetStyleSheet;
        
        if(defaultStyleSheet){
            for (sheetCount = 0; sheetCount < styleSheets.length; sheetCount++) {
                styleSheet = document.getElementById('htmldesignerIframe').contentWindow.document.styleSheets[sheetCount];
                if(styleSheet.href && styleSheet.href.indexOf(defaultStyleSheet) >= 0){
                    targetStyleSheet = styleSheet;
                    break;
                }
            }
            if(!targetStyleSheet){
                sheetPath = null;                
            }
        } else {
            var styleNode =  document.getElementById('htmldesignerIframe').contentWindow.document.createElement('STYLE');
            styleNode = $(styleNode).appendTo(document.getElementById('htmldesignerIframe').contentWindow.document.head)[0];
            targetStyleSheet = styleNode.sheet;
        }
        return targetStyleSheet;
    }
    
    $(document).on("application.context","#html-design-editor", function(event,applicationKey){
         currentApplication = applicationKey;
     });
    
    AppInit.appReady(function () {
        
    });
    
    exports.createNewRule = _createNewRule;
    exports.updateRule = _updateRule;
        
});