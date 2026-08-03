(function() {
 angular
  .module('users')
  .directive("experiment", directiveFunction)
})();

var stage, exp_canvas, stage_width, stage_height;

var container, sign_over_roller, container_big_dome, container_small_dome;

var help_array, control_labels;

var wheel_spriteSheet, wheel_animation, wheel_ticker;

var turn_on, dieect, distance;

var line_togle, line_fps;

var sign_clr, big_dome_clr, small_dome_clr;

var minus_sign_count, pluse_sign_count, sign_limit;

var cntr_x, cntr_y;

var clr = [],
 clr_line = []; /** Array variables to store return values of setTimeout function for Line animation and sign motion */
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
   /** Preloading of images */
   queue = new createjs.LoadQueue(true);
   queue.installPlugin(createjs.Sound);
   queue.on("complete", handleComplete, this);
   queue.loadManifest([{
    id: "background",
    src: "././images/background.svg",
    type: createjs.LoadQueue.IMAGE
   }, {
    id: "cross_section",
    src: "././images/dome_cross_section.svg",
    type: createjs.LoadQueue.IMAGE
   }, {
    id: "box_cover",
    src: "././images/box_cover.svg",
    type: createjs.LoadQueue.IMAGE
   }, {
    id: "dome_movable",
    src: "././images/dome_movable.svg",
    type: createjs.LoadQueue.IMAGE
   }, {
    id: "spark",
    src: "././images/spark.svg",
    type: createjs.LoadQueue.IMAGE
   }, {
    id: "cover_all",
    src: "././images/cover_all.svg",
    type: createjs.LoadQueue.IMAGE
   }, {
    id: "wheels",
    src: "././images/wheels.svg",
    type: createjs.LoadQueue.IMAGE
   }, {
    id: "line",
    src: "././images/line.svg",
    type: createjs.LoadQueue.IMAGE
   }, {
    id: "plus_sign",
    src: "././images/plus_sign.svg",
    type: createjs.LoadQueue.IMAGE
   }, {
    id: "minus_sign",
    src: "././images/minus_sign.svg",
    type: createjs.LoadQueue.IMAGE
   }]);
   stage = new createjs.Stage("demoCanvas");
   stage.enableDOMEvents(true);
   stage.enableMouseOver();

   container = new createjs.Container(); /** Creating  container */
   container.name = "container";
   stage.addChild(container); /** Append it in the stage */

   sign_over_roller = new createjs.Container(); /** Creating  container for sign over roller blet*/
   sign_over_roller.name = "sign_over_roller";
   stage.addChild(sign_over_roller); /** Append it in the stage */

   container_big_dome = new createjs.Container(); /** Creating big dome container */
   container_big_dome.name = "container_big_dome";
   stage.addChild(container_big_dome); /** Append it in the stage */

   container_small_dome = new createjs.Container(); /** Creating small dome container */
   container_small_dome.name = "container_big_dome";
   stage.addChild(container_small_dome); /** Append it in the stage */

   function handleComplete() { /** Function for drawing images and texts into canvas */
    initialXY()
    loadImages(queue.getResult("background"), "background", 0, 0, "", 0, container, 1);
    loadImages(queue.getResult("cross_section"), "cross_section", 215, 30, "", 0, container, 1);
    for (var i = 0; i < 380; i = i + 10) { /** including lines over roller belt */
     loadImages(queue.getResult("line"), "line_" + i, 376.5, 540 - i, "", 0, container, 1);
    }
    loadImages(queue.getResult("plus_sign"), "plus_sign_brush_1", 400, 153, "", 0, container, 1);
    loadImages(queue.getResult("plus_sign"), "plus_sign_brush_2", 415, 158, "", 0, container, 1);
    loadImages(queue.getResult("box_cover"), "box_cover", 325, 483, "", 0, container, 1);
    loadImages(queue.getResult("dome_movable"), "dome_movable", initiaXY[0].domeX, initiaXY[0].domeY, "", 0, container, 1);
    loadImages(queue.getResult("spark"), "spark", 125, 100, "", 0, container, 1);
    initialisationOfControls(); /** Initializing the control variable */
    initialisationOfVariables(); /** Initializing the variables */
    loadImages(queue.getResult("cover_all"), "cover_all", 304, 30.5, "", 0, container, 1);
    initialisationOfImages(); /** Function call for images used in the apparatus visibility */
    translationLabels(); /** Translation of strings using gettext */
   }
   /** Add all the strings used for the language translation here. '_' is the short cut for calling the gettext function defined in the gettext-definition.js */
   function translationLabels() {
    /** This help array shows the hints for this experiment */
    help_array = [_("help1"), _("help2"), _("help3"), _("Next"), _("Close")];
    control_labels = [_("Turn On"), _("Turn Off"), _("Dissect"), _("Cover"), _("Adjust distance: ")]; /** Array for store labels of controls */
    scope.heading = _("Van De Graaff Generator"); /** Heading of experiment */
    scope.variables = _("Variables");
    scope.result = _("Result");
    scope.copyright = _("copyright");
    scope.turn_on_off_txt = control_labels[0];
    scope.dissect_cover_txt = control_labels[2];
    scope.distance_txt = control_labels[4];
    scope.$apply();
   }

   function initialisationOfControls() {
    scope.distance = 1; /** Initial value of distance */
    scope.turn_on = false; /** Initial value of turnOnOff button */
    scope.dissect = false; /** Initial value of dissect_cover button */
   }
  }
 }
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
 stage.update();
}
/** All the images loading and added to the stage */
function loadImages(image, name, xPos, yPos, cursor, rot, container, scale) {
 var _bitmap = new createjs.Bitmap(image).set({});
 _bitmap.x = xPos;
 _bitmap.y = yPos;
 _bitmap.scaleX = _bitmap.scaleY = scale;
 _bitmap.name = name;
 _bitmap.alpha = 1;
 _bitmap.rotation = rot;
 _bitmap.cursor = cursor;
 container.addChild(_bitmap); /** Adding bitmap to the container */
 stage.update();
}

/** function to return chiled element of container */
function getCBN(chldName) {
 return container.getChildByName(chldName);
}
/** function to set initial position of child elements */
function initialXY() {
 initiaXY = [{
  domeX: 0,
  domeY: 170
 }]; /** Initial position of small dome */
}
/** All variables initialising in this function */
function initialisationOfVariables() {
 line_togle = true; /** Initialization of line_togle for line movement */
 line_fps = 0; /** Initialization of line_fps for control speed of line movement */
 pluse_sign_count = 0; /** Variable for number of pluse sign */
 minus_sign_count = 0; /** Variable for number of minuse sign */
 sign_limit = 30; /** Variable for limit of signs */
 changeSpriteFrames(1) /** Reinitialization of data for sprite sheet, to avoid wheel rotation while slider change('run:[1,4]') */
 generateSriteSheet(wheel_data); /** Function call for generate a new spritesheet */
 distance = 1; /** distace between two domes */
 cntr_x = 405;
 cntr_y = 132;
 stage.update(); /** Redrawing of canvas */
}
/** Set the initial status of the bitmap and text depends on its visibility and initial values */
function initialisationOfImages() {
 getCBN("spark").alpha = 0; /** To hide spark image */
 getCBN("plus_sign_brush_1").alpha = 0; /** To hide pluse sign over brush */
 getCBN("plus_sign_brush_2").alpha = 0; /** To hide pluse sign over brush */
 stage.update();
}
/** Function for turn on or turn off equipment */
function turnOnOff(scope) {
 turn_on = scope.turn_on = !scope.turn_on; /** Togle Turn OFF/Turn ON button and store value to variable 'trunOn' */
 if (turn_on) { /** Things to do while generator in ON state */
  sign_over_roller.removeAllChildren(); /** Initially remove all Pluse signs from brush */
  stage.update();
  scope.turn_on_off_txt = control_labels[1]; /** The label of ON/OFF button to "Turn OFF" */
  if (dieect) {
   changeSpriteFrames(4) /** Reinitialization of data for sprite sheet, to avoid wheel rotation while slider change('run:[1,4]') */
   container.removeChild(wheel_animation); /** Removing existing spritesheet */
   generateSriteSheet(wheel_data); /** adding new sprite sheet */
   wheel_ticker = createjs.Ticker.addEventListener("tick", tick); /** Starting of wheel animation */
   sign_over_roller.removeAllChildren(); /** Removing all exixsting pluse sign over roller belt */
   stage.update();
   for (var i = 1; i < 20; i++) { /** including pluse sign over roller belt */
    loadImages(queue.getResult("plus_sign"), "plus_sign_" + i, (377 + (Math.random() * 55)), (160 + (i * 19) + (Math.random() * 10)), "", 0, sign_over_roller, 1);
   }
   container.removeChild(getCBN("box_cover")); /** Removing image of cover of generator */
   loadImages(queue.getResult("box_cover"), "box_cover", 325, 483, "", 0, sign_over_roller, 1); /** Reload image of cover of generator */
   for (i = 1; i < 20; i++) { /** Function call to animate pluse sign over roller belt */
    signAnimation("plus_sign_" + i, i);
   }
   for (i = 10; i <= 370; i = i + 10) { /** Function call to animate lines over roller belt */
    rollerBelt("line_" + i, i);
   }
   signAnimOnBrush(); /** To start Pluse sing over brush */
  }
  aroundBigDome(111);
  /** *Function call to generate and animation signs over big dome. 
   *'111px' is the distance from the center of dome */
  aroundSmallDome(); /** To start animation over small dome */
 } else { /** Generator in OFF state */
  if (dieect) {
   for (i = 1; i < 20; i++) { /** To stop sign animation over belt */
    clearTimeout(clr[i]);
   }
   for (i = 10; i <= 370; i = i + 10) { /** To stop line animatin over roller belt */
    clearTimeout(clr_line[i]);
   }
  }
  loadImages(queue.getResult("box_cover"), "box_cover", 325, 483, "", 0, container, 1); /** To cover generator */
  getCBN("spark").alpha = 0; /** To hide spark image */
  scope.turn_on_off_txt = control_labels[0];
  createjs.Ticker.removeEventListener("tick", tick); /** To stop wheel animation of generator */
  createjs.Tween.removeAllTweens();
  clearTimeout(big_dome_clr); /** To clear plus sign generation */
  pluse_sign_count = 0;
  stage.update();
  clearTimeout(small_dome_clr); /** To clear minus sign generation */
  minus_sign_count = 0;
  getCBN("plus_sign_brush_1").alpha = 0; /** To hide pluse sign over brush */
  getCBN("plus_sign_brush_2").alpha = 0;
  if (dieect) {
   changeSpriteFrames(1) /** Reinitialization of data for sprite sheet, to avoid wheel rotation while slider change('run:[1,4]') */
   container.removeChild(wheel_animation);
   generateSriteSheet(wheel_data); /** Generate new sprite sheet */
  }
  stage.update();
 }
}
/** Function for dissect or cover equipment */
function dissectCover(scope) {
 dieect = scope.dissect = !scope.dissect;
 createjs.Ticker.timingMode = createjs.Ticker.RAF;
 if (dieect) { /** Generator in dissect state */
  sign_over_roller.alpha = 1; /** To show sign over roller belt */
  stage.update();
  scope.dissect_cover_txt = control_labels[3];
  getCBN("cover_all").alpha = 0; /** To hide cover of generator */
  if (turn_on) {
   changeSpriteFrames(4) /** Reinitialization of data for sprite sheet, to avoid wheel rotation while slider change('run:[1,4]') */
   container.removeChild(wheel_animation); /** removing existing sprite sheet */
   generateSriteSheet(wheel_data); /** Generate new sprite sheet */
   wheel_ticker = createjs.Ticker.addEventListener("tick", tick); /** To stop wheel movement */
   sign_over_roller.removeAllChildren();
   stage.update();
   for (var i = 1; i < 20; i++) { /** including pluse sign over roller belt */
    loadImages(queue.getResult("plus_sign"), "plus_sign_" + i, (377 + (Math.random() * 55)), (160 + (i * 19) + (Math.random() * 10)), "", 0, sign_over_roller, 1);

   }
   container.removeChild(getCBN("box_cover"));
   loadImages(queue.getResult("box_cover"), "box_cover", 325, 483, "", 0, sign_over_roller, 1);
   for (i = 1; i < 20; i++) { /** To generate pluse sign over roller */
    signAnimation("plus_sign_" + i, i);
   }
   for (i = 10; i <= 370; i = i + 10) { /** To animate pluse sign over roller belt */
    rollerBelt("line_" + i, i);
   }
   signAnimOnBrush();
  } else {
   changeSpriteFrames(1) /** Reinitialization of data for sprite sheet, to avoid wheel rotation while slider change('run:[1,4]') */
   container.removeChild(wheel_animation);
   generateSriteSheet(wheel_data);
  }
 } else {
  if (turn_on) {
   for (i = 1; i < 20; i++) {
    clearTimeout(clr[i]);
   }
   for (i = 10; i <= 370; i = i + 10) {
    clearTimeout(clr_line[i]);
   }
  }
  sign_over_roller.alpha = 0;
  stage.update();
  scope.dissect_cover_txt = control_labels[2];
  changeSpriteFrames(4) /** Reinitialization of data for sprite sheet, to avoid wheel rotation while slider change('run:[1,4]') */
  createjs.Tween.removeAllTweens();
  container.removeChild(wheel_animation);
  container.removeChild(getCBN("cover_all"));
  generateSriteSheet(wheel_data);
  loadImages(queue.getResult("cover_all"), "cover_all", 304, 30.5, "", 0, container, 1);
  createjs.Ticker.removeEventListener("tick", tick);
 }
 stage.update();
}
/** Function for sprite and tween animation */
function tick(event) {
 stage.update();
}
/** Function for dissect or cover equipment */
function setDistance(scope) {
 sign_limit = 30 + (scope.distance - 1) * 20;
 /** * Number of sign image to show.
  * Time taken to discharge electron
  * value will change based on the slider value */
 if (distance > scope.distance && turn_on && pluse_sign_count >= sign_limit) { /** To show spark while decrease distance between domes */
  getCBN("spark").alpha = 1;
 }
 distance = scope.distance;
 getCBN("dome_movable").x = initiaXY[0].domeX - (scope.distance - 1) * 5; /** Adjust the position of small dome */
 container_small_dome.x = initiaXY[0].domeX - (scope.distance - 1) * 5; /** Adjust the position of minus sign with respect to position of small dome */
 stage.update();
}
/** Function for rollering of belt */
function rollerBelt(lineName, i) {
 container.getChildByName(lineName).y = container.getChildByName(lineName).y - 2;
 if (container.getChildByName(lineName).y <= 170) { /** Line reaches the highest top */
  container.getChildByName(lineName).y = 540; /** Line top set to highest bottom */
  rollerBelt(lineName, i); /** Animate line ovre belt to top */
 } else {
  clr_line[i] = setTimeout(function() {
   rollerBelt(lineName, i)
  }, 10);
 }
}
/** Function for pluse sign animation over rolling belt */
function signAnimation(elementName, i) {
 getCBN("plus_sign_brush_2").alpha = 1;
 getCBN("plus_sign_brush_1").x = 400 + Math.random() * 15; /** To set random movement of pluse sign over brush  */
 getCBN("plus_sign_brush_1").y = 153 + Math.random() * 6; /** To set random movement of pluse sign over brush  */
 getCBN("plus_sign_brush_1").alpha = !getCBN("plus_sign_brush_1").alpha; /** Toggle the visibility of of sign over brush */
 sign_over_roller.getChildByName(elementName).y = sign_over_roller.getChildByName(elementName).y - 2; /** Movemento of pluse sign towards top, y postion decreased by 2 */
 if (sign_over_roller.getChildByName(elementName).y <= 170) { /** Pluse sign reaches the highest top */
  sign_over_roller.getChildByName(elementName).y = 530; /** The y position of pluse sign over belt set to bottom */
  sign_over_roller.getChildByName(elementName).x = (377 + (Math.random() * 55)); /** Random X position of pluse sign */
  signAnimation(elementName, i);
 } else {
  clr[i] = setTimeout(function() {
   signAnimation(elementName, i)
  }, 10);
 }
}
/** Function for pluse sign animation over electric brush */
function signAnimOnBrush() {
 createjs.Tween.get(getCBN("plus_sign_brush_2")).to({
  x: 498,
  y: 117
 }, 250).call(function() { /** pluse sign over brush moving x position to 498 and y position to 117 */
  getCBN("plus_sign_brush_2").x = 415; /** sign position set to initial state */
  getCBN("plus_sign_brush_2").y = 153; /** sign position set to initial state */
  signAnimOnBrush();
 });
}
/** Function for generating pluse sign around big dome */
function aroundBigDome(radius) {
 pluse_sign_count = pluse_sign_count + 2; /** Variable to increment the number of pluse sign around big dome */
 if (pluse_sign_count <= sign_limit) { /** To check the number of pluse sign reaches the limit */
  var x = cntr_x + radius * Math.cos(pluse_sign_count); /** Random postion of sign around big dome */
  var y = cntr_y + radius * Math.sin(pluse_sign_count); /** Random postion of sign around big dome */
  var x1 = cntr_x + radius * Math.cos(pluse_sign_count - 1); /** Random postion of sign around big dome */
  var y1 = cntr_y + radius * Math.sin(pluse_sign_count - 1); /** Random postion of sign around big dome */
  angle = Math.random() * sign_limit;
  var x2 = cntr_x + radius * Math.cos(angle); /** Random postion of sign around big dome */
  var y2 = cntr_y + radius * Math.sin(angle); /** Random postion of sign around big dome */
  if (y <= 220 && y1 <= 220 && y2 <= 220) { /** To avoid pluse sign over the insulating cover of generator */
   loadImages(queue.getResult("plus_sign"), "plus_sign_bigDome_" + pluse_sign_count, x, y, "", 0, container_big_dome, 1);
   loadImages(queue.getResult("plus_sign"), "plus_sign_bigDome_" + pluse_sign_count, x1, y1, "", 0, container_big_dome, 1);
   loadImages(queue.getResult("plus_sign"), "plus_sign_bigDome_" + pluse_sign_count, x2, y2, "", 0, container_big_dome, 1);
   stage.update();
  }
 } else {
  pluse_sign_count = 0;
  container_big_dome.removeAllChildren();
  stage.update();
  clearTimeout(big_dome_clr);
 };
 if (pluse_sign_count <= 30 && turn_on) { /** Condition to check whether the sign is fully filled around dome */
  big_dome_clr = setTimeout(function() {
   aroundBigDome(111)
  }, 100); /** the distance of sign from the center of dome is 111 */
 } else if (pluse_sign_count > 30 && pluse_sign_count <= 50 && turn_on) { /** Condition to check whether the sign is fully filled around dome */
  big_dome_clr = setTimeout(function() {
   aroundBigDome(113)
  }, 100); /** the distance of sign from the center of dome is 113 */
 } else if (pluse_sign_count > 50 && pluse_sign_count <= 70 && turn_on) { /** Condition to check whether the sign is fully filled around dome */
  big_dome_clr = setTimeout(function() {
   aroundBigDome(115)
  }, 100); /** the distance of sign from the center of dome is 115 */
 } else if (pluse_sign_count > 70 && pluse_sign_count <= 90 && turn_on) { /** Condition to check whether the sign is fully filled around dome */
  big_dome_clr = setTimeout(function() {
   aroundBigDome(117)
  }, 100); /** the distance of sign from the center of dome is 117 */
 } else if (pluse_sign_count > 90 && turn_on) { /** Condition to check whether the sign is fully filled around dome */
  big_dome_clr = setTimeout(function() {
   aroundBigDome(120)
  }, 100); /** the distance of sign from the center of dome is 120 */
 }
}
/** Function for generating pluse sign around big dome */
function aroundSmallDome() {
 minus_sign_count = minus_sign_count + 2; /** Variable to increment the number of minuse sign around big dome */
 if (minus_sign_count == sign_limit) { /** To show the spark light */
  getCBN("spark").alpha = 1; /** To show the spark light */
 } else {
  getCBN("spark").alpha = 0; /** To hide the spark light */
 }
 if (minus_sign_count <= sign_limit) { /** To check the number of minuse sign reaches the limit */
  var _cntr_x = 128;
  var _cntr_y = 222;
  var angle = Math.random() * sign_limit;
  var x = _cntr_x + 60 * Math.cos(minus_sign_count); /** Random postion of sign around small dome */
  var y = _cntr_y + 60 * Math.sin(minus_sign_count); /** Random postion of sign around small dome */
  angle = Math.random() * 20;
  var x1 = _cntr_x + 60 * Math.cos(minus_sign_count + 1); /** Random postion of sign around small dome */
  var y1 = _cntr_y + 60 * Math.sin(minus_sign_count + 1); /** Random postion of sign around small dome */
  loadImages(queue.getResult("minus_sign"), "plus_sign_smallDome_1_" + minus_sign_count, x, y, "", 0, container_small_dome, 1);
  loadImages(queue.getResult("minus_sign"), "plus_sign_smallDome_1_" + minus_sign_count, x1, y1, "", 0, container_small_dome, 1);
  stage.update();
 } else {
  minus_sign_count = 0;
  getCBN("spark").alpha = 0; /** To hide the spark light */
  container_small_dome.removeAllChildren(); /** Remove all signs around small dome */
  stage.update();
  clearTimeout(small_dome_clr);
 }
 if (turn_on) {
  small_dome_clr = setTimeout(function() {
   aroundSmallDome()
  }, 100);
 }
}

function generateSriteSheet(wheel_data) { /** Function to generate sprite sheets */
 wheel_spriteSheet = new createjs.SpriteSheet(wheel_data); /** Create a new sprite sheets using data */
 wheel_animation = new createjs.Sprite(wheel_spriteSheet, "run");
 wheel_animation.y = 490; /** Position of sprite sheet  */
 wheel_animation.x = 545; /** Position of sprite sheet  */
 container.addChild(wheel_animation); /** adding sprite sheet to container  */
}

function changeSpriteFrames(frame_number) {
 wheel_data = { /** Reinitialization of data for sprite sheet, to avoid wheel rotation while slider change('run:[1,4]') */
  images: [queue.getResult("wheels")],
  /** Set sprite image, which loaded using preloader */
  frames: {
   width: 75,
   height: 97.6
  },
  /** Set width and height of sprite frame */
  animations: { /** Initialization of animation values */
   stand: 0,
   run: [1, frame_number],
   /** animating frame from first frame to fourth frame */
   jump: [5, 1, "run"]
  }
 };
}
/** Resetting the experiment */
function reset(scope) {
 window.location.reload();
}