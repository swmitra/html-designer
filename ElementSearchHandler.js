/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict"; 
    
     var AppInit       = brackets.getModule("utils/AppInit"),
         CommandManager      = brackets.getModule("command/CommandManager");
    
    function _showSearchPanel(){
        $("#find-what-element")[0].value = "";
        $("#element-search-panel").show();
    }
    
    function _hideSearchPanel(){
        $("#element-search-panel").hide();
    }
    
    function _doSearch(){
        var result = $(document.getElementById('htmldesignerIframe').contentWindow.document).contents().find(this.value);
        if(result.length === 1){
           $("#html-design-editor").trigger("select.element",[result[0]]); 
        } else if(result.length > 1){
            $("#html-design-editor").trigger("multiselection.done",[result]);
        }
        _hideSearchPanel();
    }
    
    $(document).on("change","#find-what-element", _doSearch);
    
    $(document).on("targetdom.element.click","#html-design-editor", _hideSearchPanel);
    
    $(document).on("click", "#close-search-panel",  _hideSearchPanel);
    
    $(document).on("click", "#element-search-anchor",  _showSearchPanel);
    
    AppInit.appReady(function () {
        CommandManager.register("Show HTML split view", "launch.element.search", _showSearchPanel);
    });
    
});