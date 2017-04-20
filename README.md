Anno Modal 
 
Image Lightbox that provides a simple and nice way to create modal image dialogs that makes annotation possible.

•  Native Javascript: no Jquery, MooTools, Dojo, etc needed  •  Easy to implement  •  Fast  •  Ready in minutes  •  PHP script included  •  Ai file included  •  For all pages

![img1](http://www.eyeflash.nl/images/1.png)


	
Key features :

* Easy installation
* Native No Jquery, MooTools, Dojo, etc needed
* Fast
* Annotate images with ease
* Original image is untouched, annotated layer is saved separately
* Browse easily between images on your page while making annotations
* Auto save
* use signature feature to capture signatures
* zoom to the original size
* Touch & mouse driven
* Lot of Options to control the Anno Modal


Try

http://www.eyeflash.nl/anno_modal/

example code page
	<head>
    	<link rel="stylesheet" href="css/anno_modal.css" type="text/css" />
	</head>
    <body>
    	 <!-- <img src="images/6_thb.jpg" height="300" alt="" filename="images/6.jpg" class="anno-this">
        <img src="images/6_thb.jpg" height="300" alt="" filename="images/6.jpg" class="anno-this">-->
    
    <!-- End of page -->
    <script type="text/javascript" src="js/anno_modal_min.js"></script>
	<script>
    	document.addEventListener("DOMContentLoaded", function(event) {
        	anno_modal.init({
            	preloadAnotation:true,
            	onSave:function(i){
            	document.querySelectorAll(".anno-this")[i.index].setAttribute('src',i.imagedata);
            	}
        	});
    	});
	</script>
    
