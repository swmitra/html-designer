====================
html-designer
====================

An extension for the popular open-source code editor Brackets to design and customize web UI with HTML and CSS

![Basic UI](https://github.com/swmitra/html-designer-user-guide/blob/master/demo/Intro.gif)

--------
How to enable Design Mode?
--------

When a document with ".html/.shtml" is opened in active editor as current document the "CodeView" button drop down is visible in the bottom right corner ( in StatusBar before 'extension' DropDown ). Please refer to the following image to have an illustration of the position and view options. 
![View Options](https://github.com/swmitra/html-designer-user-guide/blob/master/Getting%20Started/ViewOptionMenu.png)

Here is a small animation to depict how to enable Design Mode. 

![Enable Design Mode](https://github.com/swmitra/html-designer-user-guide/blob/master/Getting%20Started/EnableDesignView.gif)

NOTE: If you enable Design Mode and then navigate to another html file , Design Mode will be retained and the new document will be rendered in Design Mode. But if you navigate to any non html file while in Design Mode , the editor will switch back to code view and if you wish to enable Design Mode for the next html file you open , you need to follow the view options menu again described earlier. 

--------
Features
--------

* WYSIWYG design editor to design and customize HTML pages
* Rendering of HTML page with Split view support for stylesheet editing and HTML page source editing
* Illustration controls for popular CSS properties like -
	* Layout ( BoxModel)
		* All CSS layout support
		* Reference anchoring change by retaining current position( when element is positioned)
		* Layouting parameters change by retaining current position
		* Intelligent unit persistance and incr/decr logic based on unit present in target selector 	  
	* Background Properties
	* Shadow Properties
	* Transformation properties
	* Border Properties
	* Transition Animation(with Preview)
	* CSS3 Keyframe animation(With Preview)
* Automatic CSS selector selection based on specificity for property change persistence
* User can override tools automatic selection for property change presistense 
* Drag Selection to position ( Decision tree driven property selection for positioning a positioned or non-positioned element )
* Drag Resize controls to Resize
* Precise positioning by using arrow keys to shift by 1 pixel
* Precise Resizing by using shift+arrow keys to increase/decrease height/width by 1 pixel
* Shift+Drag to change containment 
* Alt+Click to do layered selection
* Element serach by using jquery selector
* On-Demand sandboxing of application iFrame to stop JS execution
* HTML attribute editing using intutive input controls
* Drag Border radius control points to change radius for one corner
* Shift+Drag Border radius control point to change radius for all corners
* Ctrl+Drag to copy/Clone ( nested )
* Double Click a selected element to open inner HTML editor non-modal popup
* MultiSelect by Ctrl+Click
* Multiselect by drawing control rect
* Alignment on multiselected elements
* Cut/Copy/Paste of elements using context menu

**Information Overlay**
------------
------------
* Offset Markers with Offset values
* Element position reference axis ( x and y)
* Current containment and prospective containment based on mouse interaction while editing containment using Shift+Drag
* Border radius focal point for rx and ry
* Selection Rectangle

**Ruler and Grid**
------------
------------
* Ruler and Grid support with pixel calibration
* On Demand grids by clicking on Rulers
* Dynamic position of Grids drawn
* Lockable grid lines
* Show/Hide of Grid lines 
* Clear Grid lines 
* Options accessible from right click context menu at grid corner block

**Skeleton Snapshots**
------------
------------
The following snapshots will show the different controls and their access source

![Designer Launch option](https://github.com/swmitra/html-designer-user-guide/blob/master/Getting%20Started/View-Options.png)

![Designer Skeleton](https://github.com/swmitra/html-designer-user-guide/blob/master/Getting%20Started/Designer-skeleton.png)

![Designer Split view](https://github.com/swmitra/html-designer-user-guide/blob/master/Getting%20Started/Split-view-skeleton.png)

![Illustration controls](https://github.com/swmitra/html-designer-user-guide/blob/master/Getting%20Started/CSS-illustration-controls.png)

![HTML Attributes](https://github.com/swmitra/html-designer-user-guide/blob/master/Getting%20Started/HTML-attributes-editor.png)

![HTML Attributes input controls](https://github.com/swmitra/html-designer-user-guide/blob/master/Getting%20Started/attributes-input-control.png)

![CSS Text controls](https://github.com/swmitra/html-designer-user-guide/blob/master/Getting%20Started/Text-controls.png)

------------
Installation
------------

Can be used as a Brackets extension only in its current form.
Install [Brackets](http://brackets.io).
GoTo Extension Manager --> Available tab and search for "html-designer"

-------
Licence
-------

html-designer is released under MIT License.

-------
Contact
-------

For queries and discussions, please contact: swagatammitra@gmail.com

Moreover any contribution towards stabilization or new feature addition is most welcome

----
TODO
----

* Stabilization of split view feature
* Undo Redo from design context ( as of now switch to code view to do the same )
* Media query support
* Pseudo element illustration
* Revamp of Transform control with 3D support
