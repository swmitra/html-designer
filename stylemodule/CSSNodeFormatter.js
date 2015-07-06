/**
 * @author Swagatam Mitra
  
 */

define(function (require, exports, module) {
    "use strict";
    
    var beautify_css = require('lib/beautify/beautify-css').css_beautify;
    
    var config = JSON.parse(require('text!lib/beautify/config/defaults.json')); 
    
    function _formatCSSAsText(styleSheet,asMarkup){
         var styleText = [];
         for( var i in styleSheet.rules){
             if(styleSheet.rules[i].cssText){
                styleText.push(styleSheet.rules[i].cssText);
             }
         }
        
         if(!asMarkup){
             styleText = styleText.join('\n').split(';').join(';\n').split('{').join('\n{\n').split('}').join('\n}\n');
             styleText = beautify_css(styleText,config);
         } else {
             styleText = styleText.join('');
             styleText = styleText.split("\n").join("");
         }
        
         return styleText;
    } 
    
    exports.formatCSSAsText = _formatCSSAsText;
});
