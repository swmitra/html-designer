/**
 * @author Swagatam Mitra
 */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var AppInit       = brackets.getModule("utils/AppInit"),
        FileSystem    = brackets.getModule("filesystem/FileSystem");
    var CustomTemplateShortcut = require("text!widgetprofiles/html/custom-element-shortcut.html");
    var IDGen = require('widgetprofiles/UIDGenerator');
    
    require("widgetprofiles/ProfileTemplateEditHandler");
    
    var PreferencesManager	= brackets.getModule('preferences/PreferencesManager');
	var _ExtensionID		= "swmitra.html-designer";

	var _prefs = PreferencesManager.getExtensionPrefs(_ExtensionID);
    
    var widgetContext = null;
    var templateEditor = null;
    var lastSelectedElement = null;
    
    var ExtensionUtils = brackets.getModule("utils/ExtensionUtils");
    var MODULE_PATH = _prefs.get('custom-template-path');
    
    var customTemplateMap = {};
    
    function _isValidTemplate(templateString){
        var rootLength = $("<div>"+templateString+"</div>").children().length;
        
        switch(rootLength){
            case 0: $("#widget-template-editor-container #template-error").text("No valid HTML element found!");break;
            case 1:$("#widget-template-editor-container #template-error").text("");break;
            default:$("#widget-template-editor-container #template-error").text("Only one top level container allowed!");break;
        }
        
        return rootLength === 1;
    }
    
    function _showTemplateEditor(){
        $("#design-modal-backdrop").show();
        $("#widget-template-editor-container").show();
        templateEditor.refresh();
    }
    
    function _hideTemplateEditor(){
        $("#design-modal-backdrop").hide();
        $("#widget-template-editor-container").hide();
        templateEditor.getDoc().setValue("");
        $('#widget-template-label-input').val("");
        $("#widget-template-editor-container #template-error").text("")
    }
    
    function _createShortcut(){
            var index = $("#html-elements-catalog .customTemplateShortcut").length + 1;
            var label = $('#widget-template-label-input').val() || "";
            var id = IDGen.getID();
            var template = templateEditor.getDoc().getValue();
            if(_isValidTemplate(template)){
                template = $(template).attr('id','{{ID}}')[0].outerHTML;
                customTemplateMap[id] = template;
                FileSystem.getFileForPath(MODULE_PATH+"/templ"+id+".html").write(template,{ blind: true });
                $(CustomTemplateShortcut.split("{{index}}").join(index).split("{{label}}").join(label).split("{{templateID}}").join(id))
                    .appendTo("#custom-element-container");

                FileSystem.getFileForPath(MODULE_PATH+"/custom-element-entryset.html").write($("#custom-element-container").html(),{ blind: true });

                _hideTemplateEditor();
                $("#widget-template-edit-confirm").off("click",_createShortcut);
            }
        }
    
     
    $(document).on("add-widget-template","#widget-profile-context-menu", function(event){
        _showTemplateEditor();
        
        
        $("#widget-template-edit-confirm").off("click",_createShortcut);
        $("#widget-template-edit-confirm").on("click",_createShortcut);
        
        $("#widget-template-edit-cancel").one("click",function(event){
            _hideTemplateEditor(); 
            $("#widget-template-edit-confirm").off("click",_createShortcut);
        });
    });
    
    $(document).on("delete-widget-template","#widget-profile-context-menu", function(event,context){
        var element = $("#custom-element-container #ad-element-"+context)[0];
        FileSystem.getFileForPath(MODULE_PATH+"/templ"+context+".html").unlink();
        var pivotFound = false;
        $("#custom-element-container .customTemplateShortcut").each(function(){
            
            if(pivotFound === true){
                $(this).find('div').text(parseInt($(this).find('div').text()) - 1);
            }
            
            if(this === element){
                pivotFound = true;
            }
        });
        
        $(element).remove();
        FileSystem.getFileForPath(MODULE_PATH+"/custom-element-entryset.html").write($("#custom-element-container").html(),{ blind: true });
    });
    
     $(document).on("edit-widget-template","#widget-profile-context-menu", function(event,context){
        _showTemplateEditor();
         
        templateEditor.getDoc().setValue(customTemplateMap[context]);
        templateEditor.refresh();
        $('#widget-template-label-input').val($("#html-elements-catalog .customTemplateShortcut#ad-element-"+context).attr('title'));
         
        function _editShortcut(){
            var label = $('#widget-template-label-input').val() || "";
            var id = context;
            var template = templateEditor.getDoc().getValue();
            
            if(_isValidTemplate(template)){
                template = $(templateEditor.getDoc().getValue()).attr('id','{{ID}}')[0].outerHTML;
                customTemplateMap[id] = template;
                FileSystem.getFileForPath(MODULE_PATH+"/templ"+id+".html").write(template,{ blind: true });

                $("#html-elements-catalog .customTemplateShortcut#ad-element-"+id).attr('title',label);
                FileSystem.getFileForPath(MODULE_PATH+"/custom-element-entryset.html").write($("#custom-element-container").html(),{ blind: true });

                _hideTemplateEditor();
                $("#widget-template-edit-confirm").off("click",_editShortcut);
            }
        }
        
        $("#widget-template-edit-confirm").off("click",_editShortcut);
        $("#widget-template-edit-confirm").on("click",_editShortcut);
        
        $("#widget-template-edit-cancel").one("click",function(event){
            _hideTemplateEditor(); 
            $("#widget-template-edit-confirm").off("click",_editShortcut);
        });
    });
    
    $(document).on("element.selected","#html-design-editor",function(event,element){
        lastSelectedElement = element;
    });
    
    $(document).on("add-as-shortcut","#html-design-editor", function(event){
        _showTemplateEditor();
        
        templateEditor.getDoc().setValue(lastSelectedElement.outerHTML);
        templateEditor.refresh();
                
        $("#widget-template-edit-confirm").off("click",_createShortcut);
        $("#widget-template-edit-confirm").on("click",_createShortcut);
        
        $("#widget-template-edit-cancel").one("click",function(event){
            _hideTemplateEditor();
            $("#widget-template-edit-confirm").off("click",_createShortcut);
        });
    });
    
    function _synchCustomTemplates(){
        if(MODULE_PATH){
            var dir = FileSystem.getDirectoryForPath(MODULE_PATH+"/swmitra.html-designer.templates");
            dir.exists(function(err,flag){
                if(!flag){
                    dir.create();
                }
            });

            MODULE_PATH = MODULE_PATH+"/swmitra.html-designer.templates";

            FileSystem.getFileForPath(MODULE_PATH+"/custom-element-entryset.html").read(function(err,data,stats){
                if(data){
                    $("#custom-element-container").html(data);
                }
                $("#custom-element-container .customTemplateShortcut").each(function(){
                    var id = $(this).attr('id').replace('ad-element-','');
                    FileSystem.getFileForPath(MODULE_PATH+"/templ"+id+".html").read(function(err,data,stats){
                        customTemplateMap[id] = data;
                    });
                });
            });
        }
    }
    
    AppInit.appReady(function () {
        templateEditor = CodeMirror.fromTextArea($('#widget-template-data-input')[0],{
            lineWrapping: true,
            lineNumbers: true,
            mode: "htmlmixed"
        });
        
        _synchCustomTemplates();
    });
    
    function getTemplate(type){
        var template = customTemplateMap[type];
        var id = "custom"+IDGen.getID();
        template = template.replace("{{ID}}",id);
        
        return {template:template,uid:id};
    }
    
    exports.getTemplate = getTemplate;
    
});