/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var AppInit       = brackets.getModule("utils/AppInit");
    var FileUtils = brackets.getModule("file/FileUtils");
    
    var lastSelectedRuleset = null;
    var currentApplication = '';
    
    $(document).on("click","#css-toolbox-anchor",function(event){
        $("#css-editor").show();
        event.preventDefault();
        event.stopPropagation();
    });
    
    $(document).on("click","#css-editor-close",function(event){
        $("#css-editor").hide();
        event.preventDefault();
        event.stopPropagation();
    });
    
    function _showTargetSelectorOptions(rulesetref){
        var lastSelectedValue = null;
        if(lastSelectedRuleset && lastSelectedRuleset.element === rulesetref.element){
            lastSelectedValue = $("#css-target-select").val();
            if(lastSelectedValue){
                rulesetref.changeTargetSelector(lastSelectedValue);
            }
        } 
        lastSelectedRuleset = rulesetref;
        $("#css-target-select").html("");
        var options = lastSelectedRuleset.getTargetSelectorOptions();
        var option;
        for(var i=0;i<options.length;i++){
            option = options[i];
            $('<option value="'+option[1]+'">'+option[0]+'</option>').appendTo($("#css-target-select"));
        }
        
        if(lastSelectedValue){
            $("#css-target-select").val(lastSelectedValue);
        }else {
            option = lastSelectedRuleset.getPreferredSelectorValue();
            if(option){
                $("#css-target-select").val(option[1]);
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
        
        $("#html-design-editor").trigger("refresh-ruleset-properties",[lastSelectedRuleset]);
    }
    
    $(document).on("ruleset-wrapper.created ruleset-wrapper.refreshed","#html-design-editor",function(event,rulesetref){
        var asynchPromise = new $.Deferred();
        _showTargetSelectorOptions(rulesetref);
        $("#html-design-editor").trigger("refresh-ruleset-properties",[lastSelectedRuleset]);
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
        lastSelectedRuleset.changeTargetSelector($(this).val());
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