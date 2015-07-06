/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var AppInit       = brackets.getModule("utils/AppInit");
    var lastSelectedElement = null;
    
    function _appendUnitSelect(inputElement){
        var inputID = inputElement.id;
        var selectID = inputID+"-unit-select";
        var unitOptions = $(inputElement).data('unit-supported').split(',');
        var optionString = "";
        for(var i in unitOptions){
            optionString = '<option>'+unitOptions[i]+'</option>';
        }
        var selectString = "<select class='topcoat-select-button-dark' id='"+selectID+"' style='position:absolute;top:0px;right:0px;width:40px;'>"+optionString+"</select>";
        var wrapperDiv = "<div style='position:absolute;left:"+$(inputElement).css('left')+";top:"+$(inputElement).css('top')+";width:"+$(inputElement).css('width')+";'>"+inputElement.outerHTML+selectString+"</div>";
        $(inputElement).replaceWith(wrapperDiv);
        $("#"+inputID).css('top',0).css('left',0);
    }
    
    AppInit.appReady(function () { 
        
        var inputs = $("#generic-toolbox :text");
        console.log(inputs);
        /*for(var i in inputs){
            if($(inputs[i]).data("unit")){
               _appendUnitSelect(inputs[i]); 
            }
        }*/
        _appendUnitSelect($("#bg-image-position-x")[0]);
                        
    });            
});