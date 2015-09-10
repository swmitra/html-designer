/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var AppInit       = brackets.getModule("utils/AppInit");
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
        var styleSheet = _findDefaultStyleSheet();
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
        var styleSheet = _findDefaultStyleSheet();
        var styleText = null;
        styleSheet.insertRule(cssText, Math.min(index,styleSheet.cssRules.length));
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
    
    function _createNewMediaRule(mediaFilter,index){
        var styleSheet = _findDefaultStyleSheet(true);
        var styleText = null;
        styleSheet.insertRule(mediaFilter,styleSheet.rules.length);
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
    
    function _sendRulesetToMedia(mediaFilter,cssText){
        var targetRuleSet;
        var targetStyleSheet;
        var currentStyleSheets = document.getElementById('htmldesignerIframe').contentWindow.document.styleSheets;
        var sheetCount, setCount, styleSheet, ruleSets, ruleSet, mediaCount;
        var ref,entry;
        for (sheetCount = 0; sheetCount < currentStyleSheets.length && !ref; sheetCount++) {
            styleSheet = currentStyleSheets[sheetCount];
            ruleSets = styleSheet.rules;
            for (setCount = 0; setCount < ruleSets.length && !ref; setCount++) {
                ruleSet = ruleSets[setCount];
                if (ruleSet.media) {
                    for(mediaCount = 0;mediaCount < ruleSet.media.length;mediaCount++){
                        if(mediaFilter === ruleSet.media[mediaCount]){
                            targetRuleSet = ruleSet;
                            targetStyleSheet = styleSheet;
                        }
                    }
                }
            }
        }
        
        if(targetRuleSet){
            targetRuleSet.insertRule(cssText,0);
        }
        
        var styleText;
        if(targetStyleSheet.href){
            DocumentManager.getDocumentForPath(targetStyleSheet.href.replace(brackets.platform === 'mac' ? 'file://' : 'file:///' ,'').split('?')[0])
                    .done(function (doc) {
                        $("#html-design-editor").trigger('before.cssdoc.save');
                        styleText = CSSNodeFormatter.formatCSSAsText(targetStyleSheet,false);
                        doc.setText(styleText);
                        $("#html-design-editor").trigger('after.cssdoc.save');
                        $("#html-design-editor").trigger("cssdoc.changed",[currentApplication,doc]);
                    });
        } else {
             styleText = CSSNodeFormatter.formatCSSAsText(targetStyleSheet,true);
             targetStyleSheet.ownerNode.innerText = styleText;
             $("#html-design-editor").trigger('html.element.updated');
        }
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
    
    function _findDefaultStyleSheet(isMedia) {
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
        } else {
            var styleNode =  document.getElementById('htmldesignerIframe').contentWindow.document.createElement('STYLE');
            if(isMedia){
                styleNode = $(styleNode).appendTo(document.getElementById('htmldesignerIframe').contentWindow.document.head)[0];
            } else {
                styleNode = $(styleNode).prependTo(document.getElementById('htmldesignerIframe').contentWindow.document.head)[0];
            }
            targetStyleSheet = styleNode.sheet;
        }
        return targetStyleSheet;
    }
    
    $(document).on("application.context","#html-design-editor", function(event,applicationKey){
         currentApplication = applicationKey;
     });
    
    exports.createNewRule = _createNewRule;
    exports.updateRule = _updateRule;
    exports.createNewMediaRule = _createNewMediaRule;
    exports.sendRulesetToMedia = _sendRulesetToMedia;
        
});