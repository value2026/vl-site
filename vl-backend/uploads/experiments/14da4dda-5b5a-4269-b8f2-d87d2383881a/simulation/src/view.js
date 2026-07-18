/** Directive function call will call onload */
(function() {
    angular.module('users')
        .directive("experiment", directiveFunction)
})();
/** Variables declarations */
var timer, animation_counter, temp_timer, exp_canvas, start_flag;
var selected_solvent_index, selected_solute_index, stir_counter, stirror_timer, animation_timer;
var arc_line ; /** Line for plotting arc */
var current_temperature, molar_freezing_point_depression_constant, freezing_point, total_freezing_point;
var solute_mass,solvent_mass, test_tube_current_x, test_tube_current_y, press_flag, final_pos_obj_left;
var final_pos_obj_right, final_pos_obj_top, final_pos_obj_bottom, power_flag, stir_complete_flag, num_moles;
var stir_rotation_count, testtube_dip_value, xmlhttp;
var mask_tube_rect = new createjs.Shape();
var mask_thermo_rect_left = new createjs.Shape();
var mask_thermo_rect_right = new createjs.Shape();
var mask_thermo_rect_top = new createjs.Shape();
var mask_solvent_container = new createjs.Shape();
var solvent_container = new createjs.Container();
var solute_container = new createjs.Container();
var stirror_container = new createjs.Container();
var switch_on_rect = new createjs.Shape();

function directiveFunction() {
    return {
        restrict: "A",
        link: function(scope, element, attrs, dialogs) {
            /** Variable that decides if something should be drawn on mouse move */
            var experiment = true;
            if ( element[0].width > element[0].height ) {
                element[0].width = element[0].height;
                element[0].height = element[0].height;
            } else {
                element[0].width = element[0].width;
                element[0].height = element[0].width;
            }
            if ( element[0].offsetWidth > element[0].offsetHeight ) {
                element[0].offsetWidth = element[0].offsetHeight;
            } else {
                element[0].offsetWidth = element[0].offsetWidth;
                element[0].offsetHeight = element[0].offsetWidth;
            }
			exp_canvas = document.getElementById("demoCanvas");
			exp_canvas.width = element[0].width;
            exp_canvas.height = element[0].height;
			/** Creating the stage for the experiment. */
			cryoscopy_stage  = new createjs.Stage("demoCanvas")
            queue = new createjs.LoadQueue(true);
            queue.installPlugin(createjs.Sound);
			loadingProgress(queue,cryoscopy_stage,exp_canvas.width)
            queue.on("complete", handleComplete, this);
            queue.loadManifest([{
                id: "background",
                src: "././images/background.svg",
                type: createjs.LoadQueue.IMAGE
            } , {
				id: "power_on",
                src: "././images/power_on.svg",
                type: createjs.LoadQueue.IMAGE
			} , {
				id: "testtube_front",
                src: "././images/testtube_front.svg",
                type: createjs.LoadQueue.IMAGE
			}, {
				id: "testtube_back",
                src: "././images/testtube_back.svg",
                type: createjs.LoadQueue.IMAGE
			},{
				id: "thermometer",
                src: "././images/thermometer.svg",
                type: createjs.LoadQueue.IMAGE
			}, {
				id: "waterbath_top",
				src: "././images/waterbath_top.svg",
				type: createjs.LoadQueue.IMAGE
            }, {
				id: "power_off",
				src: "././images/power_off.svg",
				type: createjs.LoadQueue.IMAGE
            }, {
				id: "plate_shadow",
				src: "././images/plate_shadow.svg",
				type: createjs.LoadQueue.IMAGE
            },  {
				id: "plate_to_drag",
				src: "././images/plate_to_drag.svg",
				type: createjs.LoadQueue.IMAGE
            } , {
				id: "switch_off",
				src: "././images/switch_off.svg",
				type: createjs.LoadQueue.IMAGE
			} , {
				id: "switch_on",
				src: "././images/switch_on.svg",
				type: createjs.LoadQueue.IMAGE
			} , {
				id: "salt_powder_still",
				src: "././images/salt_powder_still.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "testtube_solution",
				src: "././images/testtube_solution.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "powder_pour1",
				src: "././images/powder_pour1.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "powder_pour2",
				src: "././images/powder_pour2.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "powder_pour3",
				src: "././images/powder_pour3.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "powder_pour4",
				src: "././images/powder_pour4.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "powder_pour5",
				src: "././images/powder_pour5.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "powder_pour6",
				src: "././images/powder_pour6.svg",
				type: createjs.LoadQueue.IMAGE
            }, {
				id: "powder_pour7",
				src: "././images/powder_pour7.svg",
				type: createjs.LoadQueue.IMAGE
            }, {
				id: "powder_pour8",
				src: "././images/powder_pour8.svg",
				type: createjs.LoadQueue.IMAGE
            }, {
				id: "powder_pour9",
				src: "././images/powder_pour9.svg",
				type: createjs.LoadQueue.IMAGE
            } , {
				id: "powder_pour10",
				src: "././images/powder_pour10.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "powder_pour11",
				src: "././images/powder_pour11.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "powder_pour12",
				src: "././images/powder_pour12.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "powder_pour13",
				src: "././images/powder_pour13.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "powder_pour14",
				src: "././images/powder_pour14.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "powder_pour15",
				src: "././images/powder_pour15.svg",
				type: createjs.LoadQueue.IMAGE
			} ,  {
				id: "stirrer1",
				src: "././images/stirrer1.svg",
				type: createjs.LoadQueue.IMAGE
            } , {
				id: "stirrer2",
				src: "././images/stirrer2.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "stirrer3",
				src: "././images/stirrer3.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "stirrer4",
				src: "././images/stirrer4.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "stirrer5",
				src: "././images/stirrer5.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "stirrer6",
				src: "././images/stirrer6.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "stirrer7",
				src: "././images/stirrer7.svg",
				type: createjs.LoadQueue.IMAGE
            } , {
				id: "stirrer8",
				src: "././images/stirrer8.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "stirrer9",
				src: "././images/stirrer9.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "stirrer10",
				src: "././images/stirrer10.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "stirrer11",
				src: "././images/stirrer11.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "stirrer12",
				src: "././images/stirrer12.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "stirrer13",
				src: "././images/stirrer13.svg",
				type: createjs.LoadQueue.IMAGE
            } , {
				id: "stirrer14",
				src: "././images/stirrer14.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "stirrer15",
				src: "././images/stirrer15.svg",
				type: createjs.LoadQueue.IMAGE
			}
            ]);
            
			/** Enables all mouse events */
            cryoscopy_stage.enableDOMEvents(true);
            cryoscopy_stage.enableMouseOver();
			createjs.Touch.enable(cryoscopy_stage); /** Enable touch events */
            timer = setInterval(updateTimer, 100); /** Stage update function in a timer */          
            function handleComplete() { 
				/** Loading Background image */
                loadImages(queue.getResult("background"), "background", 0, 0, "", 0,cryoscopy_stage,1 ); 
				/** Loading all images in the queue to the stage */					
				loadImages(queue.getResult("power_on"), "power_on", 0, 0, "", 0,cryoscopy_stage,1); 
				getChild("power_on").visible = false;
				loadImages(queue.getResult("power_off"), "power_off", 0, 0, "", 0,cryoscopy_stage,1); 
				loadImages(queue.getResult("testtube_back"), "testtube_back",395,250, "", 0,solvent_container,1);
				loadImages(queue.getResult("thermometer"), "thermometer",380, 100, "move", 0,solvent_container,1);
				loadImages(queue.getResult("waterbath_top"), "waterbath_top",0, 0, "", 0,cryoscopy_stage,1); 
				loadImages(queue.getResult("testtube_solution"), "testtube_solution",397, 260, "move", 0,solvent_container,1);
				loadImages(queue.getResult("testtube_front"), "testtube_front",395, 253, "move", 0,solvent_container,1)
				loadImages(queue.getResult("plate_shadow"), "plate_shadow",0, 0, "", 0,cryoscopy_stage,1);
				loadImages(queue.getResult("plate_to_drag"), "plate_to_drag", 55, 610, "", 0,solute_container,1);
				loadImages(queue.getResult("switch_off"), "switch_off",423, 533, "pointer", 0,cryoscopy_stage,1);
				loadImages(queue.getResult("switch_on"), "switch_on",423, 534, "pointer", 0,cryoscopy_stage,1);
				getChild("switch_on").visible = false;
				loadImages(queue.getResult("salt_powder_still"), "salt_powder_still", 120, 625, "", 0,solute_container,1);
				for ( var i=1; i<=15; i++ ) {
                    loadImages(queue.getResult("stirrer"+i), "stirrer"+i, 390, 200, "", 0, cryoscopy_stage,.75);
				} 
				/** Adding rectangle for disabling the thermometer click */
				mask_thermo_rect_top.graphics.beginFill("green").drawRect(375,100,70,35);
				mask_thermo_rect_left.graphics.beginFill("green").drawRect(375,130,30,20);
				mask_thermo_rect_right.graphics.beginFill("green").drawRect(425,130,30,20);
				mask_thermo_rect_top.alpha = 0.01;
				mask_thermo_rect_right.alpha = 0.01;
				mask_thermo_rect_left.alpha = 0.01;
				solvent_container.addChild(mask_thermo_rect_top,mask_thermo_rect_left,mask_thermo_rect_right);
				cryoscopy_stage.addChild(solvent_container);
				cryoscopy_stage.addChild(solute_container);
				solvent_container.mask = mask_solvent_container;

				/** Text loading */
				setText("temperature", 100, 350, _("37"), "#626262", 1);
                translationLabels(); /** Translation of strings using gettext */
				/** Adding mask_tube_rect for masking the tube solution */
				mask_tube_rect.graphics.beginFill("").drawRect(398,390,40,140).command;
				/** Adding rectangle for restricting the movement of test tube in the water bath */
				mask_solvent_container.graphics.beginFill("").drawRect(250, 0, 400, 340); 
				switch_on_rect.graphics.beginFill("white").drawRect(423,533,25,40); 
				switch_on_rect.alpha = 0.01;
				switch_on_rect.cursor = "pointer";
				cryoscopy_stage.addChild(mask_solvent_container);
				cryoscopy_stage.addChild(switch_on_rect);
				loadXml(); /** Function call to fetch data from xml */   
				dragDropTestTube(scope); /** Function call to drag test tube in the water bath */ 
				dragDropThermoMeter(scope); /** Function call to drag thermometer in the test tube */ 
				initialisationOfVariables(scope); /** Initialisation of variables */
				initialisationOfImages(); /** Initialisation of images */
			}
			/** Add all the strings used for the language translation here. '_' is the short cut for 
            calling the gettext function defined in the gettext-definition.js */
			function translationLabels() {
				/** This help array shows the hints for this experiment */
				helpArray = [_("help1"), _("help2"), _("help3"), _("help4"),_("help5"), _("help6"),
				_("help7"), _("help8"), _("help9"), _("help10"), _("help11"), _("help12"), _("help13"), _("Next"), _("Close")];
				scope.heading = _("Cryoscopy");
				scope.variables = _("Variables");
				scope.reset = _("Reset");
				scope.solvent_label = _("Solvent :");
				scope.solvent_mass_label = _("Solvent Mass(g)");
				scope.solvent_value = _("1");
				scope.solvent_unit = _("g");
				scope.solute_label =_("Solute :");
				scope.solute_mass_label = _("Solute Mass(g)");
				scope.solute_value = _("0");
				scope.solvent_unit = _("g");
				scope.solute_unit = _("g");
				scope.copyright = _("copyright");
				/** Adding solvents to an array */
				scope.selectSolventArray = [{optionsSolvent: _('Water'),type: 0}, {optionsSolvent: _('Benzene'),type: 1}, {optionsSolvent: _('Carbon disulphide'),type: 2}, {optionsSolvent: _('Carbon Tetrachloride'),type: 3}, {optionsSolvent: _('Chloroform'),type: 4}];
				scope.$apply();
            }
        }
    }
}

/** All variables initialising in this function */
function initialisationOfVariables(scope) {
	test_tube_current_x = 0;
	test_tube_current_y = 0;
	final_pos_obj_left = 430;
	final_pos_obj_right = 585;
	final_pos_obj_top = 260;
	final_pos_obj_bottom = 310;
	stir_counter = 0;
	selected_solvent_index = 0;	
	selected_solute_index  = 0;	
	scope.liquid_ctrls_disable = false;
	animation_counter = 0;
	scope.solvent_Mdl = 0;	
	scope.solute_Mdl = 0;
	scope.solvent_mass_value = 1;
	scope.solute_mass_value = 0;
	solute_mass = 0;
	solvent_mass = 1;
	stir_rotation_count = 0;
	arc_line = new createjs.Shape();
	/** Function to draw a wire from temperature controller to thermometer */
	arc_line.graphics.setStrokeStyle(5).beginStroke("black").bezierCurveTo(336, 363, 365, 100, 415, 128).endStroke();
	cryoscopy_stage.addChild(arc_line); 
	getChild("temperature").text = 37;
	/** Adding solutes of water to an array */
	scope.selectSoluteArray = [{optionsSolute: _('Sodium chloride'),type: 0}, {optionsSolute: _('Calcium chloride'),type: 1}, {optionsSolute: _('Aluminium chloride'),type: 2}, {optionsSolute: _('Urea'),type: 3}, {optionsSolute: _('Glucose'),type: 4}];		
	scope.solute_ctrls_disable = false;
	scope.solute_mass_ctrls_disable = false;
	scope.solvent_mass_ctrls_disable = false;
	scope.solute_mass_ctrls_disable = false;
	scope.solvent_ctrls_disable = false;
	power_flag = false;
	stir_complete_flag = false;
	press_flag = false;
	solvent_container.getChildByName("testtube_solution").mask.y = 0;
	testtube_dip_value = -50;
}

/** Set the initial status of the bitmap and text depends on its visibility and initial values */
function initialisationOfImages() {
	solvent_container.getChildByName("thermometer").x = 380;
	solvent_container.getChildByName("thermometer").y = 100; 
	current_temperature = 37;
	for ( var i=1; i<=15; i++ ) {
		getChild("stirrer" +i).x = 395;
		getChild("stirrer" +i).y = 210;
		getChild("stirrer" +i).alpha = 0;	
		getChild("stirrer" +i).scale = 0;	
	} 
	solute_container.getChildByName("salt_powder_still").scaleX = 0;
	solute_container.getChildByName("salt_powder_still").scaleY = 0;
	getChild("power_off").visible = true;
	getChild("power_on").visible = false;
	getChild("switch_on").visible = false;
	getChild("switch_off").visible = true;
	getChild("plate_shadow").visible = true;
	solute_container.visible = true;
}

/** Function to draw rectangular mask */
function drawRectangle(rect_name, x, y, width, height, alpha_val) {
    cryoscopy_stage.addChild(rect_name);
    rect_name.x = x;
    rect_name.y = y;
    rect_name.graphics.beginFill("").drawRect(0, 0, width, height).command;
    rect_name.alpha = alpha_val;
}

/** All the texts loading and added to the cryoscopy stage */
function setText(name, textX, textY, value, color, fontSize) {
    var _text = new createjs.Text(value, "bold " + fontSize + "em Tahoma, Geneva, sans-serif", color);
    _text.x = textX;
    _text.y = textY;
    _text.textBaseline = "alphabetic";
    _text.name = name;
    _text.text = value;
    _text.color = color;
	_text.font = "2em digiface";
    cryoscopy_stage.addChild(_text); /** Adding text to the container */
}

/** All the images loading and added to the cryoscopy stage */
function loadImages(image, name, xPos, yPos, cursor, rot ,container,scale) {
    var _bitmap = new createjs.Bitmap(image).set({});
    _bitmap.x = xPos;
    _bitmap.y = yPos;
    _bitmap.name = name;
    _bitmap.rotation = rot;
    _bitmap.cursor = cursor;
	/** Setting registration point for solute */
	if ( name == "salt_powder_still" ) {
		_bitmap.regX = _bitmap.image.width/4 ;
		_bitmap.regY = _bitmap.image.height ;
	  } 
	/** Masking the test tube solution */
	if ( name == "testtube_solution" ) {
		_bitmap.mask = mask_tube_rect;
    }
	/** Masking the switch */
	if( name == "switch_off" || name == "switch_on" ) {
		_bitmap.mask = switch_on_rect;
    }
	/** Masking the solute pouring animation to hide the solute outside the water bath */
	for ( var i = 1; i <=15; i++ ) {
		if ( name == "powder_pour"+i ) {	
			_bitmap.scaleY = scale;
			_bitmap.mask = mask_solvent_container;
		}
	} 
	/** Masking the stirrer animation to hide the stirrer movement over the water bath */
	for ( var i = 1; i <=15; i++ ) {
		if ( name == "stirrer"+i ) {
			_bitmap.scaleX = scale;
			_bitmap.mask = mask_solvent_container;
		}
	} 
	container.addChild(_bitmap); /** Adding bitmap to the stage */
}