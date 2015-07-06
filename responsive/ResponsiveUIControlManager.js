/**
 * @author Swagatam Mitra
  
 */

define(function (require, exports, module) {
    "use strict";
    
    var AppInit = brackets.getModule("utils/AppInit"),
        Resizer = brackets.getModule("utils/Resizer");
    
    AppInit.appReady(function () {
        Resizer.makeResizable($("#designer-content-placeholder")[0], Resizer.DIRECTION_HORIZONTAL, Resizer.POSITION_RIGHT, 300, false, undefined, false);
        Resizer.makeResizable($("#designer-content-placeholder")[0], Resizer.DIRECTION_VERTICAL, Resizer.POSITION_BOTTOM, 300, false, undefined, false);
        $("#designer-content-placeholder").on("panelResizeUpdate", function () {
            var asynchPromise = new $.Deferred();
            $("#scrollPlane").css('width',$("#designer-content-placeholder").css('width'));
            $("#scrollPlane").css('height',$("#designer-content-placeholder").css('height'));
            if($("#selection-outline:visible").length > 0){
                $("#html-design-editor").trigger( "refresh.element.selection" );
            }
            asynchPromise.resolve();
            return asynchPromise.promise();
        });
        
        $("#sidebar").on("panelResizeUpdate", function () {
            var asynchPromise = new $.Deferred();
            $("#scrollPlane").css('width',$("#designer-content-placeholder").css('width'));
            $("#scrollPlane").css('height',$("#designer-content-placeholder").css('height'));
            if($("#selection-outline:visible").length > 0){
                $("#html-design-editor").trigger( "refresh.element.selection" );
            }
            asynchPromise.resolve();
            return asynchPromise.promise();
        });
        
        $("#html-design-editor").on("design-editor-shown",function(){
            $("#scrollPlane").css('width',$("#designer-content-placeholder").css('width'));
            $("#scrollPlane").css('height',$("#designer-content-placeholder").css('height'));
        });
    });
    
});
