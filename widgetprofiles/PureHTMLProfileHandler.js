/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var IDGen = require('widgetprofiles/UIDGenerator');
    
    var textTemplate = require("text!widgetprofiles/widgetTemplates/html/textbox.html"),
        divTemplate = require("text!widgetprofiles/widgetTemplates/html/div.html"),
        imageTemplate = require("text!widgetprofiles/widgetTemplates/html/img.html"),
        buttonTemplate = require("text!widgetprofiles/widgetTemplates/html/button.html"),
        checkboxTemplate = require("text!widgetprofiles/widgetTemplates/html/checkbox.html"),
        radioTemplate = require("text!widgetprofiles/widgetTemplates/html/radio.html"),
        paragraphTemplate = require("text!widgetprofiles/widgetTemplates/html/text.html"),
        tableTemplate = require("text!widgetprofiles/widgetTemplates/html/table.html"),
        listboxTemplate = require("text!widgetprofiles/widgetTemplates/html/listbox.html"),
        iframeTemplate = require("text!widgetprofiles/widgetTemplates/html/iframe.html");
        
       
    function getTemplate(type){
        var template;
        switch(type){
            case 'div': template = divTemplate; break;
            case 'img': template = imageTemplate; break;
            case 'list': template = listboxTemplate; break;
            case 'chkbox': template = checkboxTemplate; break;
            case 'radio': template = radioTemplate; break;
            case 'button': template = buttonTemplate; break;
            case 'textbox': template = textTemplate; break;
            case 'paragraph': template = paragraphTemplate;break;
            case 'table': template = tableTemplate;break;
            case 'iframe': template = iframeTemplate;break;
        }
        var id = type+IDGen.getID();
        template = template.replace("{{ID}}",id);
        
        return {template:template,uid:id};
    }
    
    exports.getTemplate = getTemplate;
    
});