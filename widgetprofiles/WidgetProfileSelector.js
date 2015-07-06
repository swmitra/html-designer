define(function (require, exports, module) {
    "use strict";

    var htmlProfile = require("widgetprofiles/PureHTMLProfileHandler"),
        bootstrapProfile = require("widgetprofiles/BootstrapWidgetProfileHandler");
    
    var dyanamicProfiles = {};
    
    function _getProfile(profileType){
       var profile;
       switch(profileType){
           case 'html': profile = htmlProfile; break;
           case 'bootstrap': profile = bootstrapProfile; break;
           default : profile = dyanamicProfiles[profileType]; break;
       }
       return profile;
    }
    
    function _registerProfile(key,profile){
        dyanamicProfiles[key] = profile;
    }
    
    exports.getProfile = _getProfile;
    exports.registerProfile = _registerProfile;
    
});