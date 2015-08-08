/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var widgetContext = null;
    
    var PreferencesManager	= brackets.getModule('preferences/PreferencesManager');

	// Extension config
	var _ExtensionID		= "swmitra.html-designer";

	var _prefs = PreferencesManager.getExtensionPrefs(_ExtensionID);
	_prefs.definePreference('custom-template-path', 'string', "");
    
    $(document).on("contextmenu",".contextmenu-listner_create", function(event){
        if(_prefs.get('custom-template-path')){
            $("#widget-profile-context-menu-cont")
                .css('top',event.clientY - $("#html-design-template").offset().top + 23)
                .css('left',event.clientX - $("#html-design-template").offset().left + 23)
                .addClass('open')
                .show();
        }
    });
    
     
    $(document).on("click","#widget-profile-context-menu li a", function(event){
        $("#widget-profile-context-menu").trigger($(this).data('action'),[widgetContext]);
        _hideContextMenu();
    });
    
    $(document).on("contextmenu",".customTemplateShortcut", function(event){
        $("#widget-profile-edit-context-cont")
            .css('top',event.clientY - $("#html-design-template").offset().top+23)
            .css('left',event.clientX - $("#html-design-template").offset().left+23)
            .addClass('open')
            .show();
        
        widgetContext = $(this).attr('id').replace('ad-element-','');
    });
    
    $(document).on("click","#widget-profile-edit-context-menu li a", function(event){
        $("#widget-profile-context-menu").trigger($(this).data('action'),[widgetContext]);
        _hideContextMenu();
    });
    
    
    function _hideContextMenu(){
        $("#widget-profile-context-menu-cont")
        .removeClass('open')
        .hide();
        
        $("#widget-profile-edit-context-cont")
        .removeClass('open')
        .hide();
    }
    
    $(document).on("element.selected","#html-design-editor",function(event,element){
        _hideContextMenu();
    });
    
    $(document).on("multiselectarea.computed","#html-design-editor",function(event,unionArea){
        _hideContextMenu();
    });
    
    $(document).on("deselect.all","#html-design-editor",function(event){
        _hideContextMenu();
    });
    
    $(document).on("hide.contextmenu","#html-design-editor",function(event){
        _hideContextMenu();
    });
    
});