/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var lastselectedElement = null;
    var breadCrumbItem =  '<li><a href="#">{{selector}}</a></li>';
    var AppInit       = brackets.getModule("utils/AppInit");
    
    function _bindClickHandler(target){
        var selector = '';
        
        if(target.id){
            selector = "#"+target.id;
        } 
        
        var base = $(breadCrumbItem.replace("{{selector}}",target.tagName+selector)).prependTo('#breadcrumb');

        base.on('click',function(){
            $("#html-design-editor").trigger("select.element",[target]);
        });
    }
      
    function _showBreadcrumb(){
        var hrchy = [];
        var element = lastselectedElement;
        if(lastselectedElement){
            $("#breadcrumb").html(""); 
            while(element!==null && element.tagName!== 'HTML'){
               _bindClickHandler(element);
                element = element.parentElement;
            }
        }
    }
    
    $(document).on("element.selected","#html-design-editor",function(event,element){
        lastselectedElement = element;
        _showBreadcrumb();
    });
    
    $(document).on("refresh.element.selection","#html-design-editor",function(event,element){
        _showBreadcrumb();
    });
    
    $(document).on("deselect.all","#html-design-editor",function(event){
        lastselectedElement = null;
        $("#breadcrumb").html("");
    });
    
    AppInit.appReady(function () {
        $('<ul id="breadcrumb"></ul>').insertAfter("#status-file");
    });
    
});