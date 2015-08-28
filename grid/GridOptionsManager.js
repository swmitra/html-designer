/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var RulerMenuTemplate = require("text!controlhtml/ruler-options-menu.html");
    var vGuide = '<div class="vGuide"></div>',
        hGuide = '<div class="hGuide"></div>';
    
    $('.hRule');
    $('.vRule');
                
    function _showContextMenu(){
        $("#designer-ruler-menu-cont")
        .addClass('open')
        .show();
    }
    
    function _hideContextMenu(){
        $("#designer-ruler-menu-cont")
        .removeClass('open')
        .hide();
    }
    
    function _hideGrid(element){
        $(".vGuide,.hGuide").hide();
        $(element).data('action','show-grid');
        $(element).html("Show Guides");
    }
    
    function _clearGrid(){
        $(".vGuide,.hGuide").remove();
    }
    
    function _showGrid(element){
        $(".vGuide,.hGuide").show();
        $(element).data('action','hide-grid');
        $(element).html("Hide Guides");
    }
    
    function _lockGrid(element){
        $(".vGuide,.hGuide").css('pointer-events','none');
        $(element).data('action','unlock-grid');
        $(element).html("Unlock Guides");
    }
    
    function _unlockGrid(element){
        $(".vGuide,.hGuide").css('pointer-events','all');
        $(element).data('action','lock-grid');
        $(element).html("Lock Guides");
    }
    
    $(document).on("dblclick",".vGuide,.hGuide", function(event){
        $(this).remove();
    });
    
    $(document).on("contextmenu",".corner", function(event){
        if($(".corner").find("#designer-ruler-menu-cont").length === 0){
            $(".corner").append(RulerMenuTemplate);
        }
        _showContextMenu();
    });
    
    $('html').click(function() {
        _hideContextMenu();
    });
    
    $(document).on("click",".hRule", function(event){
        var $vGuide = $(vGuide)
            .offset( {top:0,left:event.offsetX - 24})
            .appendTo($(".guidePlane"));
        
        $vGuide.draggable({axis:"x"});
    });
    
    $(document).on("click",".vRule", function(event){
        var $hGuide = $(hGuide)
            .offset( {top:event.offsetY - 24,left:0})
            .appendTo($(".guidePlane"));
        
        $hGuide.draggable({axis:"y"});
    });
    
    $(document).on("click","#designer-ruler-context-menu li a",function(event){
        var action = $(this).data('action');
        switch(action){
            case 'show-grid': _showGrid(this);break;
            case 'hide-grid': _hideGrid(this);break;
            case 'lock-grid': _lockGrid(this);break;
            case 'unlock-grid': _unlockGrid(this);break;
            case 'clear-grid': _clearGrid();break;
            default: $("#designer-ruler-context-menu").trigger(action,[this]);break;
        }
        _hideContextMenu();
        event.preventDefault();
        event.stopPropagation();
    });   
});