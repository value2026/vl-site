(function() {
    angular.module('users')
        .directive("experiment", directiveFunction)
})();
/** Variables declarations */
var timer, animation_counter, exp_canvas, start_flag;
var selected_liquid_index;
var time, animation_timer, emplty_pipettu_tween, solution_pouring_tween;
var soln_pouring_rect = new createjs.Shape();
var mask_tube_rect_right = new createjs.Shape();
var mask_tube_rect_left = new createjs.Shape();
var pipette_solution_rect = new createjs.Shape();
var stop_watch_timer;
var solDroppingFlag;

function directiveFunction() {
    return {
        restrict: "A",
        link: function(scope, element, attrs) {
            /** Variable that decides if something should be drawn on mouse move */
            var experiment = true;
            if (element[0].width > element[0].height) {
                element[0].width = element[0].height;
                element[0].height = element[0].height;
            } else {
                element[0].width = element[0].width;
                element[0].height = element[0].width;
            }
            if (element[0].offsetWidth > element[0].offsetHeight) {
                element[0].offsetWidth = element[0].offsetHeight;
            } else {
                element[0].offsetWidth = element[0].offsetWidth;
                element[0].offsetHeight = element[0].offsetWidth;
            }
			exp_canvas = document.getElementById("demoCanvas");
			exp_canvas.width = element[0].width;
            exp_canvas.height = element[0].height;
			/** Creating the stage for the experiment. */
			viscosity_measurement_stage  = new createjs.Stage("demoCanvas")
            queue = new createjs.LoadQueue(true);
            queue.installPlugin(createjs.Sound);
			loadingProgress(queue,viscosity_measurement_stage,exp_canvas.width)
            queue.on("complete", handleComplete, this);
            queue.loadManifest([{
                id: "background",
                src: "././images/background.svg",
                type: createjs.LoadQueue.IMAGE
            }, {
				id: "stand_bottle",
                src: "././images/stand_bottle.svg",
                type: createjs.LoadQueue.IMAGE
			}, {
				id: "tube_solution",
                src: "././images/tube_solution.svg",
                type: createjs.LoadQueue.IMAGE
			}, {
				id: "tube_solution_yellow",
                src: "././images/tube_solution_yellow.svg",
                type: createjs.LoadQueue.IMAGE
			},{
				id: "pipette_still",
                src: "././images/pipette_still.svg",
                type: createjs.LoadQueue.IMAGE
			}, {
				id: "pipette_ani1",
				src: "././images/pipette_ani1.svg",
				type: createjs.LoadQueue.IMAGE
            }, {
				id: "pipette_ani2",
				src: "././images/pipette_ani2.svg",
				type: createjs.LoadQueue.IMAGE
            }, {
				id: "pipette_ani3",
				src: "././images/pipette_ani3.svg",
				type: createjs.LoadQueue.IMAGE
            },  {
				id: "pipette_ani4",
				src: "././images/pipette_ani4.svg",
				type: createjs.LoadQueue.IMAGE
            } , {
				id: "pipette_ani5",
				src: "././images/pipette_ani5.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "pipette_ani6",
				src: "././images/pipette_ani6.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "pipette_ani7",
				src: "././images/pipette_ani7.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "pipette_ani8",
				src: "././images/pipette_ani8.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "pipette_ani9",
				src: "././images/pipette_ani9.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "pipette_ani10",
				src: "././images/pipette_ani10.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "top_closer",
				src: "././images/top_closer.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "arrow_right",
				src: "././images/arrow right-01.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "arrow_left",
				src: "././images/arrow left-01.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "pipette_yellow_ani1",
				src: "././images/pipette_yellow_ani1.svg",
				type: createjs.LoadQueue.IMAGE
            }, {
				id: "pipette_yellow_ani2",
				src: "././images/pipette_yellow_ani2.svg",
				type: createjs.LoadQueue.IMAGE
            }, {
				id: "pipette_yellow_ani3",
				src: "././images/pipette_yellow_ani3.svg",
				type: createjs.LoadQueue.IMAGE
            },  {
				id: "pipette_yellow_ani4",
				src: "././images/pipette_yellow_ani4.svg",
				type: createjs.LoadQueue.IMAGE
            } , {
				id: "pipette_yellow_ani5",
				src: "././images/pipette_yellow_ani5.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "pipette_yellow_ani6",
				src: "././images/pipette_yellow_ani6.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "pipette_yellow_ani7",
				src: "././images/pipette_yellow_ani7.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "pipette_yellow_ani8",
				src: "././images/pipette_yellow_ani8.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "pipette_yellow_ani9",
				src: "././images/pipette_yellow_ani9.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "pipette_yellow_ani10",
				src: "././images/pipette_yellow_ani10.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "pipette_solution",
				src: "././images/pipette_solution.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "pipette_solution_yellow",
				src: "././images/pipette_solution_yellow.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "pipette_empty",
				src: "././images/pipette_empty.svg",
				type: createjs.LoadQueue.IMAGE
			}
            ]);
            
			/** Initialisation of stage */
            viscosity_measurement_stage.enableDOMEvents(true);
            viscosity_measurement_stage.enableMouseOver();
            timer = setInterval(updateTimer, 100); /** Stage update function in a timer */          

            function handleComplete() { 
				/** loading Background image */
                loadImages(queue.getResult("background"), "background", 0, 0, "", 0 ); 
                /** Function for setting stopwatch */
				createStopwatch (viscosity_measurement_stage,-25,520,1);
				/** Loading all images in the queue to the stage */				
				loadImages(queue.getResult("tube_solution"), "tube_solution_right",327, 313, "", 0);
				loadImages(queue.getResult("tube_solution"), "tube_solution_left",327, 313, "", 0);
				loadImages(queue.getResult("tube_solution_yellow"), "tube_solution_yellow_left",327, 313, "", 0);
				loadImages(queue.getResult("tube_solution_yellow"), "tube_solution_yellow_right",327, 313, "", 0);
				loadImages(queue.getResult("top_closer"), "top_closer",379, -500, "", 0); //-120
				loadImages(queue.getResult("tube_solution"), "tube_solution",327, 313, "", 0);
				loadImages(queue.getResult("tube_solution_yellow"), "tube_solution_yellow",327, 313, "", 0);
				loadImages(queue.getResult("pipette_still"), "pipette_still", 455, 20, "", 0);
				loadImages(queue.getResult("pipette_empty"), "pipette_empty", 320, 75, "", 0);
				loadImages(queue.getResult("pipette_solution"), "pipette_solution", 320, 75, "", 0);
				loadImages(queue.getResult("pipette_solution_yellow"), "pipette_solution_yellow", 320, 75, "", 0);
				/** Loading all animation images in the queue to the stage */
				for ( var i=1; i<=10; i++ ) {
                    loadImages(queue.getResult("pipette_ani"+i), "pipette_ani"+i,633, 250, "", 0, viscosity_measurement_stage, 1);
                } 
				for ( var i=1; i<=10; i++ ) {
                    loadImages(queue.getResult("pipette_yellow_ani"+i), "pipette_yellow_ani"+i, 545, 250, "", 0, viscosity_measurement_stage, 1);
                }  
				loadImages(queue.getResult("stand_bottle"), "stand_bottle", 0, 0, "", 0, 1, 1); 
				loadImages(queue.getResult("arrow_right"), "arrow_right", 305, 532, "", 0, 1, 1);
				loadImages(queue.getResult("arrow_left"), "arrow_left1", 410, 360, "", 0, 1, 1);
				loadImages(queue.getResult("arrow_left"), "arrow_left2", 410, 390, "", 0, 1, 1);
				loadImages(queue.getResult("arrow_left"), "arrow_left3", 410, 420, "", 0, 1, 1);
				/** Text loading */
				setText("clabel", 440, 373, _("C"), "#FFFFFF", 1);
				setText("alabel", 440, 403, _("A"), "#FFFFFF", 1);
				setText("dlabel", 440, 433, _("D "), "#FFFFFF", 1);
				setText("blabel", 292, 545, _("B"), "#FFFFFF", 1);
				setText("water_txt", 465, 620, "", "black",0.8);
				setText("nitro_txt", 560, 615, "", "black",0.8);
				setText("benzene_txt", 550, 625, "", "black",0.8);
				setText("toluene_txt", 635, 620, "", "black", 0.8);
                translationLabels(); /** Translation of strings using gettext */
				/** Adding mask_tube_rect for masking the tube solution */
				drawRectangle(mask_tube_rect_right,370,625,35,400,1);
				drawRectangle(mask_tube_rect_left,330,625,40,400,1);
				drawRectangle(soln_pouring_rect,345,15,2,300,1);
				drawRectangle(pipette_solution_rect,330,150,50,175,0);
                initialisationOfVariables(scope); 
				initialisationOfImages();
            }
	
			/** Add all the strings used for the language translation here. '_' is the short cut for 
            calling the gettext function defined in the gettext-definition.js */
			function translationLabels() {
				/** This help array shows the hints for this experiment */
				helpArray = [_("help1"), _("help2"), _("help3"), _("help4"), _("Next"), _("Close")];
				scope.heading = _("Determination of Viscosity of Organic Solvents");
				scope.variables = _("Variables");
				scope.fill_liquid = _("Fill liquid");
				start_btn_var=_("start");
				scope.reset = _("Reset");
				scope.show_label = _("Show labels");
				scope.liquid_label = _("Select a Liquid :");
				scope.temperature_label = _("Temperature :");
				scope.copyright = _("copyright");
				viscosity_measurement_stage.getChildByName("water_txt").text = _("Water");
				viscosity_measurement_stage.getChildByName("nitro_txt").text = _("Nitro");
				viscosity_measurement_stage.getChildByName("benzene_txt").text = _("benzene");
				viscosity_measurement_stage.getChildByName("toluene_txt").text = _("Toluene");
				scope.selectLiquidArray = [{optionsLiquid: _('Water'),type: 0}, {optionsLiquid: _('Toluene'),type: 1}, {optionsLiquid: _('Nitro benzene'),type: 2}];
				scope.$apply();
            }
        }
    }
}

/** All variables initialising in this function */
function initialisationOfVariables(scope) {
	animation_counter = 0;
	selected_liquid_index = 0;	
	scope.liquid_ctrls_disable = false;
	scope.liquid_Mdl = 0;	
	solDroppingFlag = true;
}

/** Set the initial status of the bitmap and text depends on its visibility and initial values */
function initialisationOfImages() {
	getChild("top_closer").visible = false;
	viscosity_measurement_stage.getChildByName("pipette_still").alpha = 0;
	/** Make all text visibility to false  */
	viscosity_measurement_stage.getChildByName("clabel").visible = false;
	viscosity_measurement_stage.getChildByName("alabel").visible = false;
	viscosity_measurement_stage.getChildByName("dlabel").visible = false;
	viscosity_measurement_stage.getChildByName("blabel").visible = false;
	/** Make all arrow images visibility to false  */
	for( var i=1; i<=3; i++ ) 
	{
	 getChild("arrow_left"+i).visible = false;
	}
	getChild("arrow_right").visible = false;  
	getChild("pipette_still").visible = false;
	getChild("pipette_still").x = 455;
	getChild("pipette_still").y = 20;
	for ( var i=1; i<=10; i++ ) {
		getChild("pipette_ani"+i).visible = false;
		getChild("pipette_ani"+i).x =455;
		getChild("pipette_ani"+i).y =350;
    } 
	for ( var i=1; i<=10; i++ ) {
		getChild("pipette_yellow_ani"+i).visible = false;
		getChild("pipette_yellow_ani"+i).x =545;
		getChild("pipette_yellow_ani"+i).y =350; 
    }  
	getChild("tube_solution_yellow").visible = false;
	getChild("tube_solution_yellow_left").visible = false;
	getChild("tube_solution_yellow_right").visible = false;
	viscosity_measurement_stage.getChildByName("tube_solution_left").visible = true;
	viscosity_measurement_stage.getChildByName("tube_solution_right").visible = true;
	viscosity_measurement_stage.getChildByName("tube_solution").visible = true;
	viscosity_measurement_stage.getChildByName("pipette_empty").visible = false;
	viscosity_measurement_stage.getChildByName("pipette_solution").visible = false;
	viscosity_measurement_stage.getChildByName("pipette_solution_yellow").visible = false;
}

/** Function to draw rectangular mask */
function drawRectangle(rect_name, x, y, width, height, alpha_val) {
    viscosity_measurement_stage.addChild(rect_name);
    rect_name.x = x;
    rect_name.y = y;
    rect_name.graphics.beginFill("").drawRect(0, 0, width, height).command;
    rect_name.alpha = alpha_val;
}

/** All the texts loading and added to the viscosity measurement stage */
function setText(name, textX, textY, value, color, fontSize) {
    var _text = new createjs.Text(value, "bold " + fontSize + "em Tahoma, Geneva, sans-serif", color);
    _text.x = textX;
    _text.y = textY;
    _text.textBaseline = "alphabetic";
    _text.name = name;
    _text.text = value;
    _text.color = color;
    viscosity_measurement_stage.addChild(_text); /** Adding text to the container */
}

/** All the images loading and added to the viscosity measurement stage */
function loadImages(image, name, xPos, yPos, cursor, rot) {
    var _bitmap = new createjs.Bitmap(image).set({});
    _bitmap.x = xPos;
    _bitmap.y = yPos;
    _bitmap.scaleX = _bitmap.scaleY = 1;
    _bitmap.name = name;
    _bitmap.rotation = rot;
    _bitmap.cursor = cursor;
    viscosity_measurement_stage.addChild(_bitmap); /** Adding bitmap to the stage */
	if ( name == "tube_solution_right" ) {
        _bitmap.mask = mask_tube_rect_right;
    }
	if ( name == "tube_solution_left" ) {
		_bitmap.mask = mask_tube_rect_left;
    }
	if ( name == "tube_solution" ) {
		_bitmap.mask = soln_pouring_rect;
    }
	if ( name == "tube_solution_yellow_right" ) {
        _bitmap.mask = mask_tube_rect_right;
    }
	if ( name == "tube_solution_yellow_left" ) {
		_bitmap.mask = mask_tube_rect_left;
    } 
	if(name == "tube_solution_yellow") {
		_bitmap.mask = soln_pouring_rect;
	}
	if ( name == "pipette_solution" ) {
		_bitmap.mask = pipette_solution_rect;
    } 
	if ( name == "pipette_solution_yellow" ) {
		_bitmap.mask = pipette_solution_rect;
    }  
    blur_image_width = _bitmap.image.width; /**Passing the width of the cell for blur function */
    blur_image_height = _bitmap.image.height; /**Passing the height of the cell for blur function */
}