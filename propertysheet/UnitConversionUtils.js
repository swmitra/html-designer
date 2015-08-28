/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var baseline = 100;  // any number serves 

    var map = {  // list of all units and their identifying string
        pixel : "px",
        percent : "%",
        inch : "in",
        cm : "cm",
        mm : "mm",
        point : "pt",
        pica : "pc",
        em : "em",
        ex : "ex",
        rem : "rem"
    };
    
    var factors = {};  // holds ratios
    
    function _prefetchHFactors(element,temp){
        var hfactors = {};
        var unit;
        var item;  // generic iterator
        for(item in map){
            unit = map[item];
            temp.style.width = baseline + unit;
            hfactors[unit] = (baseline / temp.offsetWidth).toFixed(4);
        }
        factors[element].push(hfactors);
    }
    
    function _prefetchVFactors(element,temp){
        var vfactors = {};
        var unit;
        var item;  // generic iterator
        for(item in map){
            unit = map[item];
            temp.style.height = baseline + unit;
            vfactors[unit] = (baseline / temp.offsetHeight).toFixed(4);
        }
        factors[element].push(vfactors);
    }
    
    
    function _prefetchFactors(element){
        var asynchPromise = new $.Deferred();
        factors = {};
        var temp = element.ownerDocument.createElement("div");  // create temporary element
        temp.style.overflow = "hidden";  // in case baseline is set too low
        temp.style.visibility = "hidden";  // no need to show it
        element.parentNode.appendChild(temp);    // insert it into the parent for em and ex  
        
        factors[element] = [];
        
        _prefetchHFactors(element,temp);
        _prefetchVFactors(element,temp);
        
        element.parentNode.removeChild(temp);  // clean up
        asynchPromise.resolve();
        return asynchPromise.promise();
    }

    
    $(document).on("element.selected","#html-design-editor",function(event,element){
         var asynchPromise = new $.Deferred();
        _prefetchFactors(element);
        asynchPromise.resolve();
        return asynchPromise.promise();
    });
    
    $(document).on('multiselect.done',"#html-design-editor",function(event,elements){
     });

    // get object with units
    var getUnits = function(target, numeric, unit, returnUnit,type){
        
        var returnVal = null;  // holds calculated values
        
        if(type === 'h'){
            if(unit === 'px'){
                returnVal = (numeric * (factors[target][0][returnUnit])) + returnUnit;
            } else {
                returnVal = (numeric /(factors[target][0][unit]))*(factors[target][0][returnUnit]) + returnUnit;
            }
        } else {
            if(unit === 'px'){
                returnVal = (numeric * (factors[target][1][returnUnit])) + returnUnit;
            } else {
                returnVal = (numeric /(factors[target][1][unit]))*(factors[target][1][returnUnit]) + returnUnit;
            }
        }
        
        if(returnUnit === 'px'){
            returnVal = parseInt(returnVal);
        } else {
            returnVal = parseFloat(returnVal).toFixed(2);
        }

        return returnVal;  // returns the object with converted unit values...
    }
    
    //Function to convert hex format to a rgb color
    function rgb2hex(rgb){
         rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
         return rgb ? "#" +
          ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
          ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
          ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '#00000000';
    }
    
    /** Checks whether the CSS value includes a calc() function, 
     *  (This is also for avoiding unnecessary regex.)
     */
    function _hasCalc(value) {
        return value.toLowerCase().indexOf('calc(') >= 0;
    }

    /** Gets the full statement (string) inside a calc() function.
     */
    function _getCalcStatement(rule) {
        if (!rule) return '';
        var pattern = /calc\(([^\)]+)\).*/;
        var match = pattern.exec(rule);
        return match && match.length > 1 ? match[1] : '';
    }

    /** Splits the calc operation's elements (values and operators) and 
     *  dissolves the values into objects with value and unit properties. 
     */
    function _parseCalcExpression(statement) {
        statement = _getCalcStatement(statement);
        // The CSS calc() function supports 4 basic math operations only: 
        // Addition (+), Subtraction (-), Multiplication (*), Division (/)
        // White-spaces are very important in a calc statement. 
        // From Mozilla: "The + and - operators must always be surrounded by whitespace. 
        // The * and / operators do not require whitespace, but adding it for consistency is allowed, and recommended."
        // We could use: statement.split(/(\s+[\+\-]\s+|\s*[\*\/]\s*)/);
        // to include the operators inside the output array, but not all browsers 
        // support splicing the capturing parentheses into the array like that. So:
        statement = statement.replace('*', ' * ').replace('/', ' / ');
        var arr = statement.split(/\s+/);
        var calcElems = [];
        for (var i = 0; i < arr.length; i++) {
            var d = _parseValueWithUnit(arr[i]);
            calcElems.push(d);
        }
        return calcElems;
    }

    /** Dissolves the value and unit of the element and 
     *  returns either the operator or an object with "value" and "unit" properties.
     */
    function _parseValueWithUnit(val) {
        // Check if the value is an operator.
        var ops = '+-*/';
        if (ops.indexOf(val) >= 0) return val;

        var o = {};
        // CSS units in a calc statement can have all the regular units. 
        // According to W3C; they can also, can include a "vw" unit (stands for viewport).
        var pattern = /([\+\-]?[0-9\.]+)(%|px|pt|em|in|cm|mm|ex|pc|vw|rem)?/;
        // Exec the value/unit pattern on the property value.
        var match = pattern.exec(val);
        // So we reset to the original value if there is no unit.
        if (match) { 
            var v = match.length >= 2 ? match[1] : match[0];
            o.value = toFloat(v); //parse value as float
            o.unit = match.length >= 3 ? match[2] : '';
        }
        else {
            o = { value:val, unit:''};
        }
        return o;
    }

    // Helper Functions
    function toFloat(value) { return parseFloat(value) || 0.0; }
    
    // expose           
    exports.getUnits = getUnits;
    exports.rgb2hex = rgb2hex;
    exports.parseCalcExpression = _parseCalcExpression;
    exports.hasCalc = _hasCalc;
    
});