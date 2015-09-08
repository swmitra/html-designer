/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
 
    var colorPool = [
                    "rgba(67, 198, 219, 0.7)",
                    "rgba(219, 88, 68, 0.7)",
                    "rgba(21, 137, 255, 0.7)",
                    "rgba(255, 138, 20, 0.7)",
                    "rgba(226, 56, 236, 0.7)",
                    "rgba(66, 237, 57, 0.7)",
                    "rgba(232, 163, 23, 0.7)",
                    "rgba(23, 93, 232, 0.7)",
                    "rgba(89, 232, 23, 0.7)",
                    "rgba(166, 23, 232, 0.7)",
                    "rgba(0, 32, 194, 0.7)",
                    "rgba(255, 36, 0, 0.7)"
                ];
    
    function _getColor(index){
        return colorPool[index % 12];
    }
    
    exports.getColor = _getColor; 
});