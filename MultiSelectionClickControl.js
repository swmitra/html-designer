/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var AppInit       = brackets.getModule("utils/AppInit");
    
    var multiSelectedElements = [];
    var lastSelectedElement = null;
    
    function _doMultiSelect(event,element,point){
        if(lastSelectedElement){
            multiSelectedElements.push(lastSelectedElement);
        }
        if(multiSelectedElements.indexOf(element) != -1 ){
            multiSelectedElements.splice(multiSelectedElements.indexOf(element),1);
        } else {
            multiSelectedElements.push(element);
        }
        $("#html-design-editor").trigger("multiselection.done",[multiSelectedElements]);
            
    }

    $(document).on("multiselect.click","#html-design-editor",_doMultiSelect);
    
    $(document).on('element.selected',"#html-design-editor",function(){
       multiSelectedElements = []; 
    });
    
    $(document).on('multiselection.done',"#html-design-editor",function(event,elements){
       multiSelectedElements = elements; 
       lastSelectedElement = null;
    });
    
    $(document).on('element.selected',"#html-design-editor",function(event,element){
        lastSelectedElement = element;
     });
    
});