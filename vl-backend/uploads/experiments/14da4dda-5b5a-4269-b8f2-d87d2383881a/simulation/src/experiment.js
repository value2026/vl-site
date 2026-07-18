/** Event handling functions starts here */
/** Stage updation function in every interval */
function updateTimer() {
	cryoscopy_stage.update();
}

/** Loading xml */
function loadXml() {
	xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if ( xmlhttp.readyState == 4 && xmlhttp.status == 200 ) {
			  retrieveData(xmlhttp);
		} 
	};
	xmlhttp.open("GET", "./xml/solvents.xml", true);
	xmlhttp.send();
}

/** Fetching xml data */
function retrieveData(xml) {
	var _xml_doc = xml.responseXML;
	var _xml_data = _xml_doc.getElementsByTagName("Solvent");
	/** Fetching molar freezing point depression constant */
	molar_freezing_point_depression_constant = (_xml_data[selected_solvent_index].getElementsByTagName("kf")[0].childNodes[0].nodeValue);
	/** Freezing point of the pure solvent */
	freezing_point = (_xml_data[selected_solvent_index].getElementsByTagName("meltingpoint")[0].childNodes[0].nodeValue);
	/** Freezing point temperature of pure solvent */
	total_freezing_point = freezing_point;	
}

/** fetching solute data from xml*/
function retrieveSoluteData(xml) {
	var _xml_doc = xml.responseXML;
	var _xml_data = _xml_doc.getElementsByTagName("Solute");
	/** Setting index for repeated solutes in the array to match with the xml data */
	if ( selected_solvent_index == 3 || selected_solvent_index == 4 ) {
		if ( selected_solute_index == 8 ){
			selected_solute_index = 7;
		} else if ( selected_solute_index == 9 ) {
			selected_solute_index = 5;
		} else if ( selected_solute_index == 10 ) {
			selected_solute_index = 6;
		}
	}
	/** Retrieving molecular weight of solute */
	var _mw = (_xml_data[selected_solute_index].getElementsByTagName("molarmass")[0].childNodes[0].nodeValue);	
	/** Retrieving van't Hoff factor of solute */
	vfactor = _xml_data[selected_solute_index].getElementsByTagName("solvent")[0].getAttribute("vfactor");
	/** Number of moles of the solute in kg of the solvent */
	num_moles = (solute_mass/_mw/solvent_mass)*1000;
	/** Depression in freezing point */
	var _delta_tf = molar_freezing_point_depression_constant * vfactor * num_moles;
	/** Freezing point of the solution */
	total_freezing_point = parseFloat(_delta_tf) + parseFloat(freezing_point); /** Total_freezing_point is the freezing point of the solution */
	total_freezing_point = total_freezing_point.toFixed(3); /** Rounding the freezing point */
	startTemperatureControl();
}

/** Function for setting controls while changing the solvent */
function changeSolventFn(scope) {
	selected_solvent_index = scope.solvent_Mdl;
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if ( xmlhttp.readyState == 4 && xmlhttp.status == 200 ) {
			retrieveData(xmlhttp,scope)
		}
	};
	xmlhttp.open("GET", "./xml/solvents.xml", true);
	xmlhttp.send();	
	if ( selected_solvent_index == 0 ) {
		scope.solute_Mdl = 0;
		/** Adding solutes of water to the solute array */
		scope.selectSoluteArray = [{optionsSolute: _('Sodium chloride'),type: 0}, {optionsSolute: _('Calcium chloride'),type: 1}, {optionsSolute: _('Aluminium chloride'),type: 2}, {optionsSolute: _('Urea'),type: 3}, {optionsSolute: _('Glucose'),type: 4}];
	} else if ( selected_solvent_index == 1 ) {
		scope.solute_Mdl = 5;
		/** Adding solutes of Benzene to the solute array */
		scope.selectSoluteArray = [{optionsSolute: _('Camphor'),type: 5}, {optionsSolute: _('Benzamide'),type: 6}];
	} else if ( selected_solvent_index == 2 ) {
		scope.solute_Mdl = 7;
		/** Adding solutes of Carbon disulphide to the solute array */
		scope.selectSoluteArray = [{optionsSolute: _('Sulphur'),type: 7}];
	} else {
		scope.solute_Mdl = 8;
		/** Adding solutes of Chloroform to the solute array */
		scope.selectSoluteArray = [{optionsSolute: _('Sulphur'),type: 8},{optionsSolute: _('Camphor'),type: 9}, {optionsSolute: _('Benzamide'),type: 10}];
	}
}
	
/** Function for setting solvant mass */
function setSolventMassFn(scope) {
	solvent_mass = scope.solvent_mass_value;
	solvent_container.getChildByName("testtube_solution").mask.y = solvent_container.getChildByName("testtube_front").y -252  - (scope.solvent_mass_value/1.5);
	if ( scope.solvent_mass_value == 0 ) { /** Setting the solution dip limit value when solvent mass has no changes */
		testtube_dip_value = testtube_dip_value;
	} else { /** Setting the solution dip limit value based on the solution rise level */
		testtube_dip_value = (scope.solvent_mass_value/2) -40; 		
	}
}

/** Function for setting solvant mass */
function setSoluteMassFn(scope) {
	solute_mass = scope.solute_mass_value;
	mass_val_float = scope.solute_mass_value / 10;
	/** Increasing the solute mass by scaling x and y position */
	solute_container.getChildByName("salt_powder_still").scaleX = mass_val_float;
	solute_container.getChildByName("salt_powder_still").scaleY = mass_val_float;
}

/** Function for dragging thermometer */
function dragDropThermoMeter(scope) {
	solvent_container.getChildByName("thermometer").on("mousedown", function(evt) { 
		press_flag = true;
		this.offset = {
			x: this.x - evt.stageX,
			y: this.y - evt.stageY
		};  
	});
	mask_thermo_rect_top.on("mousedown", function(evt) { /** Restricting the test tube movement if the user clicked on the top mask */
		press_flag = true;
	});
	mask_thermo_rect_top.on("pressup", function(evt) { /** Allowing the test tube movement if the user mouse up from the top mask */
		press_flag = false;
	}); 
	mask_thermo_rect_left.on("mousedown", function(evt) { /** Restricting the test tube movement if the user clicked on the left mask */
		press_flag = true;
	});
	mask_thermo_rect_left.on("pressup", function(evt) { /** Allowing the test tube movement if the user mouse up from the left mask */
		press_flag = false;
	}); 
	mask_thermo_rect_right.on("mousedown", function(evt) { /** Restricting the test tube movement if the user clicked on the right mask */
		press_flag = true;
	});
	mask_thermo_rect_right.on("pressup", function(evt) { /** Allowing the test tube movement if the user mouse up from the right mask */
		press_flag = false;
	}); 
	solvent_container.getChildByName("thermometer").on("pressup", function(evt) { /** Allowing the test tube movement if the user mouse up from the thermometer */
		press_flag = false;
	});	
	solvent_container.getChildByName("thermometer").on("pressmove", function(evt) { /** Left restriction of the thermometer movement in the test tube */
		if ( evt.stageX < test_tube_current_x+410 ) {
			evt.stageX = test_tube_current_x+410;
		} else if ( evt.stageX > test_tube_current_x+418 ) { /** Right restriction of the thermometer movement in the test tube */
			evt.stageX = test_tube_current_x+418;
		}
		if ( evt.stageY > test_tube_current_y +245 ) { /** Bottom restriction of the thermometer movement in the test tube */
			evt.stageY = test_tube_current_y+245;
		} else if (evt.stageY <50) { /** Thermometer top movement restriction */
			evt.stageY  = 100;
		}
		/** Setting the position of thermometer while dropping */
		this.y = evt.stageY + this.offset.y;
		this.x = evt.stageX + this.offset.x;
		thermo_current_x = evt.stageX; 
		thermo_current_y = evt.stageY;
		/** Moving the top, left, right mask based on the test tube movement */
		mask_thermo_rect_top.y = solvent_container.getChildByName("thermometer").y - 100;
		mask_thermo_rect_left.y = solvent_container.getChildByName("thermometer").y - 100;
		mask_thermo_rect_right.y = solvent_container.getChildByName("thermometer").y - 100;
	}); 
}

/** Function for dragging testtube */
function dragDropTestTube(scope) {
	solvent_container.on("mousedown", function(evt) { 
		this.parent.addChild(this);
		this.offset = {
			x: this.x - evt.stageX,
			y: this.y - evt.stageY
		}; 
	});
	solvent_container.on("pressmove", function(evt) { /** test tube press move function */
		if(press_flag == false && power_flag == false) {
			if ( evt.stageY > final_pos_obj_bottom ) {
				evt.stageY = final_pos_obj_bottom;
			} else if ( evt.stageY < final_pos_obj_top ) {
				evt.stageY = final_pos_obj_top;
			}			
			if ( evt.stageX > final_pos_obj_right ) {
				evt.stageX= final_pos_obj_right;
			} else if ( evt.stageX < final_pos_obj_left ) {
				evt.stageX = final_pos_obj_left;
			}	
			this.y = evt.stageY + this.offset.y;
			this.x = evt.stageX + this.offset.x;	
			test_tube_current_x	= this.x;
			test_tube_current_y = this.y;
			if ( scope.solvent_mass_value == 0 ) {
				testtube_dip_value = testtube_dip_value;
			} else {
				testtube_dip_value = (scope.solvent_mass_value/2) -38; 		
			}
		}
		cryoscopy_stage.removeChild(arc_line);
		arc_line = new createjs.Shape();
		arc_line.graphics.setStrokeStyle(5).beginStroke("black").bezierCurveTo(336,360, 365, 100,solvent_container.getChildByName("thermometer").x+solvent_container.x+35,solvent_container.y+27+ solvent_container.getChildByName("thermometer").y).endStroke();
		for ( var i=1; i<=15; i++ ) {
			getChild("stirrer"+i).x = solvent_container.x+396;
			getChild("stirrer"+i).y = solvent_container.y+193;
		}
		cryoscopy_stage.addChild(arc_line);
		scope.$apply();
    });
}

/** Function for  stirring solution in an interval */
function stirSolution()
{
	stirror_timer = setInterval(function() {
		stir_counter++;
		/** Calling the animation frames in an interval */
		if ( stir_counter > 15 ) {
			stir_rotation_count++;
			if ( stir_rotation_count == 4 ) { 
				clearInterval(stirror_timer);
				stir_complete_flag = true;
				power_flag =false;
			}
			stir_counter = 1;
			getChild("stirrer"+stir_counter).visible = false;
			if ( solute_mass == 0 ) { 
				startTemperatureControl();
			} else {
				xmlhttp.onreadystatechange = function() {		
					if ( xmlhttp.readyState == 4 && xmlhttp.status == 200 ) {
						retrieveSoluteData(xmlhttp);
					} 
				};
				xmlhttp.open("GET", "./xml/solutes.xml", true); 
				xmlhttp.send();
			}
		}
		stirrerRotate(stir_counter);
	}, 50);
}

/** Function to check the thermometer, test tube dipped in water bath */
function startTemperatureControl() {
	temp_timer = setInterval(function() {
		temperatureController();
	},5000);
}

/** Function for calculating temperature */
function temperatureController() {
	var interval=8*Math.random();
	/** Function to check the thermometer, test tube dipped in water bath and check whether the stirring complete */
	if ( solvent_container.y > testtube_dip_value && solvent_container.getChildByName("thermometer").y >180 && stir_complete_flag) {
		/** Checking the temperature reached the solution/solvent boiling point */
		if ( parseFloat(current_temperature-interval) > total_freezing_point ) {
			/** Adding an interval to the current temperature  to show the temperature variation in the temperature controller */
			current_temperature = (parseFloat(current_temperature-interval).toFixed(3));
			/** Function call to set the temperature in the temperature controller in the interval */
			setTemperatureReading(current_temperature);
			current_temperature = parseFloat(current_temperature - interval);
		} else {
			current_temperature = total_freezing_point; /** Setting the freezing point of the solvent or solution as temperature */
			setTemperatureReading(current_temperature); /** Function call to set the final temperature in the temperature controller */
			clearInterval(temp_timer);
		}
	}
}

/** Function for setting the temperature */
function setTemperatureReading(val) {
	getChild("temperature").text = current_temperature;
}

/** Function for stirring solution in the test tube */
function stirrerRotate(count) {
	for ( var i = 1; i <=15; i++ ) {
		getChild("stirrer"+i).alpha = 0; /** Disabling all animation frame */
	}	
	getChild("stirrer" +count).alpha = 1; /** Enabling only one animation frame at a time */
}

/** Function for setting controls while changing the solute */
function changeSoluteFn(scope) {
	selected_solute_index = scope.solute_Mdl;
}

/** Reset the experiment in the reset button event */
function resetExperiment(scope) {
	createjs.Tween.removeAllTweens(); /** Removing the solute tweening from plate to the  test tube */
	arc_line.graphics.clear(); /** Clearing the curve drawn from temprature controller and thermometer */
	cryoscopy_stage.update(); /** Updating the stage */
	initialisationOfVariables(scope); /** Initialisation of variables */
	initialisationOfImages(); /** Moving all images to the original position */
	solvent_container.x = 0; /** Resetting the solvent controller x position */
	solvent_container.y = 0; /** Resetting the solvent controller y position */
	solute_container.x = 0; /** Resetting the solute controller x position */
	solute_container.y = 0; /** Resetting the solvent controller y position */
	clearInterval(temp_timer); /** Clearing the timer used to show temperature change in the temperature controller */
	clearInterval(stirror_timer); /** Clearing the timer which used for stirring the solution */
	clearInterval(animation_timer); /** Clearing the solute pouring animation timer */
	/** Removing all animation frames for pouring solute to the test tube */
 	for ( var i=1; i<=15; i++ ) {
		cryoscopy_stage.removeChild(getChild("powder_pour" +i));
	} 
	loadXml();  
}

/** Click event function of the equipment */
function clickEquipment(scope, dialogs) {
	switch_on_rect.on("mousedown", function() {
		var solvantLimit = solvent_mass/2;
		/** To display an error messages if the if the solvent limit exceeds */
		if ( solvantLimit < solute_mass ) {
			dialogs.error(); 
		}
		else if (getChild("switch_on").visible == false) { /** Power on function */
				getChild("power_on").visible = true;
				getChild("power_off").visible = false;
				getChild("switch_off").visible = false;
				getChild("switch_on").visible = true;
				/** Disabling the controls when the power is on */
				scope.solute_ctrls_disable = true;
				scope.solute_mass_ctrls_disable = true;
				scope.solvent_mass_ctrls_disable = true;
				scope.solvent_ctrls_disable= true;
				power_flag = true;
				/** Setting index for restricting the movement under the wire */
				cryoscopy_stage.setChildIndex(solute_container, cryoscopy_stage.getNumChildren()-1)
				for ( var i=1; i<=15; i++ ) {
					loadImages(queue.getResult("powder_pour"+i), "powder_pour"+i,solvent_container.x+220,solvent_container.y+150, "", 0, cryoscopy_stage, .7);
					getChild("powder_pour" +i).alpha = 0;
				}  
				scope.$apply();
				/** Setting the animation frames count  based on the solution mass selected */
				if ( scope.solute_mass_value > 0 ) { 
					if ( scope.solute_mass_value < 1 ) { /** Play frames from 13 to 15 */
						animation_counter = 13;
					} else if ( parseInt(scope.solute_mass_value) < 5 ) { /** Play frames from 10 to 15 */
						animation_counter = 10;
					} else if ( parseInt(scope.solute_mass_value) < 8 ) { /** Play frames from 5 to 15 */
						animation_counter = 5;
					} else { /** Play all frames (ie,from 1 to 15) */
						animation_counter = 0;
					}
					/** Moving the solute from plate to the test tube*/
					createjs.Tween.get(solute_container).to({
					x:solvent_container.x+195,y:solvent_container.y-400}, 5000)
					.call(function(){at_end_pour_solute(scope)});
					getChild("plate_shadow").visible = false;
				} else { /** Start stirring if there is no solute selected */
					stirSolution();	
				}
		} else { /** Power off function */
			getChild("power_off").visible = true;
			getChild("power_on").visible = false;
			getChild("switch_on").visible = false;
			getChild("switch_off").visible = true;
			resetExperiment(scope);
			scope.$apply();
		}
	});
}

/** Pouring the solution to the test tube */
function at_end_pour_solute(scope) {
	animation_timer = setInterval(function() {
		animation_counter++;
		/** Clearing the timer after animation */
		if ( animation_counter >= 15 ) {
			getChild("powder_pour"+animation_counter).visible = false;
			clearInterval(animation_timer);
			stirSolution(); /** Start stirring after pouring the solute to the test tube */
		}  
		for ( var i = 1; i <=15; i++ ) {
			getChild("powder_pour"+i).alpha = 0; /** Disabling all animation frame */
		}
		getChild("powder_pour" +animation_counter).alpha = 1; /** Enabling only one animation frame at a time */
		solute_container.visible = false; /** Disabling solute and plate after pouring solute to the test tube */
	}, 100)
}

/** Function to return child element of stage */
function getChild(child_name) {
    return cryoscopy_stage.getChildByName(child_name); /** Returns the child element of stage */
}