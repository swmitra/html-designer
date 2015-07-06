/**
 * jQuery.Ruler v1.1
 * Add Photoshop-like rulers and mouse position to a anchor element using jQuery.
 * http://ruler.hilliuse.com
 * 
 * Dual licensed under the MIT and GPL licenses.
 * Copyright 2013 Hillius Ettinoffe http://hilliuse.com
 */
;(function( $ ){

	$.fn.ruler = function(options) {
	
		var defaults = {
			vRuleSize: 18,
			hRuleSize: 18,
            hRulerTemplate:null,
            vRulerTemplate:null,
			showCrosshair : false,
			showMousePos: false,
            showSize:false,
            showGuidePos: false,
            forceCreate:false,
            xOrigin:0,
            yOrigin: 0,
            xOffset: 0,
            yOffset: 0,
            anchor: $('body'),
            guide: $('body'),
            scrollListner: $(document),
            resizeListner:$(window),
            mousePosContainer:null,
            sizeContainer:null
            
		};//defaults
        
		var settings = $.extend({},defaults,options);
        
        if(settings.forceCreate){
            settings.anchor.children('.hRule').remove();
            settings.anchor.children('.vRule').remove();
            settings.anchor.children('.corner').remove();
        }
		
		var hRule = '<div class="ruler hRule"></div>',
				vRule = '<div class="ruler vRule"></div>',
				corner = '<div class="ruler corner"></div>',
				vMouse = '<div class="vMouse"></div>',
				hMouse = '<div class="hMouse"></div>',
                vGuide = '<div class="vGuide"></div>',
				hGuide = '<div class="hGuide"></div>',
                guidePlane = '<div class="guidePlane"></div>',
				mousePosBox = '<div class="mousePosBox">x: 50%, y: 50%</div>',
                guidePosBox = '<div class="guidePosBox mousePosBox"></div>';
		
		if (true) {
			// Mouse crosshair
			if (settings.showCrosshair) {
                if($('.hMouse').length === 0 && $(".vMouse").length === 0){
				    settings.anchor.append(vMouse, hMouse);
                }
                $('.hMouse').css("height",settings.hRuleSize);
				$('.vMouse').css("width",settings.vRuleSize);
			}
			// Mouse position
			if (settings.showMousePos && !settings.mousePosContainer) {
				settings.anchor.append(mousePosBox);
			}
            
            //Guide position 
            if (settings.showGuidePos) {
                if(settings.anchor.find(".guidePosBox").length === 0 && settings.anchor.find(".guidePlane").length === 0){
                    settings.anchor.append(guidePosBox);
                }
			}
            
			// If either, then track mouse position
			if (settings.showCrosshair || settings.showMousePos) {
              $(document).on("targetdom.element.mousemove","#html-design-editor",function(e,element,point) {
					if (settings.showCrosshair) {
                        $('.vMouse').css("top",point.y+settings.hRuleSize);
						$('.hMouse').css("left",point.x+settings.vRuleSize);
					}
					if (settings.showMousePos) {
                        var $posBox = settings.mousePosContainer || $('.mousePosBox'); 
                        $posBox.html("x:" + point.x + ", y:" + point.y );
                        if(!settings.mousePosContainer){
                            $posBox.css({
                                top: e.pageY-($(document).scrollTop()) + 16,
                                left: e.pageX + 12
                            });
                        }
					}
				});
                
			}
		}
		
		//resize
		settings.resizeListner.resize(function(e){
			var $hRule = $('.hRule');
			var $vRule = $('.vRule');
			$hRule.empty();
			$vRule.empty().height(0).outerHeight($vRule.parent().outerHeight());
			
			// Horizontal ruler ticks
			var tickLabelPos = settings.vRuleSize;
			var newTickLabel = "";
            var originOffset = settings.xOrigin;
			while ( tickLabelPos <= $hRule.width() ) {
				if ((( tickLabelPos - settings.vRuleSize ) %50 ) == 0 ) {
					newTickLabel = "<div class='tickLabel'>" + ( tickLabelPos - settings.vRuleSize + originOffset ) + "</div>";
					$(newTickLabel).css( "left", tickLabelPos+"px" ).appendTo($hRule);
				} else if ((( tickLabelPos - settings.vRuleSize ) %10 ) == 0 ) {
					newTickLabel = "<div class='tickMajor'></div>";
					$(newTickLabel).css("left",tickLabelPos+"px").appendTo($hRule);
				} else if ((( tickLabelPos - settings.vRuleSize ) %5 ) == 0 ) {
					newTickLabel = "<div class='tickMinor'></div>";
					$(newTickLabel).css( "left", tickLabelPos+"px" ).appendTo($hRule);
				}
				tickLabelPos = (tickLabelPos + 5);				
			}//hz ticks
			
			// Vertical ruler ticks
			tickLabelPos = settings.hRuleSize;
			newTickLabel = "";
            originOffset = settings.yOrigin;
			while (tickLabelPos <= $vRule.height()) {
				if ((( tickLabelPos - settings.hRuleSize ) %50 ) == 0) {
					newTickLabel = "<div class='tickLabel'><span>" + ( tickLabelPos - settings.hRuleSize + originOffset ) + "</span></div>";
					$(newTickLabel).css( "top", tickLabelPos+"px" ).appendTo($vRule);
				} else if (((tickLabelPos - settings.hRuleSize)%10) == 0) {
					newTickLabel = "<div class='tickMajor'></div>";
					$(newTickLabel).css( "top", tickLabelPos+"px" ).appendTo($vRule);
				} else if (((tickLabelPos - settings.hRuleSize)%5) == 0) {
					newTickLabel = "<div class='tickMinor'></div>";
					$(newTickLabel).css( "top", tickLabelPos+"px" ).appendTo($vRule);
				}
				tickLabelPos = ( tickLabelPos + 5 );				
			}//vert ticks
		});//resize
        
        settings.scrollListner.on("scroll",function(){
            settings.anchor.find(".hRule").css('left',0 - settings.scrollListner.scrollLeft());
            settings.anchor.find(".vRule").css('top',0 - settings.scrollListner.scrollTop()); 
            $(".guidePlane").css('left',0 - settings.scrollListner.scrollLeft());
            $(".guidePlane").css('top',0 - settings.scrollListner.scrollTop());
        });
		
		return this.each(function() {
			var $this = $(this);
            var $guideContainer = settings.guide;
            
            //Check if the rulers are already initialized
            var $hRuleExisting = $this.children('.hRule');
			var $vRuleExisting = $this.children('.vRule');
            var $cornerExisting = $this.children('.corner');
            
            if($hRuleExisting.length === 0 && $vRuleExisting.length === 0){
                var ownerDocument = settings.guide[0].ownerDocument || settings.guide[0];
                if(ownerDocument === settings.guide[0]){
                   $guideContainer = $(settings.guide[0].body); 
                }
            }
			
			// Attach rulers
			
			// Should not need 1 min padding-top of 1px but it does
			// will figure it out some other time
			$this.css("padding-top", settings.hRuleSize + 1 + "px");
			if (settings.hRuleSize > 0 && $hRuleExisting.length === 0) {
                var width = settings.anchor.width();
                if(settings.guide.outerWidth() > width){
                    width = settings.guide.outerWidth();
                }
                width = width + settings.vRuleSize;
                
                if(settings.hRulerTemplate){
                    $(settings.hRulerTemplate)
                        .height(settings.hRuleSize)
                        //.width(width)
                        .offset( {top:0,left:0-settings.guide.scrollLeft()+settings.xOffset })
                        .prependTo($this);
                } else {
				    $(hRule)
                        .height(settings.hRuleSize)
                        .width(width+800)
                        .offset( {top:0,left:0-settings.guide.scrollLeft()+settings.xOffset })
                        .prependTo($this);
                }
			}
			
			if (settings.vRuleSize > 0 && $vRuleExisting.length === 0) {
                var height = settings.anchor.height();
                if(settings.guide.outerHeight() > height){
                    height = settings.guide.outerHeight();
                }
                height = height + settings.hRuleSize;
                
				var oldWidth = $this.outerWidth();
				$this.css("padding-left", settings.vRuleSize + 1 + "px").outerWidth(oldWidth);
                if(settings.vRulerTemplate){
                    $(settings.vRulerTemplate)
                        .width(settings.vRuleSize)
                        //.height(height)
                        .offset({top:0 - settings.guide.scrollTop() + settings.yOffset, left:0})
                        .prependTo($this);
                } else {
				    $(vRule)
                        .width(settings.vRuleSize)
                        .height(height + 800)
                        .offset({top:0 - settings.guide.scrollTop() + settings.yOffset, left:0})
                        .prependTo($this);
                }
			}
			
			if ( (settings.vRuleSize > 0) && (settings.hRuleSize > 0) && $cornerExisting.length === 0 ) {
				$(corner).css({
					width: settings.vRuleSize,
					height: settings.hRuleSize
				}).prependTo($this);
			}
			
			
			var $hRule = $this.children('.hRule');
			var $vRule = $this.children('.vRule');
            var $corner = $this.children('.corner');
            
            $(".guidePlane").css('height',$vRule.css('height'));
            $(".guidePlane").css('width',$hRule.css('width'));
            
            $corner.unbind("click");
            $corner.click(function(){
                settings.guide.scrollLeft(0-settings.xOrigin);
                settings.guide.scrollTop(0-settings.yOrigin);
            });
            
            $corner.unbind("dblclick");
            $corner.dblclick(function(){
                $(".hGuide").remove();
                $(".vGuide").remove();
            });
            
            $hRule.unbind("dblclick");
            $hRule.dblclick(function(){
                $(".hGuide").remove();
            });
            
            $vRule.unbind("dblclick");
            $vRule.dblclick(function(){
                $(".vGuide").remove();
            });
		
			
            if(!settings.hRulerTemplate && $hRuleExisting.length === 0){
                // Horizontal ruler ticks
                var tickLabelPos = settings.vRuleSize;
                var newTickLabel = "";
                var originOffset = settings.xOrigin;
                while ( tickLabelPos <= $hRule.width() ) {
                    if ((( tickLabelPos - settings.vRuleSize ) %50 ) == 0 ) {
                        newTickLabel = "<div class='tickLabel'>" + ( tickLabelPos - settings.vRuleSize + originOffset ) + "</div>";
                        $(newTickLabel).css( "left", tickLabelPos+"px" ).appendTo($hRule);
                    } else if ((( tickLabelPos - settings.vRuleSize ) %10 ) == 0 ) {
                        newTickLabel = "<div class='tickMajor'></div>";
                        $(newTickLabel).css("left",tickLabelPos+"px").appendTo($hRule);
                    } else if ((( tickLabelPos - settings.vRuleSize ) %5 ) == 0 ) {
                        newTickLabel = "<div class='tickMinor'></div>";
                        $(newTickLabel).css( "left", tickLabelPos+"px" ).appendTo($hRule);
                    }
                    tickLabelPos = (tickLabelPos + 5);				
                }//hz ticks
            }
            
            
			if(!settings.vRulerTemplate && $vRuleExisting.length === 0){
                // Vertical ruler ticks
                tickLabelPos = settings.hRuleSize;
                newTickLabel = "";
                originOffset = settings.yOrigin;
                while (tickLabelPos <= $vRule.height()) {
                    if ((( tickLabelPos - settings.hRuleSize ) %50 ) == 0) {
                        newTickLabel = "<div class='tickLabel'><span>" + ( tickLabelPos - settings.hRuleSize + originOffset ) + "</span></div>";
                        $(newTickLabel).css( "top", tickLabelPos+"px" ).appendTo($vRule);
                    } else if (((tickLabelPos - settings.hRuleSize)%10) == 0) {
                        newTickLabel = "<div class='tickMajor'></div>";
                        $(newTickLabel).css( "top", tickLabelPos+"px" ).appendTo($vRule);
                    } else if (((tickLabelPos - settings.hRuleSize)%5) == 0) {
                        newTickLabel = "<div class='tickMinor'></div>";
                        $(newTickLabel).css( "top", tickLabelPos+"px" ).appendTo($vRule);
                    }
                    tickLabelPos = ( tickLabelPos + 5 );				
                }//vert ticks
            }
			
		});//each		
		
	};//ruler
})( jQuery );