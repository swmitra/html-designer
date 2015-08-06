/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var widgetContext = null;
    
    var PreferencesManager	= brackets.getModule('preferences/PreferencesManager'),
        AppInit = brackets.getModule("utils/AppInit"),
        FileSystem    = brackets.getModule("filesystem/FileSystem"),
        FileUtils = brackets.getModule("file/FileUtils");

	// Extension config
	var _ExtensionID		= "swmitra.html-designer";
    var _settingsPath = null;
    
    var _preferenceCache = {};

	var _prefs = PreferencesManager.getExtensionPrefs(_ExtensionID);
	_prefs.definePreference('settings-file-path', 'string', "");
    
    var currentApplication = null;    
    var _entryTemplate = '<li class="list-group-item" data-path="{{path}}" title="{{path}}"><a href="#">{{value}}</a><div>Default</div></li>';
    
    $(document).on("application.context","#html-design-editor", function(event,applicationKey){
        currentApplication = applicationKey;
        $("#html-design-editor").trigger("default-stylesheet-path",[_preferenceCache[currentApplication]]);
    });
    
    function _createStylesheetOptions(styleSheets){
        $("#default-stylesheet-select-list").html("");
        var prefferedStylePath = _preferenceCache[currentApplication];
        var newOption;
    
        var sheetCount,styleSheet;
        for (sheetCount = 0; sheetCount < styleSheets.length ; sheetCount++) {
            styleSheet = styleSheets[sheetCount];
            newOption = _entryTemplate.split("{{path}}").join(styleSheet.href);
            newOption = newOption.split("{{value}}").join(FileUtils.getBaseName(styleSheet.href));
            newOption = $(newOption).appendTo("#default-stylesheet-select-list");
            if(styleSheet.href === prefferedStylePath){
                newOption.addClass("active");
            }
        }  
        
        if($("#default-stylesheet-select-list").children().length === 0){
            $("#default-stylesheet-select-list").html("No Stylesheets Loaded!");
        }
    }
    
    $(document).on("click","#reset-default-stylesheet",function(event){
        $("#default-stylesheet-select-list>li").removeClass("active");
        delete _preferenceCache[currentApplication];
        $("#html-design-editor").trigger("default-stylesheet-path",[_preferenceCache[currentApplication]]);
        FileSystem.getFileForPath(_settingsPath+"/swmitra.html-designer-settings/DefaultStyleSheetPreferences.json").write(JSON.stringify(_preferenceCache),{ blind: true });
    });
    
    $(document).on("click","#default-stylesheet-select-list>li",function(event){
        $("#default-stylesheet-select-list>li").removeClass("active");
        $(this).addClass("active");
        _preferenceCache[currentApplication] = $(this).data('path');
        $("#html-design-editor").trigger("default-stylesheet-path",[_preferenceCache[currentApplication]]);
        FileSystem.getFileForPath(_settingsPath+"/swmitra.html-designer-settings/DefaultStyleSheetPreferences.json").write(JSON.stringify(_preferenceCache),{ blind: true });
    });
    
    $(document).on("stylesheets-in-dom","#html-design-editor",function(event, styleSheets){
        _createStylesheetOptions(styleSheets);
    });
    
    $(document).on("click","#design-settings-anchor",function(event){
        if(_settingsPath){
            $("#design-modal-backdrop").show();
            $("#designer-settings-container").show();
        }
    });
    
    $(document).on("click","#designer-settings-close",function(event){
        $("#design-modal-backdrop").hide();
        $("#designer-settings-container").hide();
    });
    
    AppInit.appReady(function () {
        _settingsPath = _prefs.get('settings-file-path');
        if(_settingsPath){
            var dir = FileSystem.getDirectoryForPath(_settingsPath+"/swmitra.html-designer-settings");
            dir.exists(function(err,flag){
                if(flag){
                    var file = FileSystem.getFileForPath(_settingsPath+"/swmitra.html-designer-settings/DefaultStyleSheetPreferences.json");
                    file.exists(function(err,flag){
                        if(flag){
                            file.read(function(err,data,stats){
                                if(data){
                                    _preferenceCache = JSON.parse(data);
                                }
                            });
                        } else {
                            file.write("{}",{ blind: true });
                        }
                    });
                } else {
                    dir.create(function(){
                        FileSystem.getFileForPath(_settingsPath+"/swmitra.html-designer-settings/DefaultStyleSheetPreferences.json").write("{}",{ blind: true });
                    });
                }
            });
        }
    });
    
});