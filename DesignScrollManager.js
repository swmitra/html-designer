/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    function _initScrollMock(){
        var designDOM = document.getElementById('htmldesignerIframe').contentWindow.document;

        var width = $(designDOM).width();
        var height = $(designDOM).height();
        $("#designer-content-scroll-mock")
        .css('width',width)
        .css('height',height);
        
        $("#scrollPlane").off("scroll", _simulateScroll);
        $("#scrollPlane").on("scroll", _simulateScroll);
        
    }
    
    function _simulateScroll(){
        var shadowedDoc = document.getElementById('htmldesignerIframe').contentWindow.document;
        $(shadowedDoc).scrollLeft($("#scrollPlane").scrollLeft());
        $(shadowedDoc).scrollTop($("#scrollPlane").scrollTop());
        $("#html-design-editor").trigger('grouprefresh.element.selection');
        $("#html-design-editor").trigger('refresh.element.selection');
    }
    
    function _initScroll(){
        window.setTimeout(_initScrollMock,1000);
        window.setTimeout(_initScrollMock,5000);
    }
                
    $(document).on("design-editor-shown","#html-design-editor", _initScroll);
        
});