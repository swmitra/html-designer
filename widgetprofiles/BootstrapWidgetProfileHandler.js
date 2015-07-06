/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var IDGen = require('widgetprofiles/UIDGenerator');
    
    var tabsTemplate = require("text!widgetprofiles/widgetTemplates/bootstrap/tab.html"),
        dropdownMenuTemplate = require("text!widgetprofiles/widgetTemplates/bootstrap/drop-down-menu.html");
       
    function getTemplate(type){
        var template;
        switch(type){
            case 'tabs': template = tabsTemplate; break;
            case 'dropdown': template = dropdownMenuTemplate; break;
        }
        
        var id = type+IDGen.getID();
        template = template.replace("{{ID}}",id);
        
        return {template:template,uid:id};
    }
    
    exports.getTemplate = getTemplate;
    
});