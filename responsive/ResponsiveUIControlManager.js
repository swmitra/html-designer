/**
 * @author Swagatam Mitra
  
 */

define(function (require, exports, module) {
    "use strict";
    
    var AppInit = brackets.getModule("utils/AppInit"),
        Resizer = brackets.getModule("utils/Resizer");
    
    var layout = null;
    
    var GridSettingsTemplate = require("text!controlhtml/fluid-grid-container.html"),
        ResizeKnobTemplate = require("text!controlhtml/resizeKnobHandleTemplate.html"),
        VerticalGripper = require("text!controlhtml/verticalGripper.html"),
        HorizontalGripper = require("text!controlhtml/horizontalGripper.html");
    
    var spanStart = null, 
        spanEnd = null;
    
    var fnColumnOffset,fnColumnWidth;
    
    var keys,values;
    
    var gridTemplate = require("text!responsive/html/fluidGridTemplate.html");
    var contentTemplate = '<div name="{{index}}" class="leftContentPad"></div><div name="{{index}}" class="fluidColumn"></div><div name="{{index}}" class="rightContentPad"></div>';
    
    $(document).on("panelResizeUpdate", "#designer-content-placeholder", function () {
        var asynchPromise = new $.Deferred();
        $("#scrollPlane").css('width',$("#designer-content-placeholder").css('width'));
        $("#scrollPlane").css('height',$("#designer-content-placeholder").css('height'));
        if($("#selection-outline:visible").length > 0){
            $("#html-design-editor").trigger( "refresh.element.selection" );
        }
        $("#design-window-width-input").val(parseInt($("#htmldesignerIframe").width()));
        $("#breakpoint-container").width($("#htmldesignerIframe").width());
        asynchPromise.resolve();
        return asynchPromise.promise();
    });

    $(document).on("panelResizeUpdate","#sidebar", function () {
        var asynchPromise = new $.Deferred();
        $("#scrollPlane").css('width',$("#designer-content-placeholder").css('width'));
        $("#scrollPlane").css('height',$("#designer-content-placeholder").css('height'));
        if($(".fluidGridPlane:visible").length > 0){
            _constructFluidGrid();
        }
        
        if($("#selection-outline:visible").length > 0){
            $("#html-design-editor").trigger( "refresh.element.selection" );
        }
        asynchPromise.resolve();
        return asynchPromise.promise();
    });

    $(document).on("design-editor-shown","#html-design-editor",function(){
        $("#scrollPlane").css('width',$("#designer-content-placeholder").css('width'));
        $("#scrollPlane").css('height',$("#designer-content-placeholder").css('height'));
        $("#design-window-width-input").val(parseInt($("#htmldesignerIframe").width()));
        $("#breakpoint-container").width($("#htmldesignerIframe").width());
        $("#breakpoint-container").html("");
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
                $(contentTemplate.split("{{index}}").join(i)).appendTo(".fluidGridPlane").css('margin-left','0px');
            } else {
                $(contentTemplate.split("{{index}}").join(i)).appendTo(".fluidGridPlane");
            }
        }
        
        fnColumnOffset = function(index){
            var calcGutterWidth = gutterWidth*index;
            var calcPaddingWidth = contentPadding*index*2;
            var calcColumnWidth = (sectionAvailableWidth/noOfCols)*index;
            
            var computedColumnWidth = calcColumnWidth;
            var computedComp = 0;
            
            if(gutterUnit === 'px'){
                computedComp = computedComp + calcGutterWidth;
            } else {
                computedColumnWidth = computedColumnWidth + calcGutterWidth;
            }
            
            if(paddingUnit === 'px'){
                computedComp = computedComp + calcPaddingWidth;
            } else {
                computedColumnWidth = computedColumnWidth + calcPaddingWidth;
            }
            
            if(computedComp === 0){
                computedColumnWidth = computedColumnWidth+"%";
            } else {
                computedColumnWidth = 'calc('+computedColumnWidth+'% + '+ computedComp+'px)';
            }
            
            return computedColumnWidth;
        }
        
        fnColumnWidth = function(spanIndex){
            var calcGutterWidth = gutterWidth*spanIndex;
            var calcPaddingWidth = contentPadding*(spanIndex + 1)*2;
            var calcColumnWidth = (sectionAvailableWidth/noOfCols)*(spanIndex+1);
            
            var computedColumnWidth = calcColumnWidth;
            var computedComp = 0;
            
            if(gutterUnit === 'px'){
                computedComp = computedComp + calcGutterWidth;
            } else {
                computedColumnWidth = computedColumnWidth + calcGutterWidth;
            }
            
            if(paddingUnit === 'px'){
                computedComp = computedComp + calcPaddingWidth;
            } else {
                computedColumnWidth = computedColumnWidth + calcPaddingWidth;
            }
            
            if(computedComp === 0){
                computedColumnWidth = computedColumnWidth+"%";
            } else {
                computedColumnWidth = 'calc('+computedColumnWidth+'% - '+ computedComp+'px)';
            }
            
            return computedColumnWidth;
        }
    }
    
    $(document).on("layout.decision","#html-design-editor", function(event,layoutObj){
        layout = layoutObj;
    });
    
    function _createFluidDistribution(spanStart,spanEnd){
        layout.open();
        layout.setX(fnColumnOffset(spanStart),true);
        layout.changeWidthTo(fnColumnWidth(spanEnd-spanStart),true);
        layout.refresh();
        layout.close();
        $(".activeGrid").removeClass("activeGrid");
        $(".fluidGridPlane").css('pointer-events','none');
        $(".fluidGridPlane div").css('pointer-events','none');
    }
    
    $(document).on("click",".fluidColumn",function(event){
        if(event.altKey && layout ) {
            var index = parseInt($(this).attr('name'));
            $('.fluidGridPlane div[name="'+index+'"]').addClass("activeGrid");
            if(spanStart !== null){
                if(spanStart <= index){
                    spanEnd = index;
                } else {
                    spanEnd = spanStart;
                    spanStart = index;
                }
                _createFluidDistribution(spanStart,spanEnd);
                spanStart = null; 
                spanEnd = null;
            } else {
                spanStart = index;
            }
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();
        }
    });
    
    function _handleGridActivation(event){        
        if(event.altKey === true){
            $(".fluidGridPlane").css('pointer-events','all');
           $(".fluidGridPlane div").css('pointer-events','all');
        }
    }
    
    function _handleGridDeActivation(event){        
        if(event.altKey === true){
           $(".fluidGridPlane").css('pointer-events','none');
           $(".fluidGridPlane div").css('pointer-events','none');
        }
    }
    
    $(window).on('keydown',_handleGridActivation);
    $(window).on('keyup',_handleGridDeActivation);
    
    $(document).on('input',"#fluid-column-input,#fluid-gutter-input,#fluid-padding-input",_constructFluidGrid);
    $(document).on('change',"#gutter-unit-select,#padding-unit-select",_constructFluidGrid);
    
    $(document).on("click","#show-hide-fluid-grid",function(event){
        if($(this).hasClass("hideFluidGrid")){
            $(this).removeClass("hideFluidGrid");
            $(this).addClass("glyphicon-eye-open");
            $(this).removeClass("glyphicon-eye-close");
            $(".fluidGridPlane").hide();
            $(this).attr('title',"Show Fluid Grid");
        } else {
            $(this).addClass("hideFluidGrid");
            $(this).addClass("glyphicon-eye-close");
            $(this).removeClass("glyphicon-eye-open");
            if($(".fluidGridPlane").children().length === 0){
                _constructFluidGrid();
            }
            $(".fluidGridPlane").show();
            $(this).attr('title',"Hide Fluid Grid");
        }
    });
    
    $(document).on("show-responsive-controls","#designer-ruler-context-menu",function(event, element){
        $("#html-design-editor,#grid-settings-container").addClass("fluidGridActivated");
        if($("#selection-outline:visible").length > 0){
            $("#html-design-editor").trigger( "refresh.element.selection" );
        }
        $(element).data('action',"hide-responsive-controls").text("Hide Responsive Controls");
    });
    
    $(document).on("hide-responsive-controls","#designer-ruler-context-menu",function(event, element){
        $("#html-design-editor,#grid-settings-container").removeClass("fluidGridActivated");
        if($("#selection-outline:visible").length > 0){
            $("#html-design-editor").trigger( "refresh.element.selection" );
        }
        $(element).data('action',"show-responsive-controls").text("Show Responsive Controls");
    });
    
    AppInit.appReady(function () {
        $("#html-design-template").append(GridSettingsTemplate);
        $(".fluidGridPlane").hide();
        Resizer.makeResizable($("#designer-content-placeholder")[0], Resizer.DIRECTION_HORIZONTAL, Resizer.POSITION_RIGHT, 300, false, undefined, false);
        Resizer.makeResizable($("#designer-content-placeholder")[0], Resizer.DIRECTION_VERTICAL, Resizer.POSITION_BOTTOM, 300, false, undefined, false);
        $("#designer-content-placeholder .horz-resizer").append(ResizeKnobTemplate);
        $("#designer-content-placeholder .horz-resizer").append(VerticalGripper);
        $("#designer-content-placeholder .vert-resizer").append(HorizontalGripper);
    });
    
});
