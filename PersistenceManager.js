/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var FileUtils   = brackets.getModule("file/FileUtils"),
        DocumentManager = brackets.getModule("document/DocumentManager");
    
    var isFragmentModeOn = false;
    var currentApplication = null; 
    
    var beautify_html = require('lib/beautify/beautify-html').html_beautify;
    
    var CommonUtils = require("CommonUtils");
    
    var config = JSON.parse(require('text!lib/beautify/config/defaults.json')); 
    
    function _isDOMSaveRequired(){
        var domSaveReqd = false;
        if(currentApplication && CommonUtils.isValidMarkupFile(FileUtils.getFileExtension(currentApplication))){
            domSaveReqd = true;
        }
        return domSaveReqd;
    }
    
     $(document).on('html.save.dom',"#html-design-editor",function(event, doc){
        var docText = '';
        if(_isDOMSaveRequired()){
            $("#html-design-editor").trigger('before.save.dom');
            if(doc){
                if(isFragmentModeOn === true){
                    docText = $(document.getElementById('htmldesignerIframe').contentWindow.document).find("#ad-fragment-container")[0].innerHTML;                
                } else {
                    docText = document.getElementById('htmldesignerIframe').contentWindow.document.documentElement.innerHTML;
                }
             }
             var result = beautify_html(docText, config);
             doc.setText(result);
             $("#html-design-editor").trigger('after.save.dom');
        }
     });
    
     $(document).on('html.element.dropped html.element.updated html.element.removed',"#html-design-editor",function(){
        var currentDoc = DocumentManager.getCurrentDocument();
        $("#html-design-editor").trigger('html.save.dom',[currentDoc]);
    });
    
     $(document).on('fragmentDesignModeon',"#html-design-editor",function(){
        isFragmentModeOn = true;
     });
    
     /*$(document).on('design-dom-changed',"#html-design-editor",function(){
        isFragmentModeOn = false;
     });*/
    
     $(document).on("application.context","#html-design-editor", function(event,applicationKey){
         currentApplication = applicationKey;
         isFragmentModeOn = false;
         if(currentApplication){
             currentApplication = currentApplication.split('?')[0];
         }
     });
        
});