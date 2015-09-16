/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var AppInit       = brackets.getModule("utils/AppInit");
    var lastSelectedRuleset = null;
    
    function _synchWithDOM(){
        $("#text-toolbox div .text-toolbox-icon-button").removeClass('activeTextControl');
        
        if(lastSelectedRuleset){
            $('#text-color-input').val(lastSelectedRuleset.css("color"));
            $('#text-bg-color-input').val(lastSelectedRuleset.css("background-color"));
            var alignValue = lastSelectedRuleset.css("text-align"),
                decoration = lastSelectedRuleset.css("text-decoration"),
                transform = lastSelectedRuleset.css("text-transform"),
                style = lastSelectedRuleset.css("font-style"),
                fontweight = lastSelectedRuleset.css("font-weight");
            
            $('#align-button-holder .text-toolbox-icon-button[name="'+alignValue+'"]').addClass('activeTextControl');
            $('#transform-button-holder .text-toolbox-icon-button[name="'+transform+'"]').addClass('activeTextControl');
            $('#decoration-button-holder .decoration-button[name="'+decoration+'"]').addClass('activeTextControl');
            $('#decoration-button-holder .style-button[name="'+style+'"]').addClass('activeTextControl');
            $("#text-size-input").val(lastSelectedRuleset.css("font-size"));
            $("#line-height-input").val(lastSelectedRuleset.css("line-height"));
            $("#text-indent-input").val(lastSelectedRuleset.css("text-indent"));
            $('#text-direction-select').val(lastSelectedRuleset.css("direction"));
            if(fontweight){
                switch(fontweight){
                    case "bold":
                    case "bolder":
                    case "700":
                    case "800":
                    case "900":$('#decoration-button-holder .weight-button').addClass('activeTextControl');break;
                }
            }
        }else {
            $('#text-color-input').val("");
            $('#text-bg-color-input').val("");
        }
    }
    
    $(document).on("ruleset-wrapper.created ruleset-wrapper.refreshed","#html-design-editor",function(event,rulesetref){
        var asynchPromise = new $.Deferred();
        if(rulesetref && rulesetref !== lastSelectedRuleset){
            lastSelectedRuleset = rulesetref;
            _synchWithDOM();
        }
        lastSelectedRuleset = rulesetref;
        return asynchPromise.promise();
    });
    
    $(document).on("click","#text-toolbox-anchor",function(event){
        $("#text-toolbox").show();
        event.preventDefault();
        event.stopPropagation();
    });
    
    $(document).on("click","#text-toolbox-close",function(event){
        $("#text-toolbox").hide();
        event.preventDefault();
        event.stopPropagation();
    });
    
    $(document).on("change blur","#text-size-input",function(event){
         lastSelectedRuleset.css("font-size",$("#text-size-input").val()||"");
         lastSelectedRuleset.persist();
     });
    
    $(document).on("change blur","#line-height-input",function(event){
         lastSelectedRuleset.css("line-height",$("#line-height-input").val()||"");
         lastSelectedRuleset.persist();
     });
    
    $(document).on("change blur","#text-indent-input",function(event){
         lastSelectedRuleset.css("text-indent",$("#text-indent-input").val()||"");
         lastSelectedRuleset.persist();
     });
    
    function _handleIncrDecr(event){
        var UP = 38,
            DOWN = 40;
        
       if($("#html-design-template").is(':visible')){
           if(event.which === UP || event.which === DOWN){
               if($("#text-size-input:focus,#line-height-input:focus,#text-indent-input:focus").length > 0 && $("textarea:focus").length === 0){
                   var value = $("#text-size-input:focus,#line-height-input:focus,#text-indent-input:focus").val();
                   var numericValue = parseInt(value);
                   switch(event.which){
                       case UP: value = value.replace(''+numericValue,numericValue+1);break;
                       case DOWN: value = value.replace(''+numericValue,numericValue - 1 < 0 ? 0 :numericValue - 1);
                   }
               }
               $("#text-size-input:focus,#line-height-input:focus,#text-indent-input:focus").val(value);
               $("#text-size-input:focus,#line-height-input:focus,#text-indent-input:focus").trigger("change");
            }
        } 
     }

     $(window).on('keydown',_handleIncrDecr);
    
     $(document).on("click","#align-button-holder .text-toolbox-icon-button",function(event){
         lastSelectedRuleset.css("text-align",$(this).attr("name")||"");
         lastSelectedRuleset.persist();
         $("#align-button-holder .activeTextControl").removeClass('activeTextControl');
         if($(this).attr("name")){
             $(this).addClass('activeTextControl');
         }
     });
    
    $(document).on("click","#transform-button-holder .text-toolbox-icon-button",function(event){
         lastSelectedRuleset.css("text-transform",$(this).attr("name")||"");
         lastSelectedRuleset.persist();
         $("#transform-button-holder .activeTextControl").removeClass('activeTextControl');
         if($(this).attr("name")){
             $(this).addClass('activeTextControl');
         }
     });
    
     $(document).on("click","#reset-text-decoration",function(event){
         lastSelectedRuleset.css("text-decoration","");
         lastSelectedRuleset.css("font-style","");
         lastSelectedRuleset.css("font-weight","");
         lastSelectedRuleset.persist();
         $("#decoration-button-holder .activeTextControl").removeClass('activeTextControl');
     });
    
     $(document).on("click","#decoration-button-holder .text-toolbox-icon-button",function(event){
         lastSelectedRuleset.css($(this).data("key"),$(this).data("value")||"");
         lastSelectedRuleset.persist();
         var currKey = $(this).data("key");
         $("#decoration-button-holder .activeTextControl").each(function(index){
             if($(this).data("key") === currKey){
                  $(this).removeClass('activeTextControl');
             }
         });
        
         if($(this).data("value") !== "normal"){
             $(this).addClass('activeTextControl');
         }
     });
    
    function _updateTextColor(hexColor){
         lastSelectedRuleset.css("color",$('#text-color-input').val());
         lastSelectedRuleset.persist();
    }
    
    function _updateTextBGColor(hexColor){
         lastSelectedRuleset.css("background-color",$('#text-bg-color-input').val());
         lastSelectedRuleset.persist();
    }
    
    $(document).on("change","#text-direction-select",function(event){
        lastSelectedRuleset.css("direction",$('#text-direction-select').val());
        lastSelectedRuleset.persist();
    });
    
    $(document).on("click","#orientation-container .topcoat-button",function(event){
         lastSelectedRuleset.css("direction","");
         lastSelectedRuleset.persist();
     });
    
    $(document).on('focus','#text-color-input',function(event){
        $('#text-color-input').colorpicker('setValue', $('#text-color-input').val());
    });
    
    $(document).on('focus','#text-bg-color-input',function(event){
        $('#text-bg-color-input').colorpicker('setValue', $('#text-bg-color-input').val());
    });
    
     AppInit.appReady(function () {
        $('#text-color-input').colorpicker().on('changeColor.colorpicker', function(event){
          _updateTextColor(event.color.toHex());
        });

        $('#text-bg-color-input').colorpicker().on('changeColor.colorpicker', function(event){
          _updateTextBGColor(event.color.toHex());
        });
     });
        
});