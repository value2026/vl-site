(function() {
	angular.module('users')
		.directive("experiment", directiveFunction)
})();

var galvanometer_stage,exp_canvas,line_flag,line,wire_numbers,insert_key_flag,reverse_key_flag,initial_setup_flag;

var current_measure_rotation,rotate_compass_float,rotate_apparatus_float,index_val;

var number_of_turns,radius_in_mtr,current_int,rhvalue_int,voltage,measure_rotate,apparatus_rotatn;

var tick; /** Tick timer for stage updation */

var galvanometer_container,initial_view_container,reduction_factor,initial_measure_rotation,degree_of_deflection;

var no_of_turns_array = wires_array = help_array = [];

function directiveFunction() {
	return {
		restrict: "A",
		link: function(scope, element, attrs, dialogs) {
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

			queue = new createjs.LoadQueue(true);
			queue.installPlugin(createjs.Sound);
			queue.on("complete", handleComplete, this);
			queue.loadManifest([{
				id: "background",
				src: "././images/background.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "needle",
				src: "././images/needle.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "black_needle_knob",
				src: "././images/black_needle_knob.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "rheostat_top_move",
				src: "././images/rheostat_top_move.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "main_key",
				src: "././images/main_key.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "main_key_top",
				src: "././images/main_key_top.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "round_key1",
				src: "././images/round_key1.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "round_key2",
				src: "././images/round_key2.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "round_key3",
				src: "././images/round_key3.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "round_key4",
				src: "././images/round_key4.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "battery_to_voltmeter",
				src: "././images/battery_to_voltmeter.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "battery_to_keyport",
				src: "././images/battery_to_keyport.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "keyport_to_rheostat",
				src: "././images/keyport_to_rheostat.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "rheostat_to_round_keybox",
				src: "././images/rheostat_to_round_keybox.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "round_keybox_to_voltmeter",
				src: "././images/round_keybox_to_voltmeter.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "white_keybox_to_key1",
				src: "././images/white_keybox_to_key1.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "white_keybox_to_key2",
				src: "././images/white_keybox_to_key2.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "white_keybox_to_key3",
				src: "././images/white_keybox_to_key3.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "white_keybox_to_key4",
				src: "././images/white_keybox_to_key4.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "black_keybox_to_key1",
				src: "././images/black_keybox_to_key1.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "black_keybox_to_key2",
				src: "././images/black_keybox_to_key2.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "black_keybox_to_key3",
				src: "././images/black_keybox_to_key3.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "black_keybox_to_key4",
				src: "././images/black_keybox_to_key4.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "ciruit_diagram",
				src: "././images/ciruit_diagram.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "zoomed_background",
				src: "././images/zoomed_background.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "zoomed_black_round",
				src: "././images/zoomed_black_round.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "zoomed_measures",
				src: "././images/zoomed_measures.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "zoomed_black_needle_base",
				src: "././images/zoomed_black_needle_base.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "zoomed_needle",
				src: "././images/zoomed_needle.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "zoomed_needle_top",
				src: "././images/zoomed_needle_top.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "zoomed_glacing",
				src: "././images/zoomed_glacing.svg",
				type: createjs.LoadQueue.IMAGE
			}]);
			galvanometer_stage = new createjs.Stage("demoCanvas");
			galvanometer_stage.enableDOMEvents(true);
			galvanometer_stage.enableMouseOver();
			createjs.Touch.enable(galvanometer_stage);
			tick = setInterval(updateTimer, 100); /** Stage update function in a timer */

			galvanometer_container = new createjs.Container(); /** Creating the tangent galvanometer container */
			galvanometer_container.name = "galvanometer_container";
			galvanometer_stage.addChild(galvanometer_container); /** Append it in the stage */

			initial_view_container = new createjs.Container(); /** Creating the initial view container */
			initial_view_container.name = "initial_view_container";
			galvanometer_stage.addChild(initial_view_container); /** Append it in the stage */
			initial_view_container.alpha = 0;

			circleDeclaration(); /** Circle declaration for connect the wires is created in this function */
			line = new createjs.Shape(); /** Line is created for connect the wires */

			function handleComplete() {
				loadImages(queue.getResult("background"), "background", -42, -8, "", 0, galvanometer_container);
				loadImages(queue.getResult("needle"), "needle", 585, 242, "", 30, galvanometer_container);
				loadImages(queue.getResult("black_needle_knob"), "black_needle_knob", 584, 242, "", 30, galvanometer_container);
				loadImages(queue.getResult("rheostat_top_move"), "rheostat_top_move", 210, 445, "", 0, galvanometer_container);
				loadImages(queue.getResult("main_key"), "main_key", 56, 405, "", 0, galvanometer_container);
				loadImages(queue.getResult("main_key_top"), "main_key_top", 33, 420, "", 0, galvanometer_container);
				loadImages(queue.getResult("round_key1"), "round_key1", 272, 315, "", 0, galvanometer_container);
				loadImages(queue.getResult("round_key2"), "round_key2", 308, 315, "", 0, galvanometer_container);
				loadImages(queue.getResult("round_key3"), "round_key3", 309, 338, "", 0, galvanometer_container);
				loadImages(queue.getResult("round_key4"), "round_key4", 274, 338, "", 0, galvanometer_container);
				loadImages(queue.getResult("battery_to_voltmeter"), "battery_to_voltmeter", 114, 193, "", 0, galvanometer_container);
				loadImages(queue.getResult("battery_to_keyport"), "battery_to_keyport", -7, 193, "", 0, galvanometer_container);
				loadImages(queue.getResult("keyport_to_rheostat"), "keyport_to_rheostat", 84, 405, "", 0, galvanometer_container);
				loadImages(queue.getResult("rheostat_to_round_keybox"), "rheostat_to_round_keybox", 326, 333, "", 0, galvanometer_container);
				loadImages(queue.getResult("round_keybox_to_voltmeter"), "round_keybox_to_voltmeter", 235, 198, "", 0, galvanometer_container);
				loadImages(queue.getResult("white_keybox_to_key1"), "white_keybox_to_key1", 290, 311, "", 0, galvanometer_container);
				loadImages(queue.getResult("white_keybox_to_key2"), "white_keybox_to_key2", 290, 310, "", 0, galvanometer_container);
				loadImages(queue.getResult("white_keybox_to_key3"), "white_keybox_to_key3", 292, 312, "", 0, galvanometer_container);
				loadImages(queue.getResult("white_keybox_to_key4"), "white_keybox_to_key4", 290, 316, "", 0, galvanometer_container);
				loadImages(queue.getResult("black_keybox_to_key1"), "black_keybox_to_key1", 297, 350, "", 0, galvanometer_container);
				loadImages(queue.getResult("black_keybox_to_key2"), "black_keybox_to_key2", 295, 348, "", 0, galvanometer_container);
				loadImages(queue.getResult("black_keybox_to_key3"), "black_keybox_to_key3", 295, 350, "", 0, galvanometer_container);
				loadImages(queue.getResult("black_keybox_to_key4"), "black_keybox_to_key4", 295, 350, "", 0, galvanometer_container);
				loadImages(queue.getResult("ciruit_diagram"), "ciruit_diagram", 30, 10, "", 0, galvanometer_container);
				loadImages(queue.getResult("zoomed_background"), "zoomed_background", 350, 380, "", 0, initial_view_container);
				loadImages(queue.getResult("zoomed_black_round"), "zoomed_black_round", 340, 330, "", 0, initial_view_container);
				loadImages(queue.getResult("zoomed_measures"), "zoomed_measures", 342, 330, "", -50, initial_view_container);
				loadImages(queue.getResult("zoomed_black_needle_base"), "zoomed_black_needle_base", 342, 325, "", 30, initial_view_container);
				loadImages(queue.getResult("zoomed_needle"), "zoomed_needle", 342, 325, "", 30, initial_view_container);
				loadImages(queue.getResult("zoomed_needle_top"), "zoomed_needle_top", 322, 305, "", 0, initial_view_container);
				loadImages(queue.getResult("zoomed_glacing"), "zoomed_glacing", 352, 332, "", 0, initial_view_container);
				/** Text box loading */
				setText("voltmeterTxt", 276, 182, "0", "black", 1.3, galvanometer_container);
				setText("voltmeterSymbol", 322, 191, "A", "black", 0.8, galvanometer_container);
				initialisationOfVariables(); /** Initializing the variables */
				initialisationOfImages(); /** Function call for images used in the apparatus visibility */
				translationLabels(); /** Translation of strings using gettext */
			}

			/** Add all the strings used for the language translation here. '_' is the short cut for calling the gettext function defined in the gettext-definition.js */
			function translationLabels() {
				/** This help array shows the hints for this experiment */
				help_array = [_("help1"), _("help2"), _("help3"), _("help4"), _("help5"), _("help6"), _("help7"), _("Next"), _("Close")];
				scope.heading = _("Tangent Galvanometer");
				scope.variables = _("Variables");
				scope.no_of_turns = _("Number of turns of the coil");
				scope.initial_setup_btn_lbl = _("Initial Setup");
				scope.insert_key_btn_lbl = _("Insert Key");
				scope.reverse_current_btn_lbl = _("Reverse Current");
				scope.radius_of_coils = _("Radius of the coil ");
				scope.adjust_rheostat = _("Adjust rheostat");
				scope.rotate_compass = _("Rotate compass box");
				scope.rotate_apparatus = _("Rotate apparatus");
				scope.cm = _("cm");
				scope.show_result = _("Show Result");
				scope.reset = _("Reset");
				scope.result = _("Result");
				scope.red_factor = _("Reduction Factor");
				scope.show_normal = _("Show Normal");
				scope.copyright = _("copyright");
				/** The no_of_turns_array contains the values and indexes of the first slider */
				scope.no_of_turns_array = [{
					turns: 10,
					index_val: 0
				}, {
					turns: 15,
					index_val: 1
				}, {
					turns: 20,
					index_val: 2
				}, {
					turns: 25,
					index_val: 3
				}, {
					turns: 35,
					index_val: 4
				}, {
					turns: 45,
					index_val: 5
				}];
				scope.$apply();
			}
		}
	}
}

/** Createjs stage updation happens in every interval */
function updateTimer() {
	galvanometer_stage.update();
}

/** All the texts loading and added to the stage */
function setText(name, textX, textY, value, color, fontSize, container) {
	var _text = new createjs.Text(value, "bold " + fontSize + "em Tahoma, Geneva, sans-serif", color);
	_text.x = textX;
	_text.y = textY;
	_text.textBaseline = "alphabetic";
	_text.name = name;
	_text.text = value;
	_text.color = color;
	container.addChild(_text); /** Adding text to the container */
}

/** All the images loading and added to the stage */
function loadImages(image, name, xPos, yPos, cursor, rot, container) {
	var _bitmap = new createjs.Bitmap(image).set({});
	if (name == "zoomed_background" || name == "zoomed_black_round" || name == "zoomed_measures" || name == "zoomed_needle" || name == "zoomed_black_needle_base" || name == "black_needle_knob" || name == "needle" || name == "zoomed_glacing") {
		_bitmap.regX = _bitmap.image.width / 2;
		_bitmap.regY = _bitmap.image.height / 2;
	}
	_bitmap.x = xPos;
	_bitmap.y = yPos;
	_bitmap.scaleX = _bitmap.scaleY = 0.85;
	_bitmap.name = name;
	_bitmap.alpha = 1;
	_bitmap.rotation = rot;
	_bitmap.cursor = cursor;
	container.addChild(_bitmap); /** Adding bitmap to the container */
}

/** Assigning the names for each wire */
function getWiresName() {
	white1 = galvanometer_container.getChildByName("white_keybox_to_key2");
	white2 = galvanometer_container.getChildByName("white_keybox_to_key1");
	white3 = galvanometer_container.getChildByName("white_keybox_to_key3");
	white4 = galvanometer_container.getChildByName("white_keybox_to_key4");
	black1 = galvanometer_container.getChildByName("black_keybox_to_key1");
	black2 = galvanometer_container.getChildByName("black_keybox_to_key2");
	black3 = galvanometer_container.getChildByName("black_keybox_to_key3");
	black4 = galvanometer_container.getChildByName("black_keybox_to_key4");
	wires_array = [
		[white2, black1],
		[white3, black2],
		[white4, black3],
		[white3, black1],
		[white4, black2],
		[white4, black2],
		[white4, black1],
		[white4, black1]
	];
}

/** All variables initialising in this function */
function initialisationOfVariables() {
	wire_numbers = 0; /** Count of wires */
	number_of_turns = 10;
	radius_in_mtr = 0.04;
	current_int = 1;
	rhvalue_int = 5;
	voltage = 5;
	index_val = 0;
	reduction_factor = 0;
	measure_rotate = 0;
	apparatus_rotatn = 0;
	current_measure_rotation = 0;
	initial_measure_rotation = 50;
	galvanometer_container.alpha = 1; /** Initially displayed the galvanometer container */
	initial_view_container.alpha = 0; /** Initial view container is not displayed initially */
	line_flag = false; /** Draw line flag for connect wires */
	insert_key_flag = false; /** Insert key and reverse key flag */
	reverse_key_flag = false;
	initial_setup_flag = false; /** Initial setup flag */
	galvanometer_container.getChildByName("voltmeterTxt").text = 0;
	/** Following buttons and sliders are disabled first except initial setup button */
	hide_show_sliders = false; /** It hides the sliders rotate compass box and rotate apparatus */
	control_disable = true; /** It disables the controls drop down box, reverse current, radius of coil, adjust rheostat, check box, reset */
	insert_key_disable = true; /** It disables the insert key button */
}

/** Set the initial status of the bitmap and text depends on its visibility and initial values */
function initialisationOfImages() {
	galvanometer_container.getChildByName("battery_to_voltmeter").visible = false;
	galvanometer_container.getChildByName("battery_to_keyport").visible = false;
	galvanometer_container.getChildByName("keyport_to_rheostat").visible = false;
	galvanometer_container.getChildByName("rheostat_to_round_keybox").visible = false;
	galvanometer_container.getChildByName("round_keybox_to_voltmeter").visible = false;
	galvanometer_container.getChildByName("white_keybox_to_key1").visible = false;
	galvanometer_container.getChildByName("white_keybox_to_key2").visible = false;
	galvanometer_container.getChildByName("white_keybox_to_key3").visible = false;
	galvanometer_container.getChildByName("white_keybox_to_key4").visible = false;
	galvanometer_container.getChildByName("black_keybox_to_key1").visible = false;
	galvanometer_container.getChildByName("black_keybox_to_key2").visible = false;
	galvanometer_container.getChildByName("black_keybox_to_key3").visible = false;
	galvanometer_container.getChildByName("black_keybox_to_key4").visible = false;
	galvanometer_container.getChildByName("round_key2").visible = false;
	galvanometer_container.getChildByName("round_key4").visible = false;
	galvanometer_container.getChildByName("main_key").visible = false;
}

/** Button event for showing the normal view */
function initialSetup(scope,dialogs) {
	/** On clicking the 'Initial setup' button the initial view disabled and zoomed view of the compass appears */
	if ( !initial_setup_flag ) {
		scope.hide_show_sliders = true;
		initial_setup_flag = true;
		galvanometer_container.alpha = 0;
		initial_view_container.alpha = 1;
		scope.initial_setup_btn_lbl = _("Show Normal"); /** Button label changed as Show Normal */
	} else { /** On clicking on the 'Normal view' button initial view will disable  and ready for the wire connection */
		initial_setup_flag = false;
		scope.hide_show_sliders = false;
		galvanometer_container.alpha = 1;
		initial_view_container.alpha = 0;
		if ( scope.rotate_apparatus_disable == false ) {
			scope.initial_setup_btn_lbl = _("Zoom Compass"); /** Button value changed as Initial Setup */
			if ( rotate_compass_float >= 100 ) {
				if ((apparatus_rotatn >= 207 && apparatus_rotatn <= 209) || (apparatus_rotatn >= 389 && apparatus_rotatn <= 391)) {
			  		/** Check whether the '0' reading of the apparatus coined to the needle, 
			 		then the circuit is ready for the connection */
					scope.rotate_apparatus_disable = true;
					createCircleForConnection(scope); /** Ready for wire connection */				
				} else { /** If initial adjustment fails */
				 	dialogs.error();
				}
			} else { /** Second division of the compass reading */
				if ( (apparatus_rotatn >= 28 && apparatus_rotatn <= 31) || (apparatus_rotatn >= 207 && apparatus_rotatn <= 210) ) {
					/** Check whether the '0' reading of the apparatus coined to the needle, 
					then the circuit is ready for the connection */
					scope.rotate_apparatus_disable = true;
					createCircleForConnection(scope); /** Ready for wire connection */
				} else { /** If initial adjustment fails */
				 	dialogs.error();
				}
			}
		} else {
			scope.initial_setup_btn_lbl = _("Initial Setup"); /** Button value changed as Initial Setup */
		}				
	}
}

/** Radius of the coil slider function */
function radiusSliderFN(scope) {
	radius_in_mtr = scope.Radius / 100;
	scope.radius = scope.Radius;
	intensityAndRedFactorCalc(scope); /** Finding the angle of deflection and reduction factor  */
}

/** Adjust rheostat slider function */
function adjRheostatSliderFN(scope) {
	rhvalue_int = scope.adjustRheostat;
	/** Rheostat key position changes according to the slider value */
	var _x_move = 200 + (Number(rhvalue_int) * 2.0999); /** Adjusting the values */
	galvanometer_container.getChildByName("rheostat_top_move").x = _x_move;
	intensityAndRedFactorCalc(scope); /** Finding the angle of deflection and reduction factor */
}

/** Function for find the current rotation of the zoomed measure*/
function currentRotation(scope) {
	current_measure_rotation = initial_view_container.getChildByName("zoomed_measures").rotation;
}

/** Rotate compass slider changing function */
function rotateCompassSliderFN(scope) {
	rotate_compass_float = scope.rotateCompass;
	if ( (rotate_compass_float >= 48 && rotate_compass_float <= 56) || (rotate_compass_float >= 224 && rotate_compass_float <= 232) ) {
		/** Rotate the compass in such a way that the 90 reading in the compass come horizontal to the apparatus */
		scope.rotate_apparatus_disable = false;
	} else {
		scope.rotate_apparatus_disable = true;
	}
	measure_rotate = rotate_compass_float - initial_measure_rotation;
	var _zoomed_measure_tween = createjs.Tween.get(initial_view_container.getChildByName("zoomed_measures")).to({
		rotation: (measure_rotate)
	}, 100); /** Rotate the measures in the zoomed view */
}

/** Rotate apparatus slider changing function */
function rotateApparatusSliderFN(scope) {
	scope.rotate_compass_disable = true; /** It disables the rotate compass slider */
	rotate_apparatus_float = scope.rotateApparatus;
	apparatus_rotatn=Math.round(rotate_apparatus_float+measure_rotate);
	/** Rotate full apparatus including background except needle rotation using tween */
	var _zoomed_background_tween = createjs.Tween.get(initial_view_container.getChildByName("zoomed_background")).to({
		rotation: (rotate_apparatus_float)
	}, 500);
	var _zoomed_black_round_tween = createjs.Tween.get(initial_view_container.getChildByName("zoomed_black_round")).to({
		rotation: (rotate_apparatus_float)
	}, 500);
	var _zoomed_measures_tween = createjs.Tween.get(initial_view_container.getChildByName("zoomed_measures")).to({
		rotation: (apparatus_rotatn)
	}, 500);
}

/** Circle declarations for the connection of the wires is created in this function */
function circleDeclaration() {
	voltmeter_circle1 = new createjs.Shape();
	voltmeter_circle2 = new createjs.Shape();
	battery_circle1 = new createjs.Shape();
	battery_circle2 = new createjs.Shape();
	key_circle1 = new createjs.Shape();
	key_circle2 = new createjs.Shape();
	rheostat_circle1 = new createjs.Shape();
	rheostat_circle2 = new createjs.Shape();
	keybox_circle1 = new createjs.Shape();
	keybox_circle2 = new createjs.Shape();
	keybox_circle3 = new createjs.Shape();
	keybox_circle4 = new createjs.Shape();
	compassbox_circle1 = new createjs.Shape();
	compassbox_circle2 = new createjs.Shape();
}

/** Create circle functions */
function createCircleForConnection(scope) {
	drawShapeArc(voltmeter_circle1, "voltmeter_circle1", 268, 212, "red", 20, galvanometer_container, scope);
	drawShapeArc(voltmeter_circle2, "voltmeter_circle2", 343, 212, "#025782", 20, galvanometer_container, scope);
	drawShapeArc(battery_circle1, "battery_circle1", 121, 210, "red", 20, galvanometer_container, scope);
	drawShapeArc(battery_circle2, "battery_circle2", 40, 210, "black", 20, galvanometer_container, scope);
	drawShapeArc(key_circle1, "key_circle1", 47, 418, "black", 20, galvanometer_container, scope);
	drawShapeArc(key_circle2, "key_circle2", 90, 418, "white", 20, galvanometer_container, scope);
	drawShapeArc(rheostat_circle1, "rheostat_circle1", 233, 558, "white", 20, galvanometer_container, scope);
	drawShapeArc(rheostat_circle2, "rheostat_circle2", 513, 462, "#869218", 20, galvanometer_container, scope);
	drawShapeArc(keybox_circle2, "keybox_circle2", 335, 335, "#869218", 20, galvanometer_container, scope);
	drawShapeArc(keybox_circle4, "keybox_circle4", 270, 340, "#025782", 20, galvanometer_container, scope);
	drawShapeArc(keybox_circle1, "keybox_circle1", 300, 325, "white", 20, galvanometer_container, scope);
	drawShapeArc(keybox_circle3, "keybox_circle3", 305, 355, "#660000", 20, galvanometer_container, scope);
	drawShapeArc(compassbox_circle1, "compassbox_circle1", 550, 350, "#660000", 20, galvanometer_container, scope);
	drawShapeArc(compassbox_circle2, "compassbox_circle2", 570, 365, "white", 20, galvanometer_container, scope);
}

/** Create circle shape here */
function drawShapeArc(shapeName, name, xPos, yPos, color, radius, container, scope) {
	container.addChild(shapeName);
	shapeName.name = name;
	shapeName.cursor = "pointer";
	shapeName.alpha = 0.01;
	initialX = xPos;
	initialY = yPos;
	shapeName.graphics.setStrokeStyle(2);
	shapeName.graphics.beginFill(color).drawCircle(0, 0, radius);
	shapeName.x = xPos;
	shapeName.y = yPos;
	/** Click and drag the devices end point teminals for the connection to the respective terminals */
	shapeName.on("mousedown", function(evt) {
		this.parent.addChild(this);
		this.offset = {
			x: this.x - evt.stageX / galvanometer_stage.scaleX,
			y: this.y - evt.stageY / galvanometer_stage.scaleY
		};
	});
	shapeName.on("pressmove", function(evt) {
		this.x = (evt.stageX / galvanometer_stage.scaleX) + this.offset.x;
		this.y = (evt.stageY / galvanometer_stage.scaleY) + this.offset.y;
		shapeName.x = this.x;
		shapeName.y = this.y;
		line.graphics.clear();
		if (line_flag == false) {
			line.graphics.moveTo(xPos, yPos).setStrokeStyle(3).beginStroke(color).lineTo(this.x, this.y);
			container.addChild(line);
		}
		shapeName.on("pressup", function(evt) {
			line.graphics.clear();
			shapeName.x = xPos;
			shapeName.y = yPos;
			line.graphics.clear();
			if (line_flag) {
				wire_numbers++;
				checkConnectionComplete(scope); /** Check the connection complete or not */
				line_flag = false; /** Set line flag as false */
			} else {
				shapeName.alpha = 0.01;
			}
		});
		shapeName.on("mouseup", function(evt) {
			shapeName.x = xPos;
			shapeName.y = yPos;
			line.graphics.clear();
			line.graphics.clear();
		});
		checkHitLead(name,shapeName.x,shapeName.y); /** Check hit occur in lead with wires */
	});
}

/** Lead hit with wires */
function checkHitLead(name,xPos, yPos) {
	switch (name) { /** Hit check with one spot to other */
		case "voltmeter_circle1":
			checkHit(galvanometer_container.getChildByName("battery_circle1"), "battery_to_voltmeter", name, xPos, yPos);
			break;
		case "battery_circle1":
			checkHit(galvanometer_container.getChildByName("voltmeter_circle1"), "battery_to_voltmeter", name, xPos, yPos);
			break;
		case "battery_circle2":
			checkHit(galvanometer_container.getChildByName("key_circle1"), "battery_to_keyport", name, xPos, yPos);
			break;
		case "key_circle1":
			checkHit(galvanometer_container.getChildByName("battery_circle2"), "battery_to_keyport", name, xPos, yPos);
			break;
		case "key_circle2":
			checkHit(galvanometer_container.getChildByName("rheostat_circle1"), "keyport_to_rheostat", name, xPos, yPos);
			break;
		case "rheostat_circle1":
			checkHit(galvanometer_container.getChildByName("key_circle2"), "keyport_to_rheostat", name, xPos, yPos);
			break;
		case "rheostat_circle2":
			checkHit(galvanometer_container.getChildByName("keybox_circle2"), "rheostat_to_round_keybox", name, xPos, yPos);
			break;
		case "keybox_circle2":
			checkHit(galvanometer_container.getChildByName("rheostat_circle2"), "rheostat_to_round_keybox", name, xPos, yPos);
			break;
		case "keybox_circle4":
			checkHit(galvanometer_container.getChildByName("voltmeter_circle2"), "round_keybox_to_voltmeter", name, xPos, yPos);
			break;
		case "voltmeter_circle2":
			checkHit(galvanometer_container.getChildByName("keybox_circle4"), "round_keybox_to_voltmeter", name, xPos, yPos);
			break;
		case "keybox_circle1":
			checkHit(galvanometer_container.getChildByName("compassbox_circle2"), "white_keybox_to_key1", name, xPos, yPos);
			break;
		case "compassbox_circle2":
			checkHit(galvanometer_container.getChildByName("keybox_circle1"), "white_keybox_to_key2", name, xPos, yPos);
			break;
		case "keybox_circle3":
			checkHit(galvanometer_container.getChildByName("compassbox_circle1"), "black_keybox_to_key1", name, xPos, yPos);
			break;
		case "compassbox_circle1":
			checkHit(galvanometer_container.getChildByName("keybox_circle3"), "black_keybox_to_key1", name, xPos, yPos);
			break;
	}
}

/** Hit check function */
function checkHit(spot, wire, name,xPos, yPos) {
	spot.alpha = 0.8; /** Shows the destination point */
	var _ptl = spot.globalToLocal(xPos, yPos);
	if ( spot.hitTest(_ptl.x, _ptl.y) ) { /** If hit occured or sucessful connection */     
		line_flag = true;
		line.graphics.clear();
		galvanometer_container.removeChild(line);
		galvanometer_container.getChildByName(wire).visible = true;
		spot.alpha = 0.01;
		spot.mouseEnabled = false;
		galvanometer_container.getChildByName(name).mouseEnabled = false;
	} else {
		releaseHit(spot, name); /** Highlight the  other terminal when click on one terminal */
	}
}
/** Function for releasing the drag for hit */
function releaseHit(spot, name) {
	galvanometer_container.getChildByName(name).on("pressup", function(evt) {
		spot.alpha = 0.01; /** Invisible the shape on release hit */
	});
}
/** Check the connection complete or not */
function checkConnectionComplete(scope) {
	if ( wire_numbers == 7 ) { /** Wire numbers reaches 7 when all the connections completed */
		scope.insert_key_disable = false; /** It enables the insert key button */
		scope.$apply();
	}
}

/** Drop down list change function */
function noOfTurnsSelection(scope) {
	getWiresName();
	var _turns_count = (scope.Turns-10)/5;
	for ( var i = 0; i < wires_array.length; i++ ) { /** Wires for invisible */
		wires_array[i][0].visible = false;
		wires_array[i][1].visible = false;
	}
	wires_array[_turns_count][0].visible = true;
	wires_array[_turns_count][1].visible = true;
	number_of_turns = scope.Turns;
	intensityAndRedFactorCalc(scope); /** Calculation */
}
/** Insert key button function */
function insertKeyFunction(scope) {
	if ( !insert_key_flag ) { /** If key is inserted  */
		galvanometer_container.getChildByName("main_key").visible = true;
		galvanometer_container.getChildByName("voltmeterTxt").text = 1;
		scope.insert_key_btn_lbl = _("Remove Key"); /** Button value changed as Remove key */
		scope.control_disable = false;
		insert_key_flag = true;
		intensityAndRedFactorCalc(scope);
	} else { /** If key is removed  */
		galvanometer_container.getChildByName("main_key").visible = false;
		galvanometer_container.getChildByName("voltmeterTxt").text = 0;
		scope.insert_key_btn_lbl = _("Insert Key");
		scope.control_disable = true;
		insert_key_flag = false;
		var _zoomed_needle_tween = createjs.Tween.get(initial_view_container.getChildByName("zoomed_needle")).to({
		rotation: (30)
	}, 500); /** Needle coined 0-0 line when key is removed */
		var zoomed_needlebase_tween = createjs.Tween.get(initial_view_container.getChildByName("zoomed_black_needle_base")).to({
		rotation: (30)
	}, 500); /** Rotate the base of the needle */
	galvanometer_container.getChildByName("black_needle_knob").rotation = 30;
		galvanometer_container.getChildByName("needle").rotation = 30;
	}	
}

/** Reverse current button function */
function reverseCurrentFunction(scope) {
	/** On reverse current button, the compass will deflect to the reverse position 
	marked by an anticlockwise direction, and vise versa */
	var _rev_rotation;
	if ( !reverse_key_flag ) {
		galvanometer_container.getChildByName("round_key1").visible = false;
		galvanometer_container.getChildByName("round_key3").visible = false;
		galvanometer_container.getChildByName("round_key2").visible = true;
		galvanometer_container.getChildByName("round_key4").visible = true;
		reverse_key_flag = true; /** Set reverse key flag as true */
		_rev_rotation = (initial_view_container.getChildByName("zoomed_needle").rotation - (degree_of_deflection * 2));
	} else {
		_rev_rotation = (initial_view_container.getChildByName("zoomed_needle").rotation + (degree_of_deflection * 2));
		galvanometer_container.getChildByName("round_key1").visible = true;
		galvanometer_container.getChildByName("round_key3").visible = true;
		galvanometer_container.getChildByName("round_key2").visible = false;
		galvanometer_container.getChildByName("round_key4").visible = false;
		reverse_key_flag = false; /** Set reverse key flag as false */
	}
	/** Rotate the needle of the compass based on the reverse current calculation */
	var _zoomed_needle_tween = createjs.Tween.get(initial_view_container.getChildByName("zoomed_needle")).to({
		rotation: (_rev_rotation)
	}, 500);
	var _zoomed_needlebase_tween = createjs.Tween.get(initial_view_container.getChildByName("zoomed_black_needle_base")).to({
		rotation: (_rev_rotation)
	}, 500);
	galvanometer_container.getChildByName("black_needle_knob").rotation = _rev_rotation;
	galvanometer_container.getChildByName("needle").rotation = _rev_rotation;

}

/** Show result check box function */
function showresultFN(scope) {	
	if ( scope.resultValue == true ) { /** Display the reduction factor in this function */
		if ( insert_key_flag == true ) {
			scope.hide_show_result = true;
			scope.red_factor_value = reduction_factor.toFixed(2); /** Display the reduction factor result */
		}
	} else {
		scope.hide_show_result = false;
	}
}

/** Resetting the experiment */
function reset(scope) {
	window.location.reload();
}

/** Calculations starts here */
/** Finding the horizontal intensity and reduction factor in this function */
function intensityAndRedFactorCalc(scope) {
	
	/** _tan_theta -->quotient of magnetic field at the earth center to magnetic field BH(T)
	_erth_centr_magfield --> is the magnetic field ath the centre of the earth, can be calculated by
	( µ0*n* I)/2 *r , where I= current, n= number of turns of a circular coil, 
	r is the radius of the coil and µ0 =4π*10^7 */

	var _tan_theta;
	var _erth_centr_magfield;
	var _erth_magfield = 0.000035; /** Earth magnetic field, which is a constant 3.5* 10^-5 */
	var _deflection_radian; /** Deflection angle in radians */
	var _rotation;

	/** current I= V/R , where V is the volateg and  R is the resistance */
	current_int = voltage / rhvalue_int;

	/** Voltmeter text display */
	galvanometer_container.getChildByName("voltmeterTxt").text = current_int.toFixed(3);

	_erth_centr_magfield = (4 * Math.PI * Math.pow(10, -7) * number_of_turns * current_int) / (2 * radius_in_mtr);
	/** B= BH tanθ */
	_tan_theta = _erth_centr_magfield / _erth_magfield;
	/** deflection (radian)=Math.atan(θ) */
	_deflection_radian = Math.atan(_tan_theta);
	/** 1 degree=1 radian* 180/Math.PI */
	degree_of_deflection = _deflection_radian * (180 / Math.PI);
	
	if ( !reverse_key_flag ) {
		_rotation=30 +degree_of_deflection;
	} else { // For reverse current rotation */
		_rotation=-(degree_of_deflection)+30;
	}
		
	/** Rotating, compass needle and compass base depend upon the magnetic field and deflection */
	var zoomed_needle_tween = createjs.Tween.get(initial_view_container.getChildByName("zoomed_needle")).to({
		rotation: (_rotation)
	}, 500);
	var zoomed_needlebase_tween = createjs.Tween.get(initial_view_container.getChildByName("zoomed_black_needle_base")).to({
		rotation: (_rotation)
	}, 500);
	galvanometer_container.getChildByName("black_needle_knob").rotation = _rotation;
	galvanometer_container.getChildByName("needle").rotation = _rotation;
	/** Reduction factor K (A)=current/tanθ */
	reduction_factor = current_int / _tan_theta;
	/** Display results in the result tab */
	showresultFN(scope);
}
/** Calculation ends here */