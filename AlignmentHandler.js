/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";

    var layout,
        reference,
        referenceElement;
    
    function _alignLeft(){
        if(layout){
            layout.open();
            if(referenceElement){
                layout.changeLeftTo(referenceElement.getBoundingClientRect().left);
            } else if(reference){
                layout.changeLeftTo(reference.left);
            }
            layout.refresh();
            layout.close();
            $("#html-design-editor").trigger("groupReselect");
        }
    }
    
    function _alignRight(){
        if(layout){
            layout.open();
            if(referenceElement){
                layout.changeRightTo(referenceElement.getBoundingClientRect().right);
            } else if(reference){
                layout.changeRightTo(reference.right);
            }
            layout.refresh();
            layout.close();
            $("#html-design-editor").trigger("groupReselect");
        }
    }
    
    function _alignTop(){
        if(layout){
            layout.open();
            if(referenceElement){
                layout.changeTopTo(referenceElement.getBoundingClientRect().top);
            } else if(reference){
                layout.changeTopTo(reference.top);
            }
            layout.refresh();
            layout.close();
            $("#html-design-editor").trigger("groupReselect");
        }
    }
    
    function _alignBottom(){
        if(layout){
            layout.open();
            if(referenceElement){
                layout.changeBottomTo(referenceElement.getBoundingClientRect().bottom);
            } else if(reference){
                layout.changeBottomTo(reference.bottom);
            }
            layout.refresh();
            layout.close();
            $("#html-design-editor").trigger("groupReselect");
        }
    }
    
    function _alignMiddle(){
        if(layout){
            layout.open();
            if(referenceElement){
                layout.changeMiddleTo((referenceElement.getBoundingClientRect().bottom + referenceElement.getBoundingClientRect().top)/2);
            } else if(reference){
                layout.changeMiddleTo((reference.bottom + reference.top)/2);
            }
            layout.refresh();
            layout.close();
            $("#html-design-editor").trigger("groupReselect");
        }
    }
    
    function _alignCenter(){ 
        if(layout){
            layout.open();
            if(referenceElement){
                layout.changeCenterTo((referenceElement.getBoundingClientRect().left + referenceElement.getBoundingClientRect().right)/2);
            } else if(reference){
                layout.changeCenterTo((reference.left + reference.right)/2);
            }
            layout.refresh();
            layout.close();
            $("#html-design-editor").trigger("groupReselect");
        }
    }
    
    
    
    $(document).on("grouplayout.decision","#html-design-editor", function(event,layoutObj){
        layout = layoutObj;
     });
    
    $(document).on("groupreference.selected","#html-design-editor", function(event,referenceObj){
        referenceElement = referenceObj;
     });
    
    $(document).on("multiselectarea.computed","#html-design-editor",function(event,unionArea){
        reference = unionArea;
    });
    
    $(document).on('element.selected',"#html-design-editor",function(){
        reference = null;
        referenceElement = null;
    });
    
    $(document).on('deselect.all',"#html-design-editor",function(){
        reference = null;
        referenceElement = null;
    });
    
    $(document).on('click',".alignControl",function(){
        var op = $(this).data("operation");
        switch(op){
                case "align-left":_alignLeft();break;
                case "align-center":_alignCenter();break;
                case "align-right":_alignRight();break;
                case "align-top":_alignTop();break;
                case "align-middle":_alignMiddle();break;
                case "align-bottom":_alignBottom();break;
        }
    });
    
});