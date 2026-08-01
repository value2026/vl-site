(function(){
    angular
    .module('users',['FBAngular'])
    .controller('UserController', [
        '$mdSidenav', '$mdBottomSheet', '$log', '$q','$scope','$element','Fullscreen','$mdToast','$animate',
        UserController
    ]);
	   
    /**
    * Main Controller for the Angular Material Starter App
    * @param $scope
    * @param $mdSidenav
    * @param avatarsService
    * @constructor
    */
    function UserController( $mdSidenav, $mdBottomSheet, $log, $q,$scope,$element,Fullscreen,$mdToast, $animate) {
	    $scope.toastPosition = {
            bottom: true,
            top: false,
            left: true,
            right: false
        };
        $scope.getToastPosition = function() {
            return Object.keys($scope.toastPosition)
            .filter(function(pos) { return $scope.toastPosition[pos]; })
            .join(' ');
        };
        $scope.showActionToast = function() {        
            var toast = $mdToast.simple()
            .content(help_array[0])
            .action(help_array[7])
            .hideDelay(15000)
            .highlightAction(false)
            .position($scope.getToastPosition());
        
            var toast1 = $mdToast.simple()
            .content(help_array[1])
            .action(help_array[7])
            .hideDelay(15000)
            .highlightAction(false)
            .position($scope.getToastPosition());
		  
            var toast2 = $mdToast.simple()
            .content(help_array[2])
            .action(help_array[8])
            .hideDelay(15000)
            .highlightAction(false)
            .position($scope.getToastPosition());
            
            var toast3 = $mdToast.simple()
            .content(help_array[3])
            .action(help_array[7])
            .hideDelay(15000)
            .highlightAction(false)
            .position($scope.getToastPosition());
            
            var toast4 = $mdToast.simple()
            .content(help_array[4])
            .action(help_array[7])
            .hideDelay(15000)
            .highlightAction(false)
            .position($scope.getToastPosition());
            

            var toast5 = $mdToast.simple()
            .content(help_array[5])
            .action(help_array[7])
            .hideDelay(15000)
            .highlightAction(false)
            .position($scope.getToastPosition());

            var toast6 = $mdToast.simple()
            .content(help_array[6])
            .action(help_array[7])
            .hideDelay(15000)
            .highlightAction(false)
            .position($scope.getToastPosition());

            var toast7 = $mdToast.simple()
            .content(help_array[9])
            .action(help_array[7])
            .hideDelay(15000)
            .highlightAction(false)
            .position($scope.getToastPosition());

            var toast8 = $mdToast.simple()
            .content(help_array[10])
            .action(help_array[7])
            .hideDelay(15000)
            .highlightAction(false)
            .position($scope.getToastPosition());

            var toast9 = $mdToast.simple()
            .content(help_array[11])
            .action(help_array[7])
            .hideDelay(15000)
            .highlightAction(false)
            .position($scope.getToastPosition());

            var toast10 = $mdToast.simple()
            .content(help_array[12])
            .action(help_array[8])
            .hideDelay(15000)
            .highlightAction(false)
            .position($scope.getToastPosition());

            if(!initial_adj_flag){
                $mdToast.show(toast).then(function() {
                    $mdToast.show(toast1).then(function() {
                        $mdToast.show(toast2).then(function() {
            
    			  		});
    			  	});
                });
            }else{
                $mdToast.show(toast3).then(function() {
                    $mdToast.show(toast4).then(function() {
                        $mdToast.show(toast5).then(function() {
                            $mdToast.show(toast6).then(function() {
                                $mdToast.show(toast7).then(function() {
                                    $mdToast.show(toast8).then(function() {
                                        $mdToast.show(toast9).then(function() {
                                            $mdToast.show(toast10).then(function() {
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            }		
        };
  
        var self = this;
        self.selected     = null;
        self.users        = [ ];
        self.toggleList   = toggleUsersList;

        $scope.mass_disable = false;
        $scope.length_disable = false;
        $scope.breadth_disable = false;
        $scope.vibration_ctrls_show = true;
        $scope.deflction_ctrls_show = false;
        $scope.rotate_angle  = 0 ;
        $scope.rotateAngle = 0;
        $scope.magnet_distance = 7;
        $scope.showValue = true; /** It hides the 'Result' tab */
        $scope.showVariables = false; /** I hides the 'Variables' tab */
        $scope.isActive = true;
        $scope.isActive1 = true;
        $scope.initial_adj_disable=false; /** It enables the Initial adjustment button */
        $scope.rotate_magnetometer_disable=false; /** It enables the rotate compass slider */
        $scope.hide_show_sliders=false; /** It hides the sliders rotate compass box and rotate apparatus */
        $scope.hide_show_zoom=false; /** It hides the Zoom compass button */
        $scope.magnet_mass=30; /** Initial mass of slider value */
        $scope.magnet_length=3; /** Initial length slider value */
        $scope.magnet_breadth=1; /** Initial compass box position slider value */
        $scope.magnetic_field_value=0; /** Initial magnetic field result value */
        $scope.compassPosition=0; /** Put the compass box position slider value as 0 */
        $scope.zoomPercentage = 0;
        $scope.magnet_distance_disable = true;
        $scope.initial_adj_disable = true;
        
		
        $scope.goFullscreen = function () {
            /** Full screen */
            if (Fullscreen.isEnabled())
                Fullscreen.cancel();
            else
                Fullscreen.all();
            /** Set Full screen to a specific element (bad practice) */
            /** Full screen.enable( document.getElementById('img') ) */
        };
        
        $scope.toggle = function () {
            $scope.showValue=!$scope.showValue;
            $scope.isActive = !$scope.isActive;
        };
	
        $scope.toggle1 = function () {
            $scope.showVariables=!$scope.showVariables;
            $scope.isActive1 = !$scope.isActive1;
        };
        /** Function for changing the drop down list */
        $scope.changePosition = function(){
            pos_index=$scope.magnetoPosition /** Index value of the drop down box array */
            changePositionFN($scope); /** Function defined in experiment.js file */
        }
        /** The click event function of Initial adjustment button */
        $scope.setExperiment = function() {            
            initialAdjustment($scope); /** Function defined in experiment.js file */
            initialisationOfControls($scope);
        }
        /** The click event function of Zoom compass button */
        $scope.zoomView = function() {
            objectZoom($scope); /** Function defined in experiment.js file */
        }
         /** Change event function of Length slider */
        $scope.massSlider = function() {
            massSliderFN($scope); /** Function defined in experiment.js file */
        }
        /** Change event function of Length slider */
        $scope.lengthSlider = function() {
            lengthSliderFN($scope); /** Function defined in experiment.js file */
        }
        /** Change event function of breadth slider */
        $scope.breadthSlider = function() {
            breadthSliderFN($scope); /** Function defined in experiment.js file */
        }
        /** Change event function of Adjust rheostat slider */
        $scope.placeMagnet = function() {
            calculateTime($scope) /** Function which calculate time taken for ten oscilation */
            placeMagnetFN($scope); /** Function defined in experiment.js file */
            
        }
        $scope.placeDeflectionMagnet = function() {
            rotateMagnetometerFN($scope);
            placeDeflectionMagnetFN($scope); /** Function defined in experiment.js file */
          //  calculateTime($scope) /** Function which calculate time taken for ten oscilation */
        }
        /** Change event function of Rotate magnetometer slider */
        $scope.rotateMagnetometer = function() {
            rotateMagnetometerFN($scope); /** Function defined in experiment.js file */
        }
        /** Change adjust the distance of magnet slider */
        $scope.setMagnetDistance = function() {
            setMagnetDistanceFN($scope); /** Function defined in experiment.js file */
        }
        /** Reverse the magnet */
        $scope.reverseMagnet = function() {
            reverseMagnetFN($scope); /** Function defined in experiment.js file */
        }
        /** Click event function of Reverse current button */
        $scope.changeSideOfMagnetometer = function() {
            side_index=$scope.side_A_B;
            changePositionFN($scope);
            /**changeSideOfMagnetometerFN($scope);  Function defined in experiment.js file */
        }
        /** Change event function of the check box Show result */
        $scope.showResult = function() {
            showresultFN($scope); /** Function defined in experiment.js file */
        }
        /** Click event function of the Reset button */
        $scope.resetBtn = function() {
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