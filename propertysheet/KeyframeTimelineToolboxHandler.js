/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var AppInit       = brackets.getModule("utils/AppInit");
    var FileUtils = brackets.getModule("file/FileUtils");
    var RuleSetCreator = require("stylemodule/RuleSetCreator");
    var RuleSetFinder = require("stylemodule/RuleSetFinder"),
        Resizer = brackets.getModule("utils/Resizer");
    
    var lastSelectedRuleset = null;
    var MarkerTemplate = '<div class="keyframemarker intermediatemarker" id="{{id}}" style="left:{{left}};" data-markerat="{{markerat}}"><div class="keyframemarkerdragger"></div><div class="framebubble"><div class="framebubbledragger"></div></div></div>';
    var FrameListEntryTemplate = '<li class="intermediatemarker" id="{{id}}">{{marker}}</li>';
    var ChangeSetEntryTemplate = "<div id='{{id}}' style='float:left;width:99%;'><span style='float:left;width:40%;margin-top:4px;text-align:right;padding-right:3px;'>{{name}}</span><input class='topcoat-text-input keyframe-changeset-value' style='float:left;width:50% !important' value='{{value}}' data-key='{{name}}'></div>";
    var KeyframeOptionTemplate = '<li><a role="menuitem" tabindex="-1" href="#" data-index={{index}}>{{label}}</a></li>';
        
    var intermediateFrameSet = {};
    var activeFrame = null;
    var activeAnim = null;
    var initialCSSSnapShot = null;
    
    var isLoadingDefInProgress = false;
    var accumulatedDefs = {};
    var markersSnapshot = {};
    var markersLocalSnapshot = {};
    var changeSetLocalSnapshot = {};
    var changeSetSnapshot = {};
    var elementAnimConfigCache = [];
    var elementCache = [];
    
    var $hLayer1,
        $hLayer2,
        $vLayer1,
        $vLayer2,
        $xOffsetAxisGrid,
        $yOffsetAxisGrid;
    
    var changeSetProperties = [];
    var fetchedDefs = null;
    
    function _getID(){
        var date = new Date();
        var components = [
            date.getMonth(),
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds(),
            date.getMilliseconds()
        ];

        var id = components.join("");
        return "keyframe-"+id;
    }
    
    function _getFrameDef(frame){
        var def = "";
        for(var key in frame){
            if(def){
                def = def + ';';
            }
            def = def + key + ":" + frame[key];
        }
        return "{ "+def+" }";
    }
    
    function _getFrames(nameParam){
        var frames = $(".keyframemarker");
        var def = "";
        var marker = "";
        
        frames.each(function( index ) {
          marker = $(this).data("markerat");
          def = def + marker + _getFrameDef(intermediateFrameSet["entry-"+this.id]);
        });
        
        return "@-webkit-keyframes "+nameParam+"{ "+def+" }";
    }
    
    function _findWebkitKeyframeAnimSelector(){
        var selectorInfo = [];
    }
    
    $(document).on("change",".keyframe-changeset-value",function(){
        var key = $(this).data("key");
        intermediateFrameSet[activeFrame][key]= $(this).val();
    });
    
    function _defineKeyFrame(nameParam){
        var info = RuleSetFinder.findRuleByName(nameParam,true);
        if(info){
            RuleSetCreator.updateRule(info[0],_getFrames(nameParam),info[1]);
        } else {
            RuleSetCreator.createNewRule(null,_getFrames(nameParam),0);
        }
    }
                           
    function _playKeyFrame(name){
        lastSelectedRuleset.element.offsetHeight = lastSelectedRuleset.element.offsetHeight;
        $(lastSelectedRuleset.element).css("-webkit-animation", name+" cubic-bezier("+$("#keyframe-timing-fn-value").val()+") "+$("#animation-duration-input").val()+"ms");
        
        //Timeline bar movement
        $("#current-time-marker")[0].offsetHeight = $("#current-time-marker")[0].offsetHeight;
        $("#current-time-marker").css("-webkit-animation", "timeline-movement"+" cubic-bezier("+$("#keyframe-timing-fn-value").val()+") "+$("#animation-duration-input").val()+"ms");
    }
                           
    $(document).on("click","#play-keyframe-animation",function(event){
        _hideSelection();
        _playKeyFrame(activeAnim);
        window.setTimeout(_showSelection,$("#animation-duration-input").val());
    });
    
    function _getAnimConfigText(){
        var iteration = $('#animation-infinite-loop:checked').length > 0 ? ' infinite' : ' '+$("#animation-loop-count").val();
        return activeAnim
        +" cubic-bezier("+$("#keyframe-timing-fn-value").val()+") "
        +$("#animation-duration-input").val()+"ms "
        +$("#animation-delay-input").val()+"ms "
        +iteration;
    }
    
    function _fetchAnimConfig(def){
        var config = null;
        var prop;
        for (prop in def) {
            if (def.hasOwnProperty(prop)) {
               config = config ? config +","+def[prop] : def[prop];
            }
        }
        return config;
    }
    
    $(document).on("click","#play-all-keyframe-animation",function(event){
        var index = 0;
        _hideSelection();
        for (index = 0;index < elementCache.length;index++) {
            if (elementCache[index] && elementAnimConfigCache[index]) {
                $(elementCache[index]).css("-webkit-animation", _fetchAnimConfig(elementAnimConfigCache[index]));
            }
        }
    });
    
    $(document).on("click","#stop-all-keyframe-animation",function(event){
        var index = 0;
        for (index = 0;index < elementCache.length;index++) {
            if (elementCache[index]) {
                $(elementCache[index]).css("-webkit-animation", "");
            }
        }
        _showSelection();
    });
      
    $(document).on("click","#apply-keyframe-animation",function(event){
        var index  = -1;
        var existingDef = null;
        if(lastSelectedRuleset){
            index = elementCache.indexOf(lastSelectedRuleset.element);
            if(index >= 0){
                existingDef = elementAnimConfigCache[index];
                existingDef[activeAnim] = _getAnimConfigText();
                elementAnimConfigCache[index] = existingDef;
            } else {
                existingDef = {};
                existingDef[activeAnim] = _getAnimConfigText();
                elementCache.push(lastSelectedRuleset.element);
                elementAnimConfigCache.push(existingDef);
            }
            
        }
    });
    
    function _createNewMarker(leftOffset,markerID){
        var marker = $(MarkerTemplate.replace("{{left}}",leftOffset+"px")
                        .replace("{{id}}",_getID().replace("keyframe-","keyframe-"+markerID))
                        .replace("{{markerat}}",parseInt(markerID)+"%"))
                    .appendTo("#frame-marker-container")
                    .css('height',(parseInt($("#keyframe-timeline-editor").css('height'))-1)+'px');
        $(FrameListEntryTemplate.replace("{{marker}}",parseInt(markerID)+"%").replace("{{id}}","entry-"+marker[0].id)).appendTo("#frame-deflist");
        intermediateFrameSet["entry-"+marker[0].id] = {};
        markersLocalSnapshot["entry-"+marker[0].id] = marker[0].outerHTML;
        changeSetLocalSnapshot["entry-"+marker[0].id] = $("#entry-"+marker[0].id)[0].outerHTML;
        $(marker).find(".framebubble").click();
        markersSnapshot[activeAnim] = markersLocalSnapshot;
        changeSetSnapshot[activeAnim] = changeSetLocalSnapshot;
    }
    
    $(document).on("mouseover",".intermediatemarker .framebubble",function(event,rulesetref){
        $(".intermediatemarker")
            .draggable({handle:'.framebubble',
                        containment : '#frame-marker-container',
                        axis: 'x',
                        helper: 'clone',
                        stop: _cloneThisMarker
                     });
    });
    
    $(document).on("mouseover",".intermediatemarker .keyframemarkerdragger",function(event,rulesetref){
        $(".intermediatemarker")
            .draggable({handle:'.keyframemarkerdragger',
                        containment : '#frame-marker-container',
                        axis: 'x',
                        drag: function(){
                            event.stopPropagation();
                            event.preventDefault();
                        },
                        helper: 'none'
                     });
    });
    
    $(document).on("ruleset-wrapper.created ruleset-wrapper.refreshed","#html-design-editor",function(event,rulesetref){
        var asynchPromise = new $.Deferred();
        lastSelectedRuleset = rulesetref;
        asynchPromise.resolve();
        return asynchPromise.promise();
    });
    
    $(document).on("deselect.all","#html-design-editor",function(event){
        lastSelectedRuleset = null;
    });
    
    function _captureCSSChanges(event,key,value){
        var asynchPromise = new $.Deferred();
        var isMarkerReqd = true;
        if(intermediateFrameSet[activeFrame][key]){
            isMarkerReqd = false;
        }
        intermediateFrameSet[activeFrame][key]= value;
        var frameOffset = $("#"+activeFrame.replace("entry-","")).css("left");
        if(changeSetProperties.indexOf(key) < 0){
            $('<li class="animentry" id="changeset-entry-'+key+'" name="'+activeAnim+'">'+key+'</li>').appendTo("#changeset-entries");
            $('<li class="animentry" id="changeset-frame-entry-'+key+'" name="'+activeAnim+'"></li>').appendTo("#changeset-frame-marker");
            changeSetProperties.push(key);
        }
        if(isMarkerReqd){
            $('<div class="changebubble" name="'+activeFrame+'"id="frame-'+key+parseInt(frameOffset)+'" title="'+value+'"><div>').appendTo('#changeset-frame-entry-'+key+'[name="'+activeAnim+'"]').css("left",frameOffset);
        } else {
            $('#changeset-frame-entry-'+key+'[name="'+activeAnim+'"]').find('#frame-'+key+parseInt(frameOffset)).attr("title",value);
        }
        _showFrameChanges();
        asynchPromise.resolve();
        return asynchPromise.promise();
    }
    
    function _showFrameChanges(frameID){
        if(!frameID){
            frameID = activeFrame;
        }
        $("#keyframe-set-entries").html("");
        var changeSet = intermediateFrameSet[frameID];
        var def = null;
        if(changeSet){
            for(var key in changeSet){
                def = changeSet[key];
                $(ChangeSetEntryTemplate.split("{{name}}").join(key).split("{{id}}").join("keyframeprop-"+key).split("{{value}}").join(def)).appendTo("#keyframe-set-entries");
            }
        }
    }
    
    function _createNewKeyFrameAnim(retain){
        if(lastSelectedRuleset){
            initialCSSSnapShot = lastSelectedRuleset.createSavePoint();
        }
        intermediateFrameSet = {};
        markersLocalSnapshot = {};
        changeSetLocalSnapshot = {};
        intermediateFrameSet["entry-keyframe-0"] = {};
        intermediateFrameSet["entry-keyframe-100"] = {};
        $("#new-keyframe-selector-value").val("anim-"+_getID());
        $(".intermediatemarker").remove();
        $("#keyframe-set-entries").html("");
        changeSetProperties = [];
        if(!retain){
            $("#changeset-entries").html("");
            $("#changeset-frame-marker").html("");
            accumulatedDefs = {};
            markersSnapshot = {};
            changeSetSnapshot = {};
            elementCache = [];
            elementAnimConfigCache = [];
        }
    }
    
    $(document).on("click","#new-keyframe-animation",function(){
        _createNewKeyFrameAnim(false);
    });
    
    
    
    $(document).on("click",".framebubble",function(event){
        $("#"+"entry-"+$(this).parent()[0].id).click();
        event.preventDefault();
        event.stopPropagation();
    });
    
    $(document).on("dblclick",".intermediatemarker .framebubble",function(event){
        var target = "entry-"+$(this).parent()[0].id;
        $(this).parent().remove();
        $(".changebubble[name="+activeFrame+"]").remove();
        $("#"+target).prev().click();
        delete intermediateFrameSet[target];
        $("#"+target).remove();
        event.preventDefault();
        event.stopPropagation();
    });
    
    $(document).on("click","#stop-capture-frame-changes",function(event){
        $("#stop-capture-frame-changes").removeClass("blinkingcaptureindicator");
        $(".activeframeblink").removeClass("activeframeblink");
        activeFrame = null;
        $("#html-design-editor").off("css-prop-modification css-prop-addition css-prop-removal", _captureCSSChanges);
        if(lastSelectedRuleset){
            lastSelectedRuleset.rollBack();
        }
    }); 
    
    $(document).on("click","#frame-defset li",function(event){
        $("#frame-defset li").removeClass("selected");
        $(this).addClass("selected");
        $(".activeframeblink").removeClass("activeframeblink");
        $("#"+this.id.replace("entry-","")).find(".framebubble").addClass("activeframeblink");
        activeFrame = this.id;
        _showFrameChanges(this.id);
        if(!isLoadingDefInProgress){
            _simulateActiveFrame();
        }
        $("#stop-capture-frame-changes").addClass("blinkingcaptureindicator");
        $("#html-design-editor").off("css-prop-modification css-prop-addition css-prop-removal", _captureCSSChanges);
        $("#html-design-editor").on("css-prop-modification css-prop-addition css-prop-removal", _captureCSSChanges);
    });
    
    $(document).on("dblclick","#frame-marker-container",function(event){
        var x = event.clientX - $(this).offset().left;
        var frameID = parseInt((x/parseInt($(this).css('width')))*100);
        _createNewMarker(x,frameID);
    });
    
    $(document).on("drag",".keyframemarker",function(){
        var frameTag = parseInt((parseInt($(this).css('left'))/parseInt($("#frame-marker-container").css('width')))*100)+"%";
        $("#entry-"+this.id).html(frameTag);
        markersLocalSnapshot["#entry-"+this.id] = this.outerHTML;
        changeSetLocalSnapshot["#entry-"+this.id] = $("#entry-"+this.id)[0].outerHTML;
        $(this).data("markerat",frameTag);
        $(".changebubble[name="+"entry-"+this.id+"]").css("left",$(this).css("left"));
        markersSnapshot[activeAnim] = markersLocalSnapshot;
        changeSetSnapshot[activeAnim] = changeSetLocalSnapshot;
    });
    
    $(document).on("stop",".keyframemarker",function(){
        var framePrcnt = (parseFloat($(this).css('left'))/parseInt($("#frame-marker-container").css('width')))*100 +"%";
        $(".changebubble[name="+"entry-"+this.id+"]").css("left",framePrcnt);
        $(this).css("left",framePrcnt);
    });
    
    function _showSelection(){
        if(lastSelectedRuleset){
            $("#selection-outline").show();
            $hLayer1.show();
            $hLayer2.show();
            $vLayer1.show();
            $vLayer2.show();
            $xOffsetAxisGrid.show();
            $yOffsetAxisGrid.show();
            $(lastSelectedRuleset.element).css("-webkit-animation", "");
            $("#current-time-marker").css("-webkit-animation", "");
        }
    }
    
    function _hideSelection(){
        $("#selection-outline").hide();
        $hLayer1.hide();
        $hLayer2.hide();
        $vLayer1.hide();
        $vLayer2.hide();
        $xOffsetAxisGrid.hide();
        $yOffsetAxisGrid.hide();
    }
    
    
    $(document).on("input","#animation-duration-input",function(){
        var timeTotal = $("#animation-duration-input").val();
        var quarterMark = timeTotal/4;
        $("#quarter-time-mark").html(quarterMark*1+"ms");
        $("#half-time-mark").html(quarterMark*2+"ms");
        $("#three-quarter-time-mark").html(quarterMark*3+"ms");
    });
    
    $(document).on("click","#save-keyframe-animation",function(event){
        _defineKeyFrame($("#new-keyframe-selector-value").val());
    });
    
    $(document).on("click","#browse-keyframe-animation",function(event){
        var defs = RuleSetFinder.findKeyFrameDefinitions();
        $("#browse-keyframe-options").html("");
        var rule = null;
        for(var i=0;i<defs.length;i++){
            rule = defs[i];
            $(KeyframeOptionTemplate.replace("{{index}}",i).replace("{{label}}",rule.name)).appendTo("#browse-keyframe-options");
        }
        $("#browse-keyframe-options-container")
        .addClass('open')
        .show();
        fetchedDefs = defs;
    });
    
    function _hideBrowseOptions(){
        $("#browse-keyframe-options-container")
        .removeClass('open')
        .hide();
    }
    
    $('html').click(function() {
        _hideBrowseOptions();
    });
    
    function _parseCSSText(cssText) {
        var returnObj = {};
        if (cssText !== "" && cssText !== undefined && cssText.split(' ').join('') !== "{}") {
            cssText = cssText.replace(/; \}/g, "}")
                .replace(/ \{ /g, "{\"")
                .replace(/: /g, "\":\"")
                .replace(/; /g, "\",\"")
                .replace(/\}/g, "\"}");
            returnObj = JSON.parse(cssText);
        }
        if (cssText === " { }") {
            returnObj = JSON.parse(cssText);
        }
        return returnObj;
    }
    
    function _createNewFrameFromDef(rule){
        if(rule.keyText === "0%" || rule.keyText === "from"){
            $("#entry-keyframe-0").click();
        } else if(rule.keyText === "100%" || rule.keyText === "to"){
            $("#entry-keyframe-100").click();
        } else {
            var percent = parseInt(rule.keyText);
            var leftOffset = (percent*parseInt($("#frame-marker-container").css('width')))/100;
            _createNewMarker(leftOffset,percent);
        }
    }
    
    function _parseFetchedKeyframeDef(def){
        isLoadingDefInProgress = true;
        var cssRules = def.cssRules;
        var rule = null;
        for ( var index = 0;index<cssRules.length;index++){
            rule = cssRules[index];
            _createNewFrameFromDef(rule);
            var props = _parseCSSText(' { '+rule.style.cssText+' }');
            var prop;
            for (prop in props) {
                if (props.hasOwnProperty(prop)) {
                    _captureCSSChanges(null,prop,props[prop]);
                }
            }
        }
        isLoadingDefInProgress = false;
        _simulateActiveFrame();
    }
    
    function _reconstructTimelineForAnim(name){
        intermediateFrameSet = accumulatedDefs[name];
        markersLocalSnapshot = markersSnapshot[name];
        changeSetLocalSnapshot = changeSetSnapshot[name];
        $(".intermediatemarker").remove();
        var marker;
        for (marker in markersLocalSnapshot) {
            if (markersLocalSnapshot.hasOwnProperty(marker)) {
                $(markersLocalSnapshot[marker]).appendTo("#frame-marker-container")
                .css('height',(parseInt($("#keyframe-timeline-editor").css('height'))-1)+'px');;
            }
        }
        
        for (marker in changeSetLocalSnapshot) {
            if (changeSetLocalSnapshot.hasOwnProperty(marker)) {
                $(changeSetLocalSnapshot[marker]).appendTo("#frame-deflist");
            }
        }
    }
    
    function _simulateActiveFrame(){
        var frameKeys = Object.keys(intermediateFrameSet);
        frameKeys.sort();
        var currentFrameIndex = frameKeys.indexOf(activeFrame);
        var differentialCSS = {};
        for(var index = 0;index<= currentFrameIndex;index++){
            $.extend(differentialCSS,intermediateFrameSet[frameKeys[index]]);
        }
        var key;
        if(lastSelectedRuleset){
            _hideSelection();
            $("#html-design-editor").off("css-prop-modification css-prop-addition css-prop-removal", _captureCSSChanges);
            lastSelectedRuleset.rollBack();
            for (key in differentialCSS) {
                if (differentialCSS.hasOwnProperty(key)) {
                    lastSelectedRuleset.css(key,differentialCSS[key]);
                }
            }
            $("#html-design-editor").on("css-prop-modification css-prop-addition css-prop-removal", _captureCSSChanges);
            window.setTimeout(function(){ //To force CSS reflow
                $("#html-design-editor").trigger("refresh.element.selection");
            },2);
            _showSelection();
        }
    }
    
    $(document).on("click","#browse-keyframe-options li a",function(event){
        var index = $(this).data('index');
        var keyFrameDef = fetchedDefs[index];
        activeAnim = keyFrameDef.name;
        $("#keyframe-selector-value").val(keyFrameDef.name);
        _createNewKeyFrameAnim(true);
        _hideInactiveAnimEntries();
        $('<li class="animheader" id="anim-'+activeAnim+'" style="background:#2d2e30;">'+activeAnim+'{}</li>').appendTo("#changeset-entries");
        $('<li class="animheader" id="anim-'+activeAnim+'" style="background:#2d2e30;padding-left:10px !important;">'+activeAnim+'{}</li>').appendTo("#changeset-frame-marker");
        $("#new-keyframe-selector-value").val(keyFrameDef.name);
        _hideBrowseOptions();
        _parseFetchedKeyframeDef(keyFrameDef);
        if(activeAnim){
            accumulatedDefs[activeAnim] = intermediateFrameSet;
            markersSnapshot[activeAnim] = markersLocalSnapshot;
            changeSetSnapshot[activeAnim] = changeSetLocalSnapshot;
        }
        event.preventDefault();
        event.stopPropagation();
    });
    
    function _showActiveAnimEntries(){
        $("#changeset-entries li[name="+activeAnim+"]").show();
        $("#changeset-frame-marker li[name="+activeAnim+"]").show();
        _reconstructTimelineForAnim(activeAnim);
    }
    
    function _hideInactiveAnimEntries(){
        $("#changeset-entries li.animentry[name!="+activeAnim+"]").hide();
        $("#changeset-frame-marker li.animentry[name!="+activeAnim+"]").hide();
    }
    
    $(document).on("click","#changeset-entries li.animheader",function(event){
        var selectedEntry = $("#changeset-entries li.animheader.selected");   
        $("#changeset-entries li.animheader.selected").removeClass("selected");
        $("#changeset-frame-marker li.animheader.selected").removeClass("selected");
        $(this).addClass("selected");
        $("#changeset-frame-marker li#"+this.id).addClass("selected");
        activeAnim = this.id.replace("anim-","");
        _hideInactiveAnimEntries();
        _showActiveAnimEntries();
    });
        
        
    
    function _cloneThisMarker(event,ui){
        var x = event.clientX - $("#frame-marker-container").offset().left;
        var frameID = parseInt((x/parseInt($("#frame-marker-container").css('width')))*100);
        _createNewMarker(x,frameID);
        
        var props = intermediateFrameSet["entry-"+event.target.id];
        var prop;
        if(props){
            isLoadingDefInProgress = true;
            for (prop in props) {
                if (props.hasOwnProperty(prop)) {
                    _captureCSSChanges(null,prop,props[prop]);
                }
            }
            isLoadingDefInProgress = false;
            _simulateActiveFrame();
        }
        markersSnapshot[activeAnim] = markersLocalSnapshot;
        accumulatedDefs[activeAnim] = intermediateFrameSet;
        changeSetSnapshot[activeAnim] = changeSetLocalSnapshot;
    }
    
    AppInit.appReady(function () {        
        $("#current-time-marker")
            .draggable({handle:'.timedragger',
                        containment : '#timeline-footer',
                        axis: 'x'
                     });
        
        $(".keyframemarker")
            .draggable({handle:'.framebubble',
                        containment : '#frame-marker-container',
                        axis: 'x',
                        helper: 'clone',
                        stop: _cloneThisMarker
                     });
        
        Resizer.makeResizable($("#keyframe-timeline-editor")[0], Resizer.DIRECTION_VERTICAL, Resizer.POSITION_BOTTOM, 200, false, undefined, false);
        
        $("#keyframe-timeline-editor").on("panelResizeUpdate", function () {
            var asynchPromise = new $.Deferred();
            $(".keyframemarker").css('height',(parseInt($("#keyframe-timeline-editor").css('height'))-1)+'px');
            $("#current-time-marker").css('height',(parseInt($("#keyframe-timeline-editor").css('height'))-19)+'px');
            asynchPromise.resolve();
            return asynchPromise.promise();
        });
        
        $("#changeset-entries").on("scroll", function(){
            $("#changeset-frame-marker").scrollTop($("#changeset-entries").scrollTop());
        });
        
        $hLayer1 = $("#h-layer1");
        $hLayer2 = $("#h-layer2");
        $vLayer1 = $("#v-layer1");
        $vLayer2 = $("#v-layer2");
        $xOffsetAxisGrid = $(".offsetHAxis");
        $yOffsetAxisGrid = $(".offsetVAxis");
    
    });
      
});