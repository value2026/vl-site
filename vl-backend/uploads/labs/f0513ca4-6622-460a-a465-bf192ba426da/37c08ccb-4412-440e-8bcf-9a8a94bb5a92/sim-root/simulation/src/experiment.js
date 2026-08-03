/** Directive function call will call onload */
(function() {
	angular.module('users')
		.directive("experiment", directiveFunction)
})();

var x_point, y_point;

var helpArray = [];

var stage, canvas, line_flag , wheatson_wire_flag;

var line = new createjs.Shape();

var cro_wave = new createjs.Shape();

var coil_mask_rect = new createjs.Shape();

var cro_mask_rect = new createjs.Shape();

var q_resistor_click, p_resistor_click, r_resistor_click, s_resistor_click ;

var voltperdiv_array, timeperdiv_array;

var tick, wire_num_int, wheatson_container, anderson_container, cro_container, galv_val_int, galv_result_int,galv_val ;

var const_power_int, area_float, no_turns_int, inductance_float, inductance_value_float, inductive_reactance;

var permeability_float, R2Star_float, R3Star_float, XL_float;

var length_val_float, diamter_val_float, frequency_val_float, tuner2_count_int, tuner1_count_int, capacitance_float, Xc_float, tuner1_rot_int,tuner2_rot_int, output_freq_float, initial_rect_width, coil_width_factor, initial_coil_len, output_wave_float;

var varbl_resistance_val_float, voltage_val_int, frequency_val_float, coil_diameter, coil_length, resistorQ_val, resistorP_val, resistorR_val, resistorS_val, xInitial, init;

var rslt1, inductanceSplitedArr, inductance_value, exponent_value, result_value,back_resistance_checkbox_model_array, fractional_resistance_checkbox_model_array, resR_checkbox_model_array, resS_checkbox_model_array; 

var rslt2, inductive_reactanceArr, inductive_reactance_val, exponent_val, inductive_reactance_reslt, induc_reactnce;

var resistance_total , resistance_back_total;

function directiveFunction() {
	return {
		restrict: "A",
		link: function(scope, element, attrs) {
			// variable that decides if something should be drawn on mousemove
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
			canvas = document.getElementById("demoCanvas");
			canvas.width = element[0].width;
			canvas.height = element[0].height;
			queue = new createjs.LoadQueue(true);
			queue.installPlugin(createjs.Sound);
			queue.on("complete", handleComplete, this);
			queue.loadManifest([{
				id: "background",
				src: "././images/background.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "voltmeter",
				src: "././images/voltmeter.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "battery",
				src: "././images/battery.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "blackwire1",
				src: "././images/blackwire_1.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "blackwire2",
				src: "././images/blackwire_2.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "blackwire3",
				src: "././images/blackwire_3.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "blackwire4",
				src: "././images/blackwire_4.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "blackwire5",
				src: "././images/blackwire_5.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "blackwire6",
				src: "././images/blackwire_6.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "redwire1",
				src: "././images/redwire_1.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "redwire2",
				src: "././images/redwire_2.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "variable_resistor",
				src: "././images/variable_resistor.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "variable_resistor_top",
				src: "././images/variable_resistor_top.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "batterytovariableresistor",
				src: "././images/battery_variable_resistor.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "variable_resistor_to_resistor",
				src: "././images/variable_resistor_to_resistor.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "resistor",
				src: "././images/resistor.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "batterytoresistor",
				src: "././images/battery_resistor.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "probe",
				src: "././images/probe.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "probe_wire_to _battery _right",
				src: "././images/probe_wire_to _battery _right.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "probe_to_resistor",
				src: "././images/probe_to_resistor.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "Coil_to_battery_left",
				src: "././images/coil_to_battery_left.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "coil_to_battery_right",
				src: "././images/coil_to_battery_right.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "coil",
				src: "././images/coil.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "transformer",
				src: "././images/transformer.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "transformer_to_left_resistor",
				src: "././images/transformer_to_left_resistor.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "transformer_to_ right_resistor",
				src: "././images/transformer_to_ right_resistor.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "cro",
				src: "././images/cro.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "turner",
				src: "././images/turner.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "arrow",
				src: "././images/arrow.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "turnerdot",
				src: "././images/turnerdot.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "signal_arrow",
				src: "././images/signal_arrow.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "variable_resistor_top",
				src: "././images/variable_resistor_top.svg",
				type: createjs.LoadQueue.IMAGE
			}]);
			stage = new createjs.Stage("demoCanvas");
			/** Enables all mouse events */
			stage.enableDOMEvents(true);
			stage.enableMouseOver(10);
			stage.mouseMoveOutside = true;
			createjs.Touch.enable(stage); /** Enable touch events */

			wheatson_container = new createjs.Container(); /**Container for adding wheatson's bridge to the stage*/
			wheatson_container.name = "wheatson_container";
			stage.addChild(wheatson_container); /** Append it in the stage */

			anderson_container = new createjs.Container(); /**Container for adding anderson's bridge to the stage*/
			anderson_container.name = "anderson_container";
			stage.addChild(anderson_container); /** Append it in the stage */

			cro_container = new createjs.Container(); /**Container for adding cro apparatus to the stage*/
			cro_container.name = "cro_container";
			stage.addChild(cro_container); /** Append it in the stage */
			SpotsHitDeclaration(); /** Circle declaration for connect the wires is created in this function */
			/** resistor clickable rectangles  */
            q_resistor_click = new createjs.Shape();
            p_resistor_click = new createjs.Shape();
			r_resistor_click = new createjs.Shape();
			s_resistor_click = new createjs.Shape();
			stage.update();
			/** Loads images and texts to the stage */
			function handleComplete() {
				loadImages(queue.getResult("background"), "background", 0, 0, 0.8, wheatson_container);
				loadImages(queue.getResult("voltmeter"), "voltmeter", 305, 248, 0.8, wheatson_container);
				loadImages(queue.getResult("battery"), "battery", 298, 430, 0.8, wheatson_container);
				loadImages(queue.getResult("blackwire1"), "res1_res4_Bwire", 32, 204, 0.8, wheatson_container);
				loadImages(queue.getResult("redwire1"), "res1_volt_Rwire", 120, 210, .8, wheatson_container);
				loadImages(queue.getResult("redwire2"), "res3_batry_Rwire", 138, 421, 0.8, wheatson_container);
				loadImages(queue.getResult("blackwire3"), "res2_volt_Bwire", 328, 208, 0.8, wheatson_container);
				loadImages(queue.getResult("blackwire2"), "res3_res4_Bwire", 140, 495, 0.8, wheatson_container);
				loadImages(queue.getResult("blackwire4"), "res2_batry_Bwire", 403, 208, 0.8, wheatson_container);
				loadImages(queue.getResult("blackwire5"), "res2_res4_Bwire", 589, 205, 0.8, wheatson_container);
				loadImages(queue.getResult("blackwire6"), "res1_res2_Bwire", 183, 198, 0.8, wheatson_container);
				loadImages(queue.getResult("background"), "background", 0, 0, 0.8, anderson_container);
				loadImages(queue.getResult("resistor"), "resistor", 455, 339, 0.8, anderson_container);
				loadImages(queue.getResult("variable_resistor"), "variable_resistor", 325, 222, 0.8, anderson_container);
				loadImages(queue.getResult("blackwire1"), "res1_res4_wire", 32, 204, 0.8, anderson_container);
				loadImages(queue.getResult("blackwire5"), "res2_res4_wire", 589, 205, 0.8, anderson_container);
				loadImages(queue.getResult("blackwire6"), "res1_res2_wire", 183, 198, 0.8, anderson_container);
				loadImages(queue.getResult("variable_resistor_to_resistor"), "varblres_restr_wire", 367, 255, 0.8, anderson_container);
				loadImages(queue.getResult("batterytovariableresistor"), "res1_varblres_Bwire", 180, 211, 0.8, anderson_container);
				loadImages(queue.getResult("batterytoresistor"), "batry_res_wire", 460, 210, 0.8, anderson_container);
				loadImages(queue.getResult("probe"), "probe", -18, 215, 0.8, anderson_container);
				loadImages(queue.getResult("probe_wire_to _battery _right"), "probe_batry_wire", 210, 380, 0.8, anderson_container);
				loadImages(queue.getResult("probe_to_resistor"), "probe_res_wire", 250, 330, 0.8, anderson_container);
				loadImages(queue.getResult("Coil_to_battery_left"), "coil_batry_Lwire", 139, 422, 0.8, anderson_container);
				loadImages(queue.getResult("coil_to_battery_right"), "coil_batry_Rwire", 373, 443, 0.8, anderson_container);
				loadImages(queue.getResult("coil"), "coil", 320, 425, 0.8, anderson_container);
				loadImages(queue.getResult("transformer"), "transformer", 233, 483, 0.85, anderson_container);
				loadImages(queue.getResult("transformer_to_left_resistor"), "transformer_res_Lwire", 61, 493, 0.8, anderson_container);
				loadImages(queue.getResult("transformer_to_ right_resistor"), "transformer_res_Rwire", 310, 496, 0.8, anderson_container);
				loadImages(queue.getResult("variable_resistor_top"), "variable_resistor_top", 358, 230, 0.8, anderson_container);
				loadImages(queue.getResult("cro"), "cro", 0, 0, 0.8, cro_container);
				loadImages(queue.getResult("turner"), "turner1", 383, 316, 0.8, cro_container);
				loadImages(queue.getResult("turner"), "turner2", 505, 316, 0.8, cro_container);
				cro_wave.graphics.moveTo(122, 325).setStrokeStyle(3).beginStroke("#009900").lineTo(348, 325);/** Creates wave in the cro*/
				cro_container.addChild(cro_wave); /** adds wave to the cro container */
				/** creates a rectangle for masking the cro wave animation*/
				cro_mask_rect.graphics.beginStroke("").drawRoundRect(120, 240, 225, 176,18); 
				cro_container.addChild(cro_mask_rect); /** Adding that rectangle to the stage */
				cro_wave.mask = cro_mask_rect; /** mask the cro waves */
				coil_mask_rect.graphics.beginStroke("").drawRect(325, 420, 50, 50);/** creates a rectangle for masking the coil length */
				anderson_container.addChild(coil_mask_rect); /** Adding that rectangle to the wheatson container */ 
				loadImages(queue.getResult("arrow"), "turner1_arrow_Right", 475, 300, 0.8, cro_container);
				loadImages(queue.getResult("arrow"), "turner1_arrow_Left", 390, 320, 0.8, cro_container);
				loadImages(queue.getResult("arrow"), "turner2_arrow_Right", 600, 300, 0.8, cro_container);
				loadImages(queue.getResult("arrow"), "turner2_arrow_Left", 518, 319, 0.8, cro_container);
				loadImages(queue.getResult("turnerdot"), "turner1dot", 436, 374, 0.8, cro_container);
				loadImages(queue.getResult("turnerdot"), "turner2dot", 557, 376, 0.8, cro_container);
				loadImages(queue.getResult("signal_arrow"), "signal_arrow", 300, 200, 1, wheatson_container);
				loadImages(queue.getResult("signal_arrow"), "show_arrow", 300, 200, 1, anderson_container);
				cro_container.getChildByName("turner1_arrow_Left").cursor = 
				cro_container.getChildByName("turner1_arrow_Right").cursor = 
				cro_container.getChildByName("turner2_arrow_Left").cursor = 
				cro_container.getChildByName("turner2_arrow_Right").cursor = 'pointer';
				drawRectangle(q_resistor_click, "q_resistor_click", 120, 170, 80, 100, "black", wheatson_container, scope, "pointer"); 
                drawRectangle(p_resistor_click, "p_resistor_click", 530, 170, 80, 100, "black", wheatson_container, scope, "pointer");
				drawRectangle(r_resistor_click, "r_resistor_click", 570, 440, 90, 150, "black", wheatson_container, scope, "pointer");
				drawRectangle(s_resistor_click, "s_resistor_click", 70, 440, 90, 150, "black", wheatson_container, scope, "pointer");
				setText("VoltReading", 345, 305, "", 1.5,wheatson_container);
				setText("resR1", 160, 140, "0.1 Ω", 1.5, wheatson_container);
				setText("resR2", 520, 140, "0.4 Ω", 1.5, wheatson_container);
				setText("resR3", 575, 410, "0.1 Ω", 1.5, wheatson_container);
				setText("resR4", 110, 410, "0.5 Ω", 1.5, wheatson_container);
				setText("voltText", 380, 537, "", 1,anderson_container);
				setText("variableresText", 350, 195, "", 1,anderson_container);
				setText("resR11", 160, 140, 0, 1.5,anderson_container);
				setText("resR21", 520, 140, 0, 1.5,anderson_container);
				setText("resR31", 575, 410, 0, 1.5,anderson_container);
				setText("resR41", 110, 410, 0, 1.5,anderson_container);
				
				/** Creates coil length changing mask */
				translationLabels(); /**translation of strings using gettext*/
				initialisationOfVariables(); /**initializing the variables*/
				initializeImages(); /** Function call for images used in the apparatus visibility */
				createShapesForHit(scope); /** create circle for wire connections */
				fractionalResistanceCheckBoxModels(scope, fractional_resistance_checkbox_model_array) /** Checkbox models for fractional  */
                backResistanceCheckBoxModels(scope, back_resistance_checkbox_model_array) /** Checkbox models for back side resistance box */
				ResistanceCheckBoxModelsR(scope, resR_checkbox_model_array);
				ResistanceCheckBoxModelsS(scope, resS_checkbox_model_array);
				showDialogBoxFn(scope) /** Function to show dialog box  */
				stage.update();
				
				/** Tuner rotation for volt/div right arrow*/
				cro_container.getChildByName("turner1_arrow_Right").on("click", function() {
					if ((tuner1_count_int < 11)) {/** checks whether the knob rotation has reaches its maximum value */
						rotateVoltKnob(1, 30); /** Counter increment by 1 and angle rotate by 30 degree */
						doCalculation(scope); /** All calculations for the experiment*/
						outpt_Wave(scope); /** Output wave in the CRO calculation */
					}
					stage.update();
				});
				
				/** Tuner rotation for volt/div left arrow*/
				cro_container.getChildByName("turner1_arrow_Left").on("click", function() {
					if ((tuner1_count_int > 0)) {/** checks whether the knob rotation has reaches its minimum value */
						rotateVoltKnob(-1, -30); /** Counter increment by 1 and angle rotate by -30 degree */
						doCalculation(scope); /** All calculations for the experiment*/
						outpt_Wave(scope); /** Output wave in the CRO calculation*/
					}
					stage.update();
				});
				
				/** Tuner rotation for time/div right arrow*/
				cro_container.getChildByName("turner2_arrow_Right").on("click", function() {
					if ((tuner2_count_int < 18)) {/** checks whether the knob rotation has reaches its maximum value */
						totateTimeKnob(1, 13.5); /** Counter increment by 1 and angle rotate by 13.5 degree*/
						doCalculation(scope); /** All calculations for the experiment*/
						outpt_Wave(scope); /** Output wave in the CRO calculation*/
					}
					stage.update();
				});
				
				/** Tuner rotation for time/div left arrow*/
				cro_container.getChildByName("turner2_arrow_Left").on("click", function() {
					if ((tuner2_count_int > 0)) {/** checks whether the knob rotation has reaches its minimum value */
						totateTimeKnob(-1, -13.5); /** Counter increment by 1 and angle rotate by -13.5 degree*/
						doCalculation(scope); /** All calculations for the experiment*/
						outpt_Wave(scope); /** Output wave in the CRO calculation*/
					}
					stage.update();
				});
				stage.update();
			}
			
			/** Add all the strings used for the language translation here. '_' is the shortcut for calling the gettext function defined in the gettext-definition.js*/
			function translationLabels() {
				helpArray = [_("help1"), _("help2"), _("help3"), _("help4"), _("help5"), _("help6"), _("help7"), _("help8"),
				_("help9"), _("Next"), _("Close")];
				scope.powerOnLbl = _("Power On");
				scope.heading = _("Anderson's Bridge");
				scope.signal_generator = _("Signal Generator:");
				scope.voltageLbl = _("Voltage:");
				scope.frequencyLbl = _("Frequency:");
				scope.variables = _("Wheatson's bridge");
				scope.variables_anderson = _("Anderson's Bridge");
				scope.result = _("Result");
				scope.copyright = _("copyright");
				scope.voltage = 2;
				scope.frequency = 20;
				scope.inductance_coil = _("Inductance coil:");
				scope.coilLengthLbl = _("Coil Length:");
				scope.coil_length = 5;
				scope.coilDiameterLbl = _("Coil Diameter:");
				scope.coil_diameter = .1;
				scope.anderson_powerOn = _("Power On");
				scope.variableResistrLbl = _("Variable resistance:");
				scope.variable_resistance = 1;
				scope.show_result = _("Show Result");
				scope.reset_Lbl = _("Reset");
				scope.inductanceLbl = _("Inductance:");
				scope.inductanceReactnceLbl = _("Inductive Reactance:");
				scope.show_cro = _("Show CRO");
				scope.StartExperiment = _("Anderson's bridge");
				scope.select_resistance = _("Select Resistance");
				scope.fractional_lbl = _("Fractional");
				scope.small_lbl = _("Small");
				scope.close_lbl = _("Close");
				scope.start_label = _("To start");
				scope.balancing_label = _("After balancing, proceed with");
				scope.v = _("V");
				scope.f = _("Hz");
				scope.cm = _("cm");
				scope.res = ("Ω");
				scope.fractional_show=true;
				scope.fractional_resistance_box_show=true;
				scope.$apply();
				stage.update();
			}
		}
	}
	stage.update();
}

/** All variables initialising in this function */
function initialisationOfVariables() {
	wheatson_container.alpha = 1;
	anderson_container.alpha = 0;
	cro_container.alpha = 0;
	wire_num_int = 0;
	line_flag = false;
	wheatson_wire_flag = true ;
	galv_val = 0.04;
	const_power_int = 12;
	area_float = 0.0000785;
	no_turns_int = 50;
	tuner1_rot_int = -40;
	xInitial = 0;
	inductance_value_float = 0.0000049;
	inductive_reactance = 0.0003096;
	permeability_float = 0.000001256;
	XL_float = 0.007739786;
	capacitance_float = 0.00000001;
	tuner2_rot_int = -90;
	length_val_float = .05;
	diameter_val_float = .001;
	frequency_val_float = 20;
	tuner2_count_int = 0;
	tuner1_count_int = 0;
	Xc_float = 0;
	R2Star_float = 0;
	R3Star_float = 0;
	pi = 3.14;
	inductance_float = 0.000001;
	varbl_resistance_val_float = 1;
	voltage_val_int = 2;
	coil_length = 5;
	coil_diameter = .1;
	initial_rect_width = 50;
	coil_width_factor = 3.8;
	initial_coil_len = 5;
	galv_val_int, galv_result_int = 0;
	x_point, y_point = [];
	voltperdiv_array = timeperdiv_array = [];
	voltperdiv_array = [2, 1, .5, .2, .1, .05, .02, .01, .005, 20, 10, 5];
	timeperdiv_array = [200, 100, 50, 20, 10, 5, 2, 1, .5, .2, .1, .05, .02, .01, .005, .002, .001, .0005, .0002];
	resistorQ_val, resistorP_val, resistorR_val, resistorS_val = 0;
	wheatson_container.getChildByName("VoltReading").visible = false;
	wheatson_container.getChildByName("signal_arrow").visible=false;
	anderson_container.getChildByName("show_arrow").visible=false;
	wheatson_container.getChildByName("VoltReading").text = galv_val;
	back_resistance_checkbox_model_array = ['back_resistance_checked_0_1', 'back_resistance_checked_0_2', 'back_resistance_checked_2_0_2', 'back_resistance_checked_0_5', 'back_resistance_checked_1', 'back_resistance_checked_2', 'back_resistance_checked_2_2', 'back_resistance_checked_5', 'back_resistance_checked_10', 'back_resistance_checked_20', 'back_resistance_checked_2_20', 'back_resistance_checked_50', 'back_resistance_checked_200', 'back_resistance_checked_2_200', 'back_resistance_checked_500', 'back_resistance_checked_1000', 'back_resistance_checked_2000', 'back_resistance_checked_2_2000', 'back_resistance_checked_20000', 'back_resistance_checked_50000'];
    fractional_resistance_checkbox_model_array = ['fractional_resistance_checked_0_1', 'fractional_resistance_checked_0_2', 'fractional_resistance_checked_2_0_2', 'fractional_resistance_checked_0_5', 'fractional_resistance_checked_1', 'fractional_resistance_checked_2', 'fractional_resistance_checked_2_2', 'fractional_resistance_checked_5', 'fractional_resistance_checked_10', 'fractional_resistance_checked_20', 'fractional_resistance_checked_2_20', 'fractional_resistance_checked_50', 'fractional_resistance_checked_200', 'fractional_resistance_checked_2_200', 'fractional_resistance_checked_500', 'fractional_resistance_checked_1000', 'fractional_resistance_checked_2000', 'fractional_resistance_checked_2_2000', 'fractional_resistance_checked_20000', 'fractional_resistance_checked_50000'];
    resR_checkbox_model_array = ['R_resistance_checked_0_1', 'R_resistance_checked_0_2', 'R_resistance_checked_2_0_2', 'R_resistance_checked_0_5', 'back_resistance_checked_1', 'R_resistance_checked_2', 'R_resistance_checked_2_2', 'R_resistance_checked_5', 'R_resistance_checked_10', 'R_resistance_checked_20', 'R_resistance_checked_2_20', 'R_resistance_checked_50', 'R_resistance_checked_200', 'R_resistance_checked_2_200', 'R_resistance_checked_500', 'R_resistance_checked_1000', 'R_resistance_checked_2000', 'R_resistance_checked_2_2000', 'R_resistance_checked_20000', 'back_resistance_checked_50000'];
    resS_checkbox_model_array = ['S_resistance_checked_0_1', 'S_resistance_checked_0_2', 'S_resistance_checked_2_0_2', 'S_resistance_checked_0_5', 'S_resistance_checked_1', 'S_resistance_checked_2', 'S_resistance_checked_2_2', 'S_resistance_checked_5', 'S_resistance_checked_10', 'S_resistance_checked_20', 'S_resistance_checked_2_20', 'S_resistance_checked_50', 'S_resistance_checked_200', 'S_resistance_checked_2_200', 'S_resistance_checked_500', 'S_resistance_checked_1000', 'S_resistance_checked_2000', 'S_resistance_checked_2_2000', 'S_resistance_checked_20000', 'S_resistance_checked_50000'];
	resistance_total = 0.4;
	resistance_back_total = 0.1;
	resistance_R_total =0.1 ;
	resistance_S_total=0.5;
	stage.update();	
}

/** Reset the experiment */
function resetExperiment() {
	window.location.reload();
	stage.update();
}

/** Circle declarations for connect the wires is created in this function */
function SpotsHitDeclaration() {
	res1_Spot1 = new createjs.Shape();
	res1_Spot1R = new createjs.Shape();
	res1_Spot2 = new createjs.Shape();
	res2_Spot1 = new createjs.Shape();
	res2_Spot1B = new createjs.Shape();
	res2_Spot2 = new createjs.Shape();
	res2_Spot2B = new createjs.Shape();
	res3_Spot1 = new createjs.Shape();
	res3_Spot2 = new createjs.Shape();
	res3_Spot2R = new createjs.Shape();
	res4_Spot2 = new createjs.Shape();
	res4_Spot1 = new createjs.Shape();
	volt_Bspot = new createjs.Shape();
	volt_Rspot = new createjs.Shape();
	batry_Rspot = new createjs.Shape();
	batry_Bspot = new createjs.Shape();
	res1_Spot1A = new createjs.Shape();
	res1_Spot2A = new createjs.Shape();
	res1_Spot21A = new createjs.Shape();
	res2_Spot1A = new createjs.Shape();
	res2_Spot2A = new createjs.Shape();
	res2_Spot21A = new createjs.Shape();
	res3_Spot1A = new createjs.Shape();
	res3_Spot11A = new createjs.Shape();
	res3_Spot2A = new createjs.Shape();
	res4_Spot2A = new createjs.Shape();
	res4_Spot1A = new createjs.Shape();
	res4_Spot11A = new createjs.Shape();
	res4_Spot21A = new createjs.Shape();
	varblres_spotL = new createjs.Shape();
	varblres_spotR = new createjs.Shape();
	varblres_res_spotL = new createjs.Shape();
	varblres_res_spotR = new createjs.Shape();
	varblres_res_spotL1 = new createjs.Shape();
	probe_spot = new createjs.Shape();
	probe_spotClip = new createjs.Shape();
	trans_spotL = new createjs.Shape();
	trans_spotR = new createjs.Shape();
	coil_Lspot = new createjs.Shape();
	coil_Rspot = new createjs.Shape();
	stage.update();
}

/** Create circle functions for connecting wires for wheatson and anderson experiment*/
function createShapesForHit(scope) {
	drawCircle(res1_Spot1, "res1_Spot1", 132, 213, "black", wheatson_container, scope);
	drawCircle(res1_Spot1R, "res1_Spot1R", 137, 213, "black", wheatson_container, scope);
	drawCircle(res1_Spot2, "res1_Spot2", 192, 213, "black", wheatson_container, scope);
	drawCircle(res2_Spot1, "res2_Spot1", 545, 213, "black", wheatson_container, scope);
	drawCircle(res2_Spot1B, "res2_Spot1B", 547, 213, "black", wheatson_container, scope);
	drawCircle(res2_Spot2, "res2_Spot2", 602, 213, "black", wheatson_container, scope);
	drawCircle(res2_Spot2B, "res2_Spot2B", 605, 213, "black", wheatson_container, scope);
	drawCircle(res3_Spot1, "res3_Spot1", 80, 500, "black", wheatson_container, scope);
	drawCircle(res3_Spot2, "res3_Spot2", 150, 500, "black", wheatson_container, scope);
	drawCircle(res3_Spot2R, "res3_Spot2R", 155, 500, "black", wheatson_container, scope);
	drawCircle(res4_Spot2, "res4_Spot2", 650, 497, "black", wheatson_container, scope);
	drawCircle(res4_Spot1, "res4_Spot1", 584, 497, "black", wheatson_container, scope);
	drawCircle(volt_Bspot, "volt_Bspot", 335, 338, "black", wheatson_container, scope);
	drawCircle(volt_Rspot, "volt_Rspot", 410, 338, "black", wheatson_container, scope);
	drawCircle(batry_Rspot, "batry_Rspot", 335, 448, "black", wheatson_container, scope);
	drawCircle(batry_Bspot, "batry_Bspot", 405, 448, "black", wheatson_container, scope);
	drawCircle(res1_Spot1A, "res1_Spot1A", 135, 208, "black", anderson_container, scope);
	drawCircle(res1_Spot2A, "res1_Spot2A", 188, 208, "black", anderson_container, scope);
	drawCircle(res1_Spot21A, "res1_Spot21A", 199, 208, "black", anderson_container, scope);
	drawCircle(res2_Spot1A, "res2_Spot1A", 540, 208, "black", anderson_container, scope);
	drawCircle(res2_Spot2A, "res2_Spot2A", 595, 208, "black", anderson_container, scope);
	drawCircle(res2_Spot21A, "res2_Spot21A", 605, 208, "black", anderson_container, scope);
	drawCircle(res3_Spot1A, "res3_Spot1A", 75, 500, "black", anderson_container, scope);
	drawCircle(res3_Spot11A, "res3_Spot11A", 83, 500, "black", anderson_container, scope);
	drawCircle(res3_Spot2A, "res3_Spot2A", 156, 500, "black", anderson_container, scope);
	drawCircle(res4_Spot2A, "res4_Spot2A", 651, 490, "black", anderson_container, scope);
	drawCircle(res4_Spot21A, "res4_Spot21A", 660, 490, "black", anderson_container, scope);
	drawCircle(res4_Spot1A, "res4_Spot1A", 578, 490, "black", anderson_container, scope);
	drawCircle(res4_Spot11A, "res4_Spot11A", 588, 490, "black", anderson_container, scope);
	drawCircle(varblres_spotL, "varblres_spotL", 330, 260, "black", anderson_container, scope);
	drawCircle(varblres_spotR, "varblres_spotR", 427, 260, "black", anderson_container, scope);
	drawCircle(varblres_res_spotR, "varblres_res_spotR", 470, 345, "black", anderson_container, scope);
	drawCircle(varblres_res_spotL, "varblres_res_spotL", 470, 365, "black", anderson_container, scope);
	drawCircle(varblres_res_spotL1, "varblres_res_spotL1", 460, 365, "black", anderson_container, scope);
	drawCircle(probe_spot, "probe_spot", 253, 340, "black", anderson_container, scope);
	drawCircle(probe_spotClip, "probe_spotClip", 225, 390, "black", anderson_container, scope);
	drawCircle(trans_spotL, "trans_spotL", 290, 552, "black", anderson_container, scope);
	drawCircle(trans_spotR, "trans_spotR", 313, 552, "black", anderson_container, scope);
	drawCircle(coil_Lspot, "coil_Lspot", 325, 450, "black", anderson_container, scope);
	drawCircle(coil_Rspot, "coil_Rspot", 375, 450, "black", anderson_container, scope);
	stage.update();
}

/** Set visibility of connection wires*/
function initializeImages() {
	anderson_container.getChildByName("coil_batry_Rwire").visible = false;
	anderson_container.getChildByName("coil_batry_Lwire").visible = false;
	anderson_container.getChildByName("probe_res_wire").visible = false;
	anderson_container.getChildByName("probe_batry_wire").visible = false;
	anderson_container.getChildByName("batry_res_wire").visible = false;
	anderson_container.getChildByName("varblres_restr_wire").visible = false;
	anderson_container.getChildByName("res1_res2_wire").visible = false;
	anderson_container.getChildByName("res2_res4_wire").visible = false;
	anderson_container.getChildByName("res1_res4_wire").visible = false;
	anderson_container.getChildByName("res1_varblres_Bwire").visible = false;
	anderson_container.getChildByName("transformer_res_Lwire").visible = false;
	anderson_container.getChildByName("transformer_res_Rwire").visible = false;
	wheatson_container.getChildByName("res1_res4_Bwire").visible = false;
	wheatson_container.getChildByName("res1_volt_Rwire").visible = false;
	wheatson_container.getChildByName("res2_volt_Bwire").visible = false;
	wheatson_container.getChildByName("res3_res4_Bwire").visible = false;
	wheatson_container.getChildByName("res2_batry_Bwire").visible = false;
	wheatson_container.getChildByName("res2_res4_Bwire").visible = false;
	wheatson_container.getChildByName("res1_res2_Bwire").visible = false;
	wheatson_container.getChildByName("res3_batry_Rwire").visible = false;
	stage.update();
}

/** Checkbox models for P resistor */
function fractionalResistanceCheckBoxModels(scope, checkbox_model_array) {         
	scope.item_fractional_resistance_fractional = [ //Add fractional values and their names into resistance box
		{  name: checkbox_model_array[0], value: 0.1 },
		{  name: checkbox_model_array[1], value: 0.2 },
		{  name: checkbox_model_array[2], value: 0.2 }, 
		{  name: checkbox_model_array[3], value: 0.5 }
	];
	scope.item_fractional_resistance_small = [//Add small values and their names into resistance box
		{  name: checkbox_model_array[4], value: 1 },
		{  name: checkbox_model_array[5], value: 2 },
		{  name: checkbox_model_array[6], value: 2 }, 
		{  name: checkbox_model_array[7], value: 5 },
		{  name: checkbox_model_array[8], value: 10 },
		{  name: checkbox_model_array[9], value: 20 },
		{  name: checkbox_model_array[10], value: 20 }, 
		{  name: checkbox_model_array[11], value: 50 }
	];
stage.update();	
}
 
 /** Checkbox models for Q resistor box */
function backResistanceCheckBoxModels(scope, checkbox_model_array) { /** Checkbox models for back side resistance box  */
	scope.item_back_resistance_fractional = [//Add fractional values and their names into resistance box
		{  name: checkbox_model_array[0], value: 0.1 },
		{  name: checkbox_model_array[1], value: 0.2 },
		{  name: checkbox_model_array[2], value: 0.2 }, 
		{  name: checkbox_model_array[3], value: 0.5 }
	];
	scope.item_back_resistance_small = [//Add small values and their names into resistance box
		{  name: checkbox_model_array[4], value: 1 },
		{  name: checkbox_model_array[5], value: 2 },
		{  name: checkbox_model_array[6], value: 2 }, 
		{  name: checkbox_model_array[7], value: 5 },
		{  name: checkbox_model_array[8], value: 10 },
		{  name: checkbox_model_array[9], value: 20 },
		{  name: checkbox_model_array[10], value: 20 }, 
		{  name: checkbox_model_array[11], value: 50 }
	];
	stage.update();
}

/** Checkbox models for R resistor box */
function ResistanceCheckBoxModelsR(scope, checkbox_model_array) { /** Checkbox models for R resistance box  */
	scope.item_resR_checkbox_model_fractional = [//Add fractional values and their names into resistance box
		{  name: checkbox_model_array[0], value: 0.1 },
		{  name: checkbox_model_array[1], value: 0.2 },
		{  name: checkbox_model_array[2], value: 0.2 }, 
		{  name: checkbox_model_array[3], value: 0.5 }
	];
	scope.item_resR_checkbox_model_small = [//Add small values and their names into resistance box
		{  name: checkbox_model_array[4], value: 1 },
		{  name: checkbox_model_array[5], value: 2 },
		{  name: checkbox_model_array[6], value: 2 }, 
		{  name: checkbox_model_array[7], value: 5 },
		{  name: checkbox_model_array[8], value: 10 },
		{  name: checkbox_model_array[9], value: 20 },
		{  name: checkbox_model_array[10], value: 20 }, 
		{  name: checkbox_model_array[11], value: 50 }
	];
	stage.update();
}

/** Checkbox models for S resistor box */
function ResistanceCheckBoxModelsS(scope, checkbox_model_array) { /** Checkbox models for S resistance box  */
	scope.item_resS_checkbox_model_fractional = [//Add fractional values and their names into resistance box
		{  name: checkbox_model_array[0], value: 0.1 },
		{  name: checkbox_model_array[1], value: 0.2 },
		{  name: checkbox_model_array[2], value: 0.2 }, 
		{  name: checkbox_model_array[3], value: 0.5 }
	];
	scope.item_resS_checkbox_model_small = [//Add small values and their names into resistance box
		{  name: checkbox_model_array[4], value: 1 },
		{  name: checkbox_model_array[5], value: 2 },
		{  name: checkbox_model_array[6], value: 2 }, 
		{  name: checkbox_model_array[7], value: 5 },
		{  name: checkbox_model_array[8], value: 10 },
		{  name: checkbox_model_array[9], value: 20 },
		{  name: checkbox_model_array[10], value: 20 }, 
		{  name: checkbox_model_array[11], value: 50 }
	];
	stage.update();
}

/** Select resistance group from the dialog box  */
function resistanceGroupSelectedFn(scope) {
    scope.fractional_show = scope.small_show = false;
    if (scope.resistance_group == "fractional") { /** Resistance values - Fractional */
        scope.fractional_show = true;
    } else if (scope.resistance_group == "small") { /** Resistance values - Small */
        scope.small_show = true;
    }
	stage.update();
}

/** Select resistance from the Q resistance dialog box  */
function checkBackResistanceBoxFn(check_selected, resistance_selected, scope) {
    if (!check_selected) { /** Checkbox checked false*/
        resistance_back_total += resistance_selected;
    } else { /** Checkbox checked true*/
        resistance_back_total -= resistance_selected;
    }
	resistance_back_total = Math.abs(resistance_back_total); 
    wheatson_container.getChildByName("resR1").text = resistance_back_total.toFixed(1)+" Ω"; /** assign selected value to text field */
	getResistanceVal(scope); /** calculate the wheatson bridge balance equations */
	stage.update();
};

/** Select resistance from P resistance the dialog box  */
function checkFractionalResistanceBoxFn(check_selected, resistance_selected, scope) {
    if (!check_selected) { /** Checkbox checked false*/
        resistance_total += resistance_selected;
    } else { /** Checkbox checked true*/
        resistance_total -= resistance_selected;
    }	
    resistance_total = Math.abs(resistance_total);
    wheatson_container.getChildByName("resR2").text = resistance_total.toFixed(1)+" Ω";/** assign selected value to text field */
	getResistanceVal(scope); /** calculate the wheatson bridge balance equations */
	stage.update();
};

/** Select resistance from S resistance the dialog box  */
function checkSResistanceBoxFn(check_selected, resistance_selected, scope) {
    if (!check_selected) { /** Checkbox checked false*/
        resistance_S_total += resistance_selected;
    } else { /** Checkbox checked true*/
        resistance_S_total -= resistance_selected;
    }	
    resistance_S_total = Math.abs(resistance_S_total);
    wheatson_container.getChildByName("resR4").text = resistance_S_total.toFixed(1)+" Ω";/** assign selected value to text field */
	getResistanceVal(scope); /** calculate the wheatson bridge balance equations */
	stage.update();
};

/** Select resistance from R resistance the dialog box  */
function checkRResistanceBoxFn(check_selected, resistance_selected, scope) {    
	if (!check_selected) { /** Checkbox checked false*/
        resistance_R_total += resistance_selected;
    } else { /** Checkbox checked true*/
        resistance_R_total -= resistance_selected;
    }
	resistance_R_total = Math.abs(resistance_R_total); 
    wheatson_container.getChildByName("resR3").text = resistance_R_total.toFixed(1)+" Ω";/** assign selected value to text field */
	getResistanceVal(scope); /** calculate the wheatson bridge balance equations */
	stage.update();
};

/** Function to show dialog box  */
function showDialogBoxFn(scope) {
	/** Function to click fractional resistor box(Q) to show dialog box  */
	wheatson_container.getChildByName("q_resistor_click").on("click", function(evt) {
		dialogBoxShow("q_resistor_click",true, false, false, false,scope); /** show dialog box */
		scope.$apply();
		stage.update();
	});
	/** Function to click fractional resistor box(P) to show dialog box  */
	wheatson_container.getChildByName("p_resistor_click").on("click", function(evt) {
		dialogBoxShow("p_resistor_click",false,true, false, false,scope); /** show P resistor dialog box */
		scope.$apply();
		stage.update();
	});
	/** Function to click fractional resistor box(R) to show dialog box  */
	wheatson_container.getChildByName("r_resistor_click").on("click", function(evt) {
		dialogBoxShow("r_resistor_click", false, false, true, false,scope); /** show R resistor dialog box */
		scope.$apply();
		stage.update();
	});
	/** Function to click fractional resistor box(S) to show dialog box  */
	wheatson_container.getChildByName("s_resistor_click").on("click", function(evt) {
		dialogBoxShow("s_resistor_click",false, false, false, true,scope);/** show S resistor dialog box */
		scope.$apply();	
		stage.update();		
	});
}

/** Function to show/hide  dialog box */
function dialogBoxShow(name, back_resistance_visibility, fractional_resistance_visibility,resistanceR_box_visibility,resistanceS_box_visibility,scope) {               
	scope.resistance_group = 'fractional'; /** initially selects all dialog boxes with fractional resistance */
	scope.fractional_show = true; /** shows the fractional resistance check boxes */
	scope.small_show = false; /** Hides the fractional resistance check boxes */
	scope.dialog_box_show = true; /** Shows dialog boxes for resistance selection */
	/** Set visibility modes for P,Q,R,S resistance selection boxes */
	scope.resistance_box_show = back_resistance_visibility;
	scope.fractional_resistance_box_show = fractional_resistance_visibility;
	scope.resistanceR_box_show = resistanceR_box_visibility;
	scope.resistanceS_box_show = resistanceS_box_visibility;
	stage.update();
}

/** Load all the images using in the experiment using createjs*/
function loadImages(image, name, xPos, yPos, sFactor, container) {
	var _bitmap = new createjs.Bitmap(image).set({});
	_bitmap.x = xPos;
	_bitmap.y = yPos;
	_bitmap.name = name;
	_bitmap.alpha = 1;
	_bitmap.scaleX = _bitmap.scaleY = sFactor;
	if (name == "turner1_arrow_Left" || name == "turner2_arrow_Left") { /** flip images */
		_bitmap.scaleX = _bitmap.scaleY = sFactor * -1;
	}
	/** register rotation points */
	if (name == "turner1dot" || name == "turner2dot") {
		_bitmap.regX = _bitmap.image.width / .5;
		_bitmap.regY = _bitmap.image.height / .5;
		if (name == "turner1dot") /** Initialize tuner rotation to initial value */
		_bitmap.rotation = -40;
		else _bitmap.rotation = -90;
	}
	if (name == "coil") { /** Masking coil */
		_bitmap.mask = coil_mask_rect;
		_bitmap.scaleY = 1;
	}
	container.addChild(_bitmap);
	stage.update();
}

/** Draw rectangle  */
function drawRectangle(shapeName, name, xPos, yPos, width, height, color, container, scope, cursorproperty) {
	container.addChild(shapeName);
	shapeName.cursor = cursorproperty;
	shapeName.alpha = 0.01; /** hides the rectangle */
	shapeName.name = name;
	shapeName.mouseEnabled = false;
	shapeName.graphics.setStrokeStyle(2);
	shapeName.graphics.beginFill(color).drawRect(xPos, yPos, width, height);
	stage.update();
}

/** All the texts loading and added to the stage */
function setText(name, textX, textY, value, size, container) {
	var text = new createjs.Text();
	text.x = textX;
	text.y = textY;
	text.textBaseline = "alphabetic";
	text.name = name;
	text.font = "bold " + size + "em Tahoma";
	text.text = value;
	if (name == "voltText") { /** change color for voltmeter reading */
		text.color = "#bccd21";
	}
	container.addChild(text);
	stage.update();
}

/** Draw shapes for hitting connection wires of the apparatus*/
function drawCircle(shapeName, name, xPos, yPos, color, container, scope) {
	container.addChild(shapeName);
	shapeName.name = name;
	shapeName.cursor = "pointer";
	shapeName.alpha = 0.01;
	initialX = xPos;
	initialY = yPos;
	shapeName.graphics.setStrokeStyle(2);
	shapeName.graphics.beginFill(color).drawCircle(0, 0, 25);
	shapeName.x = xPos;
	shapeName.y = yPos;
	shapeName.on("mousedown", function(evt) {
		this.parent.addChild(this);
		this.offset = {
			x: this.x - evt.stageX / stage.scaleX,
			y: this.y - evt.stageY / stage.scaleY
		};
		stage.update();
	});
	shapeName.on("pressmove", function(evt) {
		this.x = (evt.stageX / stage.scaleX) + this.offset.x;
		this.y = (evt.stageY / stage.scaleY) + this.offset.y;
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
			if (line_flag){
				wire_num_int++;
			}
			checkConecComplete(scope); /** Check the connection complete or not */
			line_flag = false; /** Set line flag as false */
		});
		stage.update();
		shapeName.on("mouseup", function(evt) {
			shapeName.alpha = 0.5;
			shapeName.x = xPos;
			shapeName.y = yPos;
			line.graphics.clear();
			line_flag = false;
			line.graphics.clear();
		});
		stage.update();
		checkConnection(name, shapeName.x, shapeName.y); /** check hit occur with wires */
	});
	stage.update();
}

/** check hit test between circle spots with wired connections */
function checkHit(spotName, wire, name, xPos, yPos, container) {
	spotName.alpha = 0.01; /** Shows the destination point */
	wheatson_container.getChildByName("signal_arrow").visible=true;
	wheatson_container.getChildByName("signal_arrow").x=spotName.x+3;
	wheatson_container.getChildByName("signal_arrow").y=spotName.y-25;
	anderson_container.getChildByName("show_arrow").visible=true;
	anderson_container.getChildByName("show_arrow").x=spotName.x+3;
	anderson_container.getChildByName("show_arrow").y=spotName.y-25;
	var ptL = spotName.globalToLocal(xPos, yPos);
	if (spotName.hitTest(ptL.x, ptL.y)) {
		line_flag = true;
		line.graphics.clear();
		container.removeChild(line);
		spotName.alpha = 0.01;
		wheatson_container.getChildByName("signal_arrow").visible=false;
		anderson_container.getChildByName("show_arrow").visible=false;
		container.getChildByName(wire).visible = true;
		spotName.mouseEnabled = false;
		container.getChildByName(name).mouseEnabled = false;
	} else {
		releaseHit(spotName, name, container); /** releases drag for hit */
	}
	stage.update();
}

/** Function for releasing the drag for hit */
function releaseHit(spot, name, container) {
	container.getChildByName(name).on("pressup", function(evt) {
		spot.alpha = 0.01;
		wheatson_container.getChildByName("signal_arrow").visible=false;
		anderson_container.getChildByName("show_arrow").visible=false;
	});
	stage.update();
}

/** check hit between display wires */
function checkConnection(name, xPos, yPos) {
	switch (name) {
		case "res1_Spot1":
			checkHit(wheatson_container.getChildByName("res3_Spot1"), "res1_res4_Bwire", name, xPos, yPos, wheatson_container);
			break;
		case "res3_Spot1":
			checkHit(wheatson_container.getChildByName("res1_Spot1"), "res1_res4_Bwire", name, xPos, yPos, wheatson_container);
			break;
		case "res1_Spot1R":
			checkHit(wheatson_container.getChildByName("volt_Rspot"), "res1_volt_Rwire", name, xPos, yPos, wheatson_container);
			break;
		case "volt_Rspot":
			checkHit(wheatson_container.getChildByName("res1_Spot1R"), "res1_volt_Rwire", name, xPos, yPos, wheatson_container);
			break;
		case "res1_Spot2":
			checkHit(wheatson_container.getChildByName("res2_Spot1"), "res1_res2_Bwire", name, xPos, yPos, wheatson_container);
			break;
		case "res2_Spot1":
			checkHit(wheatson_container.getChildByName("res1_Spot2"), "res1_res2_Bwire", name, xPos, yPos, wheatson_container);
			break;
		case "res2_Spot1B":
			checkHit(wheatson_container.getChildByName("batry_Bspot"), "res2_batry_Bwire", name, xPos, yPos, wheatson_container);
			break;
		case "batry_Bspot":
			checkHit(wheatson_container.getChildByName("res2_Spot1B"), "res2_batry_Bwire", name, xPos, yPos, wheatson_container);
			break;
		case "res2_Spot2":
			checkHit(wheatson_container.getChildByName("volt_Bspot"), "res2_volt_Bwire", name, xPos, yPos, wheatson_container);
			break;
		case "volt_Bspot":
			checkHit(wheatson_container.getChildByName("res2_Spot2"), "res2_volt_Bwire", name, xPos, yPos, wheatson_container);
			break;
		case "res2_Spot2B":
			checkHit(wheatson_container.getChildByName("res4_Spot2"), "res2_res4_Bwire", name, xPos, yPos, wheatson_container);
			break;
		case "res4_Spot2":
			checkHit(wheatson_container.getChildByName("res2_Spot2B"), "res2_res4_Bwire", name, xPos, yPos, wheatson_container);
			break;
		case "res4_Spot1":
			checkHit(wheatson_container.getChildByName("res3_Spot2"), "res3_res4_Bwire", name, xPos, yPos, wheatson_container);
			break;
		case "res3_Spot2":
			checkHit(wheatson_container.getChildByName("res4_Spot1"), "res3_res4_Bwire", name, xPos, yPos, wheatson_container);
			break;
		case "res3_Spot2R":
			checkHit(wheatson_container.getChildByName("batry_Rspot"), "res3_batry_Rwire", name, xPos, yPos, wheatson_container);
			break;
		case "batry_Rspot":
			checkHit(wheatson_container.getChildByName("res3_Spot2R"), "res3_batry_Rwire", name, xPos, yPos, wheatson_container);
			break;
		case "res1_Spot1A":
			checkHit(anderson_container.getChildByName("res3_Spot1A"), "res1_res4_wire", name, xPos, yPos, anderson_container);
			break;
		case "res3_Spot1A":
			checkHit(anderson_container.getChildByName("res1_Spot1A"), "res1_res4_wire", name, xPos, yPos, anderson_container);
			break;
		case "res1_Spot2A":
			checkHit(anderson_container.getChildByName("res2_Spot1A"), "res1_res2_wire", name, xPos, yPos, anderson_container);
			break;
		case "res2_Spot1A":
			checkHit(anderson_container.getChildByName("res1_Spot2A"), "res1_res2_wire", name, xPos, yPos, anderson_container);
			break;
		case "res1_Spot21A":
			checkHit(anderson_container.getChildByName("varblres_spotL"), "res1_varblres_Bwire", name, xPos, yPos, anderson_container);
			break;
		case "varblres_spotL":
			checkHit(anderson_container.getChildByName("res1_Spot21A"), "res1_varblres_Bwire", name, xPos, yPos, anderson_container);
			break;
		case "varblres_res_spotR":
			checkHit(anderson_container.getChildByName("res2_Spot2A"), "batry_res_wire", name, xPos, yPos, anderson_container);
			break;
		case "res2_Spot2A":
			checkHit(anderson_container.getChildByName("varblres_res_spotR"), "batry_res_wire", name, xPos, yPos, anderson_container);
			break;
		case "res2_Spot21A":
			checkHit(anderson_container.getChildByName("res4_Spot2A"), "res2_res4_wire", name, xPos, yPos, anderson_container);
			break;
		case "res4_Spot2A":
			checkHit(anderson_container.getChildByName("res2_Spot21A"), "res2_res4_wire", name, xPos, yPos, anderson_container);
			break;
		case "varblres_spotR":
			checkHit(anderson_container.getChildByName("varblres_res_spotL"), "varblres_restr_wire", name, xPos, yPos, anderson_container);
			break;
		case "varblres_res_spotL":
			checkHit(anderson_container.getChildByName("varblres_spotR"), "varblres_restr_wire", name, xPos, yPos, anderson_container);
			break;
		case "varblres_res_spotL1":
			checkHit(anderson_container.getChildByName("probe_spot"), "probe_res_wire", name, xPos, yPos, anderson_container);
			break;
		case "probe_spot":
			checkHit(anderson_container.getChildByName("varblres_res_spotL1"), "probe_res_wire", name, xPos, yPos, anderson_container);
			break;
		case "res4_Spot1A":
			checkHit(anderson_container.getChildByName("probe_spotClip"), "probe_batry_wire", name, xPos, yPos, anderson_container);
			break;
		case "probe_spotClip":
			checkHit(anderson_container.getChildByName("res4_Spot1A"), "probe_batry_wire", name, xPos, yPos, anderson_container);
			break;
		case "trans_spotL":
			checkHit(anderson_container.getChildByName("res3_Spot11A"), "transformer_res_Lwire", name, xPos, yPos, anderson_container);
			break;
		case "res3_Spot11A":
			checkHit(anderson_container.getChildByName("trans_spotL"), "transformer_res_Lwire", name, xPos, yPos, anderson_container);
			break;
		case "trans_spotR":
			checkHit(anderson_container.getChildByName("res4_Spot21A"), "transformer_res_Rwire", name, xPos, yPos, anderson_container);
			break;
		case "res4_Spot21A":
			checkHit(anderson_container.getChildByName("trans_spotR"), "transformer_res_Rwire", name, xPos, yPos, anderson_container);
			break;
		case "coil_Lspot":
			checkHit(anderson_container.getChildByName("res3_Spot2A"), "coil_batry_Lwire", name, xPos, yPos, anderson_container);
			break;
		case "res3_Spot2A":
			checkHit(anderson_container.getChildByName("coil_Lspot"), "coil_batry_Lwire", name, xPos, yPos, anderson_container);
			break;
		case "res4_Spot11A":
			checkHit(anderson_container.getChildByName("coil_Rspot"), "coil_batry_Rwire", name, xPos, yPos, anderson_container);
			break;
		case "coil_Rspot":
			checkHit(anderson_container.getChildByName("res4_Spot11A"), "coil_batry_Rwire", name, xPos, yPos, anderson_container);
			break;
	}
	stage.update();
}

/**check whether all wires are connected in wheatson and anderson experiment */
function checkConecComplete(scope) {
	if(wire_num_int==8 && wheatson_wire_flag==true){ /** check whether the wheatson experiment has completed its connection */
		scope.powerButton = false; /** power on wheatson bridge */
		scope.$apply();
	}
	else if(wire_num_int==12)/** check whether the anderson bridge experiment has completed its connection */
	{
		scope.andersonPowrBtn = false;/** power on anderson bridge */
		scope.$apply();
	}
	stage.update();
}

/** This function will trigger when the user click on the 'Power on button'*/
function powerOnFn(scope) {
	if (scope.powerOnLbl == _("Power On")) {
		/**  Enables the resistance selection only on power on*/
		wheatson_container.getChildByName("q_resistor_click").mouseEnabled = wheatson_container.getChildByName("p_resistor_click").mouseEnabled =
		wheatson_container.getChildByName("r_resistor_click").mouseEnabled =wheatson_container.getChildByName("s_resistor_click").mouseEnabled =true;
		wheatson_container.getChildByName("VoltReading").visible = true; /** Displays the galvanometer value */
		scope.powerOnLbl = _("Power Off");
		/** check whether galvanometer value is balanced on power on */
		if (galv_val == 0) {
			scope.exptMainBtn = false;
		} else { /** disabling the experiment start button */
			scope.exptMainBtn = true;
		}
	} else {
		/**Disables the resistance selection on power off*/
		wheatson_container.getChildByName("VoltReading").visible = false; /** Hides the galvanometer value */
		wheatson_container.getChildByName("q_resistor_click").mouseEnabled = wheatson_container.getChildByName("p_resistor_click").mouseEnabled =
		wheatson_container.getChildByName("r_resistor_click").mouseEnabled =wheatson_container.getChildByName("s_resistor_click").mouseEnabled =false;
		scope.powerOnLbl = _("Power On");
		/** hides the resistance selection boxes */
		scope.dialog_box_show= false;
		scope.exptMainBtn = true ;
	}
	stage.update();
}

/**starts the experiment with wheatsons bridge. */
function startExperiment(scope) {
	startAndersonExp(scope); /** Begins wheatsons experiment */
	wheatson_wire_flag = false;
	stage.update();
}

/** starts the anderson bridge experiment by initialisong power to it */
function StartandersonExpPower(scope) {
	if (scope.anderson_powerOn == _("Power On")) {
		powerOnAndersonExp(scope);
	} else { /** disables power to the anderson brdige */
		powerOffAndersonExp(scope);
	}
	stage.update();
}

/** starts anderson bridge experiment */
function startAndersonExp(scope) {
	wheatson_container.alpha = 0;
	anderson_container.alpha = 1;
	cro_container.alpha = 0;
	wire_num_int = 0;
	line_flag = false;
	scope.showDiv = false;
	scope.hideControls = true;
	scope.showPowerAnderson = true;
	scope.andersonPowrBtn = true;
	scope.control_disable = true;
	scope.diameter_control = true;
	scope.length_control = true;
	scope.dialog_box_show= false;
	scope.powerButton = true;
	scope.ShowHideCRO = true;
	scope.exptMainBtn = true;
	/** assigns the selected resistance values of wheatson bridge to anderson bridge */
	anderson_container.getChildByName("resR11").text = wheatson_container.getChildByName("resR1").text ;
	anderson_container.getChildByName("resR21").text = wheatson_container.getChildByName("resR2").text ;
	anderson_container.getChildByName("resR31").text = wheatson_container.getChildByName("resR3").text ;
	anderson_container.getChildByName("resR41").text = wheatson_container.getChildByName("resR4").text ;
	stage.update();
}

/** start power to anderson experiment */
function powerOnAndersonExp(scope) {
	scope.control_disable = false;
	scope.crodisabled = false;
	scope.diameter_control = false;
	scope.length_control = false;
	scope.reset_Btn = false;
	scope.hideResult=true;
	scope.anderson_powerOn = _("Power Off");
	anderson_container.getChildByName("voltText").visible = true;
	anderson_container.getChildByName("voltText").text = 2 + "V";
	showInductance(scope);
	stage.update();
}

/** stops power to anderson experiment */
function powerOffAndersonExp(scope) {
	scope.control_disable = true;
	scope.crodisabled = true;
	scope.diameter_control = true;
	scope.length_control = true;
	scope.reset_Btn = true;
	scope.hideResult=false;
	scope.anderson_powerOn = _("Power On");	
	anderson_container.getChildByName("voltText").visible = false;
	stage.update();
}

/** Shows the CRO for plotting the waves */
function showCroFN(scope) {
	if (scope.show_cro == _("Show CRO")) {
		ShowCROfunc(scope);
	} else { /** Hides the CRO and tracks back to anderson bridge */
		hideCROfunc(scope);
	}
	stage.update();
}

/** Show cro and waves */
function ShowCROfunc(scope) {
	wheatson_container.alpha = 0;
	anderson_container.alpha = 0;
	cro_container.alpha = 1;
	scope.diameter_control = true;
	scope.length_control = true;
	scope.hideCroSliders=false;
	scope.showPowerAnderson = false;
	scope.shw_result=false;
	scope.show_cro = _("Hide CRO");
	doCalculation(scope); /** All calculations for the experiment*/
	outpt_Wave(scope); /** Output wave in the CRO calculation*/
	stage.update();
}

/** hides cro */
function hideCROfunc(scope) {
	wheatson_container.alpha = 0;
	anderson_container.alpha = 1;
	cro_container.alpha = 0;
	scope.diameter_control = false;
	scope.length_control = false;
	scope.hideCroSliders=true;
	scope.show_cro = _("Show CRO");
	stage.update();
}

/** Voltage varying slider function */
function voltageSliderFN(scope) {
	scope.voltage = scope.volt;
	voltage_val_int = scope.volt;
	anderson_container.getChildByName("voltText").text = scope.voltage + "V";
	doCalculation(scope); /** All calculations for the experiment*/
	outpt_Wave(scope); /** Output wave in the CRO calculation*/
	stage.update();
}

/** Frequency varying slider function */
function frequencySliderFN(scope) {
	scope.frequency = scope.freq;
	frequency_val_float = scope.frequency;
	anderson_container.getChildByName("voltText").text = scope.frequency + "Hz";
	FindInductance(scope); /** Finds the inductance of the coil */
	FindInductiveReactance(scope); /** Finds the inductive reactance */
	Xc_Calc(scope); /** calculate Xc,resitance of capacitor */
	doCalculation(scope); /** All calculations for the experiment*/
	outpt_Wave(scope); /** Output wave in the CRO calculation*/
	stage.update();
}

/** Coil diameter varying slider function */
function coilDiamterSliderFN(scope) {
	scope.coil_diameter = scope.coilDiameter;
	CoreDiameter_FN(scope);
	var scale_y = (1 + (scope.coil_diameter - 0.1) / 30);
	anderson_container.getChildByName("coil").scaleY = scale_y; /** scale the coil with values form slider */
	stage.update();
}

/** Coil length varying slider function */
function changeLengthCoil(scope) {
	length_val_float = scope.coilLen / 100;
	CoreLength_FN(scope);
	var mask_width = ((scope.coil_length - initial_coil_len) * coil_width_factor) + initial_rect_width;
	coil_mask_rect.graphics.clear().beginStroke("").drawRect(325, 420, mask_width, 50); /** Increase length of coil using slider values */
	stage.update();
}

/** variable resistance varying slider function */
function variableResistorSliderFN(scope) {
	varbl_resistance_val_float = scope.varRes;
	anderson_container.getChildByName("variableresText").text = scope.varRes + " Ω";
	Resistance_FN(scope);
	stage.update();
}

/** Coil Length varying calculations */
function CoreLength_FN(scope) {
	FindNo_ofTurns(scope); /** Finds the number of turns of the inductance coil */
	FindInductance(scope); /** Finds the inductance of the coil */
	FindInductiveReactance(scope); /** Finds the inductive reactance */
	doCalculation(scope); /** All calculations for the experiment*/
	outpt_Wave(scope); /** Output wave in the CRO calculation*/
	stage.update();
}

/** Coil diameter calculations */
function CoreDiameter_FN(scope) {
	diameter_val_float = scope.coilDiameter / 100;
	FindArea(scope); /** Finds the area of the inductance coil */
	FindInductance(scope); /** Finds the inductance of the coil */
	FindInductiveReactance(scope); /** Finds the inductive reactance */
	doCalculation(scope); /** All calculations for the experiment*/
	outpt_Wave(scope); /** Output wave in the CRO calculation*/
	stage.update();
}

/** Rotate the voltage per division  knob */
function rotateVoltKnob(incr, rotVal) { /** knob of the indicator */
	tuner1_count_int = tuner1_count_int + incr;
	tuner1_rot_int += rotVal; /** indicator count */
	cro_container.getChildByName("turner1dot").rotation = tuner1_rot_int;
	stage.update();
}

/** Rotate the time per division knob */
function totateTimeKnob(incr, rotVal) { /** knob of the indicator */
	tuner2_count_int = tuner2_count_int + incr;
	tuner2_rot_int += rotVal; /** indicator count */
	cro_container.getChildByName("turner2dot").rotation = tuner2_rot_int;
	stage.update();
}

/**      Calculations starts here       */
/** Displays the selected resistance values in the text boxes and perform calculations for wheatson bridge*/
function getResistanceVal(scope) {	
	/** Assign the selected resistance values to the corresponding text boxes */
	resistorQ_val = resistance_back_total;
	resistorP_val = resistance_total;
	resistorR_val = resistance_S_total;
	resistorS_val = resistance_R_total;
	FindNo_ofTurns(scope); /** Find the number of turns of the coil */
	FindArea(scope); /** Find the area of coil */
	FindInductance(scope); /** Finds inductance  */
	FindInductiveReactance(scope); /** Finds inductive reactance */
	/** Balancing condition of resistor's calculation */
	/**calculate the balancing condition between resistors for wheatson bridge*/
	galv_val_int = (resistance_back_total / (resistance_total + resistance_back_total)) - (resistance_S_total / (resistance_S_total+ resistance_R_total));
	galv_result_int = galv_val_int * const_power_int; /** voltage= voltage * power */
	galv_val = Number(galv_result_int);
	
	/** If the galavanometr value is zero we can proceed to andersons experiment,hence bridge is balanced */
	if (Math.round(galv_val,2) == 0 && Number(resistance_total) != null && Number(resistance_back_total) != null && Number(resistance_R_total) != null && Number(resistance_S_total) != null) {
		scope.exptMainBtn = false;
		galv_val = 0; 
	}
	else { /** disabling the experiment start button */
		scope.exptMainBtn = true;
	}
	stage.update();
	/**assign the galvanometer reading */
	/** Check whether the galvanometer value is not a number */
	if (isNaN(galv_val)) { /** checks whether the voltage is not a number */
		scope.exptMainBtn = true;
		wheatson_container.getChildByName("VoltReading").text = "---";  /** displays no reading in the galavanometer */
	} else { /** Assingns the computed galvanometer value and displays it */
		wheatson_container.getChildByName("VoltReading").text = Number(galv_val.toFixed(2));
	}
	stage.update();
}

/** All common calculations are given here for Anderson bridge experiment */
function doCalculation(scope) {
	Xc_Calc(scope); /** calculate Xc,resitance of capacitor */
	R2Star_calc(scope) /** calculate R2Star,combined resistance */
	R3Star_calc(scope); /** calculate R3Star,combined inductor resistance */
	galv_VG(scope); /** calculate VG,galvanometer voltage */
	Resltant_Volt(scope); /** calculate resultant voltage */
	Output_Freq(scope); /** calculate output frequency */
	showInductance(scope); /** calculates the inductance and inductive reactance */
	stage.update();
}

/** Calculate Xc,resistance of capacitor value */
function Xc_Calc(scope) {
	/** Xc=1/(c*2*pi*f) where c=capacitance,f=frequency*/
	Xc_float = 1 / (capacitance_float * 2 * 3.14 * frequency_val_float);
	stage.update();
}

/** Calculate R2star,combined resistance of Xc,variable resitance and resistor P value  */
function R2Star_calc(scope) {
	/** R2Star=(P*(r+Xc))/(P+r+Xc) where P=resitor P value,r=variable resistance value,Xc=resitance of capacitor */
	var r2staR = Number(Number(resistorP_val) * (varbl_resistance_val_float + Xc_float) / (Number(resistorP_val) + varbl_resistance_val_float + Xc_float));
	R2Star_float = r2staR.toFixed(9);
	stage.update();
}

/** Calculate R3star,combined resistance of inductive reactance and resitor S value */
function R3Star_calc(scope) {
	/** R3Star=S+I where S=resitor S value,I=inductive reactance */
	R3Star_float = Number(resistorS_val) + Number(inductive_reactance);
	stage.update();
}

/** Calculate VG,galvanometer voltage */
function galv_VG(scope) {
	/** VG==(R2Star/(Q+R2Star)*Xc/(VR+Xc)-R/( R3Star+R))* voltage */
	var vg_value = (Number((Number(R2Star_float) / (Number(resistorQ_val) + Number(R2Star_float)) * Xc_float / Number(varbl_resistance_val_float + Xc_float) - Number(resistorR_val) / Number(R3Star_float + Number(resistorR_val))))) * Number(voltage_val_int);
	VG = vg_value.toFixed(6);
	stage.update();
}

/** Calculate resultant voltage for wave formation in the CRo apparatus */
function Resltant_Volt(scope) {
	galv_VG(scope); //finds VG voltage
	/** R=VG/V where VG=galvanometer voltage,V=voltage from Cro */
	Result_Volt = VG / voltperdiv_array[tuner1_count_int];
}

/** Calculate output frequency for wave formation in the CRO apparatus */
function Output_Freq(scope) {
	/** Output frequency=(T/1000)*f where T=time variation from cro,f= frequency   */
	output_freq_float = (timeperdiv_array[tuner2_count_int] * 0.001) * frequency_val_float;
	stage.update();
}

/** calculate Inductance */
function FindInductance(scope) {
	/** I=(P*N^2*A)/L where P=permeability,N=number of turns of coil,A=area of coil,L=length of coil */
	inductance_float = Number(permeability_float * Math.pow(1000 / length_val_float, 2) * 3.14 * Math.pow(diameter_val_float / 2, 2)) / Number(length_val_float);
	stage.update();
}

/** Calculates inductive reactance */
function FindInductiveReactance(scope) {
	/** IR=2*pi*f*I where IR=inductive reactance,f=frequency,I=inductance */
	induc_reactnce = inductance_float * 2 * 3.14 * frequency_val_float;
	inductive_reactance = induc_reactnce.toFixed(9);
	stage.update();
}

/** Calculate the number of turns of the coil */
function FindNo_ofTurns(scope) {
	/** N=1000*L where N=number of turns,L=length of the coil */
	no_turns_int = Number(1000 * length_val_float);
	stage.update();
}

/** Calculate the area of the coils */
function FindArea(scope) {
	/** A=(pi*D^2)/4 where A=area,D=diameter */
	area_float = (pi * (Math.pow(diameter_val_float, 2))) / 4;
	stage.update();
}

/**slider change function for variable resistance*/
function Resistance_FN(scope) {
	doCalculation(scope); /** All calculations for the experiment*/
	outpt_Wave(scope); /** Output wave in the CRO calculation*/
	stage.update();
}

/** Show result check box function */
function showInductance(scope) {
	rslt1 = inductance_float.toExponential(2); /** finds exponential */
	if (rslt1.indexOf("e") != -1) {
		inductanceSplitedArr = rslt1.split("e"); /** Splitting of the value and 'e' */
		inductance_value = inductanceSplitedArr[0];
		exponent_value = inductanceSplitedArr[1];
		inductanceSubVal=exponent_value; /** gets the exponent value */
		result_value = inductance_value;
		stage.update();
	}
	scope.inductance = result_value ;
	scope.inductanceSubVal=exponent_value; /** displays the result of inductance */
	rslt2 = induc_reactnce.toExponential(2); /** finds exponential */
	if (rslt2.indexOf("e") != -1) {
		inductive_reactanceArr = rslt2.split("e"); /** Splitting of the value and 'e' */
		inductive_reactance_val = inductive_reactanceArr[0];
		exponent_val = inductive_reactanceArr[1];
		reactanceSubVal=exponent_val;
		inductive_reactance_reslt = inductive_reactance_val;
	}
	stage.update();
	scope.inductive_reactance = inductive_reactance_reslt ;
	scope.reactanceSubVal=exponent_val;/** displays the result of inductive reactance*/
	stage.update();
}

/** Displays the ouput waves in the cro for resultant voltage and output frequency*/
function outpt_Wave(scope) {
	Resltant_Volt(); /** calculate resultant voltage */
	Output_Freq(); /** calculate output frequency */
	cro_wave.graphics.clear(); //clear the previously drawn waves and plot new one for each event 
	cro_wave.graphics.setStrokeStyle(1).beginStroke("#009900");
	xInitial = 0;
	output_wave_float = 0;
	x_point = [];
	y_point = [];
	var incr = 0; 
	
	/** finds increment value for finding x point for wave plotting */
	incr = 1 / (10 * output_freq_float);
	for (var i = 0; i <= 9300; i++) {
		incr = 1 / (10 * output_freq_float);
		x_point[i] = xInitial; /** Get x values */
		output_wave_float = Result_Volt * Math.sin(2 * 3.14 * output_freq_float * x_point[i]); /** Get y values */
		y_point[i] = output_wave_float.toFixed(5);
		xInitial = xInitial + incr;
		/** initialise the start x and y point of the sine wave */
		cro_wave.y = 325;
		cro_wave.x = 122;
		cro_wave.graphics.lineTo(x_point[i] * 50, y_point[i] * 15); /** Draws output wave in the cro */
	}
	stage.update();
}