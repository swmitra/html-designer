/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";

    function _applyDesignMajorPreset(){
        $("#designer-content-placeholder").css('height','calc(100% - 4px)');
        $("#designer-content-placeholder").css('width','calc(50% - 15px)');
        
        $("#styles-editor-container").css('top','50%');
        $("#styles-editor-container").css('left','50%');
        $("#styles-editor-container").css('height','calc(50% - 24px)');
        $("#styles-editor-container").css('width','50%');
        
        $("#source-editor-container").css('top','0px');
        $("#source-editor-container").css('left','50%');
        $("#source-editor-container").css('height','calc(50% - 24px)');
        $("#source-editor-container").css('width','50%');
    }
    
    function _applySourceMajorPreset(){
        $("#designer-content-placeholder").css('height','calc(50% - 15px)');
        $("#designer-content-placeholder").css('width','calc(50% - 15px)');
        
        $("#styles-editor-container").css('top','50%');
        $("#styles-editor-container").css('left','0%');
        $("#styles-editor-container").css('height','calc(50% - 24px)');
        $("#styles-editor-container").css('width','50%');
        
        $("#source-editor-container").css('top','0px');
        $("#source-editor-container").css('left','50%');
        $("#source-editor-container").css('height','calc(100% - 24px)');
        $("#source-editor-container").css('width','50%');
    }
    
    function _applyStylesMajorPreset(){
        $("#designer-content-placeholder").css('height','calc(50% - 15px)');
        $("#designer-content-placeholder").css('width','calc(50% - 15px)');
        
        $("#source-editor-container").css('top','50%');
        $("#source-editor-container").css('left','0%');
        $("#source-editor-container").css('height','calc(50% - 24px)');
        $("#source-editor-container").css('width','50%');
        
        $("#styles-editor-container").css('top','0px');
        $("#styles-editor-container").css('left','50%');
        $("#styles-editor-container").css('height','calc(100% - 24px)');
        $("#styles-editor-container").css('width','50%');
    }
    
    function _applyDesignAndStylesSplit(){
        $("#designer-content-placeholder").css('height','calc(100% - 4px)');
        $("#designer-content-placeholder").css('width','calc(50% - 15px)');
        
        $("#styles-editor-container").css('top','0px');
        $("#styles-editor-container").css('left','50%');
        $("#styles-editor-container").css('height','calc(100% - 24px)');
        $("#styles-editor-container").css('width','50%');
    }
    
    function _applyDesignAndSourceSplit(){
        $("#designer-content-placeholder").css('height','calc(100% - 4px)');
        $("#designer-content-placeholder").css('width','calc(50% - 15px)');
        
        $("#source-editor-container").css('top','0px');
        $("#source-editor-container").css('left','50%');
        $("#source-editor-container").css('height','calc(100% - 24px)');
        $("#source-editor-container").css('width','50%');
    }
    
    exports.applyDesignMajorPreset = _applyDesignMajorPreset;
    exports.applySourceMajorPreset = _applySourceMajorPreset;
    exports.applyStylesMajorPreset = _applyStylesMajorPreset;
    
    exports.applyDesignAndStylesSplit = _applyDesignAndStylesSplit;
    exports.applyDesignAndSourceSplit = _applyDesignAndSourceSplit;
});