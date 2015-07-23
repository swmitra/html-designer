/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    function _getContainedChildrens(element, x1, y1, x2, y2,elementArray){
        var boundingRect = element.getBoundingClientRect();
            var topLeftX = boundingRect.left;
            var topLeftY = boundingRect.top;
            var bottomRightX = boundingRect.right;
            var bottomRightY = boundingRect.bottom;

            if (topLeftX >= x1 
                && topLeftY >= y1 
                && bottomRightX <= x2 
                && bottomRightY <= y2) {
                // this element fits inside the selection rectangle
                elementArray.push(element);
            }
        if(elementArray.length === 0){
            var elementsSet = $(element).children();
            elementsSet.each(function() {
                _getContainedChildrens(this, x1, y1, x2, y2,elementArray);
            });
        }
    }
    
    // x1, y1 would be top-left corner
    // x2, y2 would be bottom-right corner
    // all coordinates are considered relative to the document
    function _elementsInRect(elementSet, x1, y1, x2, y2) {
        var elements = [];
        
        elementSet.each(function() {
            _getContainedChildrens(this, x1, y1, x2, y2,elements);
        });
        
        if(elements.length === 1){
            elementSet = $(elements[0]).children();
            elements = [];
            elementSet.each(function() {
                _getContainedChildrens(this, x1, y1, x2, y2,elements);
            });
        }
        //_getContainedChildrens(element, x1, y1, x2, y2,elements);
        return elements;
    }
    
    exports.getElementInRect = _elementsInRect;
    
});