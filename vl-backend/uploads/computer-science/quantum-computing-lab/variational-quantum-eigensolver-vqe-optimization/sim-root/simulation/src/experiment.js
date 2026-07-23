/** Event handling functions starts here */
/** Function to show labels based on the check box selection */  
function showLabelsFn(scope) {
	var label_visibility = false;
	if (scope.showLabels) {
		label_visibility = true;
	} 
	else{
		label_visibility = false;
	}
	viscosity_measurement_stage.getChildByName("clabel").visible = label_visibility;
	viscosity_measurement_stage.getChildByName("alabel").visible = label_visibility;
	viscosity_measurement_stage.getChildByName("dlabel").visible = label_visibility;
	viscosity_measurement_stage.getChildByName("blabel").visible = label_visibility;	
	getChild("arrow_right").visible = label_visibility;
	for( var i=1; i<=3; i++ ) 
	{
		getChild("arrow_left"+i).visible = label_visibility;
	}		
}

/** Stage updation function in every interval */
function updateTimer() {
	viscosity_measurement_stage.update();
}

/** Function for setting controls while changing the system */
function changeLiquidFn(scope)
{
	selected_liquid_index = scope.liquid_Mdl;
	if(selected_liquid_index == 1)
	{
		getChild("pipette_still").x = 633;
		getChild("pipette_still").y = 20;
		for ( var i=1; i<=10; i++ ) 
		{
		getChild("pipette_ani"+i).visible = false;
		getChild("pipette_ani"+i).x =633;
		getChild("pipette_ani"+i).y =350;
		} 
	}
	else if(selected_liquid_index == 2)
	{
		getChild("pipette_still").x = 545;
		getChild("pipette_still").y = 20;
		getChild("tube_solution_yellow_left").visible = true;
		getChild("tube_solution_yellow_right").visible = true;
		getChild("tube_solution_yellow").visible = true;
	}
	else
	{
		resetExperiment(scope);	
	}
}

/** Fill the pipette in the 'fill liquid' button event by tweeting the empty pipette */
function fillLiquidFn(scope) {
	getChild("pipette_still").alpha = 1;
	scope.liquid_ctrls_disable = true;
	scope.fill_liquid_disable = true;
	/** enabling the empty pipette and hand as visible while clicking 'fill liquid' button */
	 getChild("pipette_still").visible = true; 
	/** moving the empty pipette near the bottle */
	if(selected_liquid_index == 2)
	{
		emplty_pipettu_tween = createjs.Tween.get(viscosity_measurement_stage.getChildByName('pipette_still')) 
		.to({x:545,y:300}, 1500)
		.call(function() {at_end_suck_solution(scope)})
	}
	else{
		emplty_pipettu_tween = createjs.Tween.get(viscosity_measurement_stage.getChildByName('pipette_still')) 
		.to({y: 300}, 1500)
		.call(function() {at_end_suck_solution(scope)})
	}
}

/** Function to call animation frames for taking solution in a pipette */
function at_end_suck_solution(scope){
	animation_timer = setInterval(function() {
		animation_counter++;
		takeLiquid(scope);
		/**clearing the timer after animation */
		if ( animation_counter >= 10 ) {
			clearInterval(animation_timer);
		} 
    },100);
}

/** Loading animation for sucking liquid from bottle to fill the pipette  */	  
function takeLiquid(scope)
{	
	/** disabling the hand still frame */
	viscosity_measurement_stage.getChildByName("pipette_still").alpha = 0;
	for ( var i=1; i<=10; i++ ) 
	{  
		/** disabling all frame */
		getChild("pipette_ani"+i).visible = false;
		getChild("pipette_yellow_ani"+i).visible = false;
		/** To check the liquid type */
		if(selected_liquid_index == 0 || selected_liquid_index == 1)
		{
			/** enabling one animation frame at a time */
			getChild("pipette_ani"+animation_counter).alpha =1;
			getChild("pipette_ani"+animation_counter).visible = true; 
		}
		else
		{
			/** enabling one animation frame at a time */
			getChild("pipette_yellow_ani"+animation_counter).alpha =1;
			getChild("pipette_yellow_ani"+animation_counter).visible = true;
		}	
	}
	/** check whether animation ended */
	if(animation_counter == 10)
	{
		/** moving the filled pipette to the viscometer after taking the liquid from bottle */
		if(selected_liquid_index == 0 ||selected_liquid_index == 1)
		{
			var filled_pipettu_tween = createjs.Tween.get(getChild("pipette_ani10")).to({
			x: 320, y:75}, 1500).call(function(){at_end_pour_liquid(scope)}) //327
		}
		else
		{
			var filled_pipettu_tween = createjs.Tween.get(getChild("pipette_yellow_ani10")).to({
			x: 320, y: 75}, 1500).call(function(){at_end_pour_liquid(scope)})  
		}
	}	
}

/** pouring the liquid from filled pipette to the viscometer */	
function at_end_pour_liquid(scope)
{	
	viscosity_measurement_stage.getChildByName("pipette_ani10").visible = false;
	viscosity_measurement_stage.getChildByName("pipette_yellow_ani10").visible = false;
	viscosity_measurement_stage.getChildByName("pipette_empty").visible = true;
	if(selected_liquid_index == 0 || selected_liquid_index == 1)
	{
		viscosity_measurement_stage.getChildByName("pipette_solution").visible = true;
	}
	else
	{
		viscosity_measurement_stage.getChildByName("pipette_solution_yellow").visible = true;
	}
	animation_timer = setInterval(function() {
	/** pouring the solution to the viscometer */
	var pipette_solution_tween = createjs.Tween.get(pipette_solution_rect).to({
	y: 320}, 5000)
	/** pouring the solution to the viscometer */
	if(solDroppingFlag == true)
	{
			solution_pouring_tween = createjs.Tween.get(soln_pouring_rect).to({
			y: 320}, 100).call(function(){
			solDroppingFlag = false;
			fillViscometer(scope);
			}) 
	}
	},100);
}

/** Function to display the rising of solution in the viscometer after pouring the liquid from the pipette*/
function fillViscometer(scope)
{ 
	/** increasing the liquid level in the left side of viscometer */
	var solution_increaseing_tween_second = createjs.Tween.get(mask_tube_rect_left).to({
	y:450}, 5000).call(function(){at_end_remove_pipette(scope)}); 
	/** increasing the liquid level in the right side of viscometer */
	var solution_increaseing_tween_first = createjs.Tween.get(mask_tube_rect_right).to({
	y: 558}, 5000).call(function(){at_end_remove_pipette(scope)});
	solution_pouring_tween = createjs.Tween.get(soln_pouring_rect).to({
	y: 157}, 5000)	
} 

/** Function to remove pipette after the liquid reach a point and tweening the sucker  */
function at_end_remove_pipette(scope)
{
	/** loading the sucker in a time interval */
	viscosity_measurement_stage.getChildByName("tube_solution").visible = false;
	viscosity_measurement_stage.getChildByName("tube_solution_yellow").visible = false;
	viscosity_measurement_stage.getChildByName("pipette_empty").visible = false;
	getChild("top_closer").visible = true;
	createjs.Tween.get(viscosity_measurement_stage.getChildByName('top_closer')) /** To move the pipette to the bottle */
	.to({y: 250}, 2000).call(function(){at_end_suck_liquid(scope)});
}

/** Function to display the flow of liquid when sucking using sucker */
function at_end_suck_liquid(scope)
{
	/** increasing the liquid level in the right side of viscometer */
	var liquid_increasing_tween = createjs.Tween.get(mask_tube_rect_right).to({
	y: 365}, 5000).call(function(){at_end_remove_closer(scope)});//252
	/** decreasing the liquid level in the left side of viscometer */		
	var liquid_falling_tween = createjs.Tween.get(mask_tube_rect_left).to({
	y: 540}, 5000).call(function(){at_end_remove_closer(scope)});
}

/** Function to remove the sucker and displaying the start button */
function at_end_remove_closer(scope)
{	
	getChild("top_closer").visible = false;
	/** Changing the text of "fill liquid" button */
	scope.fill_liquid = start_btn_var;
	start_flag = true;
	/** enabling the start button */
	scope.fill_liquid_disable = false;
	scope.$apply();
}

/** Function to start experiment and moving the liquid to reach the point within the delay time */
function startExperiment(scope) {
	/** disabling the start button after starting the experiment */
	scope.fill_liquid_disable = true;
	/** To check the selected liquid and assigning the time of flow value*/ 
	if(selected_liquid_index == 0)
	{
		time=39.5;	//time of flow value of Water
	}
	else if(selected_liquid_index == 1)
	{
		time=35.27; //time of flow value of Toluene
	}
	else
	{
		time=65.89;	//time of flow value of Nitrobenzene 
	}
	/** calculating the delay time of liquid to reach the level  */
	delay_time = 	time * 1000;
	/** starting the stop watch */	
	resetWatch();
	stop_watch_timer = setInterval(expWatch,0.5);	
	pause_flag = false;
	/** increasing the liquid level in the left side of viscometer */
	var soln_falling_tween_second = createjs.Tween.get(mask_tube_rect_left).to({
    y: 520}, delay_time) 
	/** decreasing the liquid level in the right side of viscometer*/
	var soln_falling_tween_first = createjs.Tween.get(mask_tube_rect_right).to({
	y: 429}, delay_time)
}

/** Function for running the stopwatch in a timer */
function expWatch() {
    if ( !pause_flag ) {
        showWatch(viscosity_measurement_stage);
    }
}

/** Reset the experiment in the reset button event */
function resetExperiment(scope) {
	createjs.Tween.removeAllTweens();
	mask_tube_rect_right.y = 625;
	mask_tube_rect_left.y = 625;
	pipette_solution_rect.y = 150;
	soln_pouring_rect.y = 15;
	getChild("pipette_still").y = 20;
	getChild("top_closer").y = -500;
	viscosity_measurement_stage.getChildByName("tube_solution").visible = false;
	viscosity_measurement_stage.getChildByName("tube_solution_yellow").visible = false;
	viscosity_measurement_stage.getChildByName("tube_solution_left").visible = false;
	viscosity_measurement_stage.getChildByName("tube_solution_right").visible = false; 
	clearInterval(animation_timer);
	scope.fill_liquid_disable = false;
	scope.fill_liquid = _("Fill liquid");
	start_flag = false;
	clearInterval(stop_watch_timer);
	pause_flag = true;
	pauseWatch();
	initializeText("00","00","00","000",viscosity_measurement_stage); 
	resetWatch();
	viscosity_measurement_stage.update();	
	scope.showLabels = false;
	initialisationOfVariables(scope);
	initialisationOfImages();
}

/** Function to return child element of stage */
function getChild(child_name) {
    return viscosity_measurement_stage.getChildByName(child_name); /** Returns the child element of stage */
}