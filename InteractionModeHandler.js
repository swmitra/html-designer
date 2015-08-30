/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

define(function (require, exports, module) {
    "use strict";
    
    $(document).on("click","#interaction-mode", function(){
        $(this).toggleClass('activated');
        $("#html-design-editor").trigger("deselect.all");
        $("#info-overlay-plane,.eventListnerPane").toggleClass('deactivated');
        $("#designer-content-placeholder .horz-resizer .gripper").toggle();
        $("#designer-content-placeholder .vert-resizer .gripper").toggle();
    });

});
