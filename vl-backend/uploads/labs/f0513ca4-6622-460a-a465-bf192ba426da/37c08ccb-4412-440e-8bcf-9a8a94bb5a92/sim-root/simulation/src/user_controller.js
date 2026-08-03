(function(){
  angular
       .module('users',['FBAngular'])
       .controller('userController', [
          '$mdSidenav', '$mdBottomSheet', '$log', '$q','$scope','$element','Fullscreen','$mdToast','$animate','$mdDialog',
          userController,
  
	   ]);
	   
       /**
   * Main Controller for the Angular Material Starter App
   * @param $scope
   * @param $mdSidenav
   * @param avatarsService
   * @constructor
   */
  function userController( $mdSidenav, $mdBottomSheet, $log, $q,$scope,$element,Fullscreen,$mdToast, $animate,$mdDialog) {
	 $scope.toastPosition = {
		bottom: true,
		top: false,
		left: true,
		right: false
  };
  /**menu swipe*/
  $scope.toggleSidenav = function(ev) {
	$mdSidenav('right').toggle();
  };
  $scope.getToastPosition = function() {
    return Object.keys($scope.toastPosition)
      .filter(function(pos) { return $scope.toastPosition[pos]; })
      .join(' ');
  };
 $scope.showActionToast = function() {
	var toast = $mdToast.simple()
		.content(helpArray[0])
		.action(helpArray[9])
		.hideDelay(15000)
		.highlightAction(false)
		.position($scope.getToastPosition());
	var toast1 = $mdToast.simple()
		.content(helpArray[1])
		.action(helpArray[9])
		.hideDelay(15000)
		.highlightAction(false)
		.position($scope.getToastPosition());
	var toast2 = $mdToast.simple()
		.content(helpArray[2])
		.action(helpArray[9])
		.hideDelay(15000)
		.highlightAction(false)
		.position($scope.getToastPosition());
	var toast3 = $mdToast.simple()
		.content(helpArray[3])
		.action(helpArray[9])
		.hideDelay(15000)
		.highlightAction(false)
		.position($scope.getToastPosition());
	var toast4 = $mdToast.simple()
		.content(helpArray[4])
		.action(helpArray[9])
		.hideDelay(15000)
		.highlightAction(false)
		.position($scope.getToastPosition());
	var toast5 = $mdToast.simple()
		.content(helpArray[5])
		.action(helpArray[9])
		.hideDelay(15000)
		.highlightAction(false)
		.position($scope.getToastPosition());
	var toast6 = $mdToast.simple()
		.content(helpArray[6])
		.action(helpArray[9])
		.hideDelay(15000)
		.highlightAction(false)
		.position($scope.getToastPosition());
	var toast7 = $mdToast.simple()
		.content(helpArray[7])
		.action(helpArray[9])
		.hideDelay(15000)
		.highlightAction(false)
		.position($scope.getToastPosition());
	var toast8 = $mdToast.simple()
		.content(helpArray[8])
		.action(helpArray[10])
		.hideDelay(15000)
		.highlightAction(false)
		.position($scope.getToastPosition());
	$mdToast.show(toast).then(function() {
		$mdToast.show(toast1).then(function() {
			$mdToast.show(toast2).then(function() {
				$mdToast.show(toast3).then(function() {
					$mdToast.show(toast4).then(function() {
						$mdToast.show(toast5).then(function() {
							$mdToast.show(toast6).then(function() {
								$mdToast.show(toast7).then(function() {
									$mdToast.show(toast8).then(function() {});
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
    self.selected     = null;
    self.users        = [ ];
    self.toggleList   = toggleUsersList;
	$scope.powerButton=true;/** It disables the power on button */
	$scope.andersonPowrBtn=true;/** It disables the randerson power button */
	$scope.hideControls=true;/** It hides all controls */
	$scope.hideResult=false;/** It hides the show result text*/
	$scope.crodisabled=true;/** It disables the show cro button */
	$scope.control_disable=true;/** disables all sliders used in the experiment */
	$scope.dialog_box_show= false;
	$scope.powerOn_wheatson=true; /** Disables the wheatson power on button */
	$scope.exptMainBtn=true; /** Disables the start button for wheatson bridge and anderson bridge*/
	$scope.ShowHideCRO=true; /** Hides the CRO button */
	$scope.showPowerAnderson=true; /** shows the power button */
	$scope.diameter_control = true; /** Disables the coil dimeter slider  */
	$scope.length_control = true; /** Disables the coil length slider  */
	$scope.hideCroSliders=true; /** Disables the slider needed for cro */
	$scope.showVariablesWheat=false;
	$scope.isActive1=false; /** Toolbar Wheatson's  */
	$scope.isActive2=false; /** Toolbar Anderson's */
	$scope.isActive3=false; /** Toolbar Result */
	
	$scope.goFullscreen = function () {
		// Fullscreen
		if (Fullscreen.isEnabled())
		Fullscreen.cancel();
		else
		Fullscreen.all();
		// Set Fullscreen to a specific element (bad practice)
		// Fullscreen.enable( document.getElementById('img') )
	};
	    $scope.isFullScreen = false;
		$scope.goFullScreenViaWatcher = function() {
		$scope.isFullScreen = !$scope.isFullScreen;
	};
	/** start the experiment */
	 $scope.startInitial = function() {
		 startExperiment($scope);
     }
	/** Change event function of volatge slider */
     $scope.voltageslider = function() {
		 $scope.voltage=$scope.volt;
         voltageSliderFN($scope); /** Function defined in experiment.js file */
     }
	/** Change event function of frequency slider */
     $scope.frequencyslider = function() {
		 $scope.frequency=$scope.freq;
         frequencySliderFN($scope); /** Function defined in experiment.js file */
     }
	/** Change event function of coil length slider */
    $scope.coilLengthslider = function() {
		$scope.coil_length=$scope.coilLen;
        changeLengthCoil($scope); /** Function defined in experiment.js file */
    }
	/** Change event function of coil diameter slider */
    $scope.coilDiamterslider = function() {
		$scope.coil_diameter=$scope.coilDiameter;
        coilDiamterSliderFN($scope); /** Function defined in experiment.js file */
    }
	/** Change event function of variable resistor slider */
    $scope.variableResistorslider = function() {
		$scope.variable_resistance=$scope.varRes;
        variableResistorSliderFN($scope); /** Function defined in experiment.js file */
    }
	/** Change event function of wheatson power button */
	$scope.powerOnWheatson = function () {
		powerOnFn($scope);	
	};
	/** Change event function of Anderson experiment */
	$scope.StartAndersonExp = function () {
		startAndersonExp($scope);	
	};
	/** Change event function of wheatson experiment */
	$scope.StartWheatsonExp = function () {
		StartWheatsonExp($scope);	
	};
	/** Change event function of Anderson power button */
	$scope.initandersonExpPower = function () {
		StartandersonExpPower($scope);	
	};
	/** Change event function of show CRO button */
	$scope.showCroFn = function () {
		showCroFN($scope);	
	};
	/** Show dialog box  */
	$scope.hideDialog = function() {
		$scope.dialog_box_show = false;
	};	
	/** Toolbar event change */
	$scope.toggle = function () {
		$scope.showValue=!$scope.showValue;
		$scope.isActive1 = !$scope.isActive1;
	};
	/** Toolbar event change */
	$scope.toggle2 = function () {
		$scope.showVariables=!$scope.showVariables;
		$scope.isActive3 = !$scope.isActive3;
	};
	/** Toolbar event change */
	$scope.toggle1 = function () {
		$scope.showVariablesWheat=!$scope.showVariablesWheat;
		$scope.isActive2 = !$scope.isActive2;
	};
	/** Select resistance group from the dialog box  */
	$scope.resistanceGroupSelected = function() {
		resistanceGroupSelectedFn($scope) /** Function defined in experiment.js file */
	};
	/** Select resistance from the P resistor dialog box  */
	$scope.checkBackResistanceBox = function(check_selected, resistance_selected) {
		checkBackResistanceBoxFn(check_selected, resistance_selected, $scope) /** Function defined in experiment.js file */
	};
	/** Select resistance from the Q resistor dialog box  */
	$scope.checkFractionalResistanceBox = function(check_selected, resistance_selected) {
		checkFractionalResistanceBoxFn(check_selected, resistance_selected, $scope) /** Function defined in experiment.js file */
	};
	/** Select resistance from the S resistor dialog box  */
	$scope.checkResistanceBoxS = function(check_selected, resistance_selected) {
		checkSResistanceBoxFn(check_selected, resistance_selected, $scope) /** Function defined in experiment.js file */
	};
	/** Select resistance from the R resistor dialog box  */
	$scope.checkResistanceBoxR = function(check_selected, resistance_selected) {
		checkRResistanceBoxFn(check_selected, resistance_selected, $scope) /** Function defined in experiment.js file */
	};
	/**'Reset' button function*/
	$scope.resetExperiment= function(){
		$scope.initialBtn=false;		
		resetExperiment();
	};
	// *********************************
	// Internal methods
	// *********************************
	/**
	* First hide the bottomsheet IF visible, then
	* hide or Show the 'left' sideNav area
	*/
	function toggleUsersList() {
	$mdSidenav('right').toggle();
	}
	}
})();