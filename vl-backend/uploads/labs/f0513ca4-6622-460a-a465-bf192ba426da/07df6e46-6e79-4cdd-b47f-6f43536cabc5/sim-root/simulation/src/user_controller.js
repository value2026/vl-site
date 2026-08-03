(function() {
    angular.module('users', ['FBAngular'])
        .controller('UserController', [
        '$mdSidenav', '$mdBottomSheet', '$log', '$q', '$scope', '$element', 'Fullscreen', '$mdToast', '$animate',
    UserController]);

    /**
     * Main Controller for the Angular Material Starter App
     * @param $scope
     * @param $mdSidenav
     * @param avatarsService
     * @constructor
     */
    function UserController($mdSidenav, $mdBottomSheet, $log, $q, $scope, $element, Fullscreen, $mdToast, $animate) {
        $scope.toastPosition = {
            bottom: true,
            top: false,
            left: true,
            right: false
        };
        /** Menu swipe */
        $scope.toggleSidenav = function(ev) {
            $mdSidenav('right').toggle();
        };
        $scope.getToastPosition = function() {
            return Object.keys($scope.toastPosition)
                .filter(function(pos) {
                return $scope.toastPosition[pos];
            })
                .join(' ');
        };
        $scope.showActionToast = function() {
            var _toast1 = $mdToast.simple() /** Instruction 1 */
            .content(helpArray[0])
                .action(helpArray[16])
                .hideDelay(15000)
                .highlightAction(false)
                .position($scope.getToastPosition());

            var _toast2 = $mdToast.simple() /** Instruction 2 */
            .content(helpArray[1])
                .action(helpArray[16])
                .hideDelay(15000)
                .highlightAction(false)
                .position($scope.getToastPosition());

            var _toast3 = $mdToast.simple() /** Instruction 3 */
            .content(helpArray[2])
                .action(helpArray[16])
                .hideDelay(15000)
                .highlightAction(false)
                .position($scope.getToastPosition());

            var _toast4 = $mdToast.simple() /** Instruction 4 */
            .content(helpArray[3])
                .action(helpArray[16])
                .hideDelay(15000)
                .highlightAction(false)
                .position($scope.getToastPosition());

            var _toast5 = $mdToast.simple() /** Instruction 5 */
            .content(helpArray[4])
                .action(helpArray[16])
                .hideDelay(15000)
                .highlightAction(false)
                .position($scope.getToastPosition());

            var _toast6 = $mdToast.simple() /** Instruction 6 */
            .content(helpArray[5])
                .action(helpArray[16])
                .hideDelay(15000)
                .highlightAction(false)
                .position($scope.getToastPosition());

            var _toast7 = $mdToast.simple() /** Instruction 7 */
            .content(helpArray[6])
                .action(helpArray[16])
                .hideDelay(15000)
                .highlightAction(false)
                .position($scope.getToastPosition());

            var _toast8 = $mdToast.simple() /** Instruction 8 */
            .content(helpArray[7])
                .action(helpArray[16])
                .hideDelay(15000)
                .highlightAction(false)
                .position($scope.getToastPosition());

             var _toast9 = $mdToast.simple() /** Instruction 9 */
            .content(helpArray[8])
                .action(helpArray[16])
                .hideDelay(15000)
                .highlightAction(false)
                .position($scope.getToastPosition());

            var _toast10 = $mdToast.simple() /** Instruction 10 */            
            .content(helpArray[9])
                .action(helpArray[16])
                .hideDelay(15000)
                .highlightAction(false)
                .position($scope.getToastPosition());

            var _toast11 = $mdToast.simple() /** Instruction 11 */
            .content(helpArray[10])
                .action(helpArray[16])
                .hideDelay(15000)
                .highlightAction(false)
                .position($scope.getToastPosition());   

            var _toast12 = $mdToast.simple() /** Instruction 12 */
            .content(helpArray[11])
                .action(helpArray[16])
                .hideDelay(15000)
                .highlightAction(false)
                .position($scope.getToastPosition());

            var _toast13 = $mdToast.simple() /** Instruction 13 */
            .content(helpArray[12])
                .action(helpArray[16])
                .hideDelay(15000)
                .highlightAction(false)
                .position($scope.getToastPosition());

            var _toast14 = $mdToast.simple() /** Instruction 14 */
            .content(helpArray[13])
                .action(helpArray[16])
                .hideDelay(15000)
                .highlightAction(false)
                .position($scope.getToastPosition());

            var _toast15 = $mdToast.simple() /** Instruction 15 */
            .content(helpArray[14])
                .action(helpArray[16])
                .hideDelay(15000)
                .highlightAction(false)
                .position($scope.getToastPosition());

            var _toast16 = $mdToast.simple() /** Instruction 16 */
            .content(helpArray[15])
                .action(helpArray[17])
                .hideDelay(15000)
                .highlightAction(false)
                .position($scope.getToastPosition());
   
	$mdToast.show(_toast1).then(function() { /** Instruction 1 */
	 $mdToast.show(_toast2).then(function() { /** Instruction 2 */
	  $mdToast.show(_toast3).then(function() { /** Instruction 3 */
	   $mdToast.show(_toast4).then(function() { /** Instruction 4 */
	    $mdToast.show(_toast5).then(function() { /** Instruction 5 */
	    $mdToast.show(_toast6).then(function() { /** Instruction 6 */
	    $mdToast.show(_toast7).then(function() { /** Instruction 7 */
	    $mdToast.show(_toast8).then(function() { /** Instruction 8 */
	     $mdToast.show(_toast9).then(function() { /** Instruction 9 */
	     $mdToast.show(_toast10).then(function() { /** Instruction 10 */
	      $mdToast.show(_toast11).then(function() { /** Instruction 11 */
	      $mdToast.show(_toast12).then(function() { /** Instruction 12 */
	       $mdToast.show(_toast13).then(function() { /** Instruction 13 */
	        $mdToast.show(_toast14).then(function() { /** Instruction 14*/
	         $mdToast.show(_toast15).then(function() { /** Instruction 15 */
	          $mdToast.show(_toast16).then(function() { /** Instruction 16 */	});
	});
	 });
	  });
	   });
	    });    
	     });
	      });
	       });
	        });
	         });
	          });
	           });
                });
	              });
	               });
	                 };
        var self = this;
        self.selected = null;
        self.users = [];
        self.toggleList = toggleUsersList;
        $scope.jockey_position_model = 0 /** Initial jockey position */
        $scope.resistor_length_model = 10; /** Initial resistor length slider value */
        $scope.resistor_diameter_model = 0.2; /** Initial resistor diameter slider value */
        $scope.temperature_model = 25; /** Initial temperature slider value */
        $scope.unknown_slider_show = false; /** Hide length slider, diameter slider and temperature slider */
        $scope.checkbox_disabled = true; /** Checkbox disabled */
        $scope.disable_option = false; /** Disable false */
        $scope.fractional_resistance_box_show = false; /** Fractional checkbox values hide */
        $scope.resistance_box_show = false; /** Resistance checkbox values hide */
        $scope.result_show = false; /** Hide result */
        $scope.unknown_show= false; /** Hide sub compobox */
        $scope.showValue=true;/** Result toggle */
        $scope.goFullscreen = function() {
            /** Full screen */
            if (Fullscreen.isEnabled()) Fullscreen.cancel();
            else Fullscreen.all();
            /** Set Full screen to a specific element (bad practice) */
            /** Full screen.enable( document.getElementById('img') ) */
        };
        /** SideNav toggle  */
        $scope.toggle = function() {
            $scope.showValue = !$scope.showValue;
            $scope.isActive = !$scope.isActive;
        };
        $scope.toggle1 = function() {
            $scope.showVariables = !$scope.showVariables;
            $scope.isActive1 = !$scope.isActive1;
        };
        /** Function for changing 'Select resistor' drop down  */
        $scope.selectResistor = function() {
            selectResistorFn($scope); /** Function defined in experiment.js file */
        }
        /** Function for changing 'Select resistance' drop down  */
        $scope.selectUnknownResistance = function() {
            selectUnknownResistanceFn($scope); /** Function defined in experiment.js file */
        }
        /** Function for clicking 'Reverse button'  */
        $scope.reverseConnection = function() {
            reverseConnectionFn($scope) /** Function defined in experiment.js file */
        }
        /** Change event function of resistor length slider */
        $scope.resistorLengthChange = function() {
            resistorLengthChangeFN($scope); /** Function defined in experiment.js file */
        }
        /** Change event function of resistor diameter slider */
        $scope.resistorDiameterChange = function() {
            resistorDiameterChangeFN($scope); /** Function defined in experiment.js file */
        }
        /** Change event function of temperature slider */
        $scope.temperatureChange = function() {
            temperatureChangeFN($scope); /** Function defined in experiment.js file */
        }
        /** Change event function of jockey position slider */
        $scope.jockeyPositionChange = function() {
            jockeyPositionChangeFN($scope); /** Function defined in experiment.js file */
        }       
        /** Show dialog box  */
        $scope.hideDialog = function() {
            $scope.dialog_box_show = false;
        };
        /** Select resistance group from the dialog box  */
        $scope.resistanceGroupSelected = function() {
            resistanceGroupSelectedFn($scope) /** Function defined in experiment.js file */
        };
        /** Select resistance from the dialog box  */
        $scope.checkBackResistanceBox = function(check_selected, resistance_selected) {
            checkBackResistanceBoxFn(check_selected, resistance_selected, $scope) /** Function defined in experiment.js file */
        };
        /** Select resistance from the dialog box  */
        $scope.checkFractionalResistanceBox = function(check_selected, resistance_selected) {
            checkFractionalResistanceBoxFn(check_selected, resistance_selected, $scope) /** Function defined in experiment.js file */
        };
        /** Click event function of the Reset button */
        $scope.resetFn = function() {
            reset($scope); /** Function defined in experiment.js file */
        }
        /**
         * First hide the bottom sheet IF visible, then
         * hide or Show the 'left' sideNav area
         */
        function toggleUsersList() {
            $mdSidenav('right').toggle();
        }
    }
})();