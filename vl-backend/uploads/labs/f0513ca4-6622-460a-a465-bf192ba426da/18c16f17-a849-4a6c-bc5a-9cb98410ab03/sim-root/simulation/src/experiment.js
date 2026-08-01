(function() {
    angular.module('users')
        .directive("experiment", directiveFunction)
})();
var temperature_coef_resistance_stage, temp_coef_container;

var resistor1_left_spot, bridge_resistor1_left_spot, bridge_resistor1_right_spot;

var resistor1_right_spot, resistor2_left_spot, bridge_resistor2_left_spot, bridge_resistor2_right_spot;

var resistor2_right_spot, bridge_battery_left_spot, bridge_battery_right_spot, battery_left_spot;

var battery_right_spot, galvanometer_bridge_spot, galvanometer_right_spot, right_fractional_resistor_top_spot;

var right_fractional_resistor_bottom_spot, right_fractional_resistor_bridge_top_spot, right_fractional_resistor_bridge_bottom_spot;

var left_fractional_resistor_top_spot, left_fractional_resistor_bottom_spot, left_fractional_resistor_bridge_top_spot;

var left_fractional_resistor_bridge_bottom_spot, right_unknown_resistor_top_spot, right_unknown_resistor_bottom_spot;

var right_unknown_resistor_bridge_top_spot, right_unknown_resistor_bridge_bottom_spot, left_unknown_resistor_top_spot;

var left_unknown_resistor_bottom_spot, left_unknown_resistor_bridge_top_spot, left_unknown_resistor_bridge_bottom_spot;

var right_resistor_click, left_resistor_click, click_resistance_box, line, line_flag, wire_num_int, jockey_wire; /* For line*/

var boolean_array, boolean_reverse_array, resistor_index_array, total_connection, total_connection_array, checkbox_model_array, resistance_total;

var resistance_back_total, jockey_x_position, length_of_wire, temperature_of_water, diameter_of_wire,enter_count,total_count;

var jockey_connect_position, resistivity, temp_coefficient,resistance_of_wire,connection_label;

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
            /** Load images */
            queue = new createjs.LoadQueue(true);
            queue.installPlugin(createjs.Sound);
            queue.on("complete", handleComplete, this);
            queue.loadManifest([{/** Background image */
                id: "background",
                src: "././images/background.svg",
                type: createjs.LoadQueue.IMAGE
            },  { /** First resistor left to bridge left connected wire image */
                id: "resistor1_left_bridge_wire",
                src: "././images/resistor1_left_bridge_wire.svg",
                type: createjs.LoadQueue.IMAGE
            }, {/** First resistor right to bridge right connected wire image */ 
                id: "resistor1_right_bridge_wire",
                src: "././images/resistor1_right_bridge_wire.svg",
                type: createjs.LoadQueue.IMAGE
            }, {/** Second resistor left to bridge left connected wire image */ 
                id: "resistor2_left_bridge_wire",
                src: "././images/resistor2_left_bridge_wire.svg",
                type: createjs.LoadQueue.IMAGE
            }, {/** Second resistor right to bridge right connected wire image */ 
                id: "resistor2_right_bridge_wire",
                src: "././images/resistor2_right_bridge_wire.svg",
                type: createjs.LoadQueue.IMAGE
            }, {/** Battery left to bridge left connected wire image */
                id: "bridge_battery_left_wire",
                src: "././images/bridge_battery_left_wire.svg",
                type: createjs.LoadQueue.IMAGE
            },  {
                id: "bridge_battery_right_wire",
                src: "././images/bridge_battery_right_wire.svg",
                type: createjs.LoadQueue.IMAGE
            },  {/** Right side unknown resistor to bridge top connected wire image */
                id: "unknown_resistor_bridge_top_wire_right",
                src: "././images/unknown_resistor_bridge_top_wire.svg",
                type: createjs.LoadQueue.IMAGE
            },  {/** Right side unknown resistor to bridge bottom connected wire image  */
                id: "unknown_resistor_bridge_bottom_wire_right",
                src: "././images/unknown_resistor_bridge_bottom_wire.svg",
                type: createjs.LoadQueue.IMAGE
            },  {/** Right side fractional resistor to bridge top connected wire image */
                id: "fractional_resistor_bridge_top_wire_right",
                src: "././images/fractional_resistor_bridge_top_wire.svg",
                type: createjs.LoadQueue.IMAGE
            },  {/** Right side fractional resistor to bridge bottom connected wire image */ 
                id: "fractional_resistor_bridge_bottom_wire_right",
                src: "././images/fractional_resistor_bridge_bottom_wire.svg",
                type: createjs.LoadQueue.IMAGE
            },  {/** Left side unknown resistor to bridge top connected wire image */
                id: "unknown_resistor_bridge_top_wire_left",
                src: "././images/unknown_resistor_bridge_top_wire.svg",
                type: createjs.LoadQueue.IMAGE
            },  {/** Left side unknown resistor to bridge bottom connected wire image */
                id: "unknown_resistor_bridge_bottom_wire_left",
                src: "././images/unknown_resistor_bridge_bottom_wire.svg",
                type: createjs.LoadQueue.IMAGE
            },  {/** Left side fractional resistor to bridge top connected wire image */
                id: "fractional_resistor_bridge_top_wire_left",
                src: "././images/fractional_resistor_bridge_top_wire.svg",
                type: createjs.LoadQueue.IMAGE
            },  {/** Left side fractional resistor to bridge bottom connected wire image */
                id: "fractional_resistor_bridge_bottom_wire_left",
                src: "././images/fractional_resistor_bridge_bottom_wire.svg",
                type: createjs.LoadQueue.IMAGE
            },  {/** Galvanometer to bridge connected wire image */
                id: "galvanometer_bridge_wire",
                src: "././images/galvanometer_bridge_wire.svg",
                type: createjs.LoadQueue.IMAGE
            },  {/** Right side fractional resistor */
                id: "fractional_resistor_right",
                src: "././images/fractional_resistor.svg",
                type: createjs.LoadQueue.IMAGE
            },  {/** Right side nknown resistor */
                id: "unknown_resistor_right",
                src: "././images/unknown_resistor.svg",
                type: createjs.LoadQueue.IMAGE
            },  {/** Left side fractional resistor */
                id: "fractional_resistor_left",
                src: "././images/fractional_resistor.svg",
                type: createjs.LoadQueue.IMAGE
            },  {/** Left side unknown resistor */
                id: "unknown_resistor_left",
                src: "././images/unknown_resistor.svg",
                type: createjs.LoadQueue.IMAGE
            },  {/** Copper strip left */
                id: "copper_strip_left",
                src: "././images/copper_strip_left.svg",
                type: createjs.LoadQueue.IMAGE
            },  {/** Copper strip right */
                id: "copper_strip_right",
                src: "././images/copper_strip_right.svg",
                type: createjs.LoadQueue.IMAGE
            },  {/** Jockey */ 
                id: "jockey",
                src: "././images/jockey.svg",
                type: createjs.LoadQueue.IMAGE
            },  {/** Circuit diagram :- Left side connection known resistor */ 
                id: "circuit_diagram_known_left_connection",
                src: "././images/circuit_diagram_known_left_connection.svg",
                type: createjs.LoadQueue.IMAGE
            },  {/** Circuit diagram :- Right side connection known resistor */
                id: "circuit_diagram_known_right_connection",
                src: "././images/circuit_diagram_known_right_connection.svg",
                type: createjs.LoadQueue.IMAGE
            },  {/** Circuit diagram :- Left side connection unknown resistor */
                id: "circuit_diagram_unknown_left_connection",
                src: "././images/circuit_diagram_unknown_left_connection.svg",
                type: createjs.LoadQueue.IMAGE
            },  {/** Circuit diagram :- Right side connection unknown resistor */
                id: "circuit_diagram_unknown_right_connection",
                src: "././images/circuit_diagram_unknown_right_connection.svg",
                type: createjs.LoadQueue.IMAGE
            },  {/** Connection :- Arrow */
                id: "arrow",
                src: "././images/arrow.svg",
                type: createjs.LoadQueue.IMAGE
            } ]);
            /** Stage creation */
            temperature_coef_resistance_stage = new createjs.Stage("demoCanvas");
            temperature_coef_resistance_stage.enableDOMEvents(true);
            temperature_coef_resistance_stage.enableMouseOver();
            createjs.Touch.enable(temperature_coef_resistance_stage);
            /** Main container - Temperature Coeficent of resistance */
            temp_coef_container = new createjs.Container(); /** Creating Temperature Coefficient of Resistance container */
            temperature_coef_resistance_stage.addChild(temp_coef_container); /** Append it in the stage */
            /** Sub container - Temperature Coeficent of resistance */
            resistor_container_1 = new createjs.Container(); /** Creating Temperature Coefficient of Resistance container */
            temperature_coef_resistance_stage.addChild(resistor_container_1); /** Append it in the stage */
            /** Sub container - Temperature Coeficent of resistance */
            resistor_container_2 = new createjs.Container(); /** Creating Temperature Coefficient of Resistance container */
            temperature_coef_resistance_stage.addChild(resistor_container_2); /** Append it in the stage */
            /** Sub container - Temperature Coeficent of resistance */
            jockey_container = new createjs.Container(); /** Creating Temperature Coefficient of Resistance container */
            temperature_coef_resistance_stage.addChild(jockey_container); /** Append it in the stage */
            spotsHitDeclaration(); /** Circle declaration for connect the wires is created in this function */
            /** For rectangles  */
            right_resistor_click = new createjs.Shape();
            left_resistor_click = new createjs.Shape();

            function handleComplete() {
                /** Load image */
                loadImages(queue.getResult("background"), "background", 0, 0, "", 1, 1, temp_coef_container); /** Background */
                loadImages(queue.getResult("resistor1_left_bridge_wire"), "resistor1_left_bridge_wire", 187, 380, "", 1, 0, temp_coef_container); /** First resistor left to bridge left wire */
                loadImages(queue.getResult("resistor1_right_bridge_wire"), "resistor1_right_bridge_wire", 212, 380, "", 1, 0, temp_coef_container); /** First resistor right to bridge left wire */
                loadImages(queue.getResult("resistor2_left_bridge_wire"), "resistor2_left_bridge_wire", 410, 382, "", 1, 0, temp_coef_container); /** Second resistor left to bridge left wire */
                loadImages(queue.getResult("resistor2_right_bridge_wire"), "resistor2_right_bridge_wire", 445, 382, "", 1, 0, temp_coef_container); /** Second resistor right to bridge right wire */
                loadImages(queue.getResult("bridge_battery_left_wire"), "bridge_battery_left_wire", 140, 325, "", 1, 0, temp_coef_container); /** Battery left to bridge left wire */
                loadImages(queue.getResult("bridge_battery_right_wire"), "bridge_battery_right_wire", 370, 327, "", 1, 0, temp_coef_container); /** Battery right to bridge right wire */
                loadImages(queue.getResult("galvanometer_bridge_wire"), "galvanometer_bridge_wire", 341, 467, "", 1, 0, temp_coef_container); /** Galvanometer to  bridge wire */
                loadImages(queue.getResult("copper_strip_left"), "copper_strip_left", 140, 477, "", 1, 1, resistor_container_1); /** Copper strip left */
                loadImages(queue.getResult("copper_strip_right"), "copper_strip_right", 543, 477, "", 1, 1, resistor_container_2); /** Copper strip right */
                loadImages(queue.getResult("unknown_resistor_right"), "unknown_resistor_right", 590, 365, "", 1, 0, resistor_container_2); /** Right side unknown resistor */
                loadImages(queue.getResult("unknown_resistor_bridge_top_wire_right"), "unknown_resistor_bridge_top_wire_right", 535, 372, "", 1, 0, resistor_container_2); /** Right side unknown resistor to bridge top connected wire image */
                loadImages(queue.getResult("unknown_resistor_bridge_bottom_wire_right"), "unknown_resistor_bridge_bottom_wire_right", 555, 390, "", 1, 0, resistor_container_2); /** Right side unknown resistor to bridge bottom connected wire image  */
                loadImages(queue.getResult("fractional_resistor_right"), "fractional_resistor_right", 595, 460, "pointer", 1, 1, resistor_container_1); /** Right side fractional resistor */
                loadImages(queue.getResult("fractional_resistor_bridge_top_wire_right"), "fractional_resistor_bridge_top_wire_right", 622, 465, "", -1, 0, resistor_container_1); /** Right side fractional resistor to bridge top connected wire image */
                loadImages(queue.getResult("fractional_resistor_bridge_bottom_wire_right"), "fractional_resistor_bridge_bottom_wire_right", 625, 475, "", -1, 0, resistor_container_1); /** Right side fractional resistor to bridge bottom connected wire image */
                loadImages(queue.getResult("unknown_resistor_left"), "unknown_resistor_left", 115, 365, "", -1, 0, resistor_container_1); /** Left side unknown resistor */
                loadImages(queue.getResult("unknown_resistor_bridge_top_wire_left"), "unknown_resistor_bridge_top_wire_left", 170, 375, "", -1, 0, resistor_container_1); /** Left side unknown resistor to bridge top connected wire image */
                loadImages(queue.getResult("unknown_resistor_bridge_bottom_wire_left"), "unknown_resistor_bridge_bottom_wire_left", 151, 393, "", -1, 0, resistor_container_1); /** Left side unknown resistor to bridge bottom connected wire image  */
                loadImages(queue.getResult("fractional_resistor_left"), "fractional_resistor_left", 110, 463, "pointer", -1, 1, resistor_container_2); /** Left side fractional resistor */
                loadImages(queue.getResult("fractional_resistor_bridge_top_wire_left"), "fractional_resistor_bridge_top_wire_left", 82, 465, "", 1, 0, resistor_container_2); /** Left side fractional resistor to bridge top connected wire image */
                loadImages(queue.getResult("fractional_resistor_bridge_bottom_wire_left"), "fractional_resistor_bridge_bottom_wire_left", 78, 475, "", 1, 0, resistor_container_2); /** Left side fractional resistor to bridge bottom connected wire image */
                loadImages(queue.getResult("jockey"), "jockey", 156, 476, "pointer", 1, 1, jockey_container); /** Jockey */
                loadImages(queue.getResult("circuit_diagram_known_left_connection"), "circuit_diagram_known_left_connection", 30, 20, "pointer", 0.6, 1, resistor_container_2); /** Circuit diagram :- Left side connection known resistor */
                loadImages(queue.getResult("circuit_diagram_known_right_connection"), "circuit_diagram_known_right_connection", 30, 20, "pointer", 0.6, 1, resistor_container_1);/** Circuit diagram :- Right side connection known resistor */
                loadImages(queue.getResult("circuit_diagram_unknown_left_connection"), "circuit_diagram_unknown_left_connection", 30, 20, "pointer", 0.6, 0, resistor_container_1); /** Circuit diagram :- Left side connection unknown resistor */
                loadImages(queue.getResult("circuit_diagram_unknown_right_connection"), "circuit_diagram_unknown_right_connection", 30, 20, "pointer", 0.6, 0, resistor_container_2);/** Circuit diagram :- Right side connection unknown resistor */
                /** Selected resistance display labels */
                setText("back_right_resistor_value", 452, 340, "0.1 Ω", "black", 1.3, temp_coef_container); /** Back side right resistor value */
                setText("back_left_resistor_value", 205, 340, "0.1 Ω", "black", 1.3, temp_coef_container); /** Back side left resistor value */
                setText("right_fractional_resistor_value", 610, 450, "0.1 Ω", "black", 1.3, resistor_container_1); /** Right side resistor value */
                setText("left_fractional_resistor_value", 60, 450, "0.1 Ω", "black", 1.3, resistor_container_2); /** Left side resistor value  */
                setText("galvanometer_voltage_display", 541, 572, 45.06, "black", 1.3, temp_coef_container); /** Galvanometer voltage  */
                setText("galvanometer_unit", 583, 578, "mA", "black", 0.5, temp_coef_container); /** Galvanometer voltage  */
                setText("jockey_position_display", 156, 530, 0, "black", 1.3, temp_coef_container); /** Jockey position values display  */                
                /** Draw shapes */
                drawRectangle(right_resistor_click, "right_resistor_click", 450, 370, 80, 90, "black", temp_coef_container, scope, "pointer"); /** Rectacle shape for clicking on the forward arrow on constant current supply machine*/
                drawRectangle(left_resistor_click, "left_resistor_click", 160, 370, 80, 90, "black", temp_coef_container, scope, "pointer"); /** Rectacle shape for clicking on the reverse arrow on constant current supply machine*/
                translationLabels(); /** Translation of strings using gettext */
                initialisationOfVariables(); /** Initializing the variables */
                createShapesForHit(scope); /** Create circle for wire connections */               
                drawJockeyConnection(159, scope); /** Function call for connecting jockey to galvanometer */
                dragJockey(scope); /** Drag jockey to adjust the jockey position  */
                showDialogBoxFn(scope) /** Function to show dialog box  */
                fractionalResistanceCheckBoxModels(scope, fractional_resistance_checkbox_model_array) /** Checkbox models for fractional  */
                backResistanceCheckBoxModels(scope, back_resistance_checkbox_model_array) /** Checkbox models for back side resistance box */
                setText("connection_value_id", 400, 50,total_wire_connection, "white", 1.3, temp_coef_container); /** Total connection  label  */
                setText("connection_label_id", 425, 50,connection_label, "white", 1.3, temp_coef_container); /** Total connection  label  */
                loadImages(queue.getResult("arrow"), "arrow", 300, 200, "pointer", 1, 1, temperature_coef_resistance_stage); /** Connection :- Arrow */
                initialisationOfImages(); /** Function call for images used in the apparatus visibility */
                /** Createjs stage updation happens in every interval */
                temperature_coef_resistance_stage.update();
            }
            /** Function to show dialog box  */
            function showDialogBoxFn(scope) {
                /** Function to click fractional resistor box(right) to show dialog box  */
                resistor_container_1.getChildByName("fractional_resistor_right").on("click", function(evt) {
                    dialogBoxShow("fractional_resistor_right", false, true);
                    scope.$apply();
                });
                /** Function to click fractional resistor box(left) to show dialog box  */
                resistor_container_2.getChildByName("fractional_resistor_left").on("click", function(evt) {
                    dialogBoxShow("fractional_resistor_left", false, true);
                    scope.$apply();
                });
            }
            /** Function to show/hide  dialog box */
            function dialogBoxShow(name, back_resistance_visibility, fractional_resistance_visibility) {               
                scope.resistance_group = 'fractional';
                scope.fractional_show = true;
                scope.small_show = false;
                scope.dialog_box_show = true;
                scope.resistance_box_show = back_resistance_visibility;
                scope.fractional_resistance_box_show = fractional_resistance_visibility;
                click_resistance_box = name;
            }
            /** Drag jockey to adjust the jockey position  */
            function dragJockey(scope) {
                jockey_container.getChildByName("jockey").on("pressmove", function(evt) {
                    if (evt.stageX > 156 && evt.stageX < 543) {
                        jockey_container.getChildByName("jockey").x = evt.stageX;
                        temp_coef_container.getChildByName("jockey_position_display").x = evt.stageX;
                    }
                    jockey_wire.graphics.clear();                    
                    var _jockey_position_change = ((jockey_container.getChildByName("jockey").x - 156) / 3.87).toFixed(1); /** Jockey position change */
                    scope.jockey_position_model = _jockey_position_change;
                    drawJockeyConnection(jockey_container.getChildByName("jockey").x + 3, scope);
                    scope.$apply();
                    volatageOfGalvanometerCalculation(scope); /** Function to calculate volatage Of galvanometer */
                    /** Createjs stage updation happens in every interval */
                    temperature_coef_resistance_stage.update();
                });
            }
            /** Circle declarations for connect the wires is created in this function */
            function spotsHitDeclaration() {
                /** Create spot -  first reesistor to carey foster bridge */
                resistor1_left_spot = new createjs.Shape(); /** First resistor left spot */
                bridge_resistor1_left_spot = new createjs.Shape(); /** Carey foster bridge left spot for first resistor */
                resistor1_right_spot = new createjs.Shape(); /** First resistor right spot */
                bridge_resistor1_right_spot = new createjs.Shape(); /** Carey foster bridge right spot for first resistor */
                /** Create spot -  second reesistor to carey foster bridge */
                resistor2_left_spot = new createjs.Shape(); /** Second resistor left spot */
                bridge_resistor2_left_spot = new createjs.Shape(); /** Carey foster bridge left spot for second resistor */
                resistor2_right_spot = new createjs.Shape(); /** Second resistor right spot */
                bridge_resistor2_right_spot = new createjs.Shape(); /** Carey foster bridge right spot for second resistor */
                /** Create spot -  battery to carey foster bridge */
                bridge_battery_left_spot = new createjs.Shape(); /** Carey foster bridge left spot */
                bridge_battery_right_spot = new createjs.Shape(); /** Carey foster bridge right spot */
                battery_left_spot = new createjs.Shape(); /** Battery left spot */
                battery_right_spot = new createjs.Shape(); /** Battery right spot */
                /** Create spot -  galvanometer to carey foster bridge */
                galvanometer_right_spot = new createjs.Shape(); /** Galvanometer right spot */
                galvanometer_bridge_spot = new createjs.Shape(); /** Carey foster bridge center spot */
                /** Create spot -  right fractional resistor to carey foster bridge */
                right_fractional_resistor_top_spot = new createjs.Shape(); /** Right fractional resistor top spot */
                right_fractional_resistor_bottom_spot = new createjs.Shape(); /** Right fractional resistor bottom spot */
                right_fractional_resistor_bridge_top_spot = new createjs.Shape(); /** Carey foster bridge top spot connected to right fractional resistor top  */
                right_fractional_resistor_bridge_bottom_spot = new createjs.Shape(); /** Carey foster bridge bottom spot connected to right fractional resistor bottom */
                /** Create spot - left fractional resistor to carey foster bridge */
                left_fractional_resistor_top_spot = new createjs.Shape(); /** Left fractional resistor top spot */
                left_fractional_resistor_bottom_spot = new createjs.Shape(); /** Left fractional resistor bottom spot */
                left_fractional_resistor_bridge_top_spot = new createjs.Shape(); /** Carey foster bridge top spot connected to left fractional resistor top  */
                left_fractional_resistor_bridge_bottom_spot = new createjs.Shape(); /** Carey foster bridge bottom spot connected to left fractional resistor bottom */
                /** Create spot - right unknown resistor to carey foster bridge */
                right_unknown_resistor_top_spot = new createjs.Shape(); /** Right unknown resistor top spot */
                right_unknown_resistor_bottom_spot = new createjs.Shape(); /** Right unknown resistor bottom spot */
                right_unknown_resistor_bridge_top_spot = new createjs.Shape(); /** Carey foster bridge top spot connected to right unknown resistor top  */
                right_unknown_resistor_bridge_bottom_spot = new createjs.Shape(); /** Carey foster bridge bottom spot connected to right unknown resistor bottom */
                /**Create spot -  left unknown resistor to carey foster bridge */
                left_unknown_resistor_top_spot = new createjs.Shape(); /** Left unknown resistor top spot */
                left_unknown_resistor_bottom_spot = new createjs.Shape(); /** Left unknown resistor bottom spot */
                left_unknown_resistor_bridge_top_spot = new createjs.Shape(); /** Carey foster bridge top spot connected to left unknown resistor top  */
                left_unknown_resistor_bridge_bottom_spot = new createjs.Shape(); /** Carey foster bridge bottom spot connected to left unknown resistor bottom */
            }
            /** Create circle functions */
            function createShapesForHit() {
                /** Connections from first reesistor to carey foster bridge */
                drawCircle(resistor1_left_spot, "resistor1_left_spot", 193, 385, "black", 15, temp_coef_container, scope); /** First resistor left spot creation */
                drawCircle(bridge_resistor1_left_spot, "bridge_resistor1_left_spot", 265, 482, "black", 15, temp_coef_container, scope); /** Carey foster bridge left spot creation (For first resistor connection) */
                drawCircle(resistor1_right_spot, "resistor1_right_spot", 220, 385, "red", 15, temp_coef_container, scope); /** First resistor right spot creation */
                drawCircle(bridge_resistor1_right_spot, "bridge_resistor1_right_spot", 295, 485, "red", 15, temp_coef_container, scope); /** Carey foster bridge right spot creation (For first resistor connection) */
                /** Connections from second reesistor to carey foster bridge */
                drawCircle(resistor2_left_spot, "resistor2_left_spot", 470, 385, "black", 15, temp_coef_container, scope); /** Second resistor left spot creation */
                drawCircle(bridge_resistor2_left_spot, "bridge_resistor2_left_spot", 417, 482, "black", 15, temp_coef_container, scope); /** Carey foster bridge left spot creation (For second resistor connection) */
                drawCircle(resistor2_right_spot, "resistor2_right_spot", 495, 385, "red", 15, temp_coef_container, scope); /** Second resistor right spot creation */
                drawCircle(bridge_resistor2_right_spot, "bridge_resistor2_right_spot", 450, 482, "red", 15, temp_coef_container, scope); /** Carey foster bridge right spot creation (For second resistor connection) */
                /** Connections from battery to carey foster bridge */
                drawCircle(bridge_battery_left_spot, "bridge_battery_left_spot", 265, 482, "red", 15, temp_coef_container, scope); /** Carey foster bridge left spot creation (For battery connection) */
                drawCircle(battery_left_spot, "battery_left_spot", 325, 335, "red", 15, temp_coef_container, scope); /** Battery left spot creation  */
                drawCircle(bridge_battery_right_spot, "bridge_battery_right_spot", 450, 482, "black", 15, temp_coef_container, scope); /** Carey foster bridge right spot creation (For battery connection) */
                drawCircle(battery_right_spot, "battery_right_spot", 375, 335, "black", 15, temp_coef_container, scope); /** Battery rigth spot creation  */
                /** Connections from galvanometer to carey foster bridge */
                drawCircle(galvanometer_right_spot, "galvanometer_right_spot", 603, 586, "red", 15, temp_coef_container, scope); /** Galvanometer right spot creation for connecting to carey foster bridge */
                drawCircle(galvanometer_bridge_spot, "galvanometer_bridge_spot", 352, 482, "red", 15, temp_coef_container, scope); /** Carey foster bridge center spot creation for connecting to galvanometer  */
                /** Connections from right fractional resistor to carey foster bridge */
                drawCircle(right_fractional_resistor_top_spot, "right_fractional_resistor_top_spot", 610, 465, "red", 15, resistor_container_1, scope); /** Right fractional resistor top spot */
                drawCircle(right_fractional_resistor_bottom_spot, "right_fractional_resistor_bottom_spot", 620, 480, "black", 15, resistor_container_1, scope); /** Right fractional resistor bottom spot */
                drawCircle(right_fractional_resistor_bridge_top_spot, "right_fractional_resistor_bridge_top_spot", 548, 483, "red", 15, resistor_container_1, scope); /** Carey foster bridge top spot connected to right fractional resistor top  */
                drawCircle(right_fractional_resistor_bridge_bottom_spot, "right_fractional_resistor_bridge_bottom_spot", 564, 499, "black", 15, resistor_container_1, scope); /** Carey foster bridge bottom spot connected to right fractional resistor bottom */
                /** Connections from left fractional resistor to carey foster bridge */
                drawCircle(left_fractional_resistor_top_spot, "left_fractional_resistor_top_spot", 97, 468, "red", 15, resistor_container_2, scope); /** Left fractional resistor top spot */
                drawCircle(left_fractional_resistor_bottom_spot, "left_fractional_resistor_bottom_spot", 85, 480, "black", 15, resistor_container_2, scope); /** Left fractional resistor bottom spot */
                drawCircle(left_fractional_resistor_bridge_top_spot, "left_fractional_resistor_bridge_top_spot", 160, 484, "red", 15, resistor_container_2, scope); /** Carey foster bridge top spot connected to left fractional resistor top  */
                drawCircle(left_fractional_resistor_bridge_bottom_spot, "left_fractional_resistor_bridge_bottom_spot", 145, 497, "black", 15, resistor_container_2, scope); /** Carey foster bridge bottom spot connected to left fractional resistor bottom */
                /** Connections from right unknown resistor to carey foster bridge */
                drawCircle(right_unknown_resistor_top_spot, "right_unknown_resistor_top_spot", 630, 400, "black", 15, resistor_container_2, scope); /** Right unknown resistor top spot */
                drawCircle(right_unknown_resistor_bottom_spot, "right_unknown_resistor_bottom_spot", 640, 400, "red", 15, resistor_container_2, scope); /** Right unknown resistor bottom spot */
                drawCircle(right_unknown_resistor_bridge_top_spot, "right_unknown_resistor_bridge_top_spot", 550, 480, "black", 15, resistor_container_2, scope); /** Carey foster bridge top spot connected to right unknown resistor top  */
                drawCircle(right_unknown_resistor_bridge_bottom_spot, "right_unknown_resistor_bridge_bottom_spot", 560, 500, "red", 15, resistor_container_2, scope); /** Carey foster bridge bottom spot connected to right unknown resistor bottom */
                /** Connections from left unknown resistor to carey foster bridge */
                drawCircle(left_unknown_resistor_top_spot, "left_unknown_resistor_top_spot", 70, 408, "black", 15, resistor_container_1, scope); /** Left unknown resistor top spot */
                drawCircle(left_unknown_resistor_bottom_spot, "left_unknown_resistor_bottom_spot", 65, 400, "red", 15, resistor_container_1, scope); /** Left unknown resistor bottom spot */
                drawCircle(left_unknown_resistor_bridge_top_spot, "left_unknown_resistor_bridge_top_spot", 160, 484, "black", 15, resistor_container_1, scope); /** Carey foster bridge top spot connected to left unknown resistor top  */
                drawCircle(left_unknown_resistor_bridge_bottom_spot, "left_unknown_resistor_bridge_bottom_spot", 145, 497, "red", 15, resistor_container_1, scope); /** Carey foster bridge bottom spot connected to left unknown resistor bottom */
            }
            /** Draw shapes for hitting connection wires of the apparatus*/
            function drawCircle(shapeName, name, xPos, yPos, color, radius, container, scope) {
                container.addChild(shapeName);
                shapeName.name = name;
                shapeName.cursor = "pointer";
                shapeName.alpha = 0.01;
                initialX = xPos;
                initialY = yPos;
                shapeName.graphics.setStrokeStyle(2);
                shapeName.graphics.beginFill(color).drawCircle(0, 0, 20);
                shapeName.x = xPos;
                shapeName.y = yPos;
                shapeName.on("mousedown", function(evt) {
                    this.parent.addChild(this);
                    this.offset = {
                        x: this.x - evt.stageX / temperature_coef_resistance_stage.scaleX,
                        y: this.y - evt.stageY / temperature_coef_resistance_stage.scaleY
                    };
                });
                shapeName.on("pressmove", function(evt) {
                    this.x = (evt.stageX / temperature_coef_resistance_stage.scaleX) + this.offset.x;
                    this.y = (evt.stageY / temperature_coef_resistance_stage.scaleY) + this.offset.y;
                    shapeName.x = this.x;
                    shapeName.y = this.y;
                    line.graphics.clear();
                    /** Createjs stage updation happens in every interval */
                    temperature_coef_resistance_stage.update();
                    if (line_flag == false) {
                        line.graphics.moveTo(xPos, yPos).setStrokeStyle(3).beginStroke(color).lineTo(this.x, this.y);
                        container.addChild(line);
                    }
                    shapeName.on("pressup", function(evt) {
                        line.graphics.clear();
                        /** Createjs stage updation happens in every interval */
                        temperature_coef_resistance_stage.update();
                        shapeName.x = xPos;
                        shapeName.y = yPos;
                        if(line_flag==true) {
                            enter_count=0;
                        } 
                        line.graphics.clear();                       
                        line_flag = false; /** Set line flag as false */

                    });
                    shapeName.on("mouseup", function(evt) {
                        shapeName.alpha = 0.5;
                        shapeName.x = xPos;
                        shapeName.y = yPos;
                        line.graphics.clear();
                        line_flag = false;
                        line.graphics.clear();
                    });
                    checkConnection(name, scope,shapeName.x,shapeName.y); /** check hit occur with wires */
                    /** Createjs stage updation happens in every interval */
                    temperature_coef_resistance_stage.update();
                });
            }
            /** check hit between display wires */
            function checkConnection(name, scope, xPos, yPos) {
                switch (name) {
                    /** Check connections from first reesistor left to carey foster bridge */
                    case "resistor1_left_spot":
                        checkHit(temp_coef_container.getChildByName("bridge_resistor1_left_spot"), "resistor1_left_bridge_wire", name, temp_coef_container, scope, xPos, yPos);
                        break;
                        /** Check connections from carey foster bridge to first reesistor left */
                    case "bridge_resistor1_left_spot":
                        checkHit(temp_coef_container.getChildByName("resistor1_left_spot"), "resistor1_left_bridge_wire", name, temp_coef_container, scope,xPos, yPos);
                        break;
                        /** Check connections from first reesistor right to carey foster bridge */
                    case "resistor1_right_spot":
                        checkHit(temp_coef_container.getChildByName("bridge_resistor1_right_spot"), "resistor1_right_bridge_wire", name, temp_coef_container, scope,xPos, yPos);
                        break;
                        /** Check connections from carey foster bridge to first reesistor right */
                    case "bridge_resistor1_right_spot":
                        checkHit(temp_coef_container.getChildByName("resistor1_right_spot"), "resistor1_right_bridge_wire", name, temp_coef_container, scope,xPos, yPos);
                        break;
                        /** Check connections from second reesistor left to carey foster bridge */
                    case "resistor2_left_spot":
                        checkHit(temp_coef_container.getChildByName("bridge_resistor2_left_spot"), "resistor2_left_bridge_wire", name, temp_coef_container, scope,xPos, yPos);
                        break;
                        /** Check connections from carey foster bridge to second reesistor left */
                    case "bridge_resistor2_left_spot":
                        checkHit(temp_coef_container.getChildByName("resistor2_left_spot"), "resistor2_left_bridge_wire", name, temp_coef_container, scope,xPos, yPos);
                        break;
                        /** Check connections from second reesistor right to carey foster bridge */
                    case "resistor2_right_spot":
                        checkHit(temp_coef_container.getChildByName("bridge_resistor2_right_spot"), "resistor2_right_bridge_wire", name, temp_coef_container, scope,xPos, yPos);
                        break;
                        /** Check connections from carey foster bridge to second reesistor right */
                    case "bridge_resistor2_right_spot":
                        checkHit(temp_coef_container.getChildByName("resistor2_right_spot"), "resistor2_right_bridge_wire", name, temp_coef_container, scope,xPos, yPos);
                        break;
                        /** Check connections from carey foster bridge left to battery left */
                    case "bridge_battery_left_spot":
                        checkHit(temp_coef_container.getChildByName("battery_left_spot"), "bridge_battery_left_wire", name, temp_coef_container, scope,xPos, yPos);
                        break;
                        /** Check connections from battery left to carey foster bridge left */
                    case "battery_left_spot":
                        checkHit(temp_coef_container.getChildByName("bridge_battery_left_spot"), "bridge_battery_left_wire", name, temp_coef_container, scope,xPos, yPos);
                        break;
                        /** Check connections from carey foster bridge right to battery right */
                    case "bridge_battery_right_spot":
                        checkHit(temp_coef_container.getChildByName("battery_right_spot"), "bridge_battery_right_wire", name, temp_coef_container, scope,xPos, yPos);
                        break;
                        /** Check connections from battery right to carey foster bridge right */
                    case "battery_right_spot":
                        checkHit(temp_coef_container.getChildByName("bridge_battery_right_spot"), "bridge_battery_right_wire", name, temp_coef_container, scope,xPos, yPos);
                        break;
                        /** Check connections from carey foster bridge center to galvanometer right */
                    case "galvanometer_bridge_spot":
                        checkHit(temp_coef_container.getChildByName("galvanometer_right_spot"), "galvanometer_bridge_wire", name, temp_coef_container, scope,xPos, yPos);
                        break;
                        /** Check connections from galvanometer right to carey foster bridge center */
                    case "galvanometer_right_spot":
                        checkHit(temp_coef_container.getChildByName("galvanometer_bridge_spot"), "galvanometer_bridge_wire", name, temp_coef_container, scope,xPos, yPos);
                        break;
                        /** Check connections from carey foster bridge top to right fractional resistor top */
                    case "right_fractional_resistor_bridge_top_spot":
                        checkHit(resistor_container_1.getChildByName("right_fractional_resistor_top_spot"), "fractional_resistor_bridge_top_wire_right", name, resistor_container_1, scope,xPos, yPos);
                        break;
                        /** Check connections from right fractional resistor top to carey foster bridge top */
                    case "right_fractional_resistor_top_spot":
                        checkHit(resistor_container_1.getChildByName("right_fractional_resistor_bridge_top_spot"), "fractional_resistor_bridge_top_wire_right", name, resistor_container_1, scope,xPos, yPos);
                        break;
                        /** Check connections from carey foster bridge bottom to right fractional resistor bottom */
                    case "right_fractional_resistor_bridge_bottom_spot":
                        checkHit(resistor_container_1.getChildByName("right_fractional_resistor_bottom_spot"), "fractional_resistor_bridge_bottom_wire_right", name, resistor_container_1, scope,xPos, yPos);
                        break;
                        /** Check connections from right fractional resistor bottom to carey foster bridge bottom */
                    case "right_fractional_resistor_bottom_spot":
                        checkHit(resistor_container_1.getChildByName("right_fractional_resistor_bridge_bottom_spot"), "fractional_resistor_bridge_bottom_wire_right", name, resistor_container_1, scope,xPos, yPos);
                        break;
                        /** Check connections from carey foster bridge top to left fractional resistor top */
                    case "left_fractional_resistor_bridge_top_spot":
                        checkHit(resistor_container_2.getChildByName("left_fractional_resistor_top_spot"), "fractional_resistor_bridge_top_wire_left", name, resistor_container_2, scope,xPos, yPos);
                        break;
                        /** Check connections from left fractional resistor top to carey foster bridge top */
                    case "left_fractional_resistor_top_spot":
                        checkHit(resistor_container_2.getChildByName("left_fractional_resistor_bridge_top_spot"), "fractional_resistor_bridge_top_wire_left", name, resistor_container_2, scope,xPos, yPos);
                        break;
                        /** Check connections from carey foster bridge bottom to left fractional resistor bottom */
                    case "left_fractional_resistor_bridge_bottom_spot":
                        checkHit(resistor_container_2.getChildByName("left_fractional_resistor_bottom_spot"), "fractional_resistor_bridge_bottom_wire_left", name, resistor_container_2, scope,xPos, yPos);
                        break;
                        /** Check connections from left fractional resistor bottom to carey foster bridge bottom */
                    case "left_fractional_resistor_bottom_spot":
                        checkHit(resistor_container_2.getChildByName("left_fractional_resistor_bridge_bottom_spot"), "fractional_resistor_bridge_bottom_wire_left", name, resistor_container_2, scope,xPos, yPos);
                        break;
                        /** Check connections from carey foster bridge top to right unknown resistor top */
                    case "right_unknown_resistor_bridge_top_spot":
                        checkHit(resistor_container_2.getChildByName("right_unknown_resistor_top_spot"), "unknown_resistor_bridge_top_wire_right", name, resistor_container_2, scope,xPos, yPos);
                        break;
                        /** Check connections from right unknown resistor top to carey foster bridge top */
                    case "right_unknown_resistor_top_spot":
                        checkHit(resistor_container_2.getChildByName("right_unknown_resistor_bridge_top_spot"), "unknown_resistor_bridge_top_wire_right", name, resistor_container_2, scope,xPos, yPos);
                        break;
                        /** Check connections from carey foster bridge bottom to right unknown resistor bottom */
                    case "right_unknown_resistor_bridge_bottom_spot":
                        checkHit(resistor_container_2.getChildByName("right_unknown_resistor_bottom_spot"), "unknown_resistor_bridge_bottom_wire_right", name, resistor_container_2, scope,xPos, yPos);
                        break;
                        /** Check connections from right unknown resistor bottom to carey foster bridge bottom */
                    case "right_unknown_resistor_bottom_spot":
                        checkHit(resistor_container_2.getChildByName("right_unknown_resistor_bridge_bottom_spot"), "unknown_resistor_bridge_bottom_wire_right", name, resistor_container_2, scope,xPos, yPos);
                        break;
                        /** Check connections from carey foster bridge top to left unknown resistor top */
                    case "left_unknown_resistor_bridge_top_spot":
                        checkHit(resistor_container_1.getChildByName("left_unknown_resistor_top_spot"), "unknown_resistor_bridge_top_wire_left", name, resistor_container_1, scope,xPos, yPos);
                        break;
                        /** Check connections from left unknown resistor top to carey foster bridge top */
                    case "left_unknown_resistor_top_spot":
                        checkHit(resistor_container_1.getChildByName("left_unknown_resistor_bridge_top_spot"), "unknown_resistor_bridge_top_wire_left", name, resistor_container_1, scope,xPos, yPos);
                        break;
                        /** Check connections from carey foster bridge bottom to left unknown resistor bottom */
                    case "left_unknown_resistor_bridge_bottom_spot":
                        checkHit(resistor_container_1.getChildByName("left_unknown_resistor_bottom_spot"), "unknown_resistor_bridge_bottom_wire_left", name, resistor_container_1, scope,xPos, yPos);
                        break;
                        /** Check connections from left unknown resistor bottom to carey foster bridge bottom */
                    case "left_unknown_resistor_bottom_spot":
                        checkHit(resistor_container_1.getChildByName("left_unknown_resistor_bridge_bottom_spot"), "unknown_resistor_bridge_bottom_wire_left", name, resistor_container_1, scope,xPos, yPos);
                        break;
                }
            }
            /** check hit test between circle spots with wired connections */
            function checkHit(spotName, wire, name, container, scope,xPos, yPos) {
                spotName.alpha = 0.01; /** Shows the destination point */ 
                /** Show pointing arrow */
                temperature_coef_resistance_stage.getChildByName("arrow").visible=true;
                temperature_coef_resistance_stage.getChildByName("arrow").x=spotName.x+5;
                temperature_coef_resistance_stage.getChildByName("arrow").y=spotName.y-20;
                var ptL = spotName.globalToLocal(xPos, yPos);                
                if (spotName.hitTest(ptL.x, ptL.y)) {
                    line_flag = true;  
                    enter_count++;                  
                    if(enter_count==1) {
                        wire_num_int++;
                        if(name=="left_unknown_resistor_bridge_bottom_spot" || name=="left_unknown_resistor_bridge_top_spot" || name=="left_unknown_resistor_bottom_spot" || name=="left_unknown_resistor_top_spot" ||  name=="right_unknown_resistor_bridge_bottom_spot" ||  name=="right_unknown_resistor_bridge_top_spot" ||  name=="right_unknown_resistor_bottom_spot" ||  name=="right_unknown_resistor_top_spot"){
                            total_count++;
                        }
                    }  
                                     
                    line.graphics.clear();
                    container.removeChild(line);
                    spotName.alpha = 0.01;
                    temperature_coef_resistance_stage.getChildByName("arrow").visible=false;
                    container.getChildByName(wire).alpha = 1;
                    spotName.mouseEnabled = false;
                    container.getChildByName(name).mouseEnabled = false;
                    connectionCompleteFn(scope); /** Connection complete  */
                } else {

                    releaseHit(spotName, name, container);
                }
            }
            /** Function for releasing the drag for hit */
            function releaseHit(spot, name, container) {
                container.getChildByName(name).on("pressup", function(evt) {
                    spot.alpha = 0.01; 
                    temperature_coef_resistance_stage.getChildByName("arrow").visible=false;
                });
            }
            /** Draw rectangle  */
            function drawRectangle(shapeName, name, xPos, yPos, width, height, color, container, scope, cursorproperty) {
                container.addChild(shapeName);
                shapeName.cursor = cursorproperty;
                shapeName.alpha = 0.01;
                shapeName.name = name;
                shapeName.graphics.setStrokeStyle(2);
                shapeName.graphics.beginFill(color).drawRect(xPos, yPos, width, height);
                shapeName.on("mousedown", function(evt) {
                    dialogBoxShow("back_resistor_click", true, false);
                    scope.$apply();
                    /** Createjs stage updation happens in every interval */
                    temperature_coef_resistance_stage.update();
                });
            }
            /** Add all the strings used for the language translation here. '_' is the short cut for calling the gettext function defined in the gettext-definition.js */
            function translationLabels() {
                /** This help array shows the hints for this experiment */
                helpArray = [_("help1"), _("help2"), _("help3"), _("help4"), _("help5"), _("help6"), _("help7"), _("help8"), _("help9"),_("help10"),_("help11"), _("help12"), _("help13"), _("help14"), _("help15"), _("help16"), _("Next"), _("Close")];
                scope.heading = _("Temperature Coefficient of Resistance"); /** Experiment title */
                scope.variables = _("Variables"); /** Variable label */
                scope.result = _("Result"); /** Result label */
                scope.copyright = _("copyright"); /** Copyright © Amrita University 2009 - 2015 */
                scope.resistor_label = _("Select resistor"); /** 'Select resistor' dropdown label */
                scope.resistor_array = [{resistor_name:_("Known resistor"),indexVal: 0},{ resistor_name:_("Unknown resistor"),indexVal: 1}]; /** 'Select resistor' array */
                scope.resistor_known = _("Known resistor"); /** 'Select resistor' place holder value */
                scope.unknown_resistance = [{unknown_resistor_name:_("Constantan"),indexChange: 0},{ unknown_resistor_name:_("Nichrome"),indexChange: 1}]; /** 'Select resistance' array */
                scope.unknown_resistance1 = _("Constantan"); /** 'Select resistance' place holder value */
                scope.resistance_label = _("Select resistance"); /** 'Select resistance' dropdown label */
                scope.reverse_connection_btn_label = _("Reverse connection"); /** 'Reverse connection' button label */
                scope.resistor_length_label = _("Resistor length(cm):"); /** 'Resistor length' slider label */
                scope.resistor_diameter_label = _("Resistor diameter(mm):"); /** 'Resistor diameter' slider label */
                scope.temperature_label = _("Temperature"); /** 'Temperature' slider label */
                scope.temperature_unit_label = "(°C)"; /** 'Temperature unit' label */
                scope.jockey_position_label = _("Jockey position(cm):"); /** 'Jockey position' slider label */
                scope.show_result = _("Show result"); /** 'Show result' checkbox label */
                scope.resistance_wire_label = _("Resistance of the wire: "); /** 'Resistance of the wire' label */
                scope.select_resistance = _("Select resistance"); /** 'Select resistance'  dialog box label */
                scope.fractional_label = _("Fractional"); /** 'Fractional'  dialog box label */
                scope.small_label = _("Small"); /** 'Small'  dialog box label */
                connection_label= _(": Connection(s) remaining "); /** 'Connections remaining completed' label */
                scope.close_label = _("Close"); /** 'Close'  dialog box label */
                scope.reset = _("Reset"); /** 'Reset' button label */
                scope.$apply();
            }
            /** All the texts loading and added to the stage */
            function setText(name, textX, textY, value, color, fontSize, container) {
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
            function loadImages(image, name, xPos, yPos, cursor, sFactor, alpha, container) {
                var _bitmap = new createjs.Bitmap(image).set({});
                _bitmap.x = xPos;
                _bitmap.y = yPos;
                _bitmap.name = name;
                _bitmap.alpha = alpha;
                _bitmap.scaleX = sFactor;
                if (name == "circuit_diagram_known_left_connection" || name == "circuit_diagram_known_right_connection" || name == "circuit_diagram_unknown_left_connection" || name == "circuit_diagram_unknown_right_connection" ) {
                   _bitmap.scaleY = sFactor; 
                }                
                _bitmap.cursor = cursor;
                container.addChild(_bitmap); /** Adding bitmap to the container */
            }
            /** All variables initialising in this function */
            function initialisationOfVariables() {
                line = new createjs.Shape();
                line_flag = false;
                wire_num_int = 0; /** Wire connection count*/
                boolean_array = [false, true];
                boolean_reverse_array = [true, false];
                resistor_index_array = [1, 0];
                total_connection_array = [9, 11];
                total_wire_connection_array= [9, 11];
                total_wire_connection=total_wire_connection_array[0];
                total_connection = total_connection_array[0];
                back_resistance_checkbox_model_array = ['back_resistance_checked_0_1', 'back_resistance_checked_0_2', 'back_resistance_checked_2_0_2', 'back_resistance_checked_0_5', 'back_resistance_checked_1', 'back_resistance_checked_2', 'back_resistance_checked_2_2', 'back_resistance_checked_5', 'back_resistance_checked_10', 'back_resistance_checked_20', 'back_resistance_checked_2_20', 'back_resistance_checked_50', 'back_resistance_checked_200', 'back_resistance_checked_2_200', 'back_resistance_checked_500', 'back_resistance_checked_1000', 'back_resistance_checked_2000', 'back_resistance_checked_2_2000', 'back_resistance_checked_20000', 'back_resistance_checked_50000'];
                fractional_resistance_checkbox_model_array = ['fractional_resistance_checked_0_1', 'fractional_resistance_checked_0_2', 'fractional_resistance_checked_2_0_2', 'fractional_resistance_checked_0_5', 'fractional_resistance_checked_1', 'fractional_resistance_checked_2', 'fractional_resistance_checked_2_2', 'fractional_resistance_checked_5', 'fractional_resistance_checked_10', 'fractional_resistance_checked_20', 'fractional_resistance_checked_2_20', 'fractional_resistance_checked_50', 'fractional_resistance_checked_200', 'fractional_resistance_checked_2_200', 'fractional_resistance_checked_500', 'fractional_resistance_checked_1000', 'fractional_resistance_checked_2000', 'fractional_resistance_checked_2_2000', 'fractional_resistance_checked_20000', 'fractional_resistance_checked_50000'];
                resistance_total = resistance_back_total = 0.1;
                length_of_wire = 10; /** Length of wire */
                temperature_of_water = 25; /** Temperature of water */
                diameter_of_wire = 0.2; /** Diameter of wire */
                jockey_connect_position = 0; /** Jockey position */
                resistivity = 0.0000005; /** Resistivity  */
                temp_coefficient = 0.002184;/** Temperature coefficient  */
                enter_count=total_count=0;
            }
            /** Set the initial status of the bitmap and text depends on its visibility and initial values */
            function initialisationOfImages() {
                resistor_container_2.alpha = 0;
                resistor_container_2.getChildByName("right_unknown_resistor_top_spot").visible = resistor_container_2.getChildByName("right_unknown_resistor_bottom_spot").visible = resistor_container_2.getChildByName("right_unknown_resistor_bridge_top_spot").visible = resistor_container_2.getChildByName("right_unknown_resistor_bridge_bottom_spot").visible = resistor_container_1.getChildByName("left_unknown_resistor_top_spot").visible = resistor_container_1.getChildByName("left_unknown_resistor_bottom_spot").visible = resistor_container_1.getChildByName("left_unknown_resistor_bridge_top_spot").visible = resistor_container_1.getChildByName("left_unknown_resistor_bridge_bottom_spot").visible = false;
                temp_coef_container.getChildByName("galvanometer_voltage_display").visible = false;
                temperature_coef_resistance_stage.getChildByName("arrow").visible=false;
            }
            /** Checkbox models for fractional */
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
            }
            /** Checkbox models for back side resistance box */
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
                
            }
        }
    }
}
/** Select resistor drop down change */
function selectResistorFn(scope) {
    scope.result_show = boolean_array[scope.resistor_model]; /** Show/Hide result */
    scope.unknown_show= boolean_array[scope.resistor_model]; /** Show/Hide sub compobox */
    /** Unknown/known resistor and circuit diagram visibility */
    resistor_container_2.getChildByName("unknown_resistor_right").alpha = resistor_container_1.getChildByName("unknown_resistor_left").alpha = scope.resistor_model;
    resistor_container_2.getChildByName("copper_strip_right").alpha = resistor_container_1.getChildByName("copper_strip_left").alpha = resistor_index_array[scope.resistor_model];
    resistor_container_2.getChildByName("circuit_diagram_known_left_connection").alpha = resistor_container_1.getChildByName("circuit_diagram_known_right_connection").alpha = resistor_index_array[scope.resistor_model];
    resistor_container_2.getChildByName("circuit_diagram_unknown_right_connection").alpha = resistor_container_1.getChildByName("circuit_diagram_unknown_left_connection").alpha = scope.resistor_model;
    resistor_container_2.getChildByName("right_unknown_resistor_top_spot").visible = resistor_container_2.getChildByName("right_unknown_resistor_bottom_spot").visible = resistor_container_2.getChildByName("right_unknown_resistor_bridge_top_spot").visible = resistor_container_2.getChildByName("right_unknown_resistor_bridge_bottom_spot").visible = resistor_container_1.getChildByName("left_unknown_resistor_top_spot").visible = resistor_container_1.getChildByName("left_unknown_resistor_bottom_spot").visible = resistor_container_1.getChildByName("left_unknown_resistor_bridge_top_spot").visible = resistor_container_1.getChildByName("left_unknown_resistor_bridge_bottom_spot").visible = boolean_array[scope.resistor_model];
    resistor_container_1.getChildByName("unknown_resistor_bridge_top_wire_left").visible = resistor_container_1.getChildByName("unknown_resistor_bridge_bottom_wire_left").visible = resistor_container_2.getChildByName("unknown_resistor_bridge_top_wire_right").visible = resistor_container_2.getChildByName("unknown_resistor_bridge_bottom_wire_right").visible = boolean_array[scope.resistor_model];
    scope.unknown_slider_show = boolean_array[scope.resistor_model]; /** Show length slider, diameter slider and temperature slider */
    total_connection = total_connection_array[scope.resistor_model]; 
    total_wire_connection = total_wire_connection_array[scope.resistor_model];   
    temp_coef_container.getChildByName("galvanometer_voltage_display").visible = false;
    connectionCompleteFn(scope);
    volatageOfGalvanometerCalculation(scope); /** Function to calculate volatage Of galvanometer */
    /** Createjs stage updation happens in every interval */
    temperature_coef_resistance_stage.update();
}
/** Select resistance drop down change */
function selectUnknownResistanceFn(scope) {
    if (scope.resistance_model == 1) { /**  Nichrome */
        resistivity = 0.0000015;
        temp_coefficient = 0.0004;
    } else { /** Constantan */        
        resistivity = 0.0000005;
        temp_coefficient = 0.002184;
    }
    volatageOfGalvanometerCalculation(scope); /** Function to calculate volatage Of galvanometer */
    /** Createjs stage updation happens in every interval */
    temperature_coef_resistance_stage.update();
}
/** Reverse connection button click  */
function reverseConnectionFn(scope) {
    scope.alpha_original++;
    scope.alpha_reverse++;
    /** Sub container change */
    resistor_container_1.alpha = scope.alpha_original % 2;
    resistor_container_2.alpha = scope.alpha_reverse % 2;
    /** Display reverse connected wire from fractional resistor to  carey foster bridge  */
    if (resistor_container_1.getChildByName("fractional_resistor_bridge_top_wire_right").alpha == 1) {
        resistor_container_2.getChildByName("fractional_resistor_bridge_top_wire_left").alpha = 1;
    }
    if (resistor_container_1.getChildByName("fractional_resistor_bridge_bottom_wire_right").alpha == 1) {
        resistor_container_2.getChildByName("fractional_resistor_bridge_bottom_wire_left").alpha = 1;
    }
    if (resistor_container_2.getChildByName("fractional_resistor_bridge_top_wire_left").alpha == 1) {
        resistor_container_1.getChildByName("fractional_resistor_bridge_top_wire_right").alpha = 1;
    }
    if (resistor_container_2.getChildByName("fractional_resistor_bridge_bottom_wire_left").alpha == 1) {
        resistor_container_1.getChildByName("fractional_resistor_bridge_bottom_wire_right").alpha = 1;
    }
    /** Display reverse connected wire from unknown resistor to  carey foster bridge  */
    if (resistor_container_2.getChildByName("unknown_resistor_bridge_top_wire_right").alpha == 1) {
        resistor_container_1.getChildByName("unknown_resistor_bridge_top_wire_left").alpha = 1;
    }
    if (resistor_container_2.getChildByName("unknown_resistor_bridge_bottom_wire_right").alpha == 1) {
        resistor_container_1.getChildByName("unknown_resistor_bridge_bottom_wire_left").alpha = 1;
    }
    if (resistor_container_1.getChildByName("unknown_resistor_bridge_top_wire_left").alpha == 1) {
        resistor_container_2.getChildByName("unknown_resistor_bridge_top_wire_right").alpha = 1;
    }
    if (resistor_container_1.getChildByName("unknown_resistor_bridge_bottom_wire_left").alpha == 1) {
        resistor_container_2.getChildByName("unknown_resistor_bridge_bottom_wire_right").alpha = 1;
    }
    /** Hide line drawing spots on right side of carey foster bridge to fractional resistor*/
    if (resistor_container_1.getChildByName("right_fractional_resistor_bridge_top_spot").mouseEnabled == false) {
        resistor_container_2.getChildByName("left_fractional_resistor_bridge_top_spot").mouseEnabled = false;
    }
    if (resistor_container_1.getChildByName("right_fractional_resistor_bridge_bottom_spot").mouseEnabled == false) {
        resistor_container_2.getChildByName("left_fractional_resistor_bridge_bottom_spot").mouseEnabled = false;
    }
    /** Hide line drawing spots on left side of carey foster bridge to fractional resistor*/
    if (resistor_container_2.getChildByName("left_fractional_resistor_bridge_top_spot").mouseEnabled == false) {
        resistor_container_1.getChildByName("right_fractional_resistor_bridge_top_spot").mouseEnabled = false;
    }
    if (resistor_container_2.getChildByName("left_fractional_resistor_bridge_bottom_spot").mouseEnabled == false) {
        resistor_container_1.getChildByName("right_fractional_resistor_bridge_bottom_spot").mouseEnabled = false;
    }
    /** Hide line drawing spots on right side of fractional resistor */
    if (resistor_container_1.getChildByName("right_fractional_resistor_top_spot").mouseEnabled == false) {
        resistor_container_2.getChildByName("left_fractional_resistor_top_spot").mouseEnabled = false;
    }
    if (resistor_container_1.getChildByName("right_fractional_resistor_bottom_spot").mouseEnabled == false) {
        resistor_container_2.getChildByName("left_fractional_resistor_bottom_spot").mouseEnabled = false;
    }
    /** Hide line drawing spots on left side of fractional resistor */
    if (resistor_container_2.getChildByName("left_fractional_resistor_top_spot").mouseEnabled == false) {
        resistor_container_1.getChildByName("right_fractional_resistor_top_spot").mouseEnabled = false;
    }
    if (resistor_container_2.getChildByName("left_fractional_resistor_bottom_spot").mouseEnabled == false) {
        resistor_container_1.getChildByName("right_fractional_resistor_bottom_spot").mouseEnabled = false;
    }
    /** Hide line drawing spots on right side of carey foster bridge to unknown resistor*/
    if (resistor_container_2.getChildByName("right_unknown_resistor_bridge_top_spot").mouseEnabled == false) {
        resistor_container_1.getChildByName("left_unknown_resistor_bridge_top_spot").mouseEnabled = false;
    }
    if (resistor_container_2.getChildByName("right_unknown_resistor_bridge_bottom_spot").mouseEnabled == false) {
        resistor_container_1.getChildByName("left_unknown_resistor_bridge_bottom_spot").mouseEnabled = false;
    }
    /** Hide line drawing spots on left side of carey foster bridge to unknown resistor*/
    if (resistor_container_1.getChildByName("left_unknown_resistor_bridge_top_spot").mouseEnabled == false) {
        resistor_container_2.getChildByName("right_unknown_resistor_bridge_top_spot").mouseEnabled = false;
    }
    if (resistor_container_1.getChildByName("left_unknown_resistor_bridge_bottom_spot").mouseEnabled == false) {
        resistor_container_2.getChildByName("right_unknown_resistor_bridge_bottom_spot").mouseEnabled = false;
    }
    /** Hide line drawing spots on right side of unkonown resistor */
    if (resistor_container_2.getChildByName("right_unknown_resistor_top_spot").mouseEnabled == false) {
        resistor_container_1.getChildByName("left_unknown_resistor_top_spot").mouseEnabled = false;
    }
    if (resistor_container_2.getChildByName("right_unknown_resistor_bottom_spot").mouseEnabled == false) {
        resistor_container_1.getChildByName("left_unknown_resistor_bottom_spot").mouseEnabled = false;
    }
    /** Hide line drawing spots on left side of unkonown resistor */
    if (resistor_container_1.getChildByName("left_unknown_resistor_top_spot").mouseEnabled == false) {
        resistor_container_2.getChildByName("right_unknown_resistor_top_spot").mouseEnabled = false;
    }
    if (resistor_container_1.getChildByName("left_unknown_resistor_bottom_spot").mouseEnabled == false) {
        resistor_container_2.getChildByName("right_unknown_resistor_bottom_spot").mouseEnabled = false;
    }
    volatageOfGalvanometerCalculation(scope); /** Function to calculate volatage Of galvanometer */
    /** Createjs stage updation happens in every interval */
    temperature_coef_resistance_stage.update();
}
/** Resistor resistor length change */
function resistorLengthChangeFN(scope) {
    length_of_wire = scope.resistor_length_model; /** Length of wire */
    volatageOfGalvanometerCalculation(scope); /** Function to calculate volatage Of galvanometer */
}
/** Resistor resistor diameter change */
function resistorDiameterChangeFN(scope) {
    diameter_of_wire = scope.resistor_diameter_model; /** Diameter of wire */
    volatageOfGalvanometerCalculation(scope); /** Function to calculate volatage Of galvanometer */
}
/** Resistor temperature change */
function temperatureChangeFN(scope) {
    temperature_of_water = scope.temperature_model; /** Temperature of water */
    volatageOfGalvanometerCalculation(scope); /** Function to calculate volatage Of galvanometer */
}
/** Resistor jockey position change */
function jockeyPositionChangeFN(scope) {
    jockey_x_position = scope.jockey_position_model * 3.87 + 156;
    jockey_container.getChildByName("jockey").x = jockey_x_position;
    temp_coef_container.getChildByName("jockey_position_display").x = jockey_x_position;
    jockey_wire.graphics.clear();
    drawJockeyConnection(jockey_x_position + 3, scope);
    volatageOfGalvanometerCalculation(scope); /** Function to calculate volatage Of galvanometer */
    /** Createjs stage updation happens in every interval */
    temperature_coef_resistance_stage.update();
}
/** Drawing wire of jockey to galavanometer */
function drawJockeyConnection(jockey_wire_position, scope) { /** Function call for images used in the apparatus visibility */
    jockey_wire = new createjs.Shape();
    jockey_wire.graphics.moveTo(551, 585).setStrokeStyle(3).beginStroke("#000")
    jockey_wire.graphics.bezierCurveTo(497, 623, 497, 623, 478, 592);
    jockey_wire.graphics.bezierCurveTo(460, 560, 460, 560, 406, 557);
    jockey_wire.graphics.bezierCurveTo(351, 553, 351, 553, 358, 536);
    jockey_wire.graphics.bezierCurveTo(365, 519, 365, 519, jockey_wire_position, 478);
    jockey_connect_position = scope.jockey_position_model;
    temp_coef_container.getChildByName("jockey_position_display").text = scope.jockey_position_model;
    volatageOfGalvanometerCalculation(scope); /** Function to calculate volatage Of galvanometer */
    jockey_container.addChild(jockey_wire);
}
/** Select resistance group from the dialog box  */
function resistanceGroupSelectedFn(scope) {
    scope.fractional_show = scope.small_show = false;
    if (scope.resistance_group == "fractional") { /** Resistance values - Fractional */
        scope.fractional_show = true;
    } else if (scope.resistance_group == "small") { /** Resistance values - Small */
        scope.small_show = true;
    }
}
/** Select resistance from the back side resistance dialog box  */
function checkBackResistanceBoxFn(check_selected, resistance_selected, scope) {
    if (!check_selected) { /** Checkbox checked false*/
        resistance_back_total += resistance_selected;
    } else { /** Checkbox checked true*/
        resistance_back_total -= resistance_selected;
    }
    resistance_back_total = Math.abs(resistance_back_total);    
    temp_coef_container.getChildByName("back_right_resistor_value").text = resistance_back_total.toFixed(1)+" Ω";
    temp_coef_container.getChildByName("back_left_resistor_value").text = resistance_back_total.toFixed(1)+" Ω";
    volatageOfGalvanometerCalculation(scope); /** Function to calculate volatage Of galvanometer */
    /** Createjs stage updation happens in every interval */
    temperature_coef_resistance_stage.update();
};
/** Select resistance from fractional resistance the dialog box  */
function checkFractionalResistanceBoxFn(check_selected, resistance_selected, scope) {
    if (!check_selected) { /** Checkbox checked false*/
        resistance_total += resistance_selected;
    } else { /** Checkbox checked true*/
        resistance_total -= resistance_selected;
    }
    resistance_total = Math.abs(resistance_total);
    resistor_container_1.getChildByName("right_fractional_resistor_value").text = resistance_total.toFixed(1)+" Ω";
    resistor_container_2.getChildByName("left_fractional_resistor_value").text = resistance_total.toFixed(1)+" Ω";
    volatageOfGalvanometerCalculation(scope); /** Function to calculate volatage Of galvanometer */
    /** Createjs stage updation happens in every interval */
    temperature_coef_resistance_stage.update();
};
/** Function to calculate volatage Of galvanometer */
function volatageOfGalvanometerCalculation(scope) {
    var _resistance_R1 = parseFloat(resistance_back_total); /** Resistance taken from resistance box */
    var _resistance_R2 = parseFloat(resistance_back_total); /** Resistance taken from resistance box */
    var _resistance_R3_selected = parseFloat(resistance_total); /** Resistance taken from fractional resistance box */
    var _resistance_R3, _resistance_R4;
    var _supply_voltage = 1.5; /** Voltage supply from external source */
    var _resistance_per_unit_length_wire = 4; /** Resistance per unit length of wire in meter bridge*/
    resistance_of_wire=(resistivity*length_of_wire*Math.pow(10, -2))/(3.14*Math.pow(diameter_of_wire*Math.pow(10, -2)/2,2))*(1+temp_coefficient*temperature_of_water);
    if (scope.resistor_model==1) { // Unknown resistor
        if (resistor_container_2.alpha == 1) { /** Unknown resistor reverse connection */            
            _resistance_R3 = _resistance_per_unit_length_wire * ((jockey_connect_position) * Math.pow(10, -2)) + _resistance_R3_selected;
            _resistance_R4 = _resistance_per_unit_length_wire * ((100 - jockey_connect_position) * Math.pow(10, -2)) + resistance_of_wire;          
        } else { /** Unknown resistor reverse connection */            
            _resistance_R3 = _resistance_per_unit_length_wire * ((jockey_connect_position) * Math.pow(10, -2)) + resistance_of_wire;
            _resistance_R4 = _resistance_per_unit_length_wire * ((100 - jockey_connect_position) * Math.pow(10, -2)) + _resistance_R3_selected;
       }       
    } else { // Known resistor          
        if (resistor_container_1.alpha == 0) { /** Known resistor reverse connection */            
            _resistance_R3 = 0.01 + _resistance_per_unit_length_wire * ((jockey_connect_position) * Math.pow(10, -2));
            _resistance_R4 = _resistance_per_unit_length_wire * ((100 - jockey_connect_position) * Math.pow(10, -2)) + _resistance_R3_selected;
        } else { /** Known resistor reverse connection */            
            _resistance_R3 = _resistance_per_unit_length_wire * ((jockey_connect_position) * Math.pow(10, -2)) + _resistance_R3_selected;
            _resistance_R4 = 0.01 + _resistance_per_unit_length_wire * ((100 - jockey_connect_position) * Math.pow(10, -2));
        }
        _resistance_R3=Math.floor(_resistance_R3*100)/100;
        _resistance_R4=Math.floor(_resistance_R4*100)/100;  
    }
      
    /**convert resistance of wire in  exponential form*/
    scope.resistance_wire_result = resistance_of_wire.toFixed(6);  
    /** 
        VG=(R1/(R1+R2)-R3/(R3+R4))*V;
        Where VG , Where volatage of galvanometer
              R1,R2,R3,R4 , Resistance value for the resistance box                  
    */    
    voltage_of_galvanometer = (_resistance_R1 / (_resistance_R1 + _resistance_R2) - _resistance_R3 / (_resistance_R3 + _resistance_R4)) * _supply_voltage * 100;
    temp_coef_container.getChildByName("galvanometer_voltage_display").text =voltage_of_galvanometer.toFixed(1);    
    /** Createjs stage updation happens in every interval */
    temperature_coef_resistance_stage.update();
}
/** Function for completing connection */
function connectionCompleteFn(scope) {     
    var _total_connection_change=total_wire_connection - wire_num_int;   
    if(scope.resistor_model==0){/** Know resistor selected */
        _total_connection_change=_total_connection_change+total_count;
    }
    temp_coef_container.getChildByName("connection_value_id").text =_total_connection_change;
    if(_total_connection_change<=0){ /** Connection completed : Hide labels*/
        temp_coef_container.getChildByName("connection_value_id").visible=temp_coef_container.getChildByName("connection_label_id").visible=false;
    }else{
        temp_coef_container.getChildByName("connection_value_id").visible=temp_coef_container.getChildByName("connection_label_id").visible=true;
    }
    /** Connection completed : Display galvanometer reading*/
    if((resistor_container_2.getChildByName("fractional_resistor_bridge_bottom_wire_left").alpha == 1 && resistor_container_2.getChildByName("fractional_resistor_bridge_top_wire_left").alpha == 1 ) || ( resistor_container_1.getChildByName("fractional_resistor_bridge_bottom_wire_right").alpha == 1 && resistor_container_1.getChildByName("fractional_resistor_bridge_top_wire_right").alpha == 1)){
        if (wire_num_int >= total_connection) {        
            temp_coef_container.getChildByName("galvanometer_voltage_display").visible = true;
        }
    }
    volatageOfGalvanometerCalculation(scope); /** Function to calculate volatage Of galvanometer */
    /** Createjs stage updation happens in every interval */
    temperature_coef_resistance_stage.update();
}
/** Reset the experiment */
function reset(scope) {
    window.location.reload();
}