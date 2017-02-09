/**
 * @author Swagatam Mitra
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    //Function to check whether a file extension is a valid markup container
    function _isValidMarkupFile(extn){
        var valid = false;
        switch(extn){
            case 'html':
            case 'shtml':
            case 'xhtml':
            case 'htm': valid = true;
        }
        
        return valid;
    }
    
    // expose           
    exports.isValidMarkupFile = _isValidMarkupFile;
    
});
