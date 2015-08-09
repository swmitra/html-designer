/**
 * @author Swagatam Mitra
  
 */

define(function (require, exports, module) {
    "use strict";
    
    var AppInit = brackets.getModule("utils/AppInit"),
        Resizer = brackets.getModule("utils/Resizer");
    
    var GridSettingsTemplate = require("text!controlhtml/fluid-grid-container.html");
    
    var gridTemplate = require("text!responsive/html/fluidGridTemplate.html");
    //var contentTemplate = '<div class="fluidColumn"><div class="content"></div></div>';
    var contentTemplate = '<div class="leftContentPad"></div><div class="fluidColumn"></div><div class="rightContentPad"></div>'
    
    $(document).on("panelResizeUpdate", "#designer-content-placeholder", function () {
        var asynchPromise = new $.Deferred();
        $("#scrollPlane").css('width',$("#designer-content-placeholder").css('width'));
        $("#scrollPlane").css('height',$("#designer-content-placeholder").css('height'));
        if($("#selection-outline:visible").length > 0){
            $("#html-design-editor").trigger( "refresh.element.selection" );
        }
        asynchPromise.resolve();
        return asynchPromise.promise();
    });

    $(document).on("panelResizeUpdate","#sidebar", function () {
        var asynchPromise = new $.Deferred();
        $("#scrollPlane").css('width',$("#designer-content-placeholder").css('width'));
        $("#scrollPlane").css('height',$("#designer-content-placeholder").css('height'));
        if($("#selection-outline:visible").length > 0){
            $("#html-design-editor").trigger( "refresh.element.selection" );
        }
        if($(".fluidGridPlane:visible").length > 0){
            //_constructFluidGrid();
        }
        asynchPromise.resolve();
        return asynchPromise.promise();
    });

    $(document).on("design-editor-shown","#html-design-editor",function(){
        $("#scrollPlane").css('width',$("#designer-content-placeholder").css('width'));
        $("#scrollPlane").css('height',$("#designer-content-placeholder").css('height'));
    });
    
    function _constructFluidGrid(){
        var noOfCols = $("#fluid-column-input").val();
        var gutterWidth = $("#fluid-gutter-input").val();
        var gutterUnit = $("#gutter-unit-select").val();
        var contentPadding = $("#fluid-padding-input").val();
        var paddingUnit = $("#padding-unit-select").val(); 
        
        var sectionAvailableWidth = parseFloat(100.0);
        var sectionCompWidth = parseFloat(0);
        
        if(gutterUnit === '%') {
            sectionAvailableWidth = sectionAvailableWidth - gutterWidth*(noOfCols - 1);
        } else {
            sectionCompWidth = sectionCompWidth + gutterWidth*(noOfCols - 1);
        }
        
        if(paddingUnit === '%') {
            sectionAvailableWidth = sectionAvailableWidth - contentPadding*noOfCols*2;
        } else {
            sectionCompWidth = sectionCompWidth + contentPadding*noOfCols*2;
        }
        
        var computedWidth = "";
        if(sectionCompWidth === 0){
            computedWidth = (sectionAvailableWidth/noOfCols)+"%";
        } else {
            computedWidth = 'calc('+(sectionAvailableWidth/noOfCols)+'% - '+ (sectionCompWidth/noOfCols)+'px)';
        }
        
        var newTemplate =   gridTemplate.split("@gutter").join(gutterWidth+gutterUnit)
                                        .split("@sectioncomputed").join(computedWidth)
                                        .split("@contentpadding").join(contentPadding+paddingUnit);
        
        $(".fluidGridPlane").html("");
        $(".fluidGridPlane").prepend(newTemplate);
        
        for( var i=0;i<noOfCols;i++){
            if(i === 0){
                $(contentTemplate).appendTo(".fluidGridPlane").css('margin-left','0px');
            } else {
                $(contentTemplate).appendTo(".fluidGridPlane");
            }
        }
    }
    
    $(document).on('input',"#fluid-column-input,#fluid-gutter-input,#fluid-padding-input",_constructFluidGrid);
    $(document).on('change',"#gutter-unit-select,#padding-unit-select",_constructFluidGrid);
    
    $(document).on("show-fluid-grid","#designer-ruler-context-menu",function(event){
        $("#html-design-editor,#grid-settings-container").addClass("fluidGridActivated");
        if($(".fluidGridPlane").children().length === 0){
            _constructFluidGrid();
        }
        $(".fluidGridPlane").show();
        if($("#selection-outline:visible").length > 0){
            $("#html-design-editor").trigger( "refresh.element.selection" );
        }
    });
    
    $(document).on("hide-fluid-grid","#designer-ruler-context-menu",function(event){
        $("#html-design-editor,#grid-settings-container").removeClass("fluidGridActivated");
        $(".fluidGridPlane").hide();
        if($("#selection-outline:visible").length > 0){
            $("#html-design-editor").trigger( "refresh.element.selection" );
        }
    });
    
    AppInit.appReady(function () {
        $("#html-design-template").append(GridSettingsTemplate);
        $(".fluidGridPlane").hide();
        Resizer.makeResizable($("#designer-content-placeholder")[0], Resizer.DIRECTION_HORIZONTAL, Resizer.POSITION_RIGHT, 300, false, undefined, false);
        Resizer.makeResizable($("#designer-content-placeholder")[0], Resizer.DIRECTION_VERTICAL, Resizer.POSITION_BOTTOM, 300, false, undefined, false);
        
    });
    
});
