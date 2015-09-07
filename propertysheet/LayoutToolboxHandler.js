/**
 * @author Swagatam Mitra
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var AppInit       = brackets.getModule("utils/AppInit");
    var ConversionUtils = require("propertysheet/UnitConversionUtils");
    var currentLayout = null;
    
    $(document).on("click","#layout-editor-close",function(event){
        $("#advanced-layout-editor").toggleClass("toolboxCollapsed");
        $(this).toggleClass("collapsed");
        event.preventDefault();
        event.stopPropagation();
    });
    
    $(document).on("click","#reveal-advanced-layout-editor",function(event){
        $("#advanced-layout-editor").toggleClass("advancedMode");
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
        $("#layout-display-select").val(currentLayout.getLayoutParamValueFor('display'));
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
        _synchPropsInCurrentRuleSet();
     });
    
    function _synchPropsInCurrentRuleSet(){
        var asynchPromise = new $.Deferred();
        _synchOffsetWithBaseAndComp();
        
        _synchPropertyWithBaseAndComp('width');
        _synchPropertyWithBaseAndComp('height');
        _synchRangeProperty('width');
        _synchRangeProperty('height');
        
        
        _synchPropertyAsText('margin');
        _synchPropertyWithBaseAndComp('margin-left');
        _synchPropertyWithBaseAndComp('margin-top');
        _synchPropertyWithBaseAndComp('margin-bottom');
        _synchPropertyWithBaseAndComp('margin-right');
        
        _synchPropertyAsText('padding');
        _synchPropertyWithBaseAndComp('padding-left');
        _synchPropertyWithBaseAndComp('padding-top');
        _synchPropertyWithBaseAndComp('padding-bottom');
        _synchPropertyWithBaseAndComp('padding-right');
        
        asynchPromise.resolve();
        return asynchPromise.promise();
    }
    
    
    $(document).on("click",".layout-entry .close", function(event){
        $("#advanced-layout-editor .layout-entry[name="+$(this).data('name')+"]").toggle();
        $(this).toggleClass("collapsed");
     });
    
    $(document).on("target-selector-changed","#html-design-editor", function(event,rulesetref){
        _synchPropsInCurrentRuleSet();
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
    
    function _parsePropVal(value){
    
        function _parse(prop){
            var p = parseFloat(prop), q = prop.replace(/^[\-\d\.]+/,'');
            return isNaN(p) ? { value: q, unit: ''} : { value: p, unit: q };
        }
        
        var parsedExpr;
        var base,operator,comp;

        if(value && ConversionUtils.hasCalc(value)){
            parsedExpr = ConversionUtils.parseCalcExpression(value);
            if(parsedExpr.length === 3){
              base = parsedExpr[0];
              operator = parsedExpr[1];
              comp = parsedExpr[2];
              if(operator === '-'){
                    comp.value = 0 - comp.value;
              }
            } 
        } else {
            base = _parse(value+'');
        }
        
        return [base,comp];
    }
    
    function isRelativeUnit(unit){
        switch(unit){
            case '%':
            case 'em':
            case 'ex':
            case 'rem': return true;
            default: return false;
        }
    }
    
    function _synchPropertyWithBaseAndComp(prop){
        var value;
        if(currentLayout){
            value = currentLayout.getLayoutParamValueFor(prop);
            value = _parsePropVal(value);
            _showInputUI(prop,value);
        }
    }
    
    function _synchRangeProperty(prop){
        var minValue,maxValue;
        if(currentLayout){
            minValue = currentLayout.getLayoutParamValueFor('min-'+prop);
            minValue = _parsePropVal(minValue);
            $(".layout-entry .layout-box-item[name="+prop+"]").find(".layout-number-input.min").val(minValue[0].value);
            $(".layout-entry .layout-box-item[name="+prop+"]").find(".layout-select-input.min").val(minValue[0].unit || 'px');
            $(".layout-entry .layout-box-item[name="+prop+"]").find(".layout-select-input.min").data('currentval',minValue[0].unit || 'px');
            maxValue = currentLayout.getLayoutParamValueFor('max-'+prop);
            maxValue = _parsePropVal(maxValue);
            $(".layout-entry .layout-box-item[name="+prop+"]").find(".layout-number-input.max").val(maxValue[0].value);
            $(".layout-entry .layout-box-item[name="+prop+"]").find(".layout-select-input.max").val(maxValue[0].unit || 'px');
            $(".layout-entry .layout-box-item[name="+prop+"]").find(".layout-select-input.max").data('currentval',maxValue[0].unit || 'px');
        }
    }
    
    function _showInputUI(prop,value){
        $("#advanced-layout-editor .layout-entry .layout-box-item[name="+prop+"]").find(".layout-number-input.base").val(value[0].value);
        $("#advanced-layout-editor .layout-entry .layout-box-item[name="+prop+"]").find(".layout-select-input.base").val(value[0].unit || 'px');
        $("#advanced-layout-editor .layout-entry .layout-box-item[name="+prop+"]").find(".layout-select-input.base").data('currentval',value[0].unit || 'px');
        if(value[1]){
            $("#advanced-layout-editor .layout-entry .layout-box-item[name="+prop+"]").find(".layout-number-input.comp").val(value[1].value);
            $("#advanced-layout-editor .layout-entry .layout-box-item[name="+prop+"]").find(".layout-number-input.comp").removeClass("possitive");
            $("#advanced-layout-editor .layout-entry .layout-box-item[name="+prop+"]").find(".layout-number-input.comp").removeClass("negative");
            if(value[1].value > 0){
                $("#advanced-layout-editor .layout-entry .layout-box-item[name="+prop+"]").find(".layout-number-input.comp").addClass("possitive");
            } else if(value[1].value < 0){
                $("#advanced-layout-editor .layout-entry .layout-box-item[name="+prop+"]").find(".layout-number-input.comp").addClass("negative");
            }
            $("#advanced-layout-editor .layout-entry .layout-box-item[name="+prop+"]").find(".layout-select-input.comp").val(value[1].unit);
            $("#advanced-layout-editor .layout-entry .layout-box-item[name="+prop+"]").find(".layout-select-input.comp").data('currentval',value[1].unit);
        } else {
            $("#advanced-layout-editor .layout-entry .layout-box-item[name="+prop+"]").find(".layout-number-input.comp").val(0);
            $("#advanced-layout-editor .layout-entry .layout-box-item[name="+prop+"]").find(".layout-number-input.comp").removeClass("possitive");
            $("#advanced-layout-editor .layout-entry .layout-box-item[name="+prop+"]").find(".layout-number-input.comp").removeClass("negative");
            $("#advanced-layout-editor .layout-entry .layout-box-item[name="+prop+"]").find(".layout-select-input.comp").val('px');
            $("#advanced-layout-editor .layout-entry .layout-box-item[name="+prop+"]").find(".layout-select-input.comp").data('currentval','px');
        }

        if(isRelativeUnit(value[0].unit)){
            $("#advanced-layout-editor .layout-entry .layout-box-item[name="+prop+"]").addClass("comp-mode");
        } else {
            $("#advanced-layout-editor .layout-entry .layout-box-item[name="+prop+"]").removeClass("comp-mode");
        }
    }
    
    $(document).on('change',".layout-box-item .layout-select-input.base",function(event){
        var currentVal,currentUnit,convertedVal,addtnlComp = 0;
        var $context = $(this).parent();
        if(isRelativeUnit($(this).val())){
            if(!$context.hasClass('comp-mode')){
                $context.addClass('comp-mode');
            }
        } else {
            $context.removeClass('comp-mode');
            addtnlComp = ConversionUtils
                            .getUnits(currentLayout.boxModel.targetElement
                                    ,$context.find(".layout-number-input.comp").val()
                                    ,$context.find(".layout-select-input.comp").data("currentval")
                                    ,$context.find(".layout-select-input.base").val()
                                    ,$context.data('type')
                                );
        
        }
        
        convertedVal = ConversionUtils
                            .getUnits(currentLayout.boxModel.targetElement
                                    ,$context.find(".layout-number-input.base").val()
                                    ,$context.find(".layout-select-input.base").data("currentval")
                                    ,$context.find(".layout-select-input.base").val()
                                    ,$context.data('type')
                                );
        
        $context.find(".layout-number-input.base").val(parseFloat(convertedVal)+parseFloat(addtnlComp));
        _changeLayoutValue($context);
    });
        
    $(document).on('change',".layout-box-item .layout-select-input.comp",function(event){
        var currentVal,currentUnit,convertedVal;
        var $context = $(this).parent();
        
        convertedVal = ConversionUtils
                            .getUnits(currentLayout.boxModel.targetElement
                                    ,$context.find(".layout-number-input.comp").val()
                                    ,$context.find(".layout-select-input.comp").data("currentval")
                                    ,$context.find(".layout-select-input.comp").val()
                                    ,$context.data('type')
                                );
        
        $context.find(".layout-number-input.comp").val(parseFloat(convertedVal));
        _changeLayoutValue($context);
    });
    
    $(document).on('change',".layout-box-item .layout-select-input.min,.layout-box-item .layout-select-input.max",function(event){
        var currentVal,currentUnit,convertedVal;
        var $context = $(this).parent();
        var range = $(this).data('range');
        convertedVal = ConversionUtils
                            .getUnits(currentLayout.boxModel.targetElement
                                    ,$context.find(".layout-number-input."+range).val()
                                    ,$context.find(".layout-select-input."+range).data("currentval")
                                    ,$context.find(".layout-select-input."+range).val()
                                    ,$context.data('type')
                                );
        
        $context.find(".layout-number-input."+range).val(parseFloat(convertedVal));
        var cssProp = range+'-'+$context.attr('name');
        var computedValue = $context.find(".layout-number-input."+range).val() + $context.find(".layout-select-input."+range).val();
        if(currentLayout){
            currentLayout.changeLayout(cssProp,computedValue,false);
        }
    });
    
    $(document).on('change',".layout-box-item .layout-number-input.min,.layout-box-item .layout-number-input.max",function(event){
        var $context = $(this).parent();
        var range = $(this).data('range');
        var cssProp = range+'-'+$context.attr('name');
        var computedValue = $context.find(".layout-number-input."+range).val() + $context.find(".layout-select-input."+range).val();
        if(currentLayout){
            currentLayout.changeLayout(cssProp,computedValue,false);
        }
    });
    
    function _changeLayoutValue(context){
        var cssProp = context.attr('name');
        var computedValue = context.find(".layout-number-input.base").val() + context.find(".layout-select-input.base").val();
        var compensation = parseFloat(context.find(".layout-number-input.comp").val()).toFixed(2);
        var operator = compensation < 0 ?'-' : '+';
        if(operator === '-'){
            compensation = 0 - compensation;
        }
        if(context.hasClass('comp-mode') && (compensation <0 || compensation>0)){
            computedValue = 'calc('+computedValue+' '+operator+' '+compensation+context.find(".layout-select-input.comp").val()+')';
        }
        if(currentLayout){
            currentLayout.changeLayout(cssProp,computedValue,false);
        }
    }
    
    $(document).on('change',".layout-box-item .layout-number-input.base,.layout-box-item .layout-number-input.comp",function(event){
        _changeLayoutValue($(this).parent());
    });
    
    $(document).on('change',".layout-box-item .layout-text-input",function(event){
        var prop = $(this).parent().attr('name');
        if(currentLayout){
            currentLayout.changeLayout(prop,$(this).val(),false);
        }
    });
    
    function _synchPropertyAsText(prop){
        var value;
        if(currentLayout){
            value = currentLayout.getLayoutParamValueFor(prop);
            $(".layout-entry .layout-box-item[name="+prop+"]").find("input").val(value);
        }
    }
        
    function _synchOffsetWithBaseAndComp(){
        if(currentLayout){
            if(currentLayout.positioned){
                $('#advanced-layout-editor .layout-entry[name=Offset]').show();
                $('#advanced-layout-editor .layout-entry[name=Offset] #H-Offset').attr('name',currentLayout.xAxisModifier);
                $('#advanced-layout-editor .layout-entry[name=Offset] #V-Offset').attr('name',currentLayout.yAxisModifier);
                _synchPropertyWithBaseAndComp(currentLayout.xAxisModifier);
                _synchPropertyWithBaseAndComp(currentLayout.yAxisModifier);
            } else {
                $('#advanced-layout-editor .layout-entry[name=Offset]').hide();
            }
        }
    }
        
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
        asynchPromise.resolve();
        return asynchPromise.promise();
    });
    
    AppInit.appReady(function () {
        //$("#layout-editor").draggable();
    });
        
});