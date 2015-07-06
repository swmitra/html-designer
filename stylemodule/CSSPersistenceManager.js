/**
 * @author Swagatam Mitra
  
 */

define(function (require, exports, module) {
    "use strict";
    
    var FileUtils   = brackets.getModule("file/FileUtils"),
        Commands            = brackets.getModule("command/Commands"),
        CommandManager    = brackets.getModule("command/CommandManager");
    
    var dirtyStyleDocs = {};
    
    
    function _saveStyleDocs(application){
        var count = 0;
        var dirtyDocs = dirtyStyleDocs[application]; 
        if(dirtyDocs){
            for(count = 0;count<dirtyDocs.length;count++){
                CommandManager.execute(Commands.FILE_SAVE, { doc: dirtyDocs[count] });
            }
            dirtyStyleDocs[application] = [];
        }
    }
    
    $(document).on("cssdoc.changed","#html-design-editor", function(event,application,doc){
        if(!dirtyStyleDocs[application]){
           dirtyStyleDocs[application] = []; 
        }
        dirtyStyleDocs[application].push(doc);
     });
    
    $(document).on("save.application","#html-design-editor", function(event,application){
        _saveStyleDocs(application);
     });
     
});
