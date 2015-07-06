/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var lastSelectedElement;
    
    $(document).on("element.selected","#html-design-editor",function(event,element){
        lastSelectedElement = element;
    });
    
    $(document).on("deselect.all","#html-design-editor",function(event){
        //lastSelectedElement = null;
    });
    
    $(document).on("multiselection.done","#html-design-editor", function(event,elements){
        lastSelectedElement = elements;
    });
    
    function _handleDelete(){
        if(lastSelectedElement){
            $("#html-design-editor")
            .trigger(
                "design.editor.event"
                ,['delete.element'
                ,{ element : lastSelectedElement},'html']
              );
            $("#html-design-editor").trigger('groupdeselect.all');
            $("#html-design-editor").trigger('deselect.all');
        }
    }
    
    $(document).on("delete-element","#html-design-editor", function(event){
        _handleDelete();
    });
    
    function _handleElementDeletion(event){    
       if($("#html-design-template").is(':visible')){
           if(event.which === 46){
               if($("input:focus").length === 0 && $("textarea:focus").length === 0){
                    _handleDelete();
               }
           }
       } 
    }
    
    $(window).on('keydown',_handleElementDeletion);
    
    
});