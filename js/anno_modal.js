/*
 * AnnoModal - Native Javascript
 * Copyright (c) 2015 Jan-Peter Bom (http://www.eyeflash.nl)
 * Documentation (http://)
 * Licensed under Regular license
 */
/**
 * AnnoModal is a Javascript/PHP Lightbox that provides a simple
 * and nice way to present and annotate images on your web page.
 *
 * AnnoModal has been tested in the following browsers:
 * - IE 9 +
 * - Firefox 2, 3
 * - Safari 3, 4
 * - Chrome
 *
 * @name Anno_Modal
 * @type jQuery
 * @requires jQuery v1.8+
 * @cat Plugins/WebPage
 * @author an-Peter Bom (http://www.eyeflash.nl)
 * @version 1.0.0
 */
/**global ActiveXObject: false **/
var anno_modal = (function () {
    'use strict';
    var _annotoolSelected = 'Pencil';
    var undoRedo = [];
    var colorpicker = ["#331900", "#333300", "#193300", "#003300", "#003319", "#003333", "#001933", "#000033", "#190033", "#330033", "#330019", "#000000", "#663300", "#666600", "#336600", "#006600", "#006633", "#006666", "#003366", "#000066", "#330066", "#660066", "#660033", "#202020", "#994C00", "#999900", "#4C9900", "#009900", "#00994C", "#009999", "#004C99", "#000099", "#4C0099", "#990099", "#99004C", "#404040", "#CC6600", "#CCCC00", "#66CC00", "#00CC00", "#00CC66", "#00CCCC", "#0066CC", "#0000CC", "#6600CC", "#CC00CC", "#CC0066", "#606060", "#FF8000", "#FFFF00", "#80FF00", "#00FF00", "#00FF80", "#00FFFF", "#0080FF", "#0000FF", "#7F00FF", "#FF00FF", "#FF007F", "#808080", "#FF9933", "#FFFF33", "#99FF33", "#33FF33", "#33FF99", "#33FFFF", "#3399FF", "#3333FF", "#9933FF", "#FF33FF", "#FF3399", "#A0A0A0", "#FFB266", "#FFFF66", "#B2FF66", "#66FF66", "#66FFB2", "#66FFFF", "#66B2FF", "#6666FF", "#B266FF", "#FF66FF", "#FF66B2", "#C0C0C0", "#FFCC99", "#FFFF99", "#CCFF99", "#99FF99", "#99FFCC", "#99FFFF", "#99CCFF", "#9999FF", "#CC99FF", "#FF99FF", "#FF99CC", "#E0E0E0", "#FFE5CC", "#FFFFCC", "#E5FFCC", "#CCFFCC", "#CCFFE5", "#CCFFFF", "#CCE5FF", "#CCCCFF", "#E5CCFF", "#FFCCFF", "#FFCCE5", "#FFFFFF"];
    var currentColor = 0;
    var unStep = -1;
    var _curColor = '#fff';
    var context = '';
    var drawcontext = '';
    var _thiswidth = 900;
    var _allimages = '';
    var _thisheight = 900;
    var _canvasheight = 0;
    var _savedbefore = false;
    var _needsSave = false;
    var _minheight = 400;
    var _isDown = false;
    var points = [];
    var isDrawing = false;
    var kfCanvas;
    var isinternetexplorer = false;
    var fillrect = true;
    var fillcirc = true;
    var fillpen = true;
    var drawcanvas;
    var dothisafter = '';
    var qS = function (elem) {
        return document.querySelector(elem);
    };
    var qSA = function (elem) {
        return document.querySelectorAll(elem);
    };
    function isIE() {
        var myNav = navigator.userAgent.toLowerCase();
        return (myNav.indexOf('msie') !== -1) ? parseInt(myNav.split('msie')[1], 10) : false;
    }
    function sR(url, callback, postData) {
        var http = new XMLHttpRequest();
        http.open("POST", url, true);
        http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        http.onreadystatechange = function () {
            if (http.readyState !== 4) {

                return;
            }
            if (http.status !== 200 && http.status !== 304) {

                return;
            }
            callback(http.responseText);


        };
        http.send(postData);
    }

    return {
        historySave: function () {
            unStep++;
            while (undoRedo.length > 20) {
                undoRedo.shift();
                unStep--;
            }
            if (unStep !== 0 && unStep < undoRedo.length) {
                undoRedo.length = unStep;
                unStep++;
            } else {
                undoRedo.length = unStep;
            }
            undoRedo.push(kfCanvas.toDataURL());
            anno_modal.Resetselected(_annotoolSelected);
            anno_modal.undoredorefresh();
            _needsSave = true;
        },
        undoredorefresh: function () {
            qS("#annomodalundo").style.display = 'none';
            qS("#annomodalredo").style.display = 'none';
            qS("#annomodalundo_n").style.display = '';
            qS("#annomodalredo_n").style.display = '';
            if (unStep > 0) {
                qS("#annomodalundo").style.display = '';
                qS("#annomodalundo_n").style.display = 'none';
            }
            if (unStep < undoRedo.length - 1) {
                qS("#annomodalredo").style.display = '';
                qS("#annomodalredo_n").style.display = 'none';
            }
        },
        Undo: function () {
            if (unStep > -1) {
                unStep--;
                var canvasPic = new Image();
                canvasPic.src = undoRedo[unStep];
                canvasPic.onload = function () {
                    context.clearRect(0, 0, _thiswidth, _canvasheight);
                    context.drawImage(canvasPic, 0, 0);
                };
                anno_modal.undoredorefresh();
            }
        },
        Redo: function () {
            if (unStep < undoRedo.length - 1) {
                unStep++;
                var canvasPic = new Image();
                canvasPic.src = undoRedo[unStep];
                canvasPic.onload = function () {
                    context.clearRect(0, 0, _thiswidth, _canvasheight);
                    context.drawImage(canvasPic, 0, 0);
                };
                anno_modal.undoredorefresh();
            }
        },
        Clear: function () {
            if (unStep > -1) {
                unStep = 0;
                var canvasPic = new Image();
                canvasPic.src = undoRedo[unStep];
                canvasPic.onload = function () {
                    context.clearRect(0, 0, _thiswidth, _canvasheight);
                    context.drawImage(canvasPic, 0, 0);
                };
                anno_modal.undoredorefresh();
            }
        },
        Resetselected: function (t) {
            _annotoolSelected = t;
            var node = qSA('.anno-seletedtools');
            for (var n = 0, m = node.length; n < m; n++) {
                node[n].style.border = '2px solid #fff';
            }
            switch (t) {
                case "Pencil":
                    qS("#annomodalpen").style.border = '2px solid #199A3F';
                    break;
                case "Rectangle":
                    qS("#annomodalrect").style.border = '2px solid #199A3F';
                    break;
                case "Circle":
                    qS("#annomodalcirc").style.border = '2px solid #199A3F';
                    break;
                case "Line":
                    qS("#annomodalline").style.border = '2px solid #199A3F';
                    break;
                case "Text":
                    qS("#annomodaltext").style.border = '2px solid #199A3F';
                    break;
                default:
            }
        },
        getFullurl: function(url) {
            var el = document.createElement('div');
            var escapeurl = url.split('&').join('&amp;').split('<').join('&lt;').split('"').join('&quot;');
            el.innerHTML = '<a href="' + escapeurl + '">x</a>';
            return encodeURIComponent(el.firstChild.href);
        },
        drawStrokedText: function(x, y, t, textFont, textFontSize, outline) {
            _isDown = false;
            var text = window.prompt("Please enter your text", "");
            if (text !== null) {
                context.font = textFontSize + " " + textFont;
                context.beginPath();
                if (t > 0 && outline === true) {

                    if (_curColor === '#000000') {
                        context.fillStyle = "#ffffff";
                    } else {
                        context.fillStyle = "#000000";
                    }
                    context.fillText(text, x - t, y - t);
                    context.fillText(text, x + t, y - t);
                    context.fillText(text, x - t, y);
                    context.fillText(text, x + t, y);
                    context.fillText(text, x - t, y + t);
                    context.fillText(text, x + t, y + t);
                }
                context.fillStyle = _curColor;
                context.fillText(text, x, y);
                context.closePath();
                context.stroke();
                anno_modal.historySave();
            }
        },

        loadannopresrc: function(allimages, uploadScript, annoImgDir, uploadDir) {
            var d = new Date();
            var filelocation = '';
            var signatureid = '';
            var annoid = '';
            try{
                signatureid = allimages.attributes.signatureid.value;
            }catch(event){}
            try{
                annoid = allimages.attributes.annoid.value;
                if (annoid === 'give'){
                    allimages.attributes.annoid.value = d.getTime();
                    annoid = d.getTime();
                }
            }catch(event){}
            try{
                filelocation = allimages.attributes.filename.value;
            }catch(event){}

            var bestandsnaam = filelocation.substring(filelocation.lastIndexOf('/') + 1);
            sR(uploadScript, function(o) {
                if (o === 'true') {
                    var nImg = new Image();
                    var backCanvas = document.createElement('canvas');
                    var backCtx = backCanvas.getContext('2d');
                    nImg.onload = function() {
                        backCanvas.width = allimages.width;
                        backCanvas.height = allimages.height;
                        backCtx.drawImage(allimages, 0, 0, allimages.width, allimages.height);
                        backCtx.drawImage(nImg, 0, 0, allimages.width, allimages.height);
                        var backupurl = backCanvas.toDataURL("image/png");
                        allimages.setAttribute('src', backupurl);
                    };
                    nImg.onerror = function() {
                        nImg = null;
                        qS("#anno_note").style.display = 'none';
                    };
                    nImg.src = annoImgDir + bestandsnaam.replace(/\.[^/.]+$/, "") + annoid + signatureid + "_anno.png?" + d.getTime();
                }
            }, "filename=" + bestandsnaam.replace(/\.[^/.]+$/, "") + annoid + signatureid + "_anno.png" + "&check=true" + "&destdir=" + uploadDir);
        },

        init: function() {
            var newdiv = "<div id='annoloader'></div><div id='annozoom'><img title='click to close' src=''></div><div class='anno-modal' id='anno_this'/></div>";
            var options = arguments[0] || '';
            options.lineWidth        = options.lineWidth || 3;
            options.Maxsize          = options.Maxsize || 900;
            options.drawColor        = options.drawColor || "#E6050B";
            options.uploadScript     = options.uploadScript || "php/anno_modal.php";
            options.uploadDir        = options.uploadDir || "../uploaded/images/";
            options.textFont         = options.textFont || "Arial";
            options.textOutline      = options.textOutline || false;
            options.textFontSize     = options.textFontSize || "25px";
            options.annoImgDir       = options.annoImgDir || "uploaded/images/";
            options.closeondblclick  = options.closeondblclick || false;
            options.selectedTool     = options.selectedTool || "Pencil";
            options.preloadAnotation = options.preloadAnotation || false;
            options.onSave           = options.onSave || function() {};

            _curColor                = options.drawColor;

            var colorpickerdiv = "<div id='anno_clor'><ul id='anno_clor_select'>";
            for (var i = colorpicker.length - 1; i >= 0; i--) {
                colorpickerdiv += "<li style=' background-color:" + colorpicker[i] + "'></li>";
            }
            for (i = 1; i <= 12; i++) {
                colorpickerdiv += "<li id='annonlinew"+i+"'></li>";
            }
                colorpickerdiv += "</ul></div>";
            _annotoolSelected = options.selectedTool;
            document.body.innerHTML += newdiv;
            _allimages = qSA(".anno-this");

            if (isIE()) {
                isinternetexplorer = true;
            }
            if (options.preloadAnotation === true) {
                for (var t = 0, lent = _allimages.length; t < lent; t++) {
                    try {
                        anno_modal.loadannopresrc(_allimages[t], options.uploadScript, options.annoImgDir, options.uploadDir);
                    } catch (event) {}
                }
            }
            function openimage(e) {
                var filename = '';
                var nextimage = [];
                var previmage = [];
                var nexttxt = '';
                var prevtxt = '';
                var img = new Image();
                var thecurrentindex = 0;
                var ev = e;
                var usedfilename = true;
                var signatureid = '';
                var annoid  = '';
                var issignature = false;

                qS("#annoloader").style.display = 'block';
                try{
                    signatureid = ev.currentTarget.attributes.signatureid.value;
                    if (signatureid.length > 0){
                        issignature = true;
                    }
                } catch (event) {}
                try {
                    annoid = ev.currentTarget.attributes.annoid.value;
                } catch (event) {}
                try {
                    filename = ev.currentTarget.attributes.filename.value;
                } catch (event) {}
                _canvasheight = _minheight;
                _thiswidth = options.Maxsize;
                _thisheight = options.Maxsize;
                if (_thiswidth < _minheight) {
                    _thiswidth = _minheight;
                    options.Maxsize = _minheight;
                }
                if (_thisheight < _minheight) {
                    _thisheight = _minheight;
                }
                undoRedo.length = 0;
                unStep = -1;
                for (var i = 0, len = _allimages.length; i < len; i++) {
                    if (_allimages[i] === this && len - 1 > i) {
                        nextimage.push(_allimages[i + 1]);
                    }
                    if (_allimages[i] === this && i > 0) {
                        previmage.push(_allimages[i - 1]);
                    }
                    if (_allimages[i] === this) {
                        thecurrentindex = i;
                    }
                }
                if (filename === '') {
                    filename = ev.currentTarget.src;
                    usedfilename = false;
                }
                if (nextimage.length > 0) {
                    nexttxt = '<div class="anno-seletedtools" id="annomodalnext" tooltip="Next image"></div>';
                } else {
                    nexttxt = '<div class="anno-seletedtools anno-none-np" ></div>';
                }
                if (previmage.length > 0) {
                    prevtxt = '<div class="anno-seletedtools" id="annomodalprev" tooltip="Previous image"></div>';
                } else {
                    prevtxt = '<div class="anno-seletedtools anno-none-np"></div>';
                }

                function listentoesc(event) {
                    if (event.keyCode === 27) {
                        qS("#annomodalok").click();
                    }
                }
                function toggleclasje(el,clasname){
                    if (el.classList) {
                      el.classList.toggle(clasname);
                    } else {
                      var classes = el.className.split(' ');
                      var existingIndex = classes.indexOf(clasname);

                      if (existingIndex >= 0){
                            classes.splice(existingIndex, 1);
                        }else{
                            classes.push(clasname);
                            el.className = classes.join(' ');
                        }
                    }
                }

                function haveclasje(el,clasname){
                    var hastheclass = false;
                    if (el.classList){
                      hastheclass = el.classList.contains(clasname);
                    }else{
                      hastheclass = new RegExp('(^| )' + clasname + '( |$)', 'gi').test(el.className);
                    }
                    return hastheclass;
                }

                function listentokeys(event) {
                    if (nextimage.length > 0 && event.keyCode === 39) {
                        document.removeEventListener("keyup", listentokeys);
                        if (_needsSave === true) {
                            dothisafter = 'next';
                            qS("#annomodalsave").click();
                        }else{
                            qS('#anno_this').style.display = 'none';
                            img = null;
                            qS("#annomodalnext").click();
                        }
                    }
                    if (previmage.length > 0 && event.keyCode === 37) {
                        document.removeEventListener("keyup", listentokeys);
                        if (_needsSave === true) {
                            dothisafter = 'prev';
                            qS("#annomodalsave").click();
                        }else{
                            qS('#anno_this').style.display = 'none';
                            img = null;
                            qS("#annomodalprev").click();
                        }
                    }
                    if (event.keyCode === 27) {
                        qS("#annomodalok").click();
                    }
                }
                document.removeEventListener("keyup", listentokeys);
                document.removeEventListener("keyup", listentoesc);


                img.onload = function() {
                    if ((this.width * (_thisheight / this.height)) > options.Maxsize) {
                        _thiswidth = options.Maxsize;
                    } else {
                        _thiswidth = this.width * (_thisheight / this.height);
                    }
                    _thisheight = (_thiswidth * this.height) / this.width;
                    _thisheight = Number(_thisheight.toFixed());
                    _thiswidth = Number(_thiswidth.toFixed());
                    if(issignature){
                        if (_thisheight < 200) {
                            _canvasheight = 200;
                        } else {
                            _canvasheight = _thisheight;
                        }
                    }else{
                        if (_thisheight < _minheight) {
                            _canvasheight = _minheight;
                        } else {
                            _canvasheight = _thisheight;
                        }
                    }
                    var anno_this = qS("#anno_this");
                    anno_this.innerHTML = '';
                    anno_this.style.width = (_thiswidth + 100) + 'px';
                    anno_this.style.height = _canvasheight +'px';
                    anno_this.innerHTML = '<div id="annomodalbackdiv"><img id="annomodalimg" class="anno_this-img" src="' + filename + '" alt="" width="' + _thiswidth + '" /><canvas id="annomodalcanvas" width="' + _thiswidth + '" height="' + _canvasheight + '"></canvas><canvas id="anno_tmpcanvas" width="' + _thiswidth + '" height="' + _canvasheight + '"></canvas></div><div id="anno_note">Loading ... Please wait!</div><div id="annomodaltools"><div tooltip="Magnify the image to original size" class="anno-seletedtools anno-none" id="annononepart"></div>'+colorpickerdiv+'<div class="anno-seletedtools" id="annomodalok" tooltip="Close"></div><br><div class="anno-seletedtools annomodalpen" id="annomodalpen" tooltip="Pen tool"></div><div class="anno-seletedtools annomodalrect" id="annomodalrect" tooltip="Click for Stroked Rectangle Tool"></div><div class="anno-seletedtools annomodalcirc" id="annomodalcirc" tooltip="Click for Stroked Circle Tool"></div><div class="anno-seletedtools" id="annomodalline" tooltip="Line tool"></div><div class="anno-seletedtools" id="annomodaltext" tooltip="Text tool"></div><div class="anno-seletedtools" id="annocolorselector" tooltip="Color selector and line width  selection"></div><div class="anno-seletedtools" id="annomodalclear" tooltip="Clear the Annotation"></div><div class="anno-seletedtools" id="annomodalsave" tooltip="Save the annotated canvas"></div><div class="anno-seletedtools" id="annomodalundo" tooltip="Undo"></div><div class="anno-seletedtools anno-none" id="annomodalundo_n"></div><div class="anno-seletedtools" id="annomodalredo" tooltip="Redo"></div><div class="anno-seletedtools anno-none" id="annomodalredo_n"></div><br><div class="anno-seletedtools" id="annomodaldownload" tooltip="Download original image"></div><div class="anno-seletedtools" id="annomodaldowncanvas" tooltip="Download annotated image"></div><div class="anno-mb">' + prevtxt + nexttxt + '</div></div>';

                    qS("#anno_note").style.display = 'none';
                    qS("#annoloader").style.display = 'none';

                    qS("#annomodalimg").onload = function() {
                        var annomodalbackdiv = qS("#annomodalbackdiv");
                        annomodalbackdiv.style.width = _thiswidth + 'px';
                        annomodalbackdiv.style.height = _canvasheight +'px';
                        annomodalbackdiv = null;
                        currentColor = colorpicker.length;
                        qS('#annocolorselector').style.backgroundColor =_curColor;
                        var scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
                        anno_this.style.top = (scrollTop + (_canvasheight / 2 )+40) + "px";
                        qS("#annozoom").style.top = (scrollTop +40) + "px";
                        anno_this.style.left = '50%';
                        anno_this.style.margin = '-' + (_canvasheight / 2) + 'px 0 0 -' + ((_thiswidth + 100) / 2) + 'px';
                        anno_this.style.display = 'block';

                        var displaysignature = function(){
                            qS("#annocolorselector").style.display = 'none';
                            qS("#annomodalrect").style.display = 'none';
                            qS("#annomodalcirc").style.display = 'none';
                            qS("#annomodalline").style.display = 'none';
                            qS("#annomodalpen").style.display = 'none';
                            qS("#annocolorselector").style.display = 'none';
                            qS("#annomodalredo_n").style.display = 'none';
                            qS("#annomodaldowncanvas").style.display = 'none';
                            qS("#annomodaldownload").style.display = 'none';
                            qS("#annononepart").style.display = 'none';
                            qS("#annomodaltext").style.display = 'none';
                            qS("#annomodalundo_n").style.display = 'none';
                            qS("#annomodalredo").style.display = 'none';
                            qS("#annomodalundo").style.display = 'none';
                            options.lineWidth = 4;
                            _curColor = "#000000";
                            anno_modal.Resetselected('Pencil');
                        };
                        if(issignature){
                            displaysignature();
                        }
                        var annononepart = function(){
                            qS("#annozoom img").setAttribute('src', img.src);
                            qS("#annozoom").style.display = 'block';
                        };
                        var annocolorselector = function(){
                            qS("#anno_clor").style.display = 'block';
                            return false;
                        };
                        var annozoom = function(){
                            qS("#annozoom").style.display = 'none';
                        };
                        var onanno_clor_click = function(e){
                            if(e.target.id === ""){
                                _curColor = e.target.style.backgroundColor;
                                qS('#annocolorselector').style.backgroundColor = _curColor;
                            }else{
                                options.lineWidth = e.target.id.replace( /^\D+/g, '');
                                options.lineWidth = options.lineWidth * 2;
                            }
                            qS("#anno_clor").style.display = 'none';
                        };
                        var annomodalpen = function(){
                            var haschanged = ('Pencil' !== _annotoolSelected) ? true : false;
                            if(!haschanged){toggleclasje(qS("#annomodalpen"),'annopenfill');}
                            if (haveclasje(qS("#annomodalpen"),'annopenfill')) {
                                qS("#annomodalpen").setAttribute('tooltip', "40% opaque Marker Pen Tool");
                                fillpen = true;
                            }else{
                                qS("#annomodalpen").setAttribute('tooltip', "Pen Tool");
                                fillpen = false;
                            }
                            anno_modal.Resetselected('Pencil');
                        };
                        var annomodalrect = function(){
                            var haschanged = ('Rectangle' !== _annotoolSelected) ? true : false;
                            if(!haschanged){toggleclasje(qS("#annomodalrect"),'annorectfill');}
                            if (haveclasje(qS("#annomodalrect"),'annorectfill')) {
                                qS("#annomodalrect").setAttribute('tooltip', "30% opaque Rectangle Tool");
                                fillrect = true;
                            }else{
                                qS("#annomodalrect").setAttribute('tooltip', "Stroked Rectangle Tool");
                                fillrect = false;
                            }
                            anno_modal.Resetselected('Rectangle');
                        };
                        var annomodalcirc = function(){
                            var haschanged = ('Circle' !== _annotoolSelected) ? true : false;
                            if(!haschanged){toggleclasje(qS("#annomodalcirc"),'annocircfill');}
                            if (haveclasje(qS("#annomodalcirc"),'annocircfill')) {
                                qS("#annomodalcirc").setAttribute('tooltip', "30% opaque Circle Tool");
                                fillcirc = true;
                            }else{
                                qS("#annomodalcirc").setAttribute('tooltip', "Stroked Circle Tool");
                                fillcirc = false;
                            }
                            anno_modal.Resetselected('Circle');
                        };
                        var annomodalline = function(){
                            anno_modal.Resetselected('Line');
                        };
                        var annomodaltext = function(){
                            anno_modal.Resetselected('Text');
                        };
                        var annomodalundo = function(){
                            anno_modal.Undo();
                        };
                        var annomodalredo = function(){
                            anno_modal.Redo();
                        };
                        var annomodalclear = function(){
                            _needsSave = true;
                            anno_modal.Clear();
                        };
                        var annomodalprev = function(){
                            if (_needsSave === true) {
                                dothisafter = "prev";
                                qS("#annomodalsave").click();
                            }else{
                                anno_this.style.display = 'none';
                                img = null;
                                removelisteners();
                                previmage[0].click();
                            }
                        };
                        var annomodalnext = function(){
                            if (_needsSave === true) {
                                dothisafter = "next";
                                qS("#annomodalsave").click();
                            }else{
                                anno_this.style.display = 'none';
                                img = null;
                                removelisteners();
                                nextimage[0].click();
                            }
                        };

                        var enablekeys = function(){
                            if (nextimage.length > 0){
                                qS("#annomodalnext").addEventListener("click", annomodalnext);
                            }
                            if (previmage.length > 0){
                                qS("#annomodalprev").addEventListener("click", annomodalprev);
                            }
                            if (nextimage.length > 0 || previmage.length > 0) {
                                document.addEventListener("keyup", listentokeys);
                            } else {
                                document.addEventListener("keyup", listentoesc);
                            }
                        };

                        var annomodaldowncanvas = function(){
                            var backCanvas = document.createElement('canvas');
                            backCanvas.width = kfCanvas.width;
                            backCanvas.height = kfCanvas.height;
                            var backCtx = backCanvas.getContext('2d');
                            backCtx.fillStyle = "#FFFFFF";
                            backCtx.fillRect(0, 0, _thiswidth, _canvasheight);
                            backCtx.drawImage(img, 0, 0, _thiswidth, _thisheight);
                            backCtx.drawImage(kfCanvas, 0, 0);
                            var backupurl = backCanvas.toDataURL("image/png");
                            sR(
                                options.uploadScript,
                                function(thefile) {
                                    window.open(options.uploadScript + '?path=' + anno_modal.getFullurl(options.annoImgDir + thefile) + '&download=true', '_self');
                                },
                                'img=' + backupurl + '&filename=' + filename + '&destdir=' + options.uploadDir
                            );
                        };
                        var annomodaldownload = function(){
                            e.preventDefault();
                            window.open(options.uploadScript + '?path=' + anno_modal.getFullurl(filename) + '&download=true', '_self');
                        };
                        var annomodalsave = function(){

                            var dataURL = kfCanvas.toDataURL("image/png");
                            sR(
                                options.uploadScript,
                                function() {
                                    qS("#annomodalsave").style.border ='2px solid #1AAF06';
                                    document.removeEventListener("keyup", listentoesc);

                                    switch(dothisafter){
                                        case 'close':
                                            img = null;
                                            undoRedo.length = 0;
                                            unStep = -1;
                                            _savedbefore = false;
                                            removelisteners();
                                            qS('#anno_this').style.display = 'none';
                                            break;
                                        case 'next':
                                            undoRedo.length = 0;
                                            unStep = -1;
                                            qS('#anno_this').style.display = 'none';
                                            img = null;
                                            nextimage[0].click();
                                            removelisteners();
                                            break;
                                        case 'prev':
                                            undoRedo.length = 0;
                                            unStep = -1;
                                            qS('#anno_this').style.display = 'none';
                                            img = null;
                                            previmage[0].click();
                                            removelisteners();
                                            break;
                                        default:

                                            break;
                                    }
                                    dothisafter = '';
                                },
                                'img=' + dataURL + '&filename=' + filename + '&destdir=' + options.uploadDir + '&si=' + signatureid + '&ai=' + annoid
                            );

                            if (usedfilename === true) {
                                var backCanvas = document.createElement('canvas');
                                backCanvas.width = kfCanvas.width;
                                backCanvas.height = kfCanvas.height;
                                var backCtx = backCanvas.getContext('2d');
                                backCtx.fillStyle = "#FFFFFF";
                                backCtx.fillRect(0, 0, _thiswidth, _canvasheight);
                                backCtx.drawImage(img, 0, 0, _thiswidth, _thisheight);
                                backCtx.drawImage(kfCanvas, 0, 0);
                                var backupurl = backCanvas.toDataURL("image/png");
                                options.onSave({
                                    index: thecurrentindex,
                                    imagedata: backupurl,
                                    annofilename: filename.substring(filename.lastIndexOf('/') + 1).replace(/\.[^/.]+$/, "") + annoid + signatureid + "_anno.png"
                                });
                            }
                        };

                        var annomodalok = function(){
                            document.removeEventListener("keyup", listentokeys);
                            document.removeEventListener("keyup", listentoesc);
                            if (_needsSave === true) {
                                dothisafter = 'close';
                                qS("#annomodalsave").click();
                            } else {
                                img = null;
                                undoRedo.length = 0;
                                unStep = -1;
                                _savedbefore = false;
                                removelisteners();
                                qS('#anno_this').style.display = 'none';
                            }
                        };
                        var removelisteners = function(){
                            qS("#annononepart").removeEventListener("click", annononepart);
                            qS("#annocolorselector").removeEventListener("click", annocolorselector);
                            qS("#annozoom").removeEventListener("click", annozoom);
                            qS("#annomodalpen").removeEventListener("click", annomodalpen);
                            qS("#annomodalrect").removeEventListener("click", annomodalrect);
                            qS("#annomodalcirc").removeEventListener("click", annomodalcirc);
                            qS("#annomodalline").removeEventListener("click", annomodalline);
                            qS("#annomodaltext").removeEventListener("click", annomodaltext);
                            qS("#annomodalundo").removeEventListener("click", annomodalundo);
                            qS("#annomodalredo").removeEventListener("click", annomodalredo);
                            qS("#annomodalclear").removeEventListener("click", annomodalclear);
                            if (nextimage.length > 0){
                                qS("#annomodalnext").removeEventListener("click", annomodalnext);
                            }
                            if (previmage.length > 0){
                                qS("#annomodalprev").removeEventListener("click", annomodalprev);
                            }
                            document.removeEventListener("keyup", listentokeys);
                            qS("#annomodaldowncanvas").removeEventListener("click", annomodaldowncanvas);
                            qS("#annomodaldownload").removeEventListener("click", annomodaldownload);
                            qS("#annomodalsave").removeEventListener("click", annomodalsave);
                            qS("#annomodalok").removeEventListener("click", annomodalok);
                        };

                        removelisteners();
                        qS("#annononepart").addEventListener("click", annononepart);
                        qS("#annocolorselector").addEventListener("click", annocolorselector);
                        qS("#annozoom").addEventListener("click", annozoom);
                        qS("#annomodalpen").addEventListener("click", annomodalpen);
                        qS("#annomodalrect").addEventListener("click", annomodalrect);
                        qS("#annomodalcirc").addEventListener("click", annomodalcirc);
                        qS("#annomodalline").addEventListener("click", annomodalline);
                        qS("#annomodaltext").addEventListener("click", annomodaltext);
                        qS("#annomodalundo").addEventListener("click", annomodalundo);
                        qS("#annomodalredo").addEventListener("click", annomodalredo);
                        qS("#annomodalclear").addEventListener("click", annomodalclear);
                        qS("#anno_clor_select").addEventListener("click", onanno_clor_click);
                        qS("#annomodaldowncanvas").addEventListener("click", annomodaldowncanvas);
                        qS("#annomodaldownload").addEventListener("click", annomodaldownload);
                        qS("#annomodalsave").addEventListener("click", annomodalsave);
                        qS("#annomodalok").addEventListener("click", annomodalok);



                        undoRedo.length = 0;
                        anno_modal.Resetselected(_annotoolSelected);
                        fillrect = false;
                        fillcirc = false;
                        fillpen = false;
                        kfCanvas = document.getElementById("annomodalcanvas");
                        drawcanvas = document.getElementById("anno_tmpcanvas");

                        var ondown = function(e){
                            e.preventDefault();
                            drawcontext.lineJoin = drawcontext.lineCap = 'round';
                            points.length = 0;
                            drawcontext.lineWidth = options.lineWidth;
                            drawcontext.strokeStyle = _curColor;
                            drawcontext.globalAlpha=1;
                            points.push({
                                x: e.pageX - kfCanvas.offsetParent.offsetLeft - 15,
                                y: e.pageY - kfCanvas.offsetParent.offsetTop - 15
                            });
                            if (_annotoolSelected === 'Text') {

                                anno_modal.drawStrokedText(points[0].x, points[0].y, 1, options.textFont, options.textFontSize, options.textOutline);
                                return false;
                            }
                            isDrawing = true;
                        };

                        var onmove = function(e){
                            e.preventDefault();
                            if (isDrawing === true) {
                                drawcontext.clearRect(0, 0, drawcontext.canvas.width, drawcontext.canvas.height);
                                points.push({
                                    x: e.pageX - kfCanvas.offsetParent.offsetLeft - 15,
                                    y: e.pageY - kfCanvas.offsetParent.offsetTop - 15
                                });
                                var pointend = points.length - 1;
                                var width = points[pointend].x - points[0].x;
                                var height = points[pointend].y - points[0].y;
                                var diam = Math.sqrt(width * width + height * height);
                                if (_annotoolSelected === 'Pencil') {
                                    drawcontext.beginPath();
                                    drawcontext.moveTo(points[0].x, points[0].y);
                                    if (fillpen === true){
                                        drawcontext.globalAlpha=0.4;
                                        drawcontext.lineWidth = options.lineWidth;
                                        drawcontext.lineJoin = drawcontext.lineCap = 'round';
                                    }else{
                                        drawcontext.lineJoin = drawcontext.lineCap = 'round';
                                        drawcontext.globalAlpha=1;
                                        drawcontext.lineWidth = options.lineWidth;
                                    }
                                    for (var i = 1; i < points.length - 1; i++) {
                                        var c = (points[i].x + points[i + 1].x) / 2;
                                        var d = (points[i].y + points[i + 1].y) / 2;
                                        drawcontext.quadraticCurveTo(points[i].x, points[i].y, c, d);
                                    }
                                    drawcontext.stroke();
                                } else if (_annotoolSelected === 'Rectangle') {
                                    drawcontext.beginPath();
                                    drawcontext.rect(points[0].x, points[0].y, width, height);
                                    if (fillrect === true){
                                        drawcontext.globalAlpha=0.2;
                                        drawcontext.strokeStyle = 'rgba(0, 0, 0, 0)';
                                        drawcontext.fillStyle = _curColor;
                                    }else{
                                        drawcontext.globalAlpha=1;
                                        drawcontext.fillStyle = 'rgba(0, 0, 0, 0)';
                                        drawcontext.strokeStyle = _curColor;
                                    }
                                    drawcontext.fillRect(points[0].x, points[0].y, width, height);
                                    drawcontext.closePath();
                                    drawcontext.fill();
                                    drawcontext.stroke();
                                } else if (_annotoolSelected === 'Line') {
                                    drawcontext.beginPath();
                                    drawcontext.moveTo(points[0].x, points[0].y);
                                    drawcontext.lineTo(points[pointend].x, points[pointend].y);
                                    drawcontext.closePath();
                                    drawcontext.stroke();
                                } else if (_annotoolSelected === 'Circle') {
                                    drawcontext.beginPath();
                                    drawcontext.arc(points[0].x, points[0].y, diam, 0, Math.PI * 2, true);
                                    if (fillcirc === true){
                                        drawcontext.globalAlpha=0.4;
                                        drawcontext.strokeStyle = 'rgba(0, 0, 0, 0)';
                                        drawcontext.fillStyle = _curColor;
                                    }else{
                                        drawcontext.globalAlpha=1;
                                        drawcontext.fillStyle = 'rgba(0, 0, 0, 0)';
                                        drawcontext.strokeStyle = _curColor;
                                    }
                                    drawcontext.closePath();
                                    drawcontext.fill();
                                    drawcontext.stroke();
                                }
                            }
                        };

                        var onup = function(){
                            if (isDrawing !== false) {
                                isDrawing = false;
                                points.length = 0;
                                context.drawImage(drawcanvas, 0, 0);
                                drawcontext.clearRect(0, 0, drawcontext.canvas.width, drawcontext.canvas.height);
                                anno_modal.historySave();
                            }
                        };

                        if (kfCanvas) {
                            context = kfCanvas.getContext("2d");
                            drawcontext = drawcanvas.getContext("2d");
                            var d = new Date();
                            anno_modal.historySave();
                            _needsSave = false;
                            var bestandsnaam = filename.substring(filename.lastIndexOf('/') + 1);

                            var completeloadimage = function(nImg){
                                    context.drawImage(nImg, 0, 0, _thiswidth, _canvasheight);
                                    _savedbefore = true;
                                    _needsSave = false;
                                    qS("#anno_note").style.display = 'none';
                                    enablekeys();
                                    anno_modal.historySave();
                                    _needsSave = false;
                            };

                            sR(
                                options.uploadScript,
                                function(o) {
                                    if (o === 'true') {
                                       qS("#anno_note").style.display = 'block';
                                        var nImg = new Image();
                                        nImg.onload = function() {
                                            if (isinternetexplorer) {
                                                setTimeout(function(){
                                                   completeloadimage(nImg);
                                                    nImg = null;
                                                },400);
                                            }else{
                                                completeloadimage(nImg);
                                                nImg = null;
                                            }
                                        };
                                        nImg.onerror = function() {
                                            nImg = null;
                                            qS("#anno_note").style.display = 'none';
                                            enablekeys();

                                        };

                                            nImg.src = options.annoImgDir + bestandsnaam.replace(/\.[^/.]+$/, "") + annoid + signatureid + "_anno.png?" + d.getTime();



                                    }else{
                                        enablekeys();
                                    }
                                },
                                'check=true&filename=' + bestandsnaam.replace(/\.[^/.]+$/, "") + annoid + signatureid + "_anno.png" + '&destdir=' + options.uploadDir
                            );

                            isDrawing = false;
                            drawcanvas.addEventListener("mousedown", ondown, false);
                            drawcanvas.addEventListener("touchstart", ondown, false);
                            drawcanvas.addEventListener("mousemove", onmove, false);
                            drawcanvas.addEventListener("touchmove", onmove, false);
                            drawcanvas.addEventListener("mouseup", onup, false);
                            drawcanvas.addEventListener("touchend", onup, false);
                            if(options.closeondblclick) {drawcanvas.addEventListener("dblclick", annomodalok, false);}
                        }
                    }; // end onload
                };
                img.src = filename;
            }
            var toclick = qSA('.anno-this');
            for (var n = 0, m = toclick.length; n < m; n++) {
                toclick[n].addEventListener("click", openimage);
            }
            toclick = null;

        } // end init
    };
    //return this;
})();