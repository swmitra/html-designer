/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var AppInit       = brackets.getModule("utils/AppInit");
    var FileUtils = brackets.getModule("file/FileUtils");
    var RuleSetCreator = require("stylemodule/RuleSetCreator");
    
    var lastSelectedRuleset = null;
    var currentApplication = '';
    var lastPrefferedSelectorVal = "";
    var currentActiveMedia = null;
    
    $(document).on("click","#css-toolbox-anchor",function(event){
        $("#css-editor").show();
        event.preventDefault();
        event.stopPropagation();
    });
    
    $(document).on("click","#css-editor-close",function(event){
        $("#css-editor").toggleClass("toolboxCollapsed");
        $(this).toggleClass("collapsed");
        event.preventDefault();
        event.stopPropagation();
    });
    
    function _showTargetSelectorOptions(rulesetref){
        var lastSelectedValue = null;
        if(lastSelectedRuleset && lastSelectedRuleset.element === rulesetref.element && lastPrefferedSelectorVal === lastSelectedRuleset.getPreferredSelectorValue()[1]){
            lastSelectedValue = $("#css-target-select").val();
            if(lastSelectedValue){
                rulesetref.changeTargetSelector(lastSelectedValue);
            } /*else {
                lastSelectedValue = lastSelectedRuleset.getPreferredSelectorValue()[1];
            }*/
        } 
        lastSelectedRuleset = rulesetref;
        $("#css-target-select").html("");
        var options = lastSelectedRuleset.getTargetSelectorOptions();
        var option;
        for(var i=0;i<options.length;i++){
            option = options[i];
            $('<option value="'+option[1].split(/"/g).join('&quot;')+'" title="'+(option[1].split('{sep}')[3] || '')+'">'+option[0]+'</option>').appendTo($("#css-target-select"));
        }
        
        if(lastSelectedValue){
            $("#css-target-select").val(lastSelectedValue);
        }else {
            option = lastSelectedRuleset.getPreferredSelectorValue();
            if(option){
                $("#css-target-select").val(option[1]);
                lastPrefferedSelectorVal = option[1];
                var fileName = FileUtils.getBaseName(option[1].split('{sep}')[2] || currentApplication);
                $("#target-stylesheet-file").data("file",option[1].split('{sep}')[2] || currentApplication);
                if(currentApplication.indexOf(option[1].split('{sep}')[2])<0){
                    $("#target-stylesheet-file").data("type","css");  
                } else {
                    $("#target-stylesheet-file").data("type","source");  
                }
                $("#target-stylesheet-file").data("index",option[1].split('{sep}')[1]);
                fileName = fileName.split('?')[0];
                $("#target-stylesheet-file").html('@'+fileName);
            }
        }
        _findSelectorInActiveMedia();
        $("#html-design-editor").trigger("refresh-ruleset-properties",[lastSelectedRuleset]);
    }
    
    $(document).on("ruleset-wrapper.created ruleset-wrapper.refreshed","#html-design-editor",function(event,rulesetref){
        var asynchPromise = new $.Deferred();
        _showTargetSelectorOptions(rulesetref);
        //$("#html-design-editor").trigger("refresh-ruleset-properties",[rulesetref]);
        asynchPromise.resolve();
        return asynchPromise.promise();
    });
    
    $(document).on("activemedia-found","#html-design-editor",function(event,media){
        currentActiveMedia = media;
    });
    
    $(document).on("click","#add-new-selector-to-media",function(event){
        var asynchPromise = new $.Deferred();
        var cuurentVal = ($("#css-target-select").val()).split('{sep}');
        //RuleSetCreator.sendRulesetToMedia(currentActiveMedia,lastSelectedRuleset.ruleSet.cssText);
        RuleSetCreator.sendRulesetToMedia(currentActiveMedia,lastSelectedRuleset.ruleSet.selectorText+'{}');
        $("#html-design-editor").trigger( "refresh.element.selection" );
        var values;
        window.setTimeout(function(){
            $("#css-target-select option").each(function() {
                values = ($(this).val()).split('{sep}');
                if(values[0] === cuurentVal[0] && values[3] === currentActiveMedia){
                    $("#css-target-select option").val($(this).val());
                    $("#html-design-editor").trigger( "refresh.element.selection" );
                }
            });
        },100);
        asynchPromise.resolve();
        return asynchPromise.promise();
    });
    
    function _findSelectorInActiveMedia(){
        var asynchPromise = new $.Deferred();
        
        $("#add-new-selector-to-media").attr('disabled','true');
        var currVal = ($("#css-target-select").val() || "").split('{sep}')[3] || "";
        var currSelector = ($("#css-target-select").val() || "").split('{sep}')[0];
        var sameSelectorWithMediaFound = false;
        var values;
        if(currentActiveMedia && currVal === "" && currSelector !== "element.style"){
            $("#css-target-select option").each(function() {
                values = ($(this).val()).split('{sep}');
                if(values[0] === currSelector && values[3] === currentActiveMedia){
                    sameSelectorWithMediaFound = true;
                }
            });
            if(!sameSelectorWithMediaFound){
                $("#add-new-selector-to-media").removeAttr('disabled');
            }
        }

        asynchPromise.resolve();
        return asynchPromise.promise();
    }
    
    $(document).on("panelResizeUpdate", "#designer-content-placeholder", _findSelectorInActiveMedia);
    
    $(document).on("deselect.all","#html-design-editor",function(event,rulesetref){
        var asynchPromise = new $.Deferred();
        $("#css-target-select").html("");
        $("#css-target-select").val("");
        $("#target-stylesheet-file").text("");
        $("#css-target-select").css('border-left','');
        asynchPromise.resolve();
        return asynchPromise.promise();
    });
    
    $(document).on("click","#target-stylesheet-file",function(event){
        var asynchPromise = new $.Deferred();
        var type = $(this).data("type");
        var file = $(this).data("file");
        var index = $(this).data("index");
        $("#html-design-editor").trigger(type+"-file-select-requested",[file,parseInt(index)+1]);
        asynchPromise.resolve();
        return asynchPromise.promise();
    });
    
    $(document).on("click","#css-target-select", function(event){
        event.preventDefault();
        event.stopPropagation();
     });
    
    $(document).on("change","#css-target-select",function(){
        lastSelectedRuleset.changeTargetSelector($(this).val().split('&quot;').join('"'));
        var fileName = FileUtils.getBaseName($(this).val().split('{sep}')[2] || currentApplication);
        $("#target-stylesheet-file").data("file",$(this).val().split('{sep}')[2] || currentApplication);
        if(currentApplication.indexOf($(this).val().split('{sep}')[2])<0){
            $("#target-stylesheet-file").data("type","css");  
        } else {
            $("#target-stylesheet-file").data("type","source");  
        }
        $("#target-stylesheet-file").data("index",$(this).val().split('{sep}')[1]);
        fileName = fileName.split('?')[0];
        $("#target-stylesheet-file").html('@'+fileName);
        _findSelectorInActiveMedia();
    });
    
    $(document).on("application.context","#html-design-editor", function(event,applicationKey){
        currentApplication = applicationKey;
    });
    
    $(document).on("target-selector-changed","#html-design-editor", function(event,rulesetref){
        lastSelectedRuleset = rulesetref;
        $("#html-design-editor").trigger("refresh-ruleset-properties",[lastSelectedRuleset]);
    });
    
    $(document).on('change','#css-prop-priority',function() {
        if($(this).is(":checked")) {
            $("#html-design-editor").trigger("css.priority.enabled");
        } else {
            $("#html-design-editor").trigger("css.priority.disabled");
        }
    });
           
});