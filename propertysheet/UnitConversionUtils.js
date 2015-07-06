/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var baseline = 100;  // any number serves 
    var item;  // generic iterator

    var map = {  // list of all units and their identifying string
        pixel : "px",
        percent : "%",
        inch : "in",
        cm : "cm",
        mm : "mm",
        point : "pt",
        pica : "pc",
        em : "em",
        ex : "ex"
    };
    
    var factors = {};  // holds ratios
    
    function _prefetchHFactors(element,temp){
        var hfactors = {};
        var unit;
        for(item in map){
            unit = map[item];
            temp.style.width = baseline + unit;
            hfactors[unit] = baseline / temp.offsetWidth;
        }
        factors[element].push(hfactors);
    }
    
    function _prefetchVFactors(element,temp){
        var vfactors = {};
        var unit;
        for(item in map){
            unit = map[item];
            temp.style.height = baseline + unit;
            vfactors[unit] = baseline / temp.offsetHeight;
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

    
    $(document).on("element.selected element.selection.refreshed","#html-design-editor",function(event,element){
         var asynchPromise = new $.Deferred();
        _prefetchFactors(element);
        asynchPromise.resolve();
        return asynchPromise.promise();
    });
    
    $(document).on('multiselect.done',"#html-design-editor",function(event,elements){
     });

    // get object with units
    var getUnits = function(target, numeric, unit, returnUnit,type){
        
        var unit = null;  // holds calculated values
        
        if(type === 'h'){
            unit = (numeric * (factors[target][0][returnUnit])).toFixed(2) + returnUnit;
        } else {
            unit = (numeric * (factors[target][1][returnUnit])).toFixed(2) + returnUnit;
        }

        return unit;  // returns the object with converted unit values...
    }
    
    //Function to convert hex format to a rgb color
    function rgb2hex(rgb){
         rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
         return rgb ? "#" +
          ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
          ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
          ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '#00000000';
    }
    
    // expose           
    exports.getUnits = getUnits;
    exports.rgb2hex = rgb2hex;
    
});