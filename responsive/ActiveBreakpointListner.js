/**
 * @author Swagatam Mitra
  
 */

define(function (require, exports, module) {
    "use strict";
    
    var ExtensionUtils = brackets.getModule("utils/ExtensionUtils");
    var MODULE_PATH = ExtensionUtils.getModulePath(module);
    var RuleSetCreator = require("stylemodule/RuleSetCreator");
    var randomColor = require("lib/randomcolor/randomColor");
    var BrightColorPool = require("responsive/BrightColorPool");
    
    var maxMediaTemplate = '<div style="box-sizing:border-box;padding:0px 5px;background:url({{@module}}images/ruler_min.png) calc(100% - 50px) 50% no-repeat {{@bgcolor}};height:100%;width:{{@mediaparam}};text-align:right;color:white;position:absolute;border-bottom: 1px solid {{@color}};"></div>';
    var minMediaTemplate = '<div style="box-sizing:border-box;padding:0px 5px;background:url({{@module}}images/ruler_min.png) 50px 50% no-repeat {{@bgcolor}};height:100%;width:{{@mediaparam}};text-align:left;color:white;position:absolute;border-bottom: 1px solid {{@color}};"></div>';
    
    var mediaListItemTemplate = '<li style="position:relative;padding-right:30px;"><a role="menuitem" tabindex="-1" href="#" style="color:white;border-left:20px solid @bgcolor;"></span>&emsp;{{content}}</a><span class="glyphicon glyphicon-trash" style="position:absolute;right:5px;top:6px;color:red;"></li>';
    
    var RE_MEDIA_QUERY     = /^(?:(only|not)?\s*([_a-z][_a-z0-9-]*)|(\([^\)]+\)))(?:\s*and\s*(.*))?$/i,
        RE_MQ_EXPRESSION   = /^\(\s*([_a-z-][_a-z0-9-]*)\s*(?:\:\s*([^\)]+))?\s*\)$/,
        RE_MQ_FEATURE      = /^(?:(min|max)-)?(.+)/,
        RE_LENGTH_UNIT     = /(em|rem|px|cm|mm|in|pt|pc)?\s*$/,
        RE_RESOLUTION_UNIT = /(dpi|dpcm|dppx)?\s*$/;
    
    var currentStyleSheets = [];
    var definedMedia = [];
    var activeMedia = null;
    var mediaList = null;
    var tempQueryBuffer = [];
    
    $(document).on("stylesheets-in-dom","#html-design-editor",function(event, styleSheets){
        var asynchPromise = new $.Deferred();
        currentStyleSheets = document.getElementById('htmldesignerIframe').contentWindow.document.styleSheets;
        _findMediaRules();
        asynchPromise.resolve();
        return asynchPromise.promise();
    });
    
    $(document).on("click","#designer-add-media-breakpoint",function(event){
        var mediaFilter = $("#design-window-width-input").val()+'px';
        mediaFilter = '@media screen and (max-width: '+mediaFilter+'){ //inserted by html designer }';
        RuleSetCreator.createNewMediaRule(mediaFilter,0);
        currentStyleSheets = document.getElementById('htmldesignerIframe').contentWindow.document.styleSheets;
        _findMediaRules();
        
    });
    
    
    function _findMediaRules(){        
        definedMedia = [];
        mediaList = [];
        tempQueryBuffer = [];
        /*$("#breakpoint-container").html("");
        $("#media-list-menu").html("");*/
        var sheetCount, setCount, styleSheet, ruleSets, ruleSet, mediaCount;
        var ref,entry;
        for (sheetCount = 0; sheetCount < currentStyleSheets.length && !ref; sheetCount++) {
            styleSheet = currentStyleSheets[sheetCount];
            ruleSets = styleSheet.rules;
            for (setCount = 0; setCount < ruleSets.length && !ref; setCount++) {
                ruleSet = ruleSets[setCount];
                if (ruleSet.media) {
                    for(mediaCount = 0;mediaCount < ruleSet.media.length;mediaCount++){
                        try{
                            var result = parseQuery(ruleSet.media[mediaCount]);
                            if(tempQueryBuffer.indexOf(ruleSet.media[mediaCount]) < 0 && result[0] && result[0].type === "screen" && result[0].expressions.length > 0){
                                tempQueryBuffer.push(ruleSet.media[mediaCount]);
                                definedMedia.push(result);
                                entry = [];
                                entry.push(ruleSet.media[mediaCount]);
                                entry.push(ruleSet);
                                mediaList.push(entry);
                            }
                        }catch(err){
                        }
                    }
                }
            }
        }
        $("#breakpoint-container").html("");
        $("#media-list-menu").html("");
        for(mediaCount = 0;mediaCount < definedMedia.length ;mediaCount++){
            if(definedMedia[mediaCount][0].expressions[0] && definedMedia[mediaCount][0].expressions[0].feature === 'width'){
                _appendMediaIndicator(definedMedia[mediaCount][0].expressions[0].modifier,definedMedia[mediaCount][0].expressions[0].value,mediaList[mediaCount][0], tempQueryBuffer.indexOf(mediaList[mediaCount][0]));
            }
        }
        _findAppliedMedia();
    }
    
    function _findAppliedMedia() {
        var asynchPromise = new $.Deferred();
        var width = parseInt($("#designer-content-placeholder").css('width'));
        var mediaCount,mediaFound = false;
        var appliedMedia;
        for(mediaCount = definedMedia.length - 1;mediaCount >=0 && !mediaFound ;mediaCount--){
            if(definedMedia[mediaCount][0].expressions[0] && definedMedia[mediaCount][0].expressions[0].feature === 'width'){
                switch(definedMedia[mediaCount][0].expressions[0].modifier){
                    case 'min': 
                            mediaFound = width >= parseInt(definedMedia[mediaCount][0].expressions[0].value);
                            appliedMedia = mediaList[mediaCount];
                            break;
                    case 'max':
                            mediaFound = width <= parseInt(definedMedia[mediaCount][0].expressions[0].value);
                            appliedMedia = mediaList[mediaCount];
                            break;
                }
            }
        }
        if(mediaFound){
            $(".active-Media-applied").text(appliedMedia[0]);
            $(".active-Media-applied").css('border-left','15px solid '+BrightColorPool.getColor(tempQueryBuffer.indexOf(appliedMedia[0])));
        } else {
            $(".active-Media-applied").text("No Active Media");
            $(".active-Media-applied").css('border-left','');
        }
        
        $(".active-Media-applied").css('padding-left','2px');
        
        $("#html-design-editor").trigger("activemedia-found",[mediaFound ? appliedMedia[0] : null, BrightColorPool.getColor(tempQueryBuffer.indexOf(appliedMedia[0]))]);
        
        asynchPromise.resolve();
        return asynchPromise.promise();
    }
    
    $(document).on("click", "#media-list-menu-cont", function(event){
        $("#media-list-menu").show();
    }); 
    
    $(document).on("click", "#media-list-menu li", function(event){
        $("#media-list-menu").hide();
        event.stopPropagation();
        event.preventDefault();
    }); 
    
    $(document).on("panelResizeUpdate", "#designer-content-placeholder", _findAppliedMedia);
                    
    function _appendMediaIndicator(modifier,value, mediaText,index){
        var templ = "";
        var color = randomColor({
                       luminosity: 'bright',
                       format: 'rgbArray' 
                    });
        var baseCcolor = BrightColorPool.getColor(index);//"rgba("+color[0]+","+color[1]+","+color[2]+",0.8)";
        switch(modifier){
            case 'min': templ = minMediaTemplate.split("{{@module}}").join(MODULE_PATH);
                        templ = templ.split("{{@color}}").join(color).split("{{@mediaparam}}").join((5000 - parseInt(value))+'px').split("{{@bgcolor}}").join(baseCcolor); 
                        $(templ).appendTo("#breakpoint-container").css('left',value).text(value);
                        break;
            case 'max': templ = maxMediaTemplate.split("{{@module}}").join(MODULE_PATH);
                        templ = templ.split("{{@color}}").join(color).split("{{@mediaparam}}").join(value).split("{{@bgcolor}}").join(baseCcolor); 
                        $(templ).appendTo("#breakpoint-container").css('left',"0px").text(value);
                        break;
        }
        
        var entryTemplate = mediaListItemTemplate.split('{{content}}').join(mediaText).split('@bgcolor').join(baseCcolor);
        $(entryTemplate).appendTo("#media-list-menu");
    }
    
    function parseQuery(mediaQuery) {
        return mediaQuery.split(',').map(function (query) {
            query = query.trim();

            var captures = query.match(RE_MEDIA_QUERY);

            // Media Query must be valid.
            if (!captures) {
                throw new SyntaxError('Invalid CSS media query: "' + query + '"');
            }

            var modifier    = captures[1],
                type        = captures[2],
                expressions = ((captures[3] || '') + (captures[4] || '')).trim(),
                parsed      = {};

            parsed.inverse = !!modifier && modifier.toLowerCase() === 'not';
            parsed.type    = type ? type.toLowerCase() : 'all';

            // Check for media query expressions.
            if (!expressions) {
                parsed.expressions = [];
                return parsed;
            }

            // Split expressions into a list.
            expressions = expressions.match(/\([^\)]+\)/g);

            // Media Query must be valid.
            if (!expressions) {
                throw new SyntaxError('Invalid CSS media query: "' + query + '"');
            }

            parsed.expressions = expressions.map(function (expression) {
                var captures = expression.match(RE_MQ_EXPRESSION);

                // Media Query must be valid.
                if (!captures) {
                    throw new SyntaxError('Invalid CSS media query: "' + query + '"');
                }

                var feature = captures[1].toLowerCase().match(RE_MQ_FEATURE);

                return {
                    modifier: feature[1],
                    feature : feature[2],
                    value   : captures[2]
                };
            });

            return parsed;
        });
    }
    
    function _getAccentColor(mediaText){
        return BrightColorPool.getColor(tempQueryBuffer.indexOf(mediaText));
    }
   
    exports.getAccentColor = _getAccentColor;
});
