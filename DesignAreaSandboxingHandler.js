/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict"; 
    
    var AppInit       = brackets.getModule("utils/AppInit"),
         CommandManager      = brackets.getModule("command/CommandManager");
    
    var sandbox="allow-same-origin";
    
    function _toggleSanboxing(){
        var existing = $('#htmldesignerIframe').attr('sandbox');
        if(existing){
            $('#htmldesignerIframe').attr('sandbox',null);
            $('#sandbox-frame').attr('title','Enable Sandboxing');
        } else {
            $('#htmldesignerIframe').attr('sandbox',sandbox);
            $('#sandbox-frame').attr('title','Disable Sandboxing');
        }
    }
    
    $(document).on("click", "#sandbox-frame",  _toggleSanboxing);
    
    AppInit.appReady(function () {
        CommandManager.register("Toggle Sandboxing", "toggle.design.sandboxing", _toggleSanboxing);
    });
    
});