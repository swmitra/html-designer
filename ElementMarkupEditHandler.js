/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var AppInit       = brackets.getModule("utils/AppInit");
    var Resizer = brackets.getModule("utils/Resizer");
    var CodeMirror = brackets.getModule("thirdparty/CodeMirror2/lib/codemirror");
    var lastSelectedElement;
    var initialContent = null;
    var markupEditor = null;
    
    $(document).on("element.selected","#html-design-editor",function(event,element){
        lastSelectedElement = element;
        initialContent = lastSelectedElement.innerHTML;
        markupEditor.off("change",_synchUpdate);
        markupEditor.getDoc().setValue(initialContent);
        markupEditor.refresh();
        markupEditor.on("change",_synchUpdate);
    });
    
    $(document).on("deselect.all","#html-design-editor",function(event){
        $("#markup-editor-container").hide();
    });
        
    function _handleEdit(){
        if(lastSelectedElement){
            $("#markup-editor-container").show();
            markupEditor.refresh();
            markupEditor.focus();
        }
    }
    
    function _synchUpdate(){
        lastSelectedElement = $(lastSelectedElement).html(markupEditor.getDoc().getValue())[0]; 
    }
    
    $(document).on("targetdom-dblclick","#html-design-editor", function(event){
        _handleEdit();
    });
    
    $(document).on("click","#markup-edit-confirm", function(event){
        _acceptEdit();
    });
    
    $(document).on("click","#markup-edit-cancel", function(event){
        _revertEdit();
    });
    
    function _acceptEdit(){ 
        $("#markup-editor-container").hide();
        initialContent = null;
        $("#html-design-editor").trigger('select.element',[lastSelectedElement]);
        $("#html-design-editor").trigger('html.element.updated');
    }
    
    function _revertEdit(){    
        lastSelectedElement = $(lastSelectedElement).html(initialContent)[0];
        $("#markup-editor-container").hide();
        initialContent = null;
        $("#html-design-editor").trigger('select.element',[lastSelectedElement]);
    }
    
    AppInit.appReady(function () {
        markupEditor = CodeMirror.fromTextArea($('#markup-data-input')[0],{
            lineWrapping: true,
            lineNumbers: true,
            mode: "htmlmixed"
        });
        Resizer.makeResizable($("#markup-editor-container")[0]
                              , Resizer.DIRECTION_HORIZONTAL
                              , Resizer.POSITION_RIGHT
                              , 100, false, undefined, false);
        Resizer.makeResizable($("#markup-editor-container")[0]
                              , Resizer.DIRECTION_VERTICAL
                              , Resizer.POSITION_BOTTOM
                              , 140, false, undefined, false);
    });
    
});