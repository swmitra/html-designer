/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var AppInit       = brackets.getModule("utils/AppInit");
    var currentLayout = null;
    
    $(document).on("click","#layout-toolbox-anchor",function(event){
        $("#layout-editor").show();
        event.preventDefault();
        event.stopPropagation();
    });
    
    $(document).on("click","#layout-editor-close",function(event){
        $("#layout-editor").hide();
        event.preventDefault();
        event.stopPropagation();
    });
    
    $(document).on("change","#layout-position-select",function(event){
        if(currentLayout){
            currentLayout.changeLayout('position',$("#layout-position-select").val(),true);
        }
    });
    
    $(document).on("change","#layout-display-select",function(event){
        if(currentLayout){
            currentLayout.changeLayout('display',$("#layout-display-select").val(),true);
        }
    });
    
    $(document).on("change","#layout-boxsize-select",function(event){
        if(currentLayout){
            currentLayout.changeLayout('box-sizing',$("#layout-boxsize-select").val(),true);
        }
    });
    
    function _showAnchor(decision){   
        if(decision.positioned){
            $("#top-left-anchor").css('border-color','lightgrey transparent transparent');
            $("#top-right-anchor").css('border-color','transparent lightgrey transparent transparent');
            $("#bottom-left-anchor").css('border-color','transparent transparent transparent lightgrey');
            $("#bottom-right-anchor").css('border-color','transparent transparent lightgrey');
            
            if(decision.yAxisAlignment === 'top'){
                if(decision.xAxisAlignment === 'left'){
                    $("#top-left-anchor").css('border-color','#288edf transparent transparent');  
                } else {
                    $("#top-right-anchor").css('border-color','transparent #288edf transparent transparent'); 
                }
            } else {
                if(decision.xAxisAlignment === 'left'){
                    $("#bottom-left-anchor").css('border-color','transparent transparent transparent #288edf');  
                } else {
                    $("#bottom-right-anchor").css('border-color','transparent transparent #288edf'); 
                }
            }
            $(".anchorControl").data('disabled',false);
        } else {
            $("#top-left-anchor").css('border-color','gray transparent transparent');
            $("#top-right-anchor").css('border-color','transparent gray transparent transparent');
            $("#bottom-left-anchor").css('border-color','transparent transparent transparent gray');
            $("#bottom-right-anchor").css('border-color','transparent transparent gray');
            
            $(".anchorControl").data('disabled',true);
        }
    }
    
    function _showStaticPositionControl(decision){
       if(decision.positioned){
            $(".staticPositionControl").removeClass('selectedStaticPositionControl');
            $(".staticPositionControl").addClass('disabledStaticPositionControl');
            $(".staticPositionControl").data('disabled',true);
        } else {
            $(".staticPositionControl").removeClass('disabledStaticPositionControl');
            $(".staticPositionControl").data('disabled',false);
            $(".staticPositionControl").removeClass('selectedStaticPositionControl');
            var float = $(decision.boxModel.targetElement).css('float');
            var clear = $(decision.boxModel.targetElement).css('clear');
            
            switch(float){
                case 'left': $("#set-float-left").addClass('selectedStaticPositionControl');break;
                case 'right': $("#set-float-right").addClass('selectedStaticPositionControl');break;
                default: $("#set-float-none").addClass('selectedStaticPositionControl');
            }
            
            switch(clear){
                case 'left': $("#set-clear-left").addClass('selectedStaticPositionControl');break;
                case 'right': $("#set-clear-right").addClass('selectedStaticPositionControl');break;
                case 'both': $("#set-clear-both").addClass('selectedStaticPositionControl');break;
                case 'none': $("#set-clear-none").addClass('selectedStaticPositionControl');break;
            }
        } 
    }
         
    
    $(document).on("layout.decision","#html-design-editor", function(event,layoutObj){
        currentLayout = layoutObj;
        $("#layout-layer").html(currentLayout.positioned ? 'Position' : 'Margin');
        $("#layout-position-select").val(currentLayout.layout);
        $("#layout-display-select").val($(layoutObj.boxModel.targetElement).css('display'));
        $("#layout-boxsize-select").val($(layoutObj.boxModel.targetElement).css('box-sizing'));
        
        
        $("#layout-h-modifier-value").val(parseInt(currentLayout.getXAxisModifierValue()));
        if(currentLayout.xAxisAlignment === 'left'){
            $("#layout-h-modifier-value").css('border-width','1px 1px 1px 2px');
            $("#layout-h-modifier-value").css('border-color','gray gray gray #288edf');
        } else {
            $("#layout-h-modifier-value").css('border-width','1px 2px 1px 1px');
            $("#layout-h-modifier-value").css('border-color','gray #288edf gray gray');
        }
        
        $("#layout-v-modifier-value").val(parseInt(currentLayout.getYAxisModifierValue()));
        if(currentLayout.yAxisAlignment === 'top'){
            $("#layout-v-modifier-value").css('border-width','2px 1px 1px 1px');
            $("#layout-v-modifier-value").css('border-color','#288edf gray gray gray');
        } else {
            $("#layout-v-modifier-value").css('border-width','1px 1px 2px 1px'); 
            $("#layout-v-modifier-value").css('border-color','gray gray #288edf gray');
        }
        
        _showAnchor(currentLayout);
        _showStaticPositionControl(currentLayout);
     });
    
    $(document).on("input","#layout-h-modifier-value", function(event){
        currentLayout.setX($("#layout-h-modifier-value").val());
        currentLayout.refresh();
     });
    
    $(document).on("input","#layout-v-modifier-value", function(event){
        currentLayout.setY($("#layout-v-modifier-value").val());
        currentLayout.refresh();
     });
    
    $(document).on("input",".box-model-input", function(event){
        currentLayout.boxModel.cssRuleSet.css($(this).data('css-key'),$(this).val()+"px");
        currentLayout.boxModel.cssRuleSet.persist();
        currentLayout.refresh();
     });
    
    $(document).on("click",".floatControl", function(event){
        if(!$(this).data('disabled')){
            if($(this).data('css-value')!=='none'){
                if(currentLayout){
                    currentLayout.changeLayout($(this).data('css-key'),$(this).data('css-value'),true);
                }
            }else{
                if(currentLayout){
                    currentLayout.changeLayout($(this).data('css-key'),'',true);
                }
            }
            $(".floatControl").removeClass('selectedStaticPositionControl');
            $(this).addClass('selectedStaticPositionControl');
        }
     });
    
    $(document).on("click",".clearControl", function(event){
        if(!$(this).data('disabled')){
            if($(this).data('css-value')!=='none'){
                if(currentLayout){
                    currentLayout.changeLayout($(this).data('css-key'),$(this).data('css-value'),true);
                }
            }else{
                if(currentLayout){
                    currentLayout.changeLayout($(this).data('css-key'),'',true);
                }
            }
            $(".clearControl").removeClass('selectedStaticPositionControl');
            $(this).addClass('selectedStaticPositionControl');
        }
     });
    
    $(document).on("click",".anchorControl", function(event){
        if(!$(this).data('disabled')){
            if($(this).data('anchor')){
                if(currentLayout){
                    var anchors = $(this).data('anchor').split('-');
                    currentLayout.changeAnchor(anchors[0],anchors[1],true);
                }
            }
        }
     });
    
    $(document).on("click",".box-model-input", function(event){
        event.preventDefault();
        event.stopPropagation();
     });
        
    $(document).on("boxmodel.created boxmodel.refreshed","#html-design-editor", function(event,model){
        var asynchPromise = new $.Deferred();
        
        $("#pad-left").val(model.padding.left);
        $("#pad-right").val(model.padding.right);
        $("#pad-top").val(model.padding.top);
        $("#pad-bottom").val(model.padding.bottom);
        
        $("#mar-left").val(model.margin.left);
        $("#mar-right").val(model.margin.right);
        $("#mar-top").val(model.margin.top);
        $("#mar-bottom").val(model.margin.bottom);
        
        $("#pos-left").val(parseInt(model.position.left));
        $("#pos-right").val(parseInt(model.position.right));
        $("#pos-top").val(parseInt(model.position.top));
        $("#pos-bottom").val(parseInt(model.position.bottom));
        
        $("#element-width-input").val(parseInt(model.size.width));
        $("#element-height-input").val(parseInt(model.size.height));
        
        if(currentLayout){
            $("#layout-h-modifier-value").val(parseInt(currentLayout.getXAxisModifierValue()));
            $("#layout-v-modifier-value").val(parseInt(currentLayout.getYAxisModifierValue())); 
        }
        return asynchPromise.promise();
    });
    
    AppInit.appReady(function () {
        //$("#layout-editor").draggable();
    });
        
});