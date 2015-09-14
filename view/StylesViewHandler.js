/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";

    var AppInit = brackets.getModule("utils/AppInit"),
        FileUtils = brackets.getModule("file/FileUtils"),
        Resizer = brackets.getModule("utils/Resizer"),
        CommandManager = brackets.getModule("command/CommandManager"),
        DocumentManager = brackets.getModule("document/DocumentManager"),
        EditorManager = brackets.getModule("editor/EditorManager");
    
    var CodeMirror = brackets.getModule("thirdparty/CodeMirror2/lib/codemirror");
    
    var ViewPresentationPresets = require("view/ViewPresentationPresets");
    
    var CSSCustomParser = require("view/CSSParser");
    var RuleSetCreator = require('stylemodule/RuleSetCreator');
    var CSSNodeFormatter = require('stylemodule/CSSNodeFormatter');
    
    var CSSUtils = brackets.getModule("language/CSSUtils");
    var InlineSelectorEntry = '<li class="topcoat-list__item" style="cursor:move" title="{{title}}">{{selector}}</li>';
    
    var rulesAST = null;
    var stylesEditor = null;
    var styleModule = null;
    var currentApplication = null;
    var existingEditors = {};
    var currentEditor = null;
    var currentDoc = null;
    
    
    $(document).on("application.context","#html-design-editor", function(event,applicationKey){
         currentApplication = applicationKey;
    });
    
    /*$(document).on('click',"#styles-editor-minimize",function(){
        $("#source-editor-maximize").click();
        ViewPresentationPresets.applyDesignAndSourceSplit();
        $("#styles-editor-container").addClass("minimizedCSSView");
    });
    
    $(document).on('click',"#styles-editor-maximize",function(){
        $("#styles-editor-container").removeClass("minimizedCSSView");
    });*/
    
    $(document).on('click',"#styles-editor-close",function(){
        $("#styles-editor-container").hide();
    });

    function _quitStylesView() {
        $("#styles-editor-container").hide();
    }
    
    function _showStylesView() {
        $("#styles-editor-container").show();
        if(stylesEditor){
            stylesEditor.refresh();
            stylesEditor.focus();
        }
    }
    
    function _createStylesheetOptions(styleSheets){
        /*$("#stylesheet-file-select").html("");
        var styleSelect = $("#stylesheet-file-select")[0];*/
        $('.stylesheet-list').html('');
        var styleSelect = $('.stylesheet-list');
        var newOption;
        
        var sheetCount, setCount, styleSheet;
        for (sheetCount = 0; sheetCount < styleSheets.length ; sheetCount++) {
            styleSheet = styleSheets[sheetCount];
            newOption = document.createElement("option");
            newOption.text = FileUtils.getBaseName(styleSheet.href);
            newOption.value = styleSheet.href;
            newOption.title = styleSheet.href;
            styleModule[styleSheet.href] = styleSheet;
            styleSelect.append(newOption);
        }        
    }
    
    function _createSelectorList(){
        rulesAST = CSSCustomParser.praseCSS(stylesEditor.getDoc().getValue()).stylesheet.rules;
        $(".selectors-list").html("");
        var entry = null;
        for( var count=0;count<rulesAST.length;count++){
            entry = rulesAST[count];
            if(entry.name || entry.selectors ){
                $(InlineSelectorEntry
                  .replace("{{title}}","")
                  .replace("{{selector}}", entry.name || entry.selectors.join(', ')))
                .appendTo(".selectors-list").data("position",JSON.stringify(entry.position.start));
            }
            $(".selectors-list").sortable({
                start: function(event, ui) {
                        var start_pos = ui.item.index();
                        ui.item.data('start_pos', start_pos);
                    },
                update: function (event, ui) {
                        var start_pos = ui.item.data('start_pos');
                        var end_pos = ui.item.index();
                        var styleSheet = styleModule[$("#stylesheet-file-select").val()];
                        var ruleText = styleSheet.cssRules[start_pos].cssText;  
                        styleSheet.insertRule(ruleText, end_pos);
                        styleSheet.deleteRule(start_pos > end_pos ? start_pos + 1 : start_pos );
                        if(styleSheet.href){
                            DocumentManager.getDocumentForPath(styleSheet.href.replace(brackets.platform === 'mac' ? 'file://' : 'file:///' ,'').split('?')[0].split("%20").join(" "))
                                    .done(function (doc) {
                                        $("#html-design-editor").trigger('before.cssdoc.save');
                                        var styleText = CSSNodeFormatter.formatCSSAsText(styleSheet,false);
                                        doc.setText(styleText);
                                        $("#html-design-editor").trigger('after.cssdoc.save');
                                        $("#html-design-editor").trigger("cssdoc.changed",[currentApplication,doc]);
                                        //_showCSSTextFromStylesheet($("#stylesheet-file-select").val());
                                    });
                        }
                    }
            });
        }
    }
    
    function _showCSSTextFromStylesheet(path){
        DocumentManager.getDocumentForPath(path.replace(brackets.platform === 'mac' ? 'file://' : 'file:///','').split('?')[0].split("%20").join(" "))
            .done(function (doc) {
                if(currentEditor){
                    currentEditor.setVisible(false,true);
                }
                if(existingEditors[doc]){
                    currentEditor = existingEditors[doc];
                    currentEditor.focus();
                }else{
                    currentEditor = EditorManager
                        .createInlineEditorForDocument(
                            doc
                            , null
                            , $("#styles-inline-editor")[0]
                        ).editor;
                    existingEditors[doc] = currentEditor;
                    currentEditor.focus();
                    doc.addRef();
                }
                currentEditor.setVisible(true,true);
                
                stylesEditor = currentEditor._codeMirror;
                currentDoc = doc;
                $("#styles-inline-editor > *").css('height', '100%');
                stylesEditor.off("change",_dynamicUpdateHandler);
                _createSelectorList();
                stylesEditor.refresh();
                stylesEditor.on("change",_dynamicUpdateHandler);
            });
    }
    
    function _showCSSTextFromNetworkStylesheet(path){
        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var doc = DocumentManager.createUntitledDocument(path,".css");
                doc.setText(xmlhttp.responseText);
                if(currentEditor){
                    currentEditor.setVisible(false,true);
                }
                if(existingEditors[doc]){
                    currentEditor = existingEditors[doc];
                    currentEditor.focus();
                }else{
                    currentEditor = EditorManager
                        .createInlineEditorForDocument(
                            doc
                            , null
                            , $("#styles-inline-editor")[0]
                        ).editor;
                    existingEditors[doc] = currentEditor;
                    currentEditor.focus();
                    doc.addRef();
                }
                currentEditor.setVisible(true,true);
                
                stylesEditor = currentEditor._codeMirror;
                currentDoc = doc;
                $("#styles-inline-editor > *").css('height', '100%');
                stylesEditor.off("change",_dynamicUpdateHandler);
                _createSelectorList();
                stylesEditor.refresh();
                stylesEditor.on("change",_dynamicUpdateHandler);
            }
        }
        xmlhttp.open("GET", path, true);
        xmlhttp.send();
    }
    
    function _getCSSText(stylesheetentry){ 
        var declaration;
        var selector = stylesheetentry.selectors.join(', ');
        var cssText = selector+" {\n";
        for(var count = 0 ; count < stylesheetentry.declarations.length ;count++){
            declaration = stylesheetentry.declarations[count];
            cssText = cssText + declaration.property + ":" + declaration.value + ";\n";
        }
        cssText = cssText + "}";
        return cssText;
    }
    
    function _handleRuleUpdate(index){
        var entry = CSSCustomParser.praseCSS(stylesEditor.getDoc().getValue()).stylesheet.rules[index - 1]; 
        if(!entry){
            return;
        }
        var styleSheet = styleModule[$("#stylesheet-file-select").val()];
        if(entry.selectors && index >= -1){
            styleSheet.insertRule(_getCSSText(entry), index - 1);
            styleSheet.deleteRule(index);
        }
    }
    
    function _handleRuleAddition(index,delta){
        if(index < 0){
            return;
        }
        var entry = CSSCustomParser.praseCSS(stylesEditor.getDoc().getValue()).stylesheet.rules[index]; 
        if(!entry){
            return;
        }
        var styleSheet = styleModule[$("#stylesheet-file-select").val()];
        styleSheet.insertRule(_getCSSText(entry), index);
    }
    
    function _handleRuleDeletion(index,delta){
        if(index < 0){
            return;
        }
        var styleSheet = styleModule[$("#stylesheet-file-select").val()];
        styleSheet.deleteRule(index);
    }
    
    function _detectUpdateTypeAndHandle(before,after,removed,text){
        var styleSheet;
        var ruleStartIndex = CSSCustomParser.praseCSS(before).stylesheet.rules.length;
        if(removed){
           styleSheet = CSSUtils.extractAllSelectors(removed);
           if(styleSheet.length > 0){
               _handleRuleDeletion( ruleStartIndex,
                                    CSSCustomParser.praseCSS(removed).stylesheet);
           } else {
               _handleRuleUpdate(ruleStartIndex);
           }
        } else if(text){
           styleSheet = CSSUtils.extractAllSelectors(text);
           if(styleSheet.length > 0){
               _handleRuleAddition( ruleStartIndex,
                                    CSSCustomParser.praseCSS(text).stylesheet);
           } else {
               _handleRuleUpdate(ruleStartIndex);
           }
        }
        //currentDoc.markDirty();
        $("#html-design-editor").trigger("cssdoc.changed",[currentApplication,currentDoc]);
        $("#html-design-editor").trigger("refresh.element.selection",[true]);
        _createSelectorList();
        //_propagateChangesToInMemoryDoc();
    }
    
    function _dynamicUpdateHandler(cm, change){
      var from = change.from;
      var text = change.text.join("\n");
      var removed = change.removed.join("\n");
      var to =  cm.posFromIndex(cm.indexFromPos(from) + text.length);

      var before = cm.getRange({ line: 0, ch: 0 }, from);
      var after = cm.getRange(to, { line: cm.lineCount() + 1, ch: 0 });
      _detectUpdateTypeAndHandle(before,after,removed,text);
    }
    
    $(document).on("change","#stylesheet-file-select",function(event){
        var path = $("#stylesheet-file-select").val();
        if(path.trim().indexOf('http') === 0){
            _showCSSTextFromNetworkStylesheet(path);
        } else {
            _showCSSTextFromStylesheet(path);
        }        
    });
    
    $(document).on("stylesheets-in-dom","#html-design-editor",function(event, styleSheets){
        styleModule = {};
        _createStylesheetOptions(styleSheets);
        if(styleSheets.length > 0){
            var path = styleSheets[0].href;
            if(path.trim().indexOf('http') === 0){
                _showCSSTextFromNetworkStylesheet(path);
            } else {
                _showCSSTextFromStylesheet(path);
            } 
        }
    });
    
    $(document).on("refresh-split-view","#html-design-editor",function(){
        if(stylesEditor){
            stylesEditor.refresh();
        }
    });
    
    $(document).on('before.cssdoc.save',"#html-design-editor",function(){
        if(stylesEditor){
            stylesEditor.off("change",_dynamicUpdateHandler);
        }
    });
    
    $(document).on('after.cssdoc.save',"#html-design-editor",function(){
        if(stylesEditor){
            stylesEditor.on("change",_dynamicUpdateHandler);
        }
    });
    
    $(document).on("click",".topcoat-list__item",function(event){
        var cursorPos = JSON.parse($(this).data("position"));
        stylesEditor.getDoc().setCursor({line:cursorPos.line - 1,ch:cursorPos.column},{scroll:true});
    });

    function _init(){
        Resizer.makeResizable($("#styles-editor-container")[0], Resizer.DIRECTION_HORIZONTAL, Resizer.POSITION_RIGHT, 100, false, undefined, false);
        Resizer.makeResizable($("#styles-editor-container")[0], Resizer.DIRECTION_VERTICAL, Resizer.POSITION_BOTTOM, 100, false, undefined, false);
        
        $("#styles-editor-container").on("panelResizeUpdate", function () {
            stylesEditor.refresh();
        });
    }
    
    $(document).on('css-file-select-requested',"#html-design-editor",function(event,value,index){
        if(value){
            _showStylesView();
            $("#stylesheet-file-select").val(value);
            $("#stylesheet-file-select").trigger("change");
            if(index){
                window.setTimeout(function(){
                    if(currentEditor){
                        currentEditor.focus();
                    }
                    $( ".selectors-list li:nth-child("+index+")" ).click();
                },100);
            }
        }
    });
    
    exports.launch = _showStylesView;
    exports.hide = _quitStylesView;
    exports.init = _init;
});