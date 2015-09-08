/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var DocumentManager = brackets.getModule("document/DocumentManager");
    
    var CSSNodeFormatter = require('stylemodule/CSSNodeFormatter');
    
    var currentApplication = null;
    
    function _findAndRemoveLinkedSelectors(styleSheet, elementID){
        var setCount, ruleSets, ruleSet;
        var ref;
        ruleSets = styleSheet.rules;
        for (setCount = 0; setCount < ruleSets.length; setCount++) {
            ruleSet = ruleSets[setCount];
            if (ruleSet.selectorText && ruleSet.selectorText.indexOf(elementID)>=0) {
                styleSheet.deleteRule(setCount);
                _witeStyleSheetFromDOMToDoc(styleSheet);
            }
        }
    }
    
    function _cascadeRemoveFromAllStyleSheets(elementID){
        var styleSheets = document.getElementById('htmldesignerIframe').contentWindow.document.styleSheets;
        var sheetCount, styleSheet;
        var ref;
        for (sheetCount = 0; sheetCount < styleSheets.length ;sheetCount++) {
            styleSheet = document.getElementById('htmldesignerIframe').contentWindow.document.styleSheets[sheetCount];
                _findAndRemoveLinkedSelectors(styleSheet,elementID);
        }
    }
    
    function _witeStyleSheetFromDOMToDoc(styleSheet){
        var styleText;
        if(styleSheet.href){
            DocumentManager.getDocumentForPath(styleSheet.href.replace(brackets.platform === 'mac' ? 'file://' : 'file:///' ,'').split('?')[0])
                    .done(function (doc) {
                        styleText = CSSNodeFormatter.formatCSSAsText(styleSheet,false);
                        doc.setText(styleText);
                        $("#html-design-editor").trigger("cssdoc.changed",[currentApplication,doc]);
                    });
        } else {
             styleText = CSSNodeFormatter.formatCSSAsText(styleSheet,true);
             styleSheet.ownerNode.innerText = styleText;
             $("#html-design-editor").trigger('html.element.updated');
        }
    }
    
    $(document).on("element.deleted","#html-design-editor",function(event,elementID){
        if(elementID){
            _cascadeRemoveFromAllStyleSheets(elementID);
        }
    });
    
    $(document).on("remove-media","#html-design-editor",function(event,mediaText){
        //alert(mediaText);
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
                        var query = ruleSet.media[mediaCount];
                        if(query === mediaText){
                            styleSheet.deleteRule(setCount);
                            _witeStyleSheetFromDOMToDoc(styleSheet);
                        }
                    }
                }
            }
        }
        window.setTimeout(function(){
            $("#html-design-editor").trigger("design-dom-changed");
            $("#html-design-editor").trigger("refresh.element.selection");
        },400);
    });
    
    $(document).on("application.context","#html-design-editor", function(event,applicationKey){
         currentApplication = applicationKey;
     });
        
});