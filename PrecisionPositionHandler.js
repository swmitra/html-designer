/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var layout;
    
    //handle precision movement by 1px increments/decrements
        
    function _moveLeft(){
        layout.changeX(1);
    }
    
    function _moveRight(){
         layout.changeX(-1);
    }
    
    function _moveUp(){
        layout.changeY(1);
    }
    
    function _moveDown(){
        layout.changeY(-1);
    }
    
    function _handlePresicisonMovement(event){
        var LEFT = 37,
            UP = 38,
            RIGHT = 39,
            DOWN = 40;
        
       if(layout && $("#html-design-template").is(':visible')){
           if(event.shiftKey === false && event.altKey === false && event.ctrlKey === false
              && (event.which === LEFT || event.which === RIGHT || event.which === UP || event.which === DOWN)){
               if($("input:focus").length === 0 && $("textarea:focus").length === 0){
                   layout.open();
                   switch(event.which){
                       case LEFT: _moveLeft();break;
                       case RIGHT: _moveRight();break;
                       case UP: _moveUp();break;
                       case DOWN: _moveDown();break;
                   }
                   layout.close();
                   layout.refresh();
                   event.preventDefault();
                   event.stopPropagation();
               }
           }
       } 
    }
    
    $(document).on("layout.decision","#html-design-editor", function(event,layoutObj){
        layout = layoutObj;
     });
    
    $(document).on("grouplayout.decision","#html-design-editor", function(event,layoutObj){
        layout = layoutObj;
     });
    
    $(document).on('deselect.all',"#html-design-editor",function(){
        layout = null;
    });
    
    $(window).on('keydown',_handlePresicisonMovement);
    
});