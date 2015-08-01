define(function (require, exports, module) {
    "use strict";

    var htmlProfile = require("widgetprofiles/PureHTMLProfileHandler"),
       customProfile = require("widgetprofiles/CustomProfileHandler");
    
    function _getProfile(profileType){
       var profile;
       switch(profileType){
           case 'html': profile = htmlProfile; break;
           case 'custom': profile = customProfile; break;
       }
       return profile;
    }
    
    exports.getProfile = _getProfile;
});