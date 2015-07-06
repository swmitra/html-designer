/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var layout = null;
    
    //handle precision resize by 1px increments
    function _increaseWidth(){
        layout.changeWidth(1);
    }
    
    function _decreaseWidth(){
        layout.changeWidth(-1);
    }
    
    function _increaseHeight(){
        layout.changeHeight(1);
    }
    
    function _decreaseHeight(){
        layout.changeHeight(-1);
    }
    
    function _handlePresicisonResize(event){
        var LEFT = 37,
            UP = 38,
            RIGHT = 39,
            DOWN = 40;
        
       if(layout && $("#html-design-template").is(':visible')){
           if(event.altKey === true
             && (event.which === LEFT || event.which === RIGHT || event.which === UP || event.which === DOWN)){
               if($("input:focus").length === 0){
                   layout.open();
                   switch(event.which){
                       case LEFT: _decreaseWidth();break;
                       case RIGHT: _increaseWidth();break;
                       case UP: _decreaseHeight();break;
                       case DOWN: _increaseHeight();break;
                   }
                   layout.close();
                   layout.refresh();
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
    
    $(window).on('keydown',_handlePresicisonResize);
    
});