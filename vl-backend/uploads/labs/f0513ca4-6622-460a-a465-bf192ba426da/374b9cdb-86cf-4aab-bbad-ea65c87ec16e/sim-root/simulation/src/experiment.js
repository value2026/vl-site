(function() {
	angular.module('users')
		.directive("experiment", directiveFunction)
})();
/** Variables  declaration */
var quinckes_stage, quinckes_container, magneticfield_container;

var boolean_array, boolean_reverse_array, probe_index_array, forward_arrow, reverse_arrow;

var zoom_click, zoomout_click, zoom_soln_mask, zoom_scale_mask, blur_filter, zoom_bg;

var susceptibility_solution, magnetic_field, solution_height_rise, current_value, molarity_value;

var density_air, molarmass_MnSO4, actualdensity_MnSO4, molarmass_H2O, actualdensity_H2O;

var zoom_scale_base_top, solution_height_increment, initial_adjust_microscope;

function directiveFunction() {
	return {
		restrict: "A",
		link: function(scope, element, attrs) {
			/** Variable that decides if something should be drawn on mouse move */
			var experiment = true;
			/* Responsive  */
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
			queue = new createjs.LoadQueue(true);
			queue.installPlugin(createjs.Sound);
			queue.on("complete", handleComplete, this);
			queue.loadManifest([{ /** Background- Magnetic field current container*/ 
				id: "background_01",
				src: "././images/bg_01.svg",
				type: createjs.LoadQueue.IMAGE
			},
			{ /** Probe not connected image - Magnetic field current container*/ 
				id: "probe_not_connect",
				src: "././images/probe1_01.svg",
				type: createjs.LoadQueue.IMAGE
			},
			{ /** Probe connected image- Magnetic field current container */ 
				id: "probe_connect",
				src: "././images/probe2_01.svg",
				type: createjs.LoadQueue.IMAGE
			},
			{ /** Tuner button image- Magnetic field current container */ 
				id: "turner1",
				src: "././images/turner1.svg",
				type: createjs.LoadQueue.IMAGE
			}, 
			{ /** Tuner button image - Magnetic field current container */
				id: "turner2",
				src: "././images/turner2.svg",
				type: createjs.LoadQueue.IMAGE
			},  
			{ /** Tuner button rotate image - Magnetic field current container */ 
				id: "turnerrotate",
				src: "././images/turner_rotate.svg",
				type: createjs.LoadQueue.IMAGE
			}, 
			{ /** Background - Quincke's containerr */ 
				id: "background_02",
				src: "././images/bg_02.svg",
				type: createjs.LoadQueue.IMAGE
			},
			{ /** Tube zoom - Quincke's container */ 
				id: "zoomtube_02",
				src: "././images/zoom_tube.svg",
				type: createjs.LoadQueue.IMAGE
			},
			{ /** Tube solution zoom - Quincke's container */ 
				id: "zoomsln_02",
				src: "././images/zoom_sln.svg",
				type: createjs.LoadQueue.IMAGE
			}, 
			{ /** Microscope set up still  - Zoom container */ 
				id: "zoomScaleStill_03",
				src: "././images/zoom_scale_still.svg",
				type: createjs.LoadQueue.IMAGE
			},
			{ /** Zoom microscope scale  - Zoom container */
				id: "zoomScaleMove_03",
				src: "././images/zoom_scale_move.svg",
				type: createjs.LoadQueue.IMAGE
			} ]);
			quinckes_stage = new createjs.Stage("demoCanvas"); /** Create main stage */
			quinckes_stage.enableDOMEvents(true);
			quinckes_stage.enableMouseOver();
			createjs.Touch.enable(quinckes_stage);
			/** Magneticfield current container */
			magneticfield_container = new createjs.Container(); /** Creating magneticfield current container */
			magneticfield_container.name = "magneticfield_container";
			quinckes_stage.addChild(magneticfield_container); /** Append it in the stage */
			/** Quincke's set up container */
			quinckes_container = new createjs.Container(); /** Creating quinckes container */
			quinckes_container.name = "quinckes_container";
			quinckes_stage.addChild(quinckes_container); /** Append it in the stage */
			/** Current container */
			current_container = new createjs.Container(); /** Creating current container */
			current_container.name = "current_container";
			quinckes_stage.addChild(current_container); /** Append it in the stage */
			/** Zoom container */
			zoom_container = new createjs.Container(); /** Creating zoom container */
			zoom_container.name = "current_container";
			quinckes_stage.addChild(zoom_container); /** Append it in the stage */
			/** For different shapes */
			forward_arrow = new createjs.Shape();
			reverse_arrow = new createjs.Shape();
			zoom_click = new createjs.Shape();
			zoomout_click = new createjs.Shape();
			zoom_soln_mask = new createjs.Shape();
			zoom_scale_mask = new createjs.Shape();
			soln_mask = new createjs.Shape();
			zoom_bg = new createjs.Shape();
			/** For Blur */
			blur_filter = new createjs.BlurFilter(2, 2, 2);
			/** After image loading completed */
			function handleComplete() {
				/** Load images into container */
				/** Background- Magnetic field current container*/
				loadImages(queue.getResult("background_01"), "background1", -50, -50, "", 0, 1, magneticfield_container); 
				/** Background - Quincke's containerr */
				loadImages(queue.getResult("background_02"), "background2", -43, -35, "", 0, 1,  quinckes_container); 
				/** Background - Zoom containerr */				
				zoom_bg.graphics.beginFill("#8D7760").drawRect(0, 0, 700, 700); 
				zoom_container.addChild(zoom_bg);/** Add Background into container */				 
				 /** Probe not connected image - Magnetic field current container*/
				loadImages(queue.getResult("probe_not_connect"), "probe_not_connect", 425, 480, "", 0, 1, magneticfield_container); 
				/** Probe connected image - Magnetic field current container*/
				loadImages(queue.getResult("probe_connect"), "probe_connect", 343, 208, "", 0, 1, magneticfield_container);
				 /** Tuner button image- Magnetic field current container */
				loadImages(queue.getResult("turner1"), "turner1", 192, 500, "", 0, 1, current_container); 
				/** Tuner button image- Magnetic field current container */
				loadImages(queue.getResult("turner2"), "turner2", 192, 500, "", 0, 1,  current_container); 
				/** Tuner button rotate image - Magnetic field current container */
				loadImages(queue.getResult("turnerrotate"), "turnerrotate", 239, 553, "", 0, 1, current_container); 
				 /** Tube zoom - Quincke's container */
				loadImages(queue.getResult("zoomsln_02"), "zoomsln_02", 94, 150, "", 0, 1.3, quinckes_container);
				/** Tube solution zoom - Quincke's container */
				loadImages(queue.getResult("zoomtube_02"), "zoomtube_02", 2, 22, "", 0, 1.3, quinckes_container); 
				/** Microscope set up still  - Zoom container */
				loadImages(queue.getResult("zoomScaleStill_03"), "zoomScaleStill_03", -30, -85, "",0 ,1, zoom_container); 
				/** Zoom microscope scale  - Zoom container */
				loadImages(queue.getResult("zoomScaleMove_03"), "zoomScaleMove_03", 164, -505.05147063821414, "", 0, 1, zoom_container); 
				/** Machine readings and labels */
				setText("currentVal", 100, 547, "0.5", "black", 2, current_container); /** Current value label */
				setText("currentSymbol", 160, 547, "A", "black", 1, current_container); /** Current symbol label */
				setText("gaussianVal", 497, 555, "0.000", "black", 2, magneticfield_container); /** Gaussian label */
				/** Gaussian initial value label */
				setText("gaussianInitialVal", 497, 555, "0.000", "black", 2, magneticfield_container); 
				/** Constant current supply label */
				setText("currentSupplyLabel", 70, 575, _("CONSTANT CURRENT SUPPLY"), "black", 0.6, current_container);
				 /** Gauss meter label */
				setText("gaussMeterLabel", 485, 583, _("GAUSS METER"), "black", 0.6, magneticfield_container); 
				initialisationOfVariables(); /** Initializing the variables */
				initialisationOfImages(); /** Function call for images used in the apparatus visibility */
				translationLabels(); /** Translation of strings using gettext */
				/** Draw shapes */
				drawRectangle(reverse_arrow, "reverse_arrow", 190, 520, 30, 30, "black", current_container, scope, "pointer"); /** Rectacle shape for clicking on the forward arrow on constant current supply machine*/
				drawRectangle(forward_arrow, "forward_arrow", 260, 520, 30, 30, "black", current_container, scope, "pointer"); /** Rectacle shape for clicking on the reverse arrow on constant current supply machine*/
				drawRectangle(zoom_click, "zoom_click", 300, 165, 150, 300, "black", quinckes_container, scope, "url(././images/zoom_in.svg),auto"); /** Rectacle shape for clicking on the microscope scale */
				drawRectangle(zoomout_click, "zoomout_click", 140, 100, 425, 500, "black", zoom_container, scope, "url(././images/zoom_out.svg),auto"); /** Rectacle shape for clicking on the zoomed microscope scale */
				/** Rectacle shape for masking tube solution */
				drawRectangle(soln_mask, "soln_mask", 100, 35, 55, 230, "#8D765F", quinckes_container, scope, "default");		
				/** Draw circle for masking the solution */
				zoom_soln_mask.graphics.beginStroke("#ffffcc");
				zoom_soln_mask.graphics.setStrokeStyle(3);
				zoom_soln_mask.graphics.arc(125, 150, 116, 0, 2 * Math.PI); // Zoom solution mask
				quinckes_container.addChild(zoom_soln_mask); /** Add mask into container */
				/** Draw rectangle for masking the zoomed microscope scale */
				zoom_scale_mask.graphics.beginStroke("white");
				zoom_scale_mask.graphics.setStrokeStyle(5);
				zoom_scale_mask.graphics.drawRect(140, 100, 425, 500); // Zoom scale mask
				zoom_container.addChild(zoom_scale_mask); /** Add mask into container */
				/** Zoom solution top adjustment in zoomed portion */
				setSolnTop();
				quinckes_stage.update(); /** Stage update function in a timer */
			}
			
			/** Add all the strings used for the language translation here. '_' is the short cut for calling the gettext function defined in the gettext-definition.js */
			function translationLabels() {
				/** This help array shows the hints for this experiment */
				helpArray = [_("help1"), _("help2"), _("help3"), _("help4"), _("help5"), _("help6"), _("help7"), _("help8"), _("help9"), _("help10"), _("Next"), _("Close")];
				scope.heading = _("Quincke's Method"); /**Experiment title text*/
				scope.variables = _("Variables");
				scope.setup_label = _("Select set up:");
				scope.setupitem = _("Magnetic field Vs Current");
				scope.btnProbe = [_("Insert probe"), _("Remove probe")];
				scope.insert_remove_btn_label = scope.btnProbe[0];
				scope.current_label = _("Current :");
				scope.A = _("A");
				scope.molarity_label = _("Molarity :");
				scope.M = _("M");
				scope.adjust_scale_label = _("To adjust microscope scale:");
				scope.focus_label = _("Focusing knob:");
				scope.show_result = _("Show Result");
				scope.reset = _("Reset");
				scope.result = _("Result");
				scope.susceptibility_label = _("Magnetic Susceptibility of the solution : ");
				scope.setupArray = [{/**options of the dropdown box*/
					setup: _("Magnetic field Vs Current"),
					indexVal: 0
				}, {
					setup: _("Quincke's setup"),
					indexVal: 1
				}];
				scope.copyright = _("copyright");
				scope.$apply();
			}
			/** All the images loading and added to the stage */
			function loadImages(image, name, xPos, yPos, cursor, rot, sFactor, container) {
				var _bitmap = new createjs.Bitmap(image).set({});
				if (name == "turnerrotate") {
					_bitmap.regX = _bitmap.image.width / 2;
					_bitmap.regY = _bitmap.image.height / 2;
				}
				if (name == "zoomsln_02" || name == "zoomtube_02") { /** Mask apply on the tube and tube solution */
					_bitmap.mask = zoom_soln_mask;
				}
				if (name == "zoomsln_02") { /** Mask apply on the  tube solution */
					_bitmap.mask = soln_mask;
				}
				if (name == "zoomsln_02") { /** Initial blur apply on the tube solution */
					_bitmap.filters = [blur_filter];
					_bitmap.cache(0, 0, _bitmap.image.width, _bitmap.image.height);
				}
				if (name == "zoomScaleStill_03" || name == "zoomScaleMove_03") { /** Mask apply on the main scale zoom*/
					_bitmap.mask = zoom_scale_mask;
				}
				_bitmap.x = xPos;
				_bitmap.y = yPos;
				_bitmap.scaleX = sFactor;
                _bitmap.scaleY = sFactor;
				_bitmap.name = name;
				_bitmap.alpha = 1;
				_bitmap.rotation = rot;
				_bitmap.cursor = cursor;
				container.addChild(_bitmap); /** Adding bitmap to the container */
			}
			
			/** All variables initialising in this function */
			function initialisationOfVariables() {
				boolean_array = [true, false];
				boolean_reverse_array = [false, true];
				probe_index_array = [1, 0];
				current_value = 0.5;/** Current */
				molarity_value = 0.5;/** Molarity */
				magnetic_field = 0.113; /** Magnetic field */
				density_air = 1.166; /** Density of air */
				molarmass_MnSO4 = 151.0013; /** Molar mass of MnSO4 */
				actualdensity_MnSO4 = 3.25; /** Density of MnSO4 */
				molarmass_H2O = 18.01528; /** Molar mass of H2O */
				actualdensity_H2O = 1; /** Density of H2O */
				susceptibility_solution =9.13;/** Susceptibility */
				zoom_scale_base_top = 187; /** Zoom scale top*/
				solution_height_increment = 0.18127788968869932;/** Solution height increment constant  */
				solution_height_rise = 0.000004531947242217483;/** Solution height */
				initial_adjust_microscope=187;/** Initial microscope adjust slider value */
			}
			
			/** Set the initial status of the bitmap and text depends on its visibility and initial values */
			function initialisationOfImages() {
				current_container.getChildByName("turnerrotate").rotation = 10;
				magneticfield_container.getChildByName("probe_connect").visible = false;
				magneticfield_container.getChildByName("gaussianVal").visible = false;
				current_container.getChildByName("turner2").visible = false;
				quinckes_container.alpha = 0;
				zoom_container.alpha = 0;
			}
			quinckes_stage.update(); /** Stage update function in a timer */
		}
	}
}
/** Draw rectangle  */
function drawRectangle(shapeName, name, xPos, yPos, width, height, color, container, scope, cursor) {
	shapeName.graphics.clear();
	container.addChild(shapeName);
	shapeName.cursor = cursor;
	shapeName.alpha = 0.01;
	shapeName.name = name;
	shapeName.graphics.setStrokeStyle(2);
	shapeName.graphics.beginFill(color).drawRect(xPos, yPos, width, height);
	shapeName.on("mousedown", function(evt) {
		switch (name) {
			case "reverse_arrow":
				/** Current decrease */
				if (scope.current_model > 0.5) {
					scope.current_model = scope.current_model - 0.5;
					currentRegulateFn(scope);
				}
				break;
			case "forward_arrow":
				/** Current increase */
				if (scope.current_model < 5) {
					scope.current_model = scope.current_model + 0.5;
					currentRegulateFn(scope);
				}
				break;
			case "zoom_click":
				/** Zoom view of travelling microscope scale */
				zoom_container.alpha = 1;
				break;
			case "zoomout_click":
				/** Zoom out view of travelling microscope scale */
				zoom_container.alpha = 0;
				break;
		}
		scope.$apply();
		quinckes_stage.update(); /** Stage update function in a timer */
	});
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
/** Drop down change */
function changeSetupFn(scope) {
	var _setup_index = scope.setup_model /** Index value of the drop down box array */
	quinckes_container.alpha = _setup_index;/**To hide/show quinker's container and magnetic field current container*/
	scope.show_view = boolean_array[_setup_index]; /** To show/hide contents of quinker's container */
	scope.hide_view = boolean_reverse_array[_setup_index]; /** To hide/show contents of magnetic field current container  */
	if (_setup_index == 0) { /** Magnetic field Vs Current */ 
		drawRectangle(reverse_arrow, "reverse_arrow", 190, 520, 30, 30, "black", current_container, scope, "pointer"); /** Rectacle shape for clicking on the forward arrow on constant current supply machine*/
		drawRectangle(forward_arrow, "forward_arrow", 260, 520, 30, 30, "black", current_container, scope, "pointer"); /** Rectacle shape for clicking on the reverse arrow on constant current supply machine*/
		current_container.getChildByName("currentVal").x=100; /** Change current value label position */
		current_container.getChildByName("currentSymbol").x=160;/** Change current symbol position */
  		current_container.getChildByName("currentSupplyLabel").x=70;/** Change current symbol label position */
		current_container.getChildByName("turner1").x=192;/** Change tuner 1 position */
		current_container.getChildByName("turner2").x=192;/** Change tuner 2 position */
		current_container.getChildByName("turnerrotate").x=239; /** Change tuner rotate image position */
	}else{ /** Quincke's setup */ 
		drawRectangle(reverse_arrow, "reverse_arrow", 270, 520, 30, 30, "black", current_container, scope, "pointer"); /** Rectacle shape for clicking on the forward arrow on constant current supply machine*/
		drawRectangle(forward_arrow, "forward_arrow", 330, 520, 30, 30, "black", current_container, scope, "pointer"); /** Rectacle shape for clicking on the reverse arrow on constant current supply machine*/
  		current_container.getChildByName("currentVal").x=180;/** Change current value label position */
  		current_container.getChildByName("currentSymbol").x=240;/** Change current symbol position */
  		current_container.getChildByName("currentSupplyLabel").x=150;/** Change current symbol label position */
		current_container.getChildByName("turner1").x=270;/** Change tuner 1 position */
		current_container.getChildByName("turner2").x=270;/** Change tuner 2 position */
		current_container.getChildByName("turnerrotate").x=318; /** Change tuner rotate image position */		
   }
   zoom_container.alpha = 0;
   quinckes_stage.update(); /** Stage update function in a timer */
}

/** Button event for insert/remove probe */
function insertRemoveProbe(scope) {
	var _probe_index = scope.probe_btn_click % 2;
	var _probe_reverse_index = probe_index_array[_probe_index];
	magneticFieldCalcualtion(); /** Magnetic field generated calculation */
	if (scope.insert_remove_btn_label == scope.btnProbe[_probe_reverse_index]) { /** Probe inserted/removed */
		scope.insert_remove_btn_label = scope.btnProbe[_probe_index]; /** Button value changed as Remove probe/Insert probe */
		magneticfield_container.getChildByName("probe_connect").visible = boolean_array[_probe_reverse_index]; /** To hide/show probe connected image  */
		magneticfield_container.getChildByName("probe_not_connect").visible = boolean_array[_probe_index]; /** To show/hide probe not connected image  */
		magneticfield_container.getChildByName("gaussianInitialVal").visible = boolean_array[_probe_index]; /** To hide/show gaussian initial value  */
		magneticfield_container.getChildByName("gaussianVal").visible = boolean_array[_probe_reverse_index]; /** To show/hide gaussian value  */
	}
	quinckes_stage.update(); /** Stage update function in a timer */
}
/** Current slider change function */
function currentSliderFN(scope) {
	currentRegulateFn(scope); /** Current change function*/
	quinckes_stage.update(); /** Stage update function in a timer */
}
/** Current change function */
function currentRegulateFn(scope) {
	/** Display current on the current source */
	scope.current = scope.current_model;
	current_value = scope.current_model; /** Current value getting from current slider */
	var _tuner_change = (scope.current_model * 10) % 2;
	current_container.getChildByName("currentVal").text = scope.current_model; /** Current value change */
	current_container.getChildByName("turnerrotate").rotation = scope.current_model * 20; /** Rotate tuner */
	current_container.getChildByName("turner2").visible = boolean_array[_tuner_change]; /** To hide/show tuner 1  */
	current_container.getChildByName("turner1").visible = boolean_reverse_array[_tuner_change]; /** To show/hide tuner 2 */
	magneticFieldCalcualtion(); /** Magnetic field generated calculation */
	solutionIncrement(scope); /** Calculation for rise the height of the solution and applied */
}
/** Molarity slider change function */
function molaritySliderFN(scope) {
	scope.molarity = scope.molarity_model; /** Molarity slider value assigned into molarity slider value label */
	molarity_value = scope.molarity; /** Molarity value */
	solutionIncrement(scope); /** Calculation for rise the height of the solution and applied */
	quinckes_stage.update(); /** Stage update function in a timer */
}
/** Function to set focus point */
function setFocus(scope) {
	var _blur=Math.abs(parseInt(scope.adjust_focus_model));
	blur_filter = new createjs.BlurFilter(_blur, _blur, _blur);
	quinckes_container.getChildByName("zoomsln_02").filters = [blur_filter];
	quinckes_container.getChildByName("zoomsln_02").cache(0, 0, 48, 264);
	quinckes_stage.update(); /** Stage update function in a timer */
}
/** Magnetic field displayed on the Guass meter calculation */
function magneticFieldCalcualtion() {
	/** 
        Magnetic field displayed on the Guass meter,
            B=C*2267*10-4 
        Where ‘B’ is the applied Magnetic field and ‘C’ is the current from the current source 
    */
	magnetic_field = current_value * 2267 * Math.pow(10, -4);
	magneticfield_container.getChildByName("gaussianVal").text = magnetic_field.toFixed(3);

}
/**microscope top adjust on the button click*/
function microscopeTopAdjustment(scope) {
	var _diff=parseFloat(Math.abs(scope.adjust_microscope_model))-parseFloat(initial_adjust_microscope);
	_diff=Math.abs(Math.round(_diff));
	if(Math.abs(scope.adjust_microscope_model) < initial_adjust_microscope){
		increment = _diff*-1;
	}else{
		increment = _diff*1;
	}
	initial_adjust_microscope = parseFloat(Math.abs(scope.adjust_microscope_model));
	zoom_scale_base_top = zoom_scale_base_top + increment;
	 /** Apply zoom scale top  */
	zoom_container.getChildByName("zoomScaleMove_03").y = zoom_container.getChildByName("zoomScaleMove_03").y + 0.397672282857861 * increment;
	setSolnTop();
	quinckes_stage.update(); /** Stage update function in a timer */
}
/** Function to set zoom solution top */
function setSolnTop() {
	var _zoom_solution_top = zoom_scale_base_top - solution_height_increment;
	/** Apply zoom solution top  */
	quinckes_container.getChildByName("zoomsln_02").y = _zoom_solution_top; 
}
/** Show result check box function */
function showresultFN(scope) {
	/** Set result  */
	scope.susceptibility = susceptibility_solution.toFixed(2) + " x 10";
	quinckes_stage.update();
}
/** Reset the experiment */
function reset(scope) {
	window.location.reload();
}
/** Calculation for rise the height of the solution */
function solutionIncrement(scope) {
	/** To determine the volume susceptibility of paramagnetic MnSO4 solution at different concentration
        h=B2*χ/(µ0*2*g*(ρ-σ)), where h=rise of paramagnetic solution, B=applied magnetic field, µ0=4*3.14*10^-7 H/m
        ρ, σ are the densities of liquid and air respectively, I = current in ampere */
	var _gravity = 9.8,
		_density_H2O_constant = 1000,
		_const_2 = 35.1,
		_const_3 = 9.027,
		_const_4 = 4,
		_const_5 = 3,
		_const_6 = 1.38,
		_const_7 = 300,
		_susceptibility_H2O_constant = 9.04,
		solution_height_rise_constant = 2,
		_solution_height_increment_contant = 40000;
	
	/** Density of MnSO4 g/L = Molarity * Molar mass of MnSO4 */
	var _density_MnSO4 = molarity_value * molarmass_MnSO4; 
	/** Volume of MnSO4 cm^2 =  Density of MnSO4 g/L / Actual density MnSO4 */
	var _volume_MnSO4 = _density_MnSO4 / actualdensity_MnSO4; 
	/** Density of H2O =  1000 - Volume of MnSO4  */
	var _density_H2O = _density_H2O_constant - _volume_MnSO4; 
	/** Density of solution = (Volume of MnSO4 * Actual density of MnSO4 + Density of H2O *Actual density of H2O) */
	var _density_solution = (_volume_MnSO4 * actualdensity_MnSO4 + _density_H2O * actualdensity_H2O); 		
	
	/** Susceptibility of Mn2+ 'χMn2' = ((Molarity ×6.023 ×(10)^23 × 35.1 × (9.027 x (10)^(-24)))^2  × 4π(10)^7))/((3×1.38×(10)^(-23)×300))*/
	var _susceptibility_Mn = (molarity_value * 6.023 * Math.pow(10, 23) * _const_2 * (Math.pow((_const_3 * Math.pow(10, -24)), 2)) * _const_4 * Math.PI * Math.pow(10, -7)) / (_const_5 * _const_6 * Math.pow(10, -23) * _const_7); 
	
	/** Susceptibility of water χwater = 9.04*(10)^-6 */
	var _susceptibility_H2O = _susceptibility_H2O_constant * Math.pow(10, -6) ;
	
	/** Susceptibility of the solution χ=χMn2+ + χwater */
	susceptibility_solution = _susceptibility_Mn + _susceptibility_H2O; 

	/** Rise in height 'h'(m) = h=B2*χ/(µ0*2*g*(ρ-σ)), where B is the Magnetic field applied, χ Susceptibility of the solution, µ0= 4π(10)^7, g is the gravity, ρ,σ are the densities of liquid and air respectively.*/
	
	solution_height_rise = (susceptibility_solution * magnetic_field * magnetic_field) / (solution_height_rise_constant * _const_4 * Math.PI * Math.pow(10, -7) * (_density_solution - density_air) * _gravity); 
	/**convert susceptibility of the solution in the exponential form*/
	susceptibility_solution = susceptibility_solution * Math.pow(10, 6);
	scope.susceptibility = susceptibility_solution.toFixed(2) + " x 10";
	solution_height_increment = solution_height_rise * _solution_height_increment_contant;
	setSolnTop();//solution height change
}