(function() {
	angular.module('users', ['FBAngular'])
		.controller('UserController', ['$mdSidenav', '$mdBottomSheet', '$log', '$q', '$scope', '$element', 'Fullscreen', '$mdToast', '$animate', '$mdDialog', '$interval', UserController]);

	/**
	 * Main Controller for the Angular Material Starter App
	 * @param $scope
	 * @param $mdSidenav
	 * @param avatarsService
	 * @constructor
	 */
	function UserController($mdSidenav, $mdBottomSheet, $log, $q, $scope, $element, Fullscreen, $mdToast, $animate, $mdDialog, $interval) {
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
			var toast = $mdToast.simple()
				.content(help_array[0])
				.action(help_array[5])
				.hideDelay(15000)
				.highlightAction(false)
				.position($scope.getToastPosition());

			var toast1 = $mdToast.simple()
				.content(help_array[1])
				.action(help_array[5])
				.hideDelay(15000)
				.highlightAction(false)
				.position($scope.getToastPosition());

			var toast2 = $mdToast.simple()
				.content(help_array[2])
				.action(help_array[5])
				.hideDelay(15000)
				.highlightAction(false)
				.position($scope.getToastPosition());
			var toast3 = $mdToast.simple()
				.content(help_array[3])
				.action(help_array[5])
				.hideDelay(15000)
				.highlightAction(false)
				.position($scope.getToastPosition());
			var toast4 = $mdToast.simple()
				.content(help_array[4])
				.action(help_array[6])
				.hideDelay(15000)
				.highlightAction(false)
				.position($scope.getToastPosition());

			$mdToast.show(toast).then(function() {
				$mdToast.show(toast1).then(function() {
					$mdToast.show(toast2).then(function() {
						$mdToast.show(toast3).then(function() {
							$mdToast.show(toast4).then(function() {});
						});
					});
				});
			});
		};

		var self = this,
			j = 0,
			counter = 0;

		self.modes = [];
		self.activated = true;
		self.selected = null;
		self.users = [];
		self.toggleList = toggleUsersList;
		$scope.showValue = false;
		$scope.showVariables = false;
		$scope.isActive = true;
		$scope.isActive1 = true;

		$scope.graph_show = false; /** It hides the graph drawing area */
		$scope.checked = true; /** Show rod checkbox checked true */
		$scope.coils = 2; /** Initial value of the number of coils slider */

		self.toggleActivation = function() {
			if (!self.activated) self.modes = [];
			if (self.activated) j = counter = 0;
		};

		$scope.goFullscreen = function() {
			if (Fullscreen.isEnabled()) Fullscreen.cancel();
			else Fullscreen.all();
		};

		$scope.isFullScreen = false;
		$scope.goFullScreenViaWatcher = function() {
			$scope.isFullScreen = !$scope.isFullScreen;
		};

		/** Select the coil numbers */
		$scope.selectCoils = function() {
			arrangeCoils($scope.coils); /** Function defined in experiment.js file */
		};

		/** Show rod checkbox function */
		$scope.showRod = function() {
			$scope.checked == (false) ? true : false;
			displayRod($scope.checked); /** Function defined in experiment.js file */
		}

		/** 'Show graph' check box function */
		$scope.showGraph = function() {
			displayGraph($scope); /** Function defined in experiment.js file */
		}

		$scope.toggle = function() {
			$scope.showValue = !$scope.showValue;
			$scope.isActive = !$scope.isActive;
		};

		$scope.toggle1 = function() {
			$scope.showVariables = !$scope.showVariables;
			$scope.isActive1 = !$scope.isActive1;
		};

		/** 'Reset' button function */
		$scope.resetExperiment = function() {
			resetExperiment(); /** Function defined in experiment.js file */
		};

		$scope.showConfirm = function(ev) {
			/** Appending dialogue to document.body to cover sidenav in docs app */
			var confirm = $mdDialog.confirm()
			$mdDialog.show({
				template: '',
			});
		};

		// *********************************
		// Internal methods
		// *********************************

		/**
		 * First hide the bottom sheet IF visible, then
		 * hide or Show the 'left' sideNav area
		 */
		function toggleUsersList() {
			$mdSidenav('right').toggle();
		}
	}
})();