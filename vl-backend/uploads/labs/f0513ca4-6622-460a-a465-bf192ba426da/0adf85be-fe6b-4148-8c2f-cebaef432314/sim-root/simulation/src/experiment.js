(function() {
	angular.module('users')
		.directive("experiment", directiveFunction)
})();

var barkhausen_stage, canvas;

var coil_count,tick,graph_draw_timer,audio,wire_end_x,graph_timer,start_x,end_x,coil_area,wire_x,show_gph;

var b_intial,b_final,emf,time,count,final_x,final_y,reduced_emf,initial_x,magnet_bitmap,rod_flag;

var reduced_emf,line_x,line_y,graph_x_initial,graph_y_initial,graph_x_final,sound;

var help_array = [];

var graph_line = new createjs.Shape();

var line = new createjs.Shape();

function directiveFunction() {
	return {
		restrict: "A",
		link: function(scope, element, attrs) {
			/** Variable that decides if something should be drawn on mousemove */
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
			audio = new Audio();
			queue.loadManifest([{
				id: "speaker",
				src: "images/speaker.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "rod",
				src: "images/rod.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "move_me",
				src: "images/move_me.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "magnet",
				src: "images/magnet.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "coil_under",
				src: "images/coil_under.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "wire_end_piece",
				src: "images/wire_end_piece.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "coil_top",
				src: "images/coil_top.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "graph",
				src: "images/graph.svg",
				type: createjs.LoadQueue.IMAGE
			}, {
				id: "noise_sound",
				src: "sounds/noise.mp3",
				type: createjs.LoadQueue.SOUND
			}]);

			barkhausen_stage = new createjs.Stage("demoCanvas");
			barkhausen_stage.enableDOMEvents(true);
			createjs.Touch.enable(barkhausen_stage);
			barkhausen_stage.enableMouseOver(10050);

			function handleComplete() {
				loadImages(queue.getResult("speaker"), "speaker", 100, 220, 1);
				loadImages(queue.getResult("coil_under"), "coil_under1", 140, 225, 1);
				loadImages(queue.getResult("coil_under"), "coil_under2", 158.5, 226, 1);
				loadImages(queue.getResult("coil_under"), "coil_under3", 177, 226, 1);
				loadImages(queue.getResult("coil_under"), "coil_under4", 196, 226, 1);
				loadImages(queue.getResult("coil_under"), "coil_under5", 215, 226, 1);
				loadImages(queue.getResult("coil_under"), "coil_under6", 233.5, 226, 1);
				loadImages(queue.getResult("coil_under"), "coil_under7", 252, 226, 1);
				loadImages(queue.getResult("coil_under"), "coil_under8", 270, 226, 1);
				loadImages(queue.getResult("wire_end_piece"), "wire_end_piece", 155, 246, 1);
				drawWire();
				loadImages(queue.getResult("rod"), "rod", 145, 230, 0.9);
				loadImages(queue.getResult("move_me"), "move_me", 450, 20, 1, 1);
				loadImages(queue.getResult("coil_top"), "coil_top1", 160, 224, 1);
				loadImages(queue.getResult("coil_top"), "coil_top2", 179, 224, 1);
				loadImages(queue.getResult("coil_top"), "coil_top3", 197, 224, 1);
				loadImages(queue.getResult("coil_top"), "coil_top4", 217, 224, 1);
				loadImages(queue.getResult("coil_top"), "coil_top5", 235, 224, 1);
				loadImages(queue.getResult("coil_top"), "coil_top6", 252, 224, 1);
				loadImages(queue.getResult("coil_top"), "coil_top7", 270, 224, 1);
				loadImages(queue.getResult("coil_top"), "coil_top8", 290, 224, 1);
				loadImages(queue.getResult("graph"), "graph", 0, 0, 1);
				setMagnet(queue.getResult("magnet"), "magnet", 400, 120, 1);
				setText("moveMe", 450, 55, "", "gray", 1.4);
				tick = setInterval(updateTimer, 100); /** Stage update function in a timer */
				for ( var i = 2; i <= 8; i++ ) {
					barkhausen_stage.getChildByName("coil_under" + (i)).visible = false;
					barkhausen_stage.getChildByName("coil_top" + (i)).visible = false;
				}
				wire_end_x = barkhausen_stage.getChildByName("wire_end_piece").x;
				initialisationOfVariables(); /** Initializing the variables */
				translationLabels(); /** Translation of strings using gettext */
				volControler(0);
				graph_line.graphics.moveTo(initial_x, final_y).setStrokeStyle(1).beginStroke("#0000ff").lineTo(final_x, final_y);
				line_y = graph_y_initial;
				line_x = graph_x_initial;
				barkhausen_stage.addChild(graph_line);
			}

			/** Add all the strings used for the language translation here. '_' is the shortcut for calling the gettext function defined in the gettext-definition.js */
			function translationLabels() {
				help_array = [_("help1"), _("help2"), _("help3"), _("help4"), _("help5"), _("Next"), _("Close")];
				scope.variables = _("Variables");
				scope.number_of_coils = _("No of coils:");
				scope.measurements = _("Measurements");
				scope.show_rod = _("Show Rod");
				scope.show_graph = _("Show Graph");
				scope.reset_lbl = _("Reset");
				scope.copyright = _("copyright")
				scope.heading = _("Barkhausen Effect");
				scope.$apply();
			}
		}
	}
}

/** Function for drawing the graph */
function drawGraph() {
	if ( show_gph ) { /** If show graph checkbox is checked */
		if (line_x >= graph_x_final) { /** If the x value of drawing line graph is greater than the x final value */
			graph_line.graphics.clear(); /** Clear the graph */
			graph_line.graphics.setStrokeStyle(0.5).beginStroke("#0000ff");
			line_x = graph_x_initial; /** Set the line graph x value as initial value and the graph again start from the initial value */
			graph_line.graphics.moveTo(line_x, line_y);
		} else {
			line_x += 0.1; /** Drawing the graph */
			if (emf != 0) {
				if ((barkhausen_stage.getChildByName("magnet").y < (barkhausen_stage.getChildByName("coil_top1").y - 100)) || (barkhausen_stage.getChildByName("magnet").y > (barkhausen_stage.getChildByName("coil_top1").y + 100))) { /** Calculating the reduced emf with respect to the y position on magnet and coil */
					emf = 0;
					reduced_emf = Math.abs(emf) / 3000;
				} else {
					reduced_emf = Math.abs(emf) / 500;
				}
				if (!rod_flag) {
					reduced_emf = Math.abs(emf) / 2500;
				}
				line_y = line_y - ((reduced_emf));
				graph_line.graphics.lineTo(line_x, line_y);
				line_y = graph_y_initial;
				line_y = line_y + ((reduced_emf));
				graph_line.graphics.lineTo(line_x, line_y);
			} else {
				line_y = graph_y_initial;
				graph_line.graphics.lineTo(line_x, line_y);
			}
		}
	}
}

/** Set the volume in this function */
function volControler(vol) {
	var volm = Math.abs(vol / 1000).toFixed(2);
	volm = (volm + coil_count) / 50;
	if ( volm > 1 ) {
		volm = 1;
	}
	audio.volume = volm;
}

/** emf calculating function */
function calculateEmf() {
	count++;
	if ( rod_flag ) { /** If rod is visible, volume will vary depend on the emf, higher the emf, high the volume is */
		volControler(emf);
	}
	start_x = (barkhausen_stage.getChildByName("magnet").x - barkhausen_stage.getChildByName("coil_under" + (coil_count / 2)).x) / coil_area; /** Distance x of magnet and coil */
	end_x = (barkhausen_stage.getChildByName("coil_under" + (coil_count / 2)).x - barkhausen_stage.getChildByName("magnet").x) / coil_area; /** Distance y of magnet and coil */
	var _final_distance = Math.sqrt(start_x * start_x + end_x * end_x);
	if ( _final_distance < 1 ) {
		b_intial = sound * 2;
	} else {
		b_intial = sound * Math.pow(1 / _final_distance, 2) * (3 * start_x * start_x / (_final_distance * _final_distance) - 1);
	}
	var _dt = count / 1000 - time;
	emf = coil_count * ((b_intial - b_final) / _dt);
	if ( (isNaN(emf)) || (emf < 0) ) {
		emf = 0;
	}
	b_final = b_intial;
	time = count / 1000;
}

/** Stage update timer */
function updateTimer() {
	calculateEmf(); /** Emf calculating function */
	barkhausen_stage.update();
}

/** Magnet image function */
function setMagnet(image, name, xPos, yPos, sFactor) {
	magnet_bitmap = new createjs.Bitmap(image).set({
		x: 0,
		y: 0
	});
	magnet_bitmap.x = xPos;
	magnet_bitmap.y = yPos;
	magnet_bitmap.name = name;
	magnet_bitmap.cursor = "move";
	barkhausen_stage.addChild(magnet_bitmap);
	moveMagnet(); /** Magnet move function */
}

/** Moving the magnet */
function moveMagnet() {
	audio.src = "sounds/noise.mp3";
	audio.play();
	audio.loop = true;
	magnet_bitmap.on("mousedown", function(evt) {
		this.parent.addChild(this);
		this.offset = {
			x: this.x - evt.stageX,
			y: this.y - evt.stageY
		};
		barkhausen_stage.getChildByName("move_me").visible = false;
		barkhausen_stage.getChildByName("moveMe").visible = false;
	});
	/** The pressmove event is dispatched when the mouse moves after a mousedown on the target until the mouse is released. */
	magnet_bitmap.on("pressmove", function(evt) {
		this.y = evt.stageY + this.offset.y;
		this.x = evt.stageX + this.offset.x;
	});
	/** Drag releasing event */
	barkhausen_stage.on("stagemouseup", function(event) {
		barkhausen_stage.getChildByName("move_me").visible = true;
		barkhausen_stage.getChildByName("move_me").x = barkhausen_stage.getChildByName("magnet").x + 50;
		barkhausen_stage.getChildByName("move_me").y = barkhausen_stage.getChildByName("magnet").y - 100;
		barkhausen_stage.getChildByName("moveMe").visible = true;
		barkhausen_stage.getChildByName("moveMe").x = barkhausen_stage.getChildByName("magnet").x + 50;
		barkhausen_stage.getChildByName("moveMe").y = barkhausen_stage.getChildByName("magnet").y - 65;
	});
}

/** All the texts loading and added to the stage */
function setText(name, textX, textY, value, color, fontSize) {
	var _text = new createjs.Text();
	_text.x = textX;
	_text.y = textY;
	_text.textBaseline = "alphabetic";
	_text.name = name;
	_text.font = "bold " + fontSize + "em Tahoma";
	_text.text = value;
	_text.color = color;
	barkhausen_stage.addChild(_text);
}

/** Load all the images using in the experiment using createjs */
function loadImages(image, name, xPos, yPos, sFactor) {
	var _bitmap = new createjs.Bitmap(image).set({});
	_bitmap.x = xPos;
	_bitmap.y = yPos;
	_bitmap.name = name;
	_bitmap.alpha = 1;
	if (name == "rod") {
		_bitmap.scaleX = 0.75;
		_bitmap.scaleY = 1;
	} else {
		_bitmap.scaleX = _bitmap.scaleY = sFactor;
	}
	barkhausen_stage.addChild(_bitmap);
}

/** Initialisation of all variables here */
function initialisationOfVariables() {
	start_x = end_x = coil_area = 70;
	b_intial = 0;
	b_final = 0;
	emf = 0;
	sound = 1;
	time = 0;
	count = 0;
	final_x = 48;
	final_y = 102;
	reduced_emf = 0;
	initial_x = 48;
	line_x = 0;
	line_y = 0;
	wire_x = 300;
	coil_count = 2;
	graph_x_initial = 50;
	graph_y_initial = 102;
	graph_x_final = 335;
	rod_flag = true;
	show_gph = false;
	barkhausen_stage.getChildByName("moveMe").text = _("Move Me");
	barkhausen_stage.getChildByName("graph").visible = false;
	graph_timer = setInterval(drawGraph, 10);
}

/** Show rod checkbox event */
function displayRod(chked) {
	if (!chked) { /** If not checked */
		barkhausen_stage.getChildByName("rod").visible = false;
		barkhausen_stage.getChildByName("greenLineWire").visible = true;
		rod_flag = false;
	} else { /** If checked */
		barkhausen_stage.getChildByName("rod").visible = true;
		barkhausen_stage.getChildByName("greenLineWire").visible = false;
		rod_flag = true;
	}
}

/** Show graph checkbox event */
function displayGraph(scope) {
	if (scope.graph_show == false) { /** If graph is not showing */
		scope.graph_show = true;
		show_gph = true;
		graph_line.visible = true;
		barkhausen_stage.getChildByName("graph").visible = true; /** Display graph */
	} else {
		scope.graph_show = false;
		show_gph = false;
		graph_line.visible = false;
		barkhausen_stage.getChildByName("graph").visible = false;
	}
}

/** Coils slider change event */
function arrangeCoils(num) {
	coil_count = num;
	for (var i = 2; i <= 16; i = i + 2) {
		if (i / 2 <= num / 2) {
			barkhausen_stage.getChildByName("coil_under" + (i / 2)).visible = true; /** Coils displaying with respect to the no of coil increased */
			barkhausen_stage.getChildByName("coil_top" + (i / 2)).visible = true;
		} else {
			barkhausen_stage.getChildByName("coil_under" + (i / 2)).visible = false;
			barkhausen_stage.getChildByName("coil_top" + (i / 2)).visible = false;
		}
		barkhausen_stage.getChildByName("wire_end_piece").x = barkhausen_stage.getChildByName("coil_top" + (num / 2)).x - 5;
	}
	drawWire(); /** Draw the wire with respect to the coil numbers */
	if (rod_flag) {
		barkhausen_stage.getChildByName("greenLineWire").visible = false;
	}
}

/** Draw the coil connecting wire */
function drawWire() {
	line.graphics.clear().moveTo(145, 264).setStrokeStyle(3).beginStroke("#009933").lineTo(barkhausen_stage.getChildByName("wire_end_piece").x, 264);
	line.name = "greenLineWire";
	wire_x = wire_x - 10;
	barkhausen_stage.addChild(line);
}

/** Reset the experiment here */
function resetExperiment() {
	window.location.reload();
}