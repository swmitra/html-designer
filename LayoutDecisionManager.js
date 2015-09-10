/**
 * @author Swagatam Mitra
  
 */

/*
    decision input 
    
    position : absolute | fixed | relative | static
    display: block | inline-block
    float: left | right
    clear: left | right | both
*/
    /*Layout decision result 
    {
        xAxisModifier:'margin-left'||'margin-right'||'left'||'right',
        yAxisModifier:'margin-top'||'margin-bottom'||'top'||'bottom',
        xAxisAlignment:'left' || 'right',
        yAxisAlignment:'top' || 'bottom',
        positionReference : { x: numeric , y: numeric }
    }*/

    /*Box Model 
    {
        targetElement: <element>,
        position : { left: null, right: null, top: null, bottom: null },
        margin : { left: null, right: null, top: null, bottom: null },
        border : { left: null, right: null, top: null, bottom: null },
        padding : { left: null, right: null, top: null, bottom: null }
    }*/

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var lastConstructedDecision = null;
    
    function _isPositioned(element){
        var position = $(element).css('position');
        return (    position === 'absolute' 
                 || position === 'fixed'
                 || position === 'relative') 
                 ? [true,position]
                 : [false,'static'];
    }
    
    function _isValueSet(prop){
       return parseInt(prop) || parseInt(prop) === 0; 
    }
    
    function _getXAxisModifier(model,isElementPositioned){
        if(isElementPositioned){
            if(_isValueSet(model.position.left)){
                return 'left';
            } else if(_isValueSet(model.position.right)){
                return 'right';
            } else {
                return 'left';
            }
        } else {
            if($(model.targetElement).css('float') === 'right'){
                return 'margin-right';
            } else {
                return 'margin-left';
            }
        }
    }
    
    function _getYAxisModifier(model,isElementPositioned){
        if(isElementPositioned){
            if(_isValueSet(model.position.top)){
               return 'top';
            } else if(_isValueSet(model.position.bottom)){
                return 'bottom';
            } else {
               return 'top'; 
            }
        } else {
            return 'margin-top';
        }
    }
    
    function _getPositionReference(model,xMod,yMod,xAnch,yAnch){
        
        function _getRefrencePositionForRelativeElement(model,xMod,yMod,xAnch,yAnch){
            var xComp1 = parseInt(model.position[xMod]) || 0 ,
                xComp2 = parseInt(model.margin.left) || 0;
            
            var yComp1 = parseInt(model.position[yMod]) || 0,
                yComp2 = parseInt(model.margin.top) || 0;
            
            var currentPos = model.targetElement.getBoundingClientRect();
            var defaultXPos = (xAnch === 'right') ? currentPos.right + xComp1 - xComp2: currentPos.left - xComp1 - xComp2;
            var defaultYPos = (yAnch === 'bottom') ? currentPos.bottom + yComp1 - yComp2 : currentPos.top - yComp1 - yComp2;
            
            return {x:defaultXPos,y:defaultYPos};
        }
        
        function _getReferencePosition(model){
            var offsetParent = $(model.targetElement).offsetParent()[0].tagName === 'HTML' 
                                    ? document.getElementById('htmldesignerIframe').contentWindow.document.body.parentElement
                                    : $(model.targetElement).offsetParent()[0];
            var offsetParentPos = offsetParent.getBoundingClientRect();
            
            var offsetParentHBorderWidth = xAnch === 'right' ? parseInt($(offsetParent).css('border-right-width')) : parseInt($(offsetParent).css('border-left-width'));
            var offsetParentVBorderWidth = xAnch === 'bottom' ? parseInt($(offsetParent).css('border-bottom-width')) : parseInt($(offsetParent).css('border-top-width'));            
            var refXPos = (xAnch === 'right') ? offsetParentPos.right - offsetParentHBorderWidth : offsetParentPos.left + offsetParentHBorderWidth;
            var refYPos = (yAnch === 'bottom') ? offsetParentPos.bottom - offsetParentVBorderWidth : offsetParentPos.top + offsetParentVBorderWidth;
            return {x:refXPos,y:refYPos};
        }
        
        function _getReferencePositionForStaticElement(model){
            var offsetParent = $(model.targetElement).parent()[0];
            var offsetParentPos = offsetParent.getBoundingClientRect();
            var offsetParentHBorderWidth = xAnch === 'right' ? parseInt($(offsetParent).css('border-right-width')) : parseInt($(offsetParent).css('border-left-width'));
            var offsetParentVBorderWidth = xAnch === 'bottom' ? parseInt($(offsetParent).css('border-bottom-width')) : parseInt($(offsetParent).css('border-top-width'));
            var refXPos = (xAnch === 'right') ? offsetParentPos.right - offsetParentHBorderWidth : offsetParentPos.left + offsetParentHBorderWidth;
            var refYPos = (yAnch === 'bottom') ? offsetParentPos.bottom - offsetParentVBorderWidth : offsetParentPos.top + offsetParentVBorderWidth;
            return {x:refXPos,y:refYPos};
        }
        
        var position = $(model.targetElement).css('position');
        var ref;
        switch(position){
                case 'absolute':
                case 'fixed':ref = _getReferencePosition(model);break;
                case 'static':ref = _getReferencePositionForStaticElement(model);break;
                case 'relative':ref = _getRefrencePositionForRelativeElement(model,xMod,yMod,xAnch,yAnch);break;
                default : break;
        }
        return ref;
    }
    
    //layout prototype
    function Layout(layoutResult){
        this.layout = layoutResult.layout;
        this.positioned = layoutResult.positioned;
        this.xAxisModifier = layoutResult.xAxisModifier;
        this.yAxisModifier = layoutResult.yAxisModifier;
        this.xAxisAlignment = layoutResult.xAxisAlignment;
        this.yAxisAlignment = layoutResult.yAxisAlignment;
        this.boxModel = layoutResult.boxModel;
        this.positionReference = layoutResult.positionReference;
        this._isChanged = false;
        this._trackChange = false;
    }
    
    Layout.prototype.getLayoutParamValueFor = function(key){
        return this.boxModel.cssRuleSet.getDefinitePropertyValue(key);
    }
    
    Layout.prototype.changeAnchor = function(vAnchorInput, hAnchorInput,retainCurrentPos){
        var prevRect = this.boxModel.targetElement.getBoundingClientRect();
        
        if(vAnchorInput === 'bottom'){
            this.boxModel.cssRuleSet.css('top','');
            this.boxModel.cssRuleSet.css('bottom',0);
        } else {
            this.boxModel.cssRuleSet.css('bottom',''); 
            this.boxModel.cssRuleSet.css('top',0);
        }
        
        if(hAnchorInput === 'right'){
            this.boxModel.cssRuleSet.css('left','');
            this.boxModel.cssRuleSet.css('right',0);
        } else {
            this.boxModel.cssRuleSet.css('right','');
            this.boxModel.cssRuleSet.css('left',0);
        }
        
        var isElementPositioned = _isPositioned(this.boxModel.targetElement);

        this.layout = isElementPositioned[1];
        this.positioned = isElementPositioned[0];
        this.xAxisModifier = hAnchorInput;
        this.yAxisModifier = vAnchorInput;
        this.xAxisAlignment = hAnchorInput;
        this.yAxisAlignment = vAnchorInput;
        
        if(retainCurrentPos){
            var currentRect = this.boxModel.targetElement.getBoundingClientRect();
            
            var hComp = currentRect.left - prevRect.left;
            this.changeX(hComp);

            var vComp = currentRect.top - prevRect.top;
            this.changeY(vComp);
        }
        
        //$("#html-design-editor").trigger('html.element.updated');
        this.boxModel.cssRuleSet.persist();
        
        $("#html-design-editor").trigger("element.selected",[this.boxModel.targetElement]);
        
    };
    
    Layout.prototype.changeLayout = function(key, value,retainCurrentPos){
        var prevRect = this.boxModel.targetElement.getBoundingClientRect();
        this.boxModel.cssRuleSet.css(key,value);
        
        var isElementPositioned = _isPositioned(this.boxModel.targetElement);
        var xAxisMod = _getXAxisModifier(this.boxModel,isElementPositioned[0]),
            yAxisMod = _getYAxisModifier(this.boxModel,isElementPositioned[0]),
            xAnchor = xAxisMod.indexOf('left') >= 0 ? 'left' : 'right',
            yAnchor = yAxisMod.indexOf('top') >= 0 ? 'top' : 'bottom';

        this.layout = isElementPositioned[1];
        this.positioned = isElementPositioned[0];
        this.xAxisModifier = xAxisMod;
        this.yAxisModifier = yAxisMod;
        this.xAxisAlignment = xAnchor;
        this.yAxisAlignment = yAnchor;
        
        if(retainCurrentPos){
            var currentRect = this.boxModel.targetElement.getBoundingClientRect();
            
            var hComp = currentRect.left - prevRect.left;
            this.changeX(hComp);

            var vComp = currentRect.top - prevRect.top;
            this.changeY(vComp);
        }
        
        //$("#html-design-editor").trigger('html.element.updated');
        this.boxModel.cssRuleSet.persist();
        
        $("#html-design-editor").trigger("element.selected",[this.boxModel.targetElement]);
    };
        
    Layout.prototype.changeX = function(incr){
        if(this.xAxisAlignment === 'left'){
            this.boxModel.cssRuleSet.boxModelHCSS(this.xAxisModifier,((parseInt($(this.boxModel.targetElement).css(this.xAxisModifier) || 0) || 0) - incr)+"px");
        } else {
            this.boxModel.cssRuleSet.boxModelHCSS(this.xAxisModifier,((parseInt($(this.boxModel.targetElement).css(this.xAxisModifier) || 0) || 0) + incr)+"px");
        }
        this.markChanged();
    };
    
    Layout.prototype.setX = function(value,passThrough){
        //if(this.xAxisAlignment === 'left'){
            this.boxModel.cssRuleSet.boxModelHCSS(this.xAxisModifier,value,passThrough);
        //} else {
            //this.boxModel.cssRuleSet.boxModelHCSS(this.xAxisModifier,value,passThrough);
        //}
        this.markChanged();
    };
    
    Layout.prototype.getXAxisModifierValue = function(){
        //if(this.xAxisAlignment === 'left'){
            return $(this.boxModel.targetElement).css(this.xAxisModifier);
       // } else {
          //  return $(this.boxModel.targetElement).css(this.xAxisModifier);
        //}
    };
    
    Layout.prototype.changeLeftTo = function(xValue){
        var existingValue = this.boxModel.boundingRect.left;
        var toBeCompensated = existingValue - xValue;
        this.changeX(toBeCompensated);
    };
    
    Layout.prototype.changeRightTo = function(xValue){
        var existingValue = this.boxModel.boundingRect.right;
        var toBeCompensated = existingValue - xValue;
        this.changeX(toBeCompensated);
    };
    
    Layout.prototype.changeY = function(incr){
        if(this.yAxisAlignment === 'top'){
            this.boxModel.cssRuleSet.boxModelVCSS(this.yAxisModifier,((parseInt($(this.boxModel.targetElement).css(this.yAxisModifier) || 0) || 0) - incr)+"px");
        } else {
            this.boxModel.cssRuleSet.boxModelVCSS(this.yAxisModifier,((parseInt($(this.boxModel.targetElement).css(this.yAxisModifier) || 0) || 0) + incr)+"px");
        }
        this.markChanged();
    };
    
    Layout.prototype.setY = function(value){
        if(this.yAxisAlignment === 'top'){
            this.boxModel.cssRuleSet.boxModelVCSS(this.yAxisModifier,value);
        } else {
            this.boxModel.cssRuleSet.boxModelVCSS(this.yAxisModifier,value);
        }
        this.markChanged();
    };
    
    Layout.prototype.getYAxisModifierValue = function(){
        if(this.yAxisAlignment === 'top'){
            return $(this.boxModel.targetElement).css(this.yAxisModifier);
        } else {
            return $(this.boxModel.targetElement).css(this.yAxisModifier);
        }
    };
    
    Layout.prototype.changeTopTo = function(yValue){
        var existingValue = this.boxModel.boundingRect.top ;
        var toBeCompensated = existingValue - yValue;
        this.changeY(toBeCompensated);
    };
    
    Layout.prototype.changeCenterTo = function(xValue){
        var existingValue = (this.boxModel.boundingRect.left + this.boxModel.boundingRect.right)/2 ;
        var toBeCompensated = existingValue - xValue;
        this.changeX(toBeCompensated);
    };
    
    Layout.prototype.changeMiddleTo = function(yValue){
        var existingValue = (this.boxModel.boundingRect.top + this.boxModel.boundingRect.bottom)/2 ;
        var toBeCompensated = existingValue - yValue;
        this.changeY(toBeCompensated);
    };
    
    Layout.prototype.changeBottomTo = function(yValue){
        var existingValue = this.boxModel.boundingRect.bottom;
        var toBeCompensated = existingValue - yValue;
        this.changeY(toBeCompensated);
    };
    
    Layout.prototype.changeWidth = function(incr){
        this.boxModel.cssRuleSet.boxModelHCSS('width',(parseInt($(this.boxModel.targetElement).css('width')) || 0) + incr);
        this.markChanged();
    };
    
    Layout.prototype.changeHeight = function(incr){
        this.boxModel.cssRuleSet.boxModelVCSS('height',(parseInt($(this.boxModel.targetElement).css('height')) || 0) + incr);
        this.markChanged();
    };
    
    Layout.prototype.changeWidthTo = function(width,passThrough){
        this.boxModel.cssRuleSet.boxModelHCSS('width',width,passThrough);
        this.markChanged();
    };
    
    Layout.prototype.changeHeightTo = function(height){
        this.boxModel.cssRuleSet.boxModelVCSS('height',height);
        this.markChanged();
    };
    
    Layout.prototype.createSavePoint = function(){
        return {x:parseInt($(this.boxModel.targetElement).css(this.xAxisModifier)),
                          y:parseInt($(this.boxModel.targetElement).css(this.yAxisModifier))};
    };
    
    Layout.prototype.rollBack = function(savepoint){
        this.boxModel.cssRuleSet.css(this.yAxisModifier,savepoint.y);
        this.boxModel.cssRuleSet.css(this.xAxisModifier,savepoint.x);
        if(this._isChanged){
            this._isChanged = false;
        }
        this._trackChange = false;
    };
    
    Layout.prototype.markChanged = function(){
        if(this._trackChange){
            this._isChanged = true;
        } 
    };
    
    Layout.prototype.open = function(exclusive){
        this._trackChange = true;
    };
    
    Layout.prototype._setModel = function(model){
        this.boxModel = model;
    };
    
    Layout.prototype._setPositionReference = function(ref){
        this.positionReference = ref;
    };
    
    Layout.prototype.close = function(exclusive){
        if(this._isChanged){
            this.boxModel.cssRuleSet.persist();
            this._isChanged = false;
        }
        this._trackChange = false;
    };
    
    Layout.prototype.refresh = function(){
        $("#html-design-editor").trigger("refresh.element.selection");
    };
    
    //Composite Layout prototype
    function CompositeLayout(layouts){
        this.layouts = layouts;
    }
    
    CompositeLayout.prototype.changeX = function(incr){
        for (var i in this.layouts) {
            if(this.layouts[i].changeX){
                this.layouts[i].changeX(incr);
            }
        }
    };
    
     CompositeLayout.prototype.changeLeftTo = function(xValue){
        for (var i in this.layouts) {
            if(this.layouts[i].changeLeftTo){
                this.layouts[i].changeLeftTo(xValue);
            }
        }
    };
     
    CompositeLayout.prototype.changeRightTo = function(xValue){
        for (var i in this.layouts) {
            if(this.layouts[i].changeRightTo){
                this.layouts[i].changeRightTo(xValue);
            }
        }
    };
    
    CompositeLayout.prototype.changeY = function(incr){
        for (var i in this.layouts) {
          if(this.layouts[i].changeY){
                this.layouts[i].changeY(incr);
            }
        }
    };
    
    CompositeLayout.prototype.changeTopTo = function(yValue){
        for (var i in this.layouts) {
            if(this.layouts[i].changeTopTo){
                this.layouts[i].changeTopTo(yValue);
            }
        }
    };
    
    CompositeLayout.prototype.changeBottomTo = function(yValue){
        for (var i in this.layouts) {
            if(this.layouts[i].changeBottomTo){
                this.layouts[i].changeBottomTo(yValue);
            }
        }
    };
    
    CompositeLayout.prototype.changeCenterTo = function(xValue){
        for (var i in this.layouts) {
            if(this.layouts[i].changeCenterTo){
                this.layouts[i].changeCenterTo(xValue);
            }
        }
    };
    
    CompositeLayout.prototype.changeMiddleTo = function(yValue){
        for (var i in this.layouts) {
            if(this.layouts[i].changeMiddleTo){
                this.layouts[i].changeMiddleTo(yValue);
            }
        }
    };
    
    CompositeLayout.prototype.changeWidth = function(incr){
        for (var i in this.layouts) {
          if(this.layouts[i].changeWidth){
                this.layouts[i].changeWidth(incr);
            }
        }
    };
    
    CompositeLayout.prototype.changeHeight = function(incr){
        for (var i in this.layouts) {
          if(this.layouts[i].changeHeight){
                this.layouts[i].changeHeight(incr);
            }
        }
    };
    
    CompositeLayout.prototype.open = function(exclusive){
        for (var i in this.layouts) {
          if(this.layouts[i].open){
                this.layouts[i].open(exclusive);
            }
        }
    };
    
    CompositeLayout.prototype.close = function(exclusive){
        for (var i in this.layouts) {
         if(this.layouts[i].close){
                this.layouts[i].close(exclusive);
            }
        }
    };
    
    CompositeLayout.prototype.distributeHorizontally = function(referenceRect,spaceParam,pivot){
        var lastDistributedTo = 0;
        this.layouts.sort(_hSortCompareFnOnLayouts);
        if(!spaceParam){
           var cummulativeWidth = 0;
           for(var i in this.layouts) {
                cummulativeWidth+= parseInt(this.layouts[i].boxModel.targetElement.getBoundingClientRect().width);
            }
            spaceParam = ((referenceRect.right - referenceRect.left) - cummulativeWidth)/(this.layouts.length - 1);
        }
        
        spaceParam = parseInt(spaceParam);
       
        for(var i in this.layouts) {
            if(i === "0"){
                this.layouts[i].changeLeftTo(referenceRect.left);
                lastDistributedTo+= this.layouts[i].boxModel.targetElement.getBoundingClientRect().width + referenceRect.left;
            }else{
                this.layouts[i].changeLeftTo(lastDistributedTo + spaceParam);
                lastDistributedTo+= this.layouts[i].boxModel.targetElement.getBoundingClientRect().width + spaceParam;
            }
        }
    };
    
    CompositeLayout.prototype.distributeVertically = function(referenceRect,spaceParam,pivot){
        var lastDistributedTo = 0;
        this.layouts.sort(_vSortCompareFnOnLayouts);
        if(!spaceParam){
           var cummulativeHeight = 0;
           for (var i in this.layouts) {
                cummulativeHeight+= parseInt(this.layouts[i].boxModel.targetElement.getBoundingClientRect().height);
            }
            spaceParam = ((referenceRect.bottom - referenceRect.top) - cummulativeHeight)/(this.layouts.length - 1);
        }
        
        spaceParam = parseInt(spaceParam);
        
        for(var i in this.layouts) {
            if(i === "0"){
                this.layouts[i].changeTopTo(referenceRect.top);
                lastDistributedTo+= this.layouts[i].boxModel.targetElement.getBoundingClientRect().height + referenceRect.top;
            }else{
                this.layouts[i].changeTopTo(lastDistributedTo + spaceParam);
                lastDistributedTo+= this.layouts[i].boxModel.targetElement.getBoundingClientRect().height + spaceParam;
            }
        }
    };
    
    CompositeLayout.prototype.changeWidthTo = function(width){
        for (var i in this.layouts) {
         if(this.layouts[i].changeWidthTo){
                this.layouts[i].changeWidthTo(width);
            }
        }
    };
    
    CompositeLayout.prototype.changeHeightTo = function(height){
        for (var i in this.layouts) {
         if(this.layouts[i].changeHeightTo){
                this.layouts[i].changeHeightTo(height);
            }
        }
    };
    
    CompositeLayout.prototype.refresh = function(){
        $("#html-design-editor").trigger("grouprefresh.element.selection");
    };
    
    function _createNewDecision(model){
         var isElementPositioned = _isPositioned(model.targetElement);
         var xAxisMod = _getXAxisModifier(model,isElementPositioned[0]),
            yAxisMod = _getYAxisModifier(model,isElementPositioned[0]),
            xAnchor = xAxisMod.indexOf('left') >= 0 ? 'left' : 'right',
            yAnchor = yAxisMod.indexOf('top') >= 0 ? 'top' : 'bottom';
        
        return new Layout( {
            layout:isElementPositioned[1],
            positioned: isElementPositioned[0],
            xAxisModifier : xAxisMod,
            yAxisModifier : yAxisMod,
            xAxisAlignment : xAnchor,
            yAxisAlignment : yAnchor,
            boxModel : model,
            positionReference : _getPositionReference(model,xAxisMod,yAxisMod,xAnchor,yAnchor)
        });
    }
    
    function _updateLastDecision(model){
        lastConstructedDecision._setModel(model);
    }
    
    function _updateLastPositionReference(model){
        var xAnchor =lastConstructedDecision.xAxisModifier.indexOf('left') >= 0 ? 'left' : 'right',
            yAnchor =lastConstructedDecision.yAxisModifier.indexOf('top') >= 0 ? 'top' : 'bottom';
        var newPosRef = _getPositionReference( model
                                              ,lastConstructedDecision.xAxisModifier
                                              ,lastConstructedDecision.yAxisModifier
                                              ,xAnchor
                                              ,yAnchor
                                             );
        lastConstructedDecision._setPositionReference(newPosRef);
    }
    
    function _getLayoutDescision(model){        
        lastConstructedDecision = _createNewDecision(model);
        return lastConstructedDecision;
    }
    
    function _getRefreshedLayoutDescision(model){        
        _updateLastDecision(model);
        _updateLastPositionReference(model);
        return lastConstructedDecision;
    }
    
    function _getCompositeLayoutDescision(models){ 
        var decisions = [];
        for (var i in models) {
            if(models[i].targetElement){
                decisions.push(_getLayoutDescision(models[i]));
            }
        }
        return new CompositeLayout(decisions);
    }
    
    function _hSortCompareFnOnLayouts(a,b) {
        return a.boxModel.targetElement.getBoundingClientRect().left - b.boxModel.targetElement.getBoundingClientRect().left;
    }
    
    function _vSortCompareFnOnLayouts(a,b) {
        return a.boxModel.targetElement.getBoundingClientRect().top - b.boxModel.targetElement.getBoundingClientRect().top;
    }
   
     $(document).on("boxmodel.created","#html-design-editor", function(event,model){
         $("#html-design-editor").trigger('layout.decision',[_getLayoutDescision(model)]);
     });
    
     $(document).on("boxmodel.refreshed","#html-design-editor", function(event,model){
         var asynchPromise = new $.Deferred();
         $("#html-design-editor").trigger('layout.decision',[_getRefreshedLayoutDescision(model)]);
         asynchPromise.resolve();
         return asynchPromise.promise();
     });
    
     $(document).on("groupmodel.created","#html-design-editor", function(event,models){
         $("#html-design-editor").trigger('grouplayout.decision',[_getCompositeLayoutDescision(models)]);
     });
     
});
