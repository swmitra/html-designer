/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var AppInit       = brackets.getModule("utils/AppInit");
    
    var lastSelectedElement = null;
    var $hLayer1,
        $hLayer2,
        $vLayer1,
        $vLayer2,
        $xOffsetAxisGrid,
        $yOffsetAxisGrid;
        
    
    function _resetAllPositions(element){
        if(!element || element !== lastSelectedElement){
            $(".offsetIndicator").hide();
            $xOffsetAxisGrid.hide();
            $yOffsetAxisGrid.hide();
            $hLayer1.hide();
            $vLayer1.hide();
        }
    }
    
    function _showYOffsetWithPosition(decision){
       var layer1,layer2,absL1,absL2;
       if(decision.yAxisAlignment === 'top'){
            layer1 = (parseInt(decision.boxModel.position['top']) || 0);
            layer2 = (parseInt(decision.boxModel.margin['top']) || 0);
        } else {
            layer1 = (parseInt(decision.boxModel.position['bottom']) || 0);
            layer2 = decision.layout === 'relative' ? (parseInt(decision.boxModel.margin['top']) || 0) :(parseInt(decision.boxModel.margin['bottom']) || 0);
        }
        absL1 = Math.abs(layer1);
        absL2 = Math.abs(layer2);
        $vLayer1.height(absL1);
        $vLayer2.height(absL2);
        $vLayer1.html(layer1);
        $vLayer2.html(layer2);
        $vLayer1.css('left',parseInt($("#selection-outline").css('left'))+1).show();
        $vLayer1.css('width',parseInt($("#selection-outline").css('width')));
        
        if(layer1<0){
            if(decision.yAxisAlignment === 'top'){
                $vLayer1.addClass('negativeL1Offset');
                $vLayer1.css('top',decision.positionReference.y+23-absL1+1);
            } else {
                $vLayer1.addClass('negativeL1Offset');
                $vLayer1.css('top',decision.positionReference.y+23 - 1);
            }
        }else{
            if(decision.yAxisAlignment === 'top'){
                $vLayer1.removeClass('negativeL1Offset');
                $vLayer1.css('top',decision.positionReference.y+23+1);
            } else {
                $vLayer1.removeClass('negativeL1Offset');
                $vLayer1.css('top',decision.positionReference.y+23-absL1 - 1);
            }
        }
        
        if(layer2<0){
            if(decision.layout === 'relative'){
                if(decision.yAxisAlignment === 'top'){
                    $vLayer2.addClass('negativeL2Offset');
                    $vLayer2.css('top',0);
                } else {
                    $vLayer2.addClass('negativeL2Offset');
                    $vLayer2.css('top','');
                    $vLayer2.css('bottom',layer2);
                }
            } else {
                if(decision.yAxisAlignment === 'top'){
                    $vLayer2.addClass('negativeL2Offset');
                    $vLayer2.css('top',0);
                } else {
                    $vLayer2.addClass('negativeL2Offset');
                    $vLayer2.css('top','100%');
                }
            }
        }else{
            if(decision.layout === 'relative'){
                if(decision.yAxisAlignment === 'top'){
                    $vLayer2.removeClass('negativeL2Offset');
                    $vLayer2.css('top',0-absL2-1);
                } else {
                    $vLayer2.removeClass('negativeL2Offset');
                    $vLayer2.css('top','');
                    $vLayer2.css('bottom',0);
                }
            } else {
                if(decision.yAxisAlignment === 'top'){
                    $vLayer2.removeClass('negativeL2Offset');
                    $vLayer2.css('top',0-absL2-1);
                } else {
                    $vLayer2.removeClass('negativeL2Offset');
                    $vLayer2.css('top','calc(100% + 1px)');
                }
            }
        }
    }
    
    function _showYOffsetWithPadding(decision){
       var layer1,layer2,absL1,absL2;
        if(decision.yAxisAlignment === 'top'){
            layer1 = parseInt($(decision.boxModel.targetElement).parent().css('padding-top') || 0);
            layer2 = (parseInt(decision.boxModel.margin['top']) || 0);
        } else {
            layer1 = parseInt($(decision.boxModel.targetElement).parent().css('padding-bottom') || 0);
            layer2 = (parseInt(decision.boxModel.margin['bottom']) || 0);
        }
        
        absL1 = Math.abs(layer1);
        absL2 = Math.abs(layer2);
        $vLayer1.height(absL1);
        $vLayer2.height(absL2);
        $vLayer1.html(layer1);
        $vLayer2.html(layer2);
        $vLayer1.css('left',parseInt($("#selection-outline").css('left'))+1).show();
        $vLayer1.css('width',parseInt($("#selection-outline").css('width')));
        
        if(layer1<0){
            if(decision.yAxisAlignment === 'top'){
                $vLayer1.addClass('negativeL1Offset');
                $vLayer1.css('top',decision.positionReference.y+23-absL1+1);
            } else {
                $vLayer1.addClass('negativeL1Offset');
                $vLayer1.css('top',decision.positionReference.y+23 - 1);
            }
        }else{
            if(decision.yAxisAlignment === 'top'){
                $vLayer1.removeClass('negativeL1Offset');
                $vLayer1.css('top',decision.positionReference.y+23+1);
            } else {
                $vLayer1.removeClass('negativeL1Offset');
                $vLayer1.css('top',decision.positionReference.y+23-absL1 - 1);
            }
        }
        
        if(layer2<0){
            if(decision.yAxisAlignment === 'top'){
                $vLayer2.addClass('negativeL2Offset');
                $vLayer2.css('top',0);
            } else {
                $vLayer2.addClass('negativeL2Offset');
                $vLayer2.css('top','calc(100% - '+absL2+'px)');
            }
        }else{
            if(decision.yAxisAlignment === 'top'){
                $vLayer2.removeClass('negativeL2Offset');
                $vLayer2.css('top',0-absL2-1);
            } else {
                $vLayer2.removeClass('negativeL2Offset');
                $vLayer2.css('top','calc(100% + 1px)');
            }
        }
        
    }
    
    function _highlightYOffset(decision){
        if(decision.positioned){
            _showYOffsetWithPosition(decision);
        } else {
            _showYOffsetWithPadding(decision);
        } 
    }
    
    function _showXOffsetWithPosition(decision){
       var layer1,layer2,absL1,absL2;
       if(decision.xAxisAlignment === 'left'){
            layer1 = (parseInt(decision.boxModel.position['left']) || 0);
            layer2 = (parseInt(decision.boxModel.margin['left']) || 0);
        } else {
            layer1 = (parseInt(decision.boxModel.position['right']) || 0);
            layer2 = decision.layout === 'relative' ? (parseInt(decision.boxModel.margin['left']) || 0) :(parseInt(decision.boxModel.margin['right']) || 0);
        }
        
        absL1 = Math.abs(layer1);
        absL2 = Math.abs(layer2);
        $hLayer1.width(absL1);
        $hLayer2.width(absL2);
        $hLayer1.html(layer1);
        $hLayer2.html(layer2);
        $hLayer1.css('top',parseInt($("#selection-outline").css('top'))+1).show();
        $hLayer1.css('height',parseInt($("#selection-outline").css('height')));
        
        if(layer1<0){
            if(decision.xAxisAlignment === 'left'){
                $hLayer1.addClass('negativeL1Offset');
                $hLayer1.css('left',decision.positionReference.x+23-absL1+1);
            } else {
                $hLayer1.addClass('negativeL1Offset');
                $hLayer1.css('left',decision.positionReference.x+23 - 1);
            }
        }else{
            if(decision.xAxisAlignment === 'left'){
                $hLayer1.removeClass('negativeL1Offset');
                $hLayer1.css('left',decision.positionReference.x+23+1);
            } else {
                $hLayer1.removeClass('negativeL1Offset');
                $hLayer1.css('left',decision.positionReference.x+23-absL1 -1);
            }
        }
        
        if(layer2<0){
            if(decision.layout === 'relative'){
                if(decision.xAxisAlignment === 'left'){
                    $hLayer2.addClass('negativeL2Offset');
                    $hLayer2.css('left',0);
                } else {
                    $hLayer2.addClass('negativeL2Offset');
                    $hLayer2.css('left','');
                    $hLayer2.css('right',layer2);
                }
            } else {
                if(decision.xAxisAlignment === 'left'){
                    $hLayer2.addClass('negativeL2Offset');
                    $hLayer2.css('left',0);
                } else {
                    $hLayer2.addClass('negativeL2Offset');
                    $hLayer2.css('left','calc(100% - '+absL2+'px)');
                }
            }
        }else{
            if(decision.layout === 'relative'){
                if(decision.xAxisAlignment === 'left'){
                    $hLayer2.removeClass('negativeL2Offset');
                    $hLayer2.css('left',0-absL2-1);
                } else {
                    $hLayer2.removeClass('negativeL2Offset');
                    $hLayer2.css('left','');
                    $hLayer2.css('right',0);
                }
            } else {
                if(decision.xAxisAlignment === 'left'){
                    $hLayer2.removeClass('negativeL2Offset');
                    $hLayer2.css('left',0-absL2-1);
                } else {
                    $hLayer2.removeClass('negativeL2Offset');
                    $hLayer2.css('left','calc(100% + 1px)');
                }
            }
        }
    }
    
    function _showXOffsetWithPadding(decision){
        var layer1,layer2,absL1,absL2;
        if(decision.xAxisAlignment === 'left'){
            layer1 = parseInt($(decision.boxModel.targetElement).parent().css('padding-left') || 0);
            layer2 = (parseInt(decision.boxModel.margin['left']) || 0);
        } else {
            layer1 = parseInt($(decision.boxModel.targetElement).parent().css('padding-right') || 0);
            layer2 = (parseInt(decision.boxModel.margin['right']) || 0);
        }
        
        absL1 = Math.abs(layer1);
        absL2 = Math.abs(layer2);
        $hLayer1.width(absL1);
        $hLayer2.width(absL2);
        $hLayer1.html(layer1);
        $hLayer2.html(layer2);
        $hLayer1.css('top',parseInt($("#selection-outline").css('top'))+1).show();
        $hLayer1.css('height',parseInt($("#selection-outline").css('height')));
        
        if(layer1<0){
            if(decision.xAxisAlignment === 'left'){
                $hLayer1.addClass('negativeL1Offset');
                $hLayer1.css('left',decision.positionReference.x+23-absL1+1);
            } else {
                $hLayer1.addClass('negativeL1Offset');
                $hLayer1.css('left',decision.positionReference.x+23-1);
            }
        }else{
            if(decision.xAxisAlignment === 'left'){
                $hLayer1.removeClass('negativeL1Offset');
                $hLayer1.css('left',decision.positionReference.x+23+1);
            } else {
                $hLayer1.removeClass('negativeL1Offset');
                $hLayer1.css('left',decision.positionReference.x+23-absL1 - 1);
            }
        }
        
        if(layer2<0){
            if(decision.xAxisAlignment === 'left'){
                $hLayer2.addClass('negativeL2Offset');
                $hLayer2.css('left',0);
            } else {
                $hLayer2.addClass('negativeL2Offset');
                $hLayer2.css('left','calc(100% - '+absL2+'px)');
            }
        }else{
            if(decision.xAxisAlignment === 'left'){
                $hLayer2.removeClass('negativeL2Offset');
                $hLayer2.css('left',0-absL2-1);
            } else {
                $hLayer2.removeClass('negativeL2Offset');
                $hLayer2.css('left','calc(100% + 1px)');
            }
        }
    }
    
    function _highlightXOffset(decision){
        if(decision.positioned){
            _showXOffsetWithPosition(decision);
        } else {
            _showXOffsetWithPadding(decision);
        } 
    }
    
    function _showOffset(decision){
        _resetAllPositions(decision.boxModel.targetElement);
        _highlightXOffset(decision);
        _highlightYOffset(decision);
        $xOffsetAxisGrid.css('left',decision.positionReference.x+23).show();
        $yOffsetAxisGrid.css('top',decision.positionReference.y+23).show();
        lastSelectedElement = decision.boxModel.targetElement;
    }  
    
     $(document).on("layout.decision","#html-design-editor", function(event,descion){
         var asynchPromise = new $.Deferred();
         _showOffset(descion);
         asynchPromise.resolve();
         return asynchPromise.promise();
     });
    
    $(document).on('deselect.all',"#html-design-editor",_resetAllPositions);
    
    AppInit.appReady(function () {
        $hLayer1 = $("#h-layer1");
        $hLayer2 = $("#h-layer2");
        $vLayer1 = $("#v-layer1");
        $vLayer2 = $("#v-layer2");
        $xOffsetAxisGrid = $(".offsetHAxis");
        $yOffsetAxisGrid = $(".offsetVAxis");
    });
});