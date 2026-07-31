(function() {
	angular.module('users', ['FBAngular'])
		.controller('userController', [
		'$mdSidenav', '$mdBottomSheet', '$log', '$q', '$scope', '$element', 'Fullscreen', '$mdToast', '$animate',
	userController]);

	/**
	 * Main Controller for the Angular Material Starter App
	 * @param $scope
	 * @param $mdSidenav
	 * @param avatarsService
	 * @constructor
	 */
	function userController($mdSidenav, $mdBottomSheet, $log, $q, $scope, $element, Fullscreen, $mdToast, $animate) {
		$scope.toastPosition = {
			bottom: true,
			top: false,
			left: true,
			right: false
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
				.action(helpArray[10])
				.hideDelay(15000)
				.highlightAction(false)
				.position($scope.getToastPosition());

			var _toast2 = $mdToast.simple() /** Instruction 2 */
			.content(helpArray[1])
				.action(helpArray[10])
				.hideDelay(15000)
				.highlightAction(false)
				.position($scope.getToastPosition());

			var _toast3 = $mdToast.simple() /** Instruction 3 */
			.content(helpArray[2])
				.action(helpArray[10])
				.hideDelay(15000)
				.highlightAction(false)
				.position($scope.getToastPosition());

			var _toast4 = $mdToast.simple() /** Instruction 4 */
			.content(helpArray[3])
				.action(helpArray[10])
				.hideDelay(15000)
				.highlightAction(false)
				.position($scope.getToastPosition());

			var _toast5 = $mdToast.simple() /** Instruction 5 */
			.content(helpArray[4])
				.action(helpArray[10])
				.hideDelay(15000)
				.highlightAction(false)
				.position($scope.getToastPosition());

			var _toast6 = $mdToast.simple() /** Instruction 6 */
			.content(helpArray[5])
				.action(helpArray[10])
				.hideDelay(15000)
				.highlightAction(false)
				.position($scope.getToastPosition());

			var _toast7 = $mdToast.simple() /** Instruction 7 */
			.content(helpArray[6])
				.action(helpArray[10])
				.hideDelay(15000)
				.highlightAction(false)
				.position($scope.getToastPosition());

			var _toast8 = $mdToast.simple() /** Instruction 8 */
			.content(helpArray[7])
				.action(helpArray[10])
				.hideDelay(15000)
				.highlightAction(false)
				.position($scope.getToastPosition());

			var _toast9 = $mdToast.simple() /** Instruction 9 */
			.content(helpArray[8])
				.action(helpArray[10])
				.hideDelay(15000)
				.highlightAction(false)
				.position($scope.getToastPosition());

			var _toast10 = $mdToast.simple() /** Instruction 9 */
			.content(helpArray[9])
				.action(helpArray[11])
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

		$scope.current = 0.5; /** Initial current slider value */
		$scope.current_model = 0.5; /** Initial current  value */
		$scope.molarity = 0.5; /** Initial molarity slider value */
		$scope.susceptibility = 0.5; /** Magnetic Susceptibility value */
		$scope.probe_btn_click = 0; /** Initial probe button click */
		$scope.hide_view = false; /** Hide view  */
		$scope.show_view = true; /** Show view  */
		$scope.hide_result = false; /** Hide result */
		$scope.adjust_microscope_model=-187;/** Microscope top  */
		$scope.adjust_focus_model=-2;/** Blur value  */
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
		/** Function for changing 'Select setup' drop down  */
		$scope.changeSetup = function() {
			$scope.hide_result = false; /** Hide result */
			$scope.result_model = false; /** Hide checkbox */
			changeSetupFn($scope);
		}
		/** Click event function of Insert probe button */
		$scope.insertProbe = function() {
			$scope.probe_btn_click++; /** Probe button click count increases */
			insertRemoveProbe($scope); /** Function defined in experiment.js file */
		}
		/** Change event function of current slider */
		$scope.currentSlider = function() {
			currentSliderFN($scope); /** Function defined in experiment.js file */
		}
		/** Change event function of molarity slider */
		$scope.molaritySlider = function() {
			molaritySliderFN($scope); /** Function defined in experiment.js file */
		}
		/** Change event function of check box Show result */
		$scope.showResult = function() {
			$scope.hide_result = !$scope.hide_result; /** Hide/Show result */
			showresultFN($scope); /** Function defined in experiment.js file */
		}
		/** Click event function of the microscope height adjust to up */
		$scope.adjustMicroscope = function() {
			microscopeTopAdjustment($scope); /** Function defined in experiment.js file */
		}		
		/** Click event function of the microscope focus in*/
		$scope.microscopeFocus = function(val) {
			setFocus($scope); /** Function defined in experiment.js file */
		}		
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