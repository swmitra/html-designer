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
        listboxTemplate = require("text!widgetprofiles/widgetTemplates/html/listbox.html");
        
       
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
        }
        var id = type+IDGen.getID();
        template = template.replace("{{ID}}",id);
        
        return {template:template,uid:id};
    }
    
    exports.getTemplate = getTemplate;
    
});