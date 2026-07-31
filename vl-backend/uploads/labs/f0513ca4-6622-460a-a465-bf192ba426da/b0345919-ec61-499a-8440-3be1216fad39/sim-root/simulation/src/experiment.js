(function(){
  angular
       .module('users')
	   .directive("experiment",directiveFunction)
})();

var deflection_stage, exp_canvas, stage_width, stage_height;

var magnet_placed, magnet_anim_clr;

var vibration_container, magnetometer_container;

var tick, oscilation_twenn, clr_oscilation;

var magnet_length, magnet_mass

var oscilation_listener;

var cont, speed_ctrl, degree, angle;

var time_T,time_in_ms;

var pos_index, side_index, position_name;

var vibration_mgnt_placed;

var sideA_x, sideA_y;

var sideB_x, sideB_y, multiplication_const;

var current_angle, position_adjust_factor;

var initial_x, initial_y, rev_x, rev_y;

var _initial_angle, _current_dist;

var mgnt_length, moment_of_magnet;

var _bh, moment_of_inertia;

var deflection_angle, initial_pos;

var amplitude, exp, help_array;

var frame, clockwise, anim_speed;

function directiveFunction(){
	return {
		restrict: "A",
		link: function(scope, element,attrs){
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
			exp_canvas=document.getElementById("demoCanvas");
			exp_canvas.width=element[0].width;
			exp_canvas.height=element[0].height;            
            /**preloading the images in a queue*/
			queue = new createjs.LoadQueue(true);
			queue.installPlugin(createjs.Sound);
			queue.on("complete", handleComplete, this);
			queue.loadManifest([
				{
					id: "background",
                    src: "././images/background.svg",
                    type: createjs.LoadQueue.IMAGE
                }, {
                    id: "box_top",
                    src: "././images/box_top.svg",
                    type: createjs.LoadQueue.IMAGE
                },{
                    id: "box_under",
                    src: "././images/box_under.svg",
                    type: createjs.LoadQueue.IMAGE
                },  {
                    id: "magnet_in_box",
                    src: "././images/magnet_in_box.svg",
                    type: createjs.LoadQueue.IMAGE
                }, {
                    id: "magnet_holder_top",
                    src: "././images/magnet_holder_top.svg",
                    type: createjs.LoadQueue.IMAGE
                }, {
                    id: "zoom_view",
                    src: "././images/zoom_view.svg",
                    type: createjs.LoadQueue.IMAGE
                }, {
                    id: "magnet_zoom",
                    src: "././images/magnet_zoom.svg",
                    type: createjs.LoadQueue.IMAGE
                }, {
                    id: "timer_body",
                    src: "././images/timer_body.svg",
                    type: createjs.LoadQueue.IMAGE
                }, {
                    id: "timer_button",
                    src: "././images/timer_button.svg",
                    type: createjs.LoadQueue.IMAGE
                }, {
                    id: "timer_red_bulb",
                    src: "././images/timer_red_bulb.svg",
                    type: createjs.LoadQueue.IMAGE
                }, {
                    id: "timer_green_bulb",
                    src: "././images/timer_green_bulb.svg",
                    type: createjs.LoadQueue.IMAGE
                }, {
                    id: "hand_magnet",
                    src: "././images/hand_magnet.svg",
                    type: createjs.LoadQueue.IMAGE
                } 
                , {
                    id: "bg_deflection",
                    src: "././images/bg_deflection.svg",
                    type: createjs.LoadQueue.IMAGE
                }
                , {
                    id: "magnetometer",
                    src: "././images/magnetometer.svg",
                    type: createjs.LoadQueue.IMAGE
                }
                , {
                    id: "magnetometer_round",
                    src: "././images/magnetometer_round.svg",
                    type: createjs.LoadQueue.IMAGE
                }
                , {
                    id: "middle_silver_spot",
                    src: "././images/middle_silver_spot.svg",
                    type: createjs.LoadQueue.IMAGE
                }
                , {
                    id: "needle",

                    src: "././images/needle.svg",
                    type: createjs.LoadQueue.IMAGE
                }
                , {
                    id: "magnet_tanB",
                    src: "././images/magnet_tanB.svg",
                    type: createjs.LoadQueue.IMAGE
                }
                , {
                    id: "magnet_tanA",
                    src: "././images/magnet_tanA.svg",
                    type: createjs.LoadQueue.IMAGE
                }
                , {
                    id: "magnet_tanC_red",
                    src: "././images/magnet_tanC_red.svg",
                    type: createjs.LoadQueue.IMAGE
                }
                , {
                    id: "magnet_tanC_gray",
                    src: "././images/magnet_tanC_gray.svg",
                    type: createjs.LoadQueue.IMAGE
                }
                , {
                    id: "compass",
                    src: "././images/compass.svg",
                    type: createjs.LoadQueue.IMAGE
                }
                , {
                    id: "thread",
                    src: "././images/thread.svg",
                    type: createjs.LoadQueue.IMAGE
                }
                , {
                    id: "magnet_holder_back",
                    src: "././images/magnet_holder_back.svg",
                    type: createjs.LoadQueue.IMAGE
                }
                , {
                    id: "magnet_holder_front",
                    src: "././images/magnet_holder_front.svg",
                    type: createjs.LoadQueue.IMAGE
                }
                , {
                    id: "magnet_frame_1",
                    src: "././images/magnet_frame_1.svg",
                    type: createjs.LoadQueue.IMAGE
                }
                , {
                    id: "magnet_frame_2",
                    src: "././images/magnet_frame_2.svg",
                    type: createjs.LoadQueue.IMAGE
                }
                , {
                    id: "magnet_frame_3",
                    src: "././images/magnet_frame_3.svg",
                    type: createjs.LoadQueue.IMAGE
                }
                , {
                    id: "magnet_frame_4",
                    src: "././images/magnet_frame_4.svg",
                    type: createjs.LoadQueue.IMAGE
                }
                , {
                    id: "magnet_frame_5",
                    src: "././images/magnet_frame_5.svg",
                    type: createjs.LoadQueue.IMAGE
                }
                , {
                    id: "magnet_frame_6",
                    src: "././images/magnet_frame_6.svg",
                    type: createjs.LoadQueue.IMAGE
                }
                , {
                    id: "magnet_frame_7",
                    src: "././images/magnet_frame_7.svg",
                    type: createjs.LoadQueue.IMAGE
                }
                , {
                    id: "magnet_frame_8",
                    src: "././images/magnet_frame_8.svg",
                    type: createjs.LoadQueue.IMAGE
                }
                , {
                    id: "magnet_frame_9",
                    src: "././images/magnet_frame_9.svg",
                    type: createjs.LoadQueue.IMAGE
                }
			]);			

			deflection_stage = new createjs.Stage("demoCanvas");
			deflection_stage.enableDOMEvents(true);
			deflection_stage.enableMouseOver();
            tick = setInterval(updateTimer, 100); /** Stage update function in a timer */
            
            vibration_container=new createjs.Container(); /** Creating the circular coil container */
            vibration_container.name="vibration_container";
            deflection_stage.addChild(vibration_container); /** Append it in the stage */
            
            deflection_magnetometer_container=new createjs.Container(); /** Creating the compass box move container */
            deflection_magnetometer_container.name="deflection_magnetometer_container";
            deflection_stage.addChild(deflection_magnetometer_container); /** Append it in the stage */

            magnetometer_container = new createjs.Container();
            magnetometer_container.name = "magnetometer_container";
			       
			function handleComplete(){	/**loading all images in the queue to the satage*/			
				loadImages(queue.getResult("background"),"background",-345,0,"",0,vibration_container,0.88);                     
                loadImages(queue.getResult("box_under"),"clock_to_move",-31, 168, "",0,vibration_container,0.88);
                loadImages(queue.getResult("magnet_holder_back"),"magnet_holder_back",141, 480,"",0,vibration_container,0.88);
                loadImages(queue.getResult("magnet_frame_1"),"magnet_frames",132, 479,"",0,vibration_container,0.88);
                loadImages(queue.getResult("thread"),"thread",197,430, "",0,vibration_container,0.88);
                loadImages(queue.getResult("magnet_in_box"),"magnet_in_box",135, 502,"",0,vibration_container,0.88);  
                loadImages(queue.getResult("magnet_holder_top"),"magnet_holder_top",142, 516,"",0,vibration_container,0.88);   
                loadImages(queue.getResult("box_top"),"box_top",-25, 167, "",0,vibration_container,0.88);                 
                loadImages(queue.getResult("zoom_view"),"zoom_view",258, 73, "",0,vibration_container,0.88); 
                loadImages(queue.getResult("magnet_zoom"),"magnet_zoom",530, 224, "",0,vibration_container,0.88);  
                loadImages(queue.getResult("bg_deflection"),"bg_deflection",0, 0,"",0,deflection_magnetometer_container,1); 
                loadImages(queue.getResult("compass"),"compass",550,20,"",0,deflection_magnetometer_container,1); 
                deflection_magnetometer_container.addChild(magnetometer_container);
                loadImages(queue.getResult("magnetometer"),"magnetometer",350, 350,"",0,magnetometer_container,0.25);
                loadImages(queue.getResult("magnet_tanB"),"magnet_tanB",398, 350,"",90,magnetometer_container,0.25);                
                loadImages(queue.getResult("magnetometer_round"),"magnetometer_round",350, 350,"",0,magnetometer_container,0.25); 
                loadImages(queue.getResult("needle"),"needle",350, 350,"",0,magnetometer_container,0.25);               
                loadImages(queue.getResult("middle_silver_spot"),"middle_silver_spot",350, 350,"",0,magnetometer_container,.25);              
                /** Text box loading */
                setText("side_a_txt",498, 352.5,_("SIDE A"),"black",1.5,magnetometer_container);
                setText("side_b_txt",202, 352.5,_("SIDE B"),"black",1.5,magnetometer_container);
                getMagnetoCBN("side_a_txt").regX = 10;
                getMagnetoCBN("side_a_txt").regY = -35;
                getMagnetoCBN("side_b_txt").regX = 65;
                getMagnetoCBN("side_b_txt").regY = -35;
                vibration_container.getChildByName("magnet_frames").alpha = 0;
                createStopwatch (deflection_stage,400,520,1);
                loadImages(queue.getResult("hand_magnet"),"hand_magnet",530, 700, "",0,deflection_stage,0.88);
				initialisationOfVariables(); /** Initializing the variables */
				initialisationOfImages(); /** Function call for images used in the apparatus visibility */
				translationLabels(); /** Translation of strings using gettext */
                magnetometer_container.on("pressmove", function(evt) {/** Drag functionality of magnetometer */
                    magnetometer_container.x = _current_magnet_x + evt.stageX - _current_x;
                    magnetometer_container.y = _current_magnet_y + evt.stageY - _current_y;
                });
                var _current_x;
                var _current_y;
                var _current_magnet_x = 0;
                var _current_magnet_y = 0;
                magnetometer_container.on("mousedown", function(evt) {
                    _current_x = evt.stageX;
                    _current_y = evt.stageY;
                })
                magnetometer_container.on("pressup", function(evt) { 
                    _current_magnet_x=magnetometer_container.x; 
                    _current_magnet_y=magnetometer_container.y; 
                }) 
			}
			/** Add all the strings used for the language translation here. '_' is the short cut for calling the gettext function defined in the gettext-definition.js */	
			function translationLabels(){/**labels used in the experiment initialize here*/
                /** This help array shows the hints for this experiment */
				help_array=[_("help1"),_("help2"),_("help3"),_("help4"),_("help5"),_("help6"),_("help7"),_("Next"),_("Close"),_("help8"),_("help9"),_("help10"),_("help11")];
                scope.heading=_("Deflection Magnetometer");
				scope.variables=_("Variables");                			
                scope.initial_adjust_btn_lbl=_("Deflection Magnetometer");
                scope.mass_of_magnet=_("Mass of the magnet:");
                scope.length_of_magnet=_("Length of the magnet:");
                scope.breadth_of_magnet=_("Breadth of the magnet:");
                scope.cm=_("cm");
                scope.g=_("g");
                scope.show_result=_("Show Result");
                scope.place_magnet=_("Place the Magnet");
                scope.reset=_("Reset");                
				scope.result=_("Result");
                scope.position_of_magnetometer = _("Position of magnetometer:");  
				scope.copyright=_("copyright"); 
                /** The noOfTurnsArray contains the values and indexes of the dropdown */
                scope.position = [{side:"TanB",indexVal:0},{side:"TanA",indexVal:1},{side:"TanC",indexVal:2}];
				scope.side = [{side:"Side A",indexVal:0},{side:"Side B",indexVal:1}];
                scope.rotate_angle_txt= _("Rotation angle:");
                scope.side_of_magnetometer= _("Select the side:");
                scope.magnet_distance_txt= _("Distance:");
                scope.magnet_reverse_txt= _("Reverse the magnet");
                scope.objectZoom_txt = _("Object zoom:")
                scope.result_mont_of_mgnt = _("Time period: ");
                scope.result_horzn_intsty = _("Moment of inertia(I): ");
                scope.unit_am = _("s");
                scope.unit_bh = _("kgm")+"²";
                scope.mont_of_mgnt_val =_bh;
                scope.experiment_type_label = [{type:_("Vibration Magnetometer"),index:0},{type:_("Deflection Magnetometer"),index:1}];
                scope.experiment_type_lbl = _("Select experiment:");
                scope.$apply();				
			}
		}
	}
}
function getMagnetoCBN(chldName){/** function to return chiled element of container */
    return magnetometer_container.getChildByName(chldName);
}

/** Createjs stage updation happens in every interval */
function updateTimer() {
    deflection_stage.update();
}
/** All the texts loading and added to the stage */
function setText(name, textX, textY, value, color, fontSize, container){
    var text = new createjs.Text(value, "bold " + fontSize + "em Tahoma, Geneva, sans-serif", color);
    text.x = textX;
    text.y = textY;
    text.textBaseline = "alphabetic";
    text.name = name;
    text.text = value;
    text.color = color;
    container.addChild(text); /** Adding text to the container */
}
/** All the images loading and added to the stage */
function loadImages(image, name, xPos, yPos, cursor, rot, container,scale){
    var _bitmap = new createjs.Bitmap(image).set({});
     if (name == 'magnet_zoom' || name == 'magnetometer' || name == 'magnet_tanB' || name == 'needle'|| name == 'magnetometer_round'|| name == 'middle_silver_spot') {
        _bitmap.regX = _bitmap.image.width/2;
        _bitmap.regY = _bitmap.image.height/2;       
    }	  
    _bitmap.x = xPos;
    _bitmap.y = yPos;
    _bitmap.scaleX=_bitmap.scaleY=scale;
    _bitmap.name = name;
    _bitmap.alpha = 1;
    _bitmap.rotation = rot;   
    _bitmap.cursor = cursor; 	
    container.addChild(_bitmap); /** Adding bitmap to the container */ 
}

function initialisationOfControls(scope){
    scope.mass_disable=false; /** enable mass slider */
    scope.length_disable = false; /** enable length slider */
    scope.breadth_disable = false; /** enable breadth slider */
    scope.magnet_place_disable = false; /** enable magnet place button */
    scope.magnetDeflec_place_disable = false; /** enable magnet place button */
    scope.zoom_value = 0; /** Initial stage of zoom view of magnetometr */
    scope.magnet_distance_disable = true;/** enable distance slider */
    scope.resultValue = false; /** Initial state of check box for result */
    scope.isReverse = false; /** Initial state of check box for reverse */
    scope.magnet_distance_disable = true; /** enable distance of magnet slider */
    scope.magnetDeflec_place_disable=false; /** enable distance of magnet slider */
    scope.rotateAngle = 0; /** Slider value of rotation angle, set to zero */
    /** Angle of magneto meter(image) set to zero */
    getMagnetoCBN("magnetometer").rotation = 0; 
    getMagnetoCBN("magnetometer_round").rotation = 0;
    getMagnetoCBN("magnet_tanB").rotation = 90;
    /** index value of drop down box set to zero*/
    scope.magnetoPosition = 0;
    scope.side_A_B = 0;
    scope.showValue = true;

}
/** All variables initialising in this function */
function initialisationOfVariables() {
    magnet_placed = false;
    vibration_container.alpha=1; /** Initially display of vibration magnetometer */
    deflection_magnetometer_container.alpha=0;/** Hide deflection magnetometer at initial stage  */
    initial_adj_flag=false; /** Initial adjustment flag */
    cont=0; speed_ctrl = 1200; /** Initial of values */
    degree = 0; angle = 30; /** Initial of values */
    /** Following buttons and sliders are disabled first except initial adjustment button */
    hide_show_sliders=false; /** It hides the sliders rotate compass box and rotate apparatus */
    initial_adj_disable=false; /** It enables the Initial adjustment button */
    /** Reset values for initial display of deflection magnetometer */
    vibration_mgnt_placed = false;
    getMagnetoCBN("magnet_tanB").alpha = 0;
    pos_index = 0; /** To determine position of magnet(Tan B, Tan A and Tan C) */
    side_index = 0; /** To determine side of magnetometer(Side A/Side B) */
    position_name = ["magnet_tanB","magnet_tanA","magnet_tanC_red"];/** Strings to display in dropdown box */
    sideA_x = 398; 
	sideA_y = 350;  /** Initial magnet position at side A */
    sideB_x = 302; 
	sideB_y = 350; /** Initial magnet position at side B */
    current_angle = 0; /** Initial rotation angle */
    position_adjust_factor = 3.9; /** Variable used to set initial position of different size magnet image */
    initial_x=398;
	initial_y=350;
    _initial_angle = 0; /** Initial rotation angle of magnetometer */
    _current_dist =0; /** Initial distance of mganet fom center of magnetometer */
    mgnt_length = 0.03/2; /** Initial length of magnet for calculation */
    _bh = 0.000036; /** Constant used for angle calculation */
    deflection_angle=0; /** Initial rotation angle of magnet */
    amplitude = 30; /** Amplitude value for magnet oscilation */
    exp = 0; /** variable used to set result value as the power of 10 */
	frame = 1;
	initial_pos = 350;
	clockwise = true;
	anim_speed = 70;
	multiplication_const = 0.0175;
}
/** Set the initial status of the bitmap and text depends on its visibility and initial values */
function initialisationOfImages() {
    deflection_magnetometer_container.getChildByName("compass").scaleX=1;
    deflection_magnetometer_container.getChildByName("compass").scaleY=1;
    getMagnetoCBN("needle").rotation = 0;
    magnetometer_container.x = 0; /** Initial position of magnetometer */
    magnetometer_container.y = 0; /** Initial position of magnetometer */
    amplitude = 30;
}
/** Button event for showing the normal view */
function initialAdjustment(scope) {
    deflection_stage.scaleX=deflection_stage.scaleY= 1; /** Scaling of stage */
    initialisationOfImages(); /** Function call for initialization of images */
    initialisationOfControls(scope); /** Function call for initialization of control variables */
    magnet_placed = false;
    side_index = 0;
    pos_index = 0;
	getMagnetoCBN("side_a_txt").rotation = getMagnetoCBN("side_b_txt").rotation = 0;
	getMagnetoCBN("side_a_txt").x=498;
	getMagnetoCBN("side_b_txt").x=202;
	getMagnetoCBN("side_a_txt").y = getMagnetoCBN("side_b_txt").y = 352.5;
	scope.rotate_angle = 0;
/** Reseting values for initial display of vibration magnetometer */
    if(vibration_mgnt_placed){ /** Condition to check wether the vibration magnetometer placed or not */
        vibration_mgnt_placed = false;
        clearInterval(clr_oscilation); /** To stop oscilation of magnet */
        cont = 0; /** Time set to zero*/
    }
    vibration_container.getChildByName('magnet_zoom').rotation = 0;
    getMagnetoCBN("magnet_tanB").alpha = 0;
    if ( !initial_adj_flag ) { /** If the initial view is displayed */
        scope.initial_adj_disable=true;
        scope.vibration_ctrls_show = false;
        scope.deflction_ctrls_show = true;
        scope.hide_show_sliders=true; /** It shows the sliders rotate compass box and rotate apparatus */
        scope.hide_show_zoom=false; /** It shows the Zoom compass button */
        initial_adj_flag=true;
        vibration_container.alpha=0; /** vibration magnetometer container and compass box container alpha set as 0 */
        deflection_magnetometer_container.alpha=1; /** deflection magnetometer container and compass box container alpha set as 0 */
        /** Result to display in deflection magnetometer */
        scope.initial_adjust_btn_lbl=_("Vibration Magnetometer");    
        scope.result_mont_of_mgnt = _("Moment of the magnet(m): ");
        scope.result_horzn_intsty = _("Horizontal intensity: ");
        scope.unit_am = _("Am")+"²";
        scope.unit_bh = _("T"); 
        scope.bh_value = 3.6;
        scope.exponent = "-5"; 
        scope.mont_of_mgnt_val = moment_of_magnet;
        removeClock(); 
        clearTimeout(magnet_anim_clr);
          /** If running, update elapsed time otherwise keep it */
        clearInterval(stop_watch_timer);
        pause_flag = true;
        pauseWatch();
        initializeText("00","00","00","000",deflection_stage); 
        vibration_container.getChildByName("magnet_frames").alpha = 0;
        vibration_container.getChildByName("magnet_holder_back").alpha = 1;
        vibration_container.getChildByName("magnet_in_box").alpha = 1;
        vibration_container.getChildByName("magnet_holder_top").alpha = 1; 
		
    } else { /** If the normal view is displayed */
        createStopwatch (deflection_stage,400,520,1);
        deflection_stage.removeChild(deflection_stage.getChildByName("hand_magnet"));
        loadImages(queue.getResult("hand_magnet"),"hand_magnet",530, 700, "",0,deflection_stage,0.88);
        scope.vibration_ctrls_show = true;
        scope.deflction_ctrls_show = false;
        scope.initial_adj_disable=true;
        initial_adj_flag=false; /** Set insert key flag as false */
        scope.hide_show_sliders=false; /** It hides the sliders rotate compass box and rotate apparatus */ 
        vibration_container.alpha=1; /** Set alpha 1 of circular coil and compass box move containers */
        deflection_magnetometer_container.alpha=0;
        scope.initial_adjust_btn_lbl=_("Deflection Magnetometer"); /** Button value changed as Initial Adjustment */
        if ( (scope.rotateApparatus >= 24 && scope.rotateApparatus <= 34) || (scope.rotateApparatus >= 200 && scope.rotateApparatus <= 210) ) {
            scope.initial_adj_disable=true; /** It disables the Initial adjustment button */
            scope.hide_show_zoom=true; /** It hides the Zoom compass button */
            createCircleForConnection(scope); /** Ready for wire connection */            
        }
/** Result to display in  vibration magnetometer */
        scope.result_mont_of_mgnt = _("Time period: ");
        scope.result_horzn_intsty = _("Moment of inertia(I): ");
        scope.unit_am = _("s");
        scope.unit_bh = _("kgm")+"²";
        scope.mont_of_mgnt_val =_bh;
        scope.bh_value = moment_of_inertia;
    }
}
/** Slider function for Mass of magnet*/
function massSliderFN(scope) {
    scope.magnet_mass=scope.magnet_Mass;  /** Get mass of magnet */
}
/** Slider function for Lengtho fo magnet*/
function lengthSliderFN(scope) {
    scope.magnet_length=scope.magnet_Length; /** Set length of magnet */
    vibration_container.getChildByName('magnet_zoom').x = 534.5 - scope.magnet_Length*1.5; /** Set the length of manget in zoom view */
    vibration_container.getChildByName('magnet_zoom').scaleX = 0.78 + scope.magnet_Length/30;
    vibration_container.getChildByName('magnet_in_box').x = 144 - scope.magnet_Length*3;
    vibration_container.getChildByName('magnet_in_box').scaleX = 0.78 + scope.magnet_Length/30;
}
/** Slider function for Breadth of magnet */
function breadthSliderFN(scope){
    diameter_float=scope.magnet_Breadth/100; /** set breadth of magnet and convert to meter */
    scope.magnet_breadth=scope.magnet_Breadth;
    vibration_container.getChildByName('magnet_zoom').y=225-scope.magnet_breadth*1; /** Set manget breadth in zoom view */
    vibration_container.getChildByName('magnet_zoom').scaleY=0.79+scope.magnet_breadth/10; 
}
/** Function to change to position(tanA tanB and tanC) of magnet */
function changePositionFN(scope){	
    scope.magnet_distance = 7; /** Initial distance of magnet from the origin of magnetometer */
    magnetometer_container.removeChild(magnetometer_container.getChildByName("magnet_tanB"));
    magnetometer_container.removeChild(magnetometer_container.getChildByName("magnetometer_round"));
    magnetometer_container.removeChild(magnetometer_container.getChildByName("needle"));
    magnetometer_container.removeChild(magnetometer_container.getChildByName("middle_silver_spot"));
    if(side_index == 0){ /** images changed for initial adjustment durring position change */
	    loadImages(queue.getResult("magnet_tanB"),"magnet_tanB",sideA_x, sideA_y,"",current_angle,magnetometer_container,0.25);
    }else if (side_index == 1){
		loadImages(queue.getResult("magnet_tanB"),"magnet_tanB",sideA_x, sideA_y,"",current_angle,magnetometer_container,0.25);
    }
    loadImages(queue.getResult("magnetometer_round"),"magnetometer_round",350, 350,"",0,magnetometer_container,0.25); /** images changed for initial adjustment durring position change */
    loadImages(queue.getResult("needle"),"needle",350, 350,"",0,magnetometer_container,0.25);  /** images changed for initial adjustment durring position change */             
    loadImages(queue.getResult("middle_silver_spot"),"middle_silver_spot",350, 350,"",0,magnetometer_container,.25);  /** images changed for initial adjustment durring position change */
    getMagnetoCBN("magnet_tanB").alpha = 0; /** hide magnet */
    rotateMagnetometerFN(scope); /** to rotate magnet */
    getMagnetoCBN("magnet_tanB").alpha = 0; /** hide magnet */
    magnet_placed = false;
    scope.magnet_distance_disable = true;
    scope.magnetDeflec_place_disable = false;
    getMagnetoCBN("needle").rotation = 0;
    reverseMagnetFN(scope);
    scope.isReverse = false; /** Initial state of check box for reverse */    
}
/** Function to rotate magnetometer*/
function rotateMagnetometerFN(scope){
    scope.rotate_angle = scope.rotateAngle;
    var magnetometer_tween = createjs.Tween.get(getMagnetoCBN("magnetometer")).to({
        rotation: (scope.rotate_angle)
    }, 500); /** To rotate magnetometer */
    var magnetometer_round_tween = createjs.Tween.get(getMagnetoCBN("magnetometer_round")).to({
        rotation: ((pos_index!=0?90:0)+scope.rotate_angle)
    }, 500); /** To rotate magnetometer */
    var magnet_tanB_tween = createjs.Tween.get(getMagnetoCBN("magnet_tanB")).to({
        rotation: ((pos_index==0?90:0)+scope.rotate_angle)
    }, 500); /** To rotate magnetometer */
   
    var side_a_x_tween = createjs.Tween.get(getMagnetoCBN("side_a_txt")).to({
        x: (initial_pos + Math.cos(scope.rotate_angle*multiplication_const)*148),y: (initial_pos + Math.sin(scope.rotate_angle*multiplication_const)*148),rotation: (scope.rotate_angle)
    }, 500); /** To adjust position of text */
 
    var side_b_x_tween = createjs.Tween.get(getMagnetoCBN("side_b_txt")).to({
        x: (initial_pos - Math.cos(scope.rotate_angle*multiplication_const)*148),y: (initial_pos - Math.sin(scope.rotate_angle*multiplication_const)*148),rotation: (scope.rotate_angle)
    }, 500); /** To adjust position of text */
    
    current_angle = scope.rotate_angle;
    if(side_index == 0){ /** To determine the side of magnetometer */
        var magnet_tanB_x_tween = createjs.Tween.get(getMagnetoCBN("magnet_tanB")).to({
            x: (getMagnetoCBN("magnetometer_round").x + Math.cos(scope.rotate_angle*multiplication_const)*(48+(scope.magnet_distance-7)*6.3)),y: (getMagnetoCBN("magnetometer_round").y + Math.sin(scope.rotate_angle*multiplication_const)*(48+(scope.magnet_distance-7)*6.3))
        }, 500); /** replace magnet and set to circulat motion of magnet. Math functions used for circular position of magnet over magnetometer */
		rev_x = (getMagnetoCBN("magnetometer_round").x + Math.cos(scope.rotate_angle*multiplication_const)*(48+(scope.magnet_distance-7)*6.3));
		rev_y = (getMagnetoCBN("magnetometer_round").y + Math.sin(scope.rotate_angle*multiplication_const)*(48+(scope.magnet_distance-7)*6.3));
		
       }else{
        var magnet_tanB_x_tween = createjs.Tween.get(getMagnetoCBN("magnet_tanB")).to({
            x: (getMagnetoCBN("magnetometer_round").x - Math.cos(scope.rotate_angle*multiplication_const)*(48+(scope.magnet_distance-7)*6.3)), y: (getMagnetoCBN("magnetometer_round").y - Math.sin(scope.rotate_angle*multiplication_const)*(48+(scope.magnet_distance-7)*6.3))
        }, 500);/** replace magnet and set to circular motion of magnet. Math functions used for circular position of magnet over magnetometer */
		rev_x = (getMagnetoCBN("magnetometer_round").x - Math.cos(scope.rotate_angle*multiplication_const)*(48+(scope.magnet_distance-7)*6.3));
		rev_y = (getMagnetoCBN("magnetometer_round").y - Math.sin(scope.rotate_angle*multiplication_const)*(48+(scope.magnet_distance-7)*6.3));
       }
    if(pos_index == 0){
		/** Circular position of magnet in Tan B position */
        /** Because of magnet image in different size, it is difficult to set all three 
		position in same way.Using this variable all images can set position to in same position */
		position_adjust_factor = 3.9; 
		var _multiplication_factor = 48;								 
	}else if(pos_index == 1){ /** Circular position of magnet in Tan A position */
        position_adjust_factor = 0.4;
		var _multiplication_factor = 44.5;
	}else{ /** Circular position of magnet in Tan C position */
        position_adjust_factor = 1.9;
		var _multiplication_factor = 46;
    }
   setMagnetPosition(scope,_multiplication_factor)	;
   initial_x = getMagnetoCBN("magnet_tanB").x;
   initial_y = getMagnetoCBN("magnet_tanB").y;
}

/**set magnet position in the scale while rotating the scale*/
function setMagnetPosition(scope,multi_factor){
	sideA_x = initial_pos + Math.cos(scope.rotate_angle*multiplication_const)*multi_factor; /** Initial x postion of magnet, math functions used for circular position of magnet */
	sideA_y = initial_pos + Math.sin(scope.rotate_angle*multiplication_const)*multi_factor; /** Initial y postion of magnet, math functions used for circular position of magnet */
	sideB_x = initial_pos - Math.cos(scope.rotate_angle*multiplication_const)*multi_factor; /** Initial x postion of magnet, math functions used for circular position of magnet */
	sideB_y = initial_pos - Math.sin(scope.rotate_angle*multiplication_const)*multi_factor; /** Initial y postion of magnet, math functions used for circular position of magnet */
}
/** Function to adjust the distance of magnet */
function setMagnetDistanceFN(scope){
    scope.magnet_distance = scope.magnet_distance;
    if(side_index == 0){
		var magnet_tanB_x_tween = createjs.Tween.get(getMagnetoCBN("magnet_tanB")).to({
            x: (initial_pos+(scope.magnet_distance*6.3 + position_adjust_factor)*Math.cos(scope.rotate_angle*multiplication_const)),
			y: (initial_pos+(scope.magnet_distance*6.3 + position_adjust_factor)*Math.sin(scope.rotate_angle*multiplication_const))
        }, 500);  // where 6.3 is a constant 
		rev_x = (initial_pos+(scope.magnet_distance*6.3 + position_adjust_factor)*Math.cos(scope.rotate_angle*multiplication_const));
		rev_y = (initial_pos+(scope.magnet_distance*6.3 + position_adjust_factor)*Math.sin(scope.rotate_angle*multiplication_const));
    }else{
		var magnet_tanB_x_tween = createjs.Tween.get(getMagnetoCBN("magnet_tanB")).to({
            x: (initial_pos-(scope.magnet_distance*6.3 + position_adjust_factor)*Math.cos(scope.rotate_angle*multiplication_const)),
			y: (initial_pos-(scope.magnet_distance*6.3 + position_adjust_factor)*Math.sin(scope.rotate_angle*multiplication_const))
        }, 500);
		rev_x = (initial_pos-(scope.magnet_distance*6.3 + position_adjust_factor)*Math.cos(scope.rotate_angle*multiplication_const));
		rev_y = (initial_pos-(scope.magnet_distance*6.3 + position_adjust_factor)*Math.sin(scope.rotate_angle*multiplication_const));
   
    }
    calculateAngle(scope);
    if(magnet_placed){
        var needle_tween = createjs.Tween.get(getMagnetoCBN("needle")).to({
            rotation: (deflection_angle)
        }, 500);
    }
}
/** Function to reverse magnet */
function reverseMagnetFN(scope){
    calculateAngle(scope);
	var _rot=0;
	if(magnet_placed){ /** rotate needle of magnetometer */
		var needle_tween = createjs.Tween.get(getMagnetoCBN("needle")).to({
			rotation: (deflection_angle)
		}, 500);
	} 	
	if(pos_index == 0){ /** Initial adjustment of manget and it position to tanB */
		scope.isReverse==true?_rot=(270+current_angle):_rot=(90+current_angle);
		var magnet_tanB_tween = createjs.Tween.get(getMagnetoCBN("magnet_tanB")).to({
		rotation: (_rot)
		}, 500);
	}else if(pos_index == 1){ /** Initial adjustment of manget and it position to tanA */
		scope.isReverse==true?_rot=(180+current_angle):_rot=(current_angle);
		var magnet_tanB_tween = createjs.Tween.get(getMagnetoCBN("magnet_tanB")).to({
			rotation: (_rot)
		}, 500);		
    }else{ /** Initial adjustment of manget and it position to tanC */
        if (scope.isReverse) { /** Adjustment of manget while magnet in reverse position */  
			if(side_index == 0){ /** Adjustment of manget for side A */
                magnetometer_container.removeChild(magnetometer_container.getChildByName("magnet_tanB"));
                loadImages(queue.getResult("magnet_tanC_gray"),"magnet_tanB",rev_x, rev_y,"",current_angle,magnetometer_container,0.25);
                getMagnetoCBN("magnet_tanB").alpha = magnet_placed?1:0;
            }else{ /** Adjustment of manget for side B */
                magnetometer_container.removeChild(magnetometer_container.getChildByName("magnet_tanB"));
                loadImages(queue.getResult("magnet_tanC_gray"),"magnet_tanB",rev_x, rev_y,"",current_angle,magnetometer_container,0.25);
                getMagnetoCBN("magnet_tanB").alpha = magnet_placed?1:0;                
            }
        }else{ /** Adjustment of magnet while it is not in reverse position */
            if(side_index == 0){ /** Adjustment of manget for side A */
                magnetometer_container.removeChild(magnetometer_container.getChildByName("magnet_tanB"));
                loadImages(queue.getResult("magnet_tanC_red"),"magnet_tanB",rev_x, rev_y,"",current_angle,magnetometer_container,0.25);
                getMagnetoCBN("magnet_tanB").alpha = magnet_placed?1:0;
            }else{ /** Adjustment of manget for side B */
                magnetometer_container.removeChild(magnetometer_container.getChildByName("magnet_tanB"));
                loadImages(queue.getResult("magnet_tanC_red"),"magnet_tanB",rev_x, rev_y,"",current_angle,magnetometer_container,0.25);
                getMagnetoCBN("magnet_tanB").alpha = magnet_placed?1:0;  
            }
        }
    }
}
/** Function to zoom magnetometer */
function objectZoom(scope){ 	
	scope.zoomPercentage = scope.zoom_value;
	var deflection_stage_tween = createjs.Tween.get(deflection_stage).to({
	scaleX: (1 + (scope.zoomPercentage / 11.11)),
	scaleY: (1 + (scope.zoomPercentage / 11.11))
	}, 500); /** To zoom magnetometer using scaling x */
	deflection_magnetometer_container.getChildByName("compass").scaleX=deflection_magnetometer_container.getChildByName("compass").scaleY= 1-(scope.zoomPercentage/20);
	deflection_stage.regX = deflection_stage.regY = 350;
	deflection_stage.x = deflection_stage.y = 350;

 
}
/** Function to place magnet of vibration magnetometer */
function placeMagnetFN(scope){
    vibration_mgnt_placed = true;
    while(exp<20){ /** To display result values as power of 10 */
        var number = moment_of_inertia*Math.pow(10,exp)
        if(number >= 1){
            scope.bh_value = number.toFixed(2)+"X10";
            scope.exponent = "-"+exp;
            break;
        }else{
            exp++
        }
    }
    scope.magnet_place_disable=true;
    scope.magnet_distance_disable = false;
    scope.mass_disable=true;
    scope.length_disable = true;
    scope.breadth_disable = true;
    scope.initial_adj_disable = false;
    createjs.Tween.get(deflection_stage.getChildByName('hand_magnet'), {loop: false}) /** To place magnet and hand towards the magnet placed in box */
          .to({x: 330, y: 470}, 500, createjs.Ease.getPowInOut(4)).call(at_end)
          .to({x: 530, y: 700}, 1000, createjs.Ease.getPowInOut(2));
    function at_end(){
        oscilation(); /** To start oscilation of magnet*/
        clr_oscilation = setInterval(function(){oscilation()},speed_ctrl); /** To repeate oscilation of magnet*/
        magnetAnimation();
        vibration_container.getChildByName("magnet_frames").alpha = 1;
        vibration_container.getChildByName("magnet_holder_back").alpha = 0;
        vibration_container.getChildByName("magnet_in_box").alpha = 0;
        vibration_container.getChildByName("magnet_holder_top").alpha = 0;
    }
}
/** Function to place magnet of deflection magnetometer */
function placeDeflectionMagnetFN(scope){
    magnet_placed = true;
    scope.magnet_distance_disable = false;
    scope.magnetDeflec_place_disable=true;
    getMagnetoCBN("magnet_tanB").x = side_index == 0 ? sideA_x : sideB_x; /** x position of magnet while placing magnet*/
    getMagnetoCBN("magnet_tanB").y = side_index == 0 ? sideA_y : sideB_y; /** y position of magnet while placing magnet*/
    getMagnetoCBN("magnet_tanB").alpha = 1;
    calculateAngle(scope);
    var needle_tween = createjs.Tween.get(getMagnetoCBN("needle")).to({ /** To set deflection of needle */
        rotation: (deflection_angle)
    }, 500);
}
/** Function to oscilate the magnet in vibration magnetometer */
function oscilation(){
    cont++;
 if (total_time % 10 == 0 && amplitude > 0) { /** To decrease oscilation of magnet and it decrease in each 10 count */
  amplitude = amplitude - 2;
  anim_speed = anim_speed + 10;
 }
 oscilation_tween = createjs.Tween.get(vibration_container.getChildByName("magnet_zoom"), {
   loop: false}).to({rotation: amplitude}, speed_ctrl / 2, createjs.Ease.getPowInOut(1))
  .to({rotation: -1 * amplitude}, speed_ctrl / 2, createjs.Ease.getPowInOut(1));
 if (amplitude <= 0) {
  clearInterval(clr_oscilation);
  clearTimeout(magnet_anim_clr);
 }
}
/**Animation for magnet movement*/
function magnetAnimation(){
    if(frame<=8 && clockwise){
        frame++; 
    }else{
        clockwise = false;
    }
    if(!clockwise){
        frame--;
        if(frame == 1){
            clockwise = true;
        }
    }
    vibration_container.removeChild(vibration_container.getChildByName("magnet_frames"));
    loadImages(queue.getResult("magnet_frame_"+frame),"magnet_frames",132, 479,"",0,vibration_container,0.88);
    magnet_anim_clr = setTimeout(function(){magnetAnimation()},anim_speed);
}
/** Function to calculate the time taken for ten oscilation */
function calculateTime(scope){
    mgnt_length = (scope.magnet_length/100)/2;
    var _mgnt_breadth = scope.magnet_breadth/100;
    var _mgnt_mass = scope.magnet_mass/1000;
	 /** moment of magnet (m) (Am2)*/
    moment_of_magnet=20*2*mgnt_length;
    scope.mont_of_mgnt_val = moment_of_magnet;
	/** Moment of inertia of magnet (I) in Kgm2 */
    moment_of_inertia=_mgnt_mass * ((Math.pow(mgnt_length*2,2) + Math.pow(_mgnt_breadth,2))/12);
	/** Period of oscillation of a magnet (T2) in second*/
    var _period_of_oscilation=(4*3.14*3.14*moment_of_inertia)/(moment_of_magnet*_bh);
	/** The period of oscillation of a magnet T= 2π×squart (I/(mBH) */
    time_T=Math.sqrt(_period_of_oscilation);
    time_T = time_T*10;
    time_in_ms = parseInt((time_T-parseInt(time_T))*1000); /** convert to integer */
    speed_ctrl = 1200+((parseInt(time_T)-12)*100);
}
/** Function to calculte the angle of rotaion*/
function calculateAngle(scope){
    var _tan0;
    var _a_tan;
    calculateTime(scope);
    var _distance = scope.magnet_distance/100;
	/** horizontal intensity of earth's magnetic field at a place.*/
    var _m_bh = moment_of_magnet/_bh;
    if(pos_index == 0){ /** magnet in Tan B position */
        _tan0 = _m_bh/(Math.sqrt(Math.pow(Math.pow(_distance,2) + Math.pow(mgnt_length,2),3)) * Math.pow(10,7));
        _a_tan = Math.atan(_tan0); /** to calculate ATAN */
        deflection_angle = (180 * _a_tan)/3.14;
        
    }else if(pos_index == 1){/** magnet in Tan A position */
        _tan0 = (2*_distance*_m_bh)/(Math.pow(Math.pow(_distance,2) - Math.pow(mgnt_length,2),2) * Math.pow(10,7));
        _a_tan = Math.atan(_tan0);
		/** deflection angle from the mathematical equation */
        deflection_angle = (180 * _a_tan)/3.14; 
    }else{ /** magnet in Tan C position */
        _tan0 = (20 * ((1/Math.pow(_distance,2)) - (_distance/Math.sqrt(Math.pow(Math.pow(_distance,2) + Math.pow(mgnt_length,2),3)))))/(_bh* Math.pow(10,7));
        _a_tan = Math.atan(_tan0);
        deflection_angle = (180 * _a_tan)/3.14; 
    }
    deflection_angle = deflection_angle*(scope.isReverse?-1:1);
}
function showresultFN(scope){
    scope.resultValue==true?scope.showValue=false:scope.showValue=true;
}

/** Resetting the experiment */
function reset(scope){
    window.location.reload();
}