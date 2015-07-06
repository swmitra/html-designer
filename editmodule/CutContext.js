/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var clipBoardItem = null;
    var lastContext = null;
    
    $(document).on("cut-element","#html-design-editor", function(event){
        $("#html-design-editor").trigger("add-to-clipboard",["cutContext",lastContext]);
        $("#html-design-editor").trigger("deselect.all");
    });
    
    $(document).on("added-to-clipboard","#html-design-editor", function(event,element,context){
        if(context === "cutContext"){
            clipBoardItem = element;
             _applyCutMaskPosition();
             $("#cut-mask").show();
        }
    });
    
    function _cancelCutContext(){
        clipBoardItem = null;
        $("#cut-mask").hide();
        $("#html-design-editor").trigger("clear-clipboard");
    }
    
    $(document).on("element.selected","#html-design-editor",function(event,element){
        if(clipBoardItem && (clipBoardItem === element || $(clipBoardItem).find(element).length > 0)){
            _cancelCutContext();
        }
    });
    
    $(document).on("element-cut-completed","#html-design-editor", function(event){
         clipBoardItem = null;
         $("#cut-mask").hide();
         $("#html-design-editor").trigger("clear-clipboard");
    });
    
    function _applyCutMaskPosition(){
        var asynchPromise = new $.Deferred();
        if(clipBoardItem){
            var boundingRect = clipBoardItem.getBoundingClientRect();
            $("#cut-mask").css("top",boundingRect.top);
            $("#cut-mask").css("left",boundingRect.left);
            $("#cut-mask").css("width",boundingRect.width-1);
            $("#cut-mask").css("height",boundingRect.height-1);
        }
        asynchPromise.resolve();
        return asynchPromise.promise();
    }
    
    $(document).on("targetdom.contextmenu","#html-design-editor", function(e,elem,point){
        lastContext = elem;
    });
    
    $(document).on('refresh.element.selection',"#html-design-editor",_applyCutMaskPosition);
    
    function _handleCutContextRetention(event){
        var ESC = 27;
        if(clipBoardItem && event.which === ESC && $("input:focus").length === 0){
            _cancelCutContext();
        }
           
    }
    
    $(window).on('keydown',_handleCutContextRetention);

});