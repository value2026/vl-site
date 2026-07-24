(function(){
    angular
    .module('users',['FBAngular','ui.bootstrap','dialogs.main','pascalprecht.translate'])
    .controller('UserController', [
        '$mdSidenav', '$mdBottomSheet', '$log', '$q','$scope','$element','Fullscreen','$mdToast','$animate','$translate','dialogs',
        UserController
    ])
	.config(['dialogsProvider','$translateProvider',function(dialogsProvider,$translateProvider){
        dialogsProvider.useBackdrop('static');
        dialogsProvider.useEscClose(false);
        dialogsProvider.useCopy(false);
        dialogsProvider.setSize('sm');
        $translateProvider.translations(language,{DIALOGS_ERROR:(_("Error")),DIALOGS_ERROR_MSG:(_("Try again!")),DIALOGS_CLOSE:(_("Okay"))}),$translateProvider.preferredLanguage(language);
    }]);
       
    /**
    * Main Controller for the Angular Material Starter App
    * @param $scope
    * @param $mdSidenav
    * @param avatarsService
    * @constructor
    */
    function UserController( $mdSidenav, $mdBottomSheet, $log, $q,$scope,$element,Fullscreen,$mdToast, $animate, $translate, dialogs) {
		var toast;
        $scope.toastPosition = {
            bottom: true,
            top: false,
            left: true,
            right: false
        };
        $scope.toggleSidenav = function(ev) {
            $mdSidenav('right').toggle();
        };
        $scope.getToastPosition = function() {
            return Object.keys($scope.toastPosition)
            .filter(function(pos) { return $scope.toastPosition[pos]; })
            .join(' ');
        };
        $scope.showActionToast = function() {        
             toast = $mdToast.simple()
            .content(helpArray[0])
            .action(helpArray[13])
            .hideDelay(15000)
            .highlightAction(false)
            .position($scope.getToastPosition());
        
            var toast1 = $mdToast.simple()
            .content(helpArray[1])
            .action(helpArray[13])
            .hideDelay(15000)
            .highlightAction(false)
            .position($scope.getToastPosition());
          
            var toast2 = $mdToast.simple()
            .content(helpArray[2])
            .action(helpArray[13])
            .hideDelay(15000)
            .highlightAction(false)
            .position($scope.getToastPosition());
			
			var toast3 = $mdToast.simple()
            .content(helpArray[3])
            .action(helpArray[13])
            .hideDelay(15000)
            .highlightAction(false)
            .position($scope.getToastPosition());
			
			var toast4 = $mdToast.simple()
            .content(helpArray[4])
            .action(helpArray[13])
            .hideDelay(15000)
            .highlightAction(false)
            .position($scope.getToastPosition());
			
			var toast5 = $mdToast.simple()
            .content(helpArray[5])
            .action(helpArray[13])
            .hideDelay(15000)
            .highlightAction(false)
            .position($scope.getToastPosition());
			
			var toast6 = $mdToast.simple()
            .content(helpArray[6])
            .action(helpArray[13])
            .hideDelay(15000)
            .highlightAction(false)
            .position($scope.getToastPosition());
			
			var toast7 = $mdToast.simple()
            .content(helpArray[7])
            .action(helpArray[13])
            .hideDelay(15000)
            .highlightAction(false)
            .position($scope.getToastPosition());
			
			var toast8 = $mdToast.simple()
            .content(helpArray[8])
            .action(helpArray[13])
            .hideDelay(15000)
            .highlightAction(false)
            .position($scope.getToastPosition());
			
			var toast9 = $mdToast.simple()
            .content(helpArray[9])
            .action(helpArray[13])
            .hideDelay(15000)
            .highlightAction(false)
            .position($scope.getToastPosition());
			
			var toast10 = $mdToast.simple()
            .content(helpArray[10])
            .action(helpArray[13])
            .hideDelay(15000)
            .highlightAction(false)
            .position($scope.getToastPosition());
			
			var toast11 = $mdToast.simple()
            .content(helpArray[11])
            .action(helpArray[13])
            .hideDelay(15000)
            .highlightAction(false)
            .position($scope.getToastPosition());
            
            var toast12 = $mdToast.simple()
            .content(helpArray[12])
            .action(helpArray[14]) 
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
											$mdToast.show(toast8).then(function() {
												$mdToast.show(toast9).then(function() {
													$mdToast.show(toast10).then(function() {
														$mdToast.show(toast11).then(function() {
															$mdToast.show(toast12).then(function() {
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
        self.selected     = null;
        self.users        = [ ];
        self.toggleList   = toggleUsersList;    
		$scope.solute_ctrls_disable = false; /** It hide the the disable property of 'solute' drop down */
		$scope.solute_mass_ctrls_disable = false; /** It hide the the disable property of 'solute mass' slider */
		$scope.solvent_mass_ctrls_disable = false; /** It hide the the disable property of 'solvent mass' slider*/
		$scope.solvent_ctrls_disable = false; /** It hide the the disable property of 'solvent' drop down */
        $scope.goFullscreen = function () {
            /** Full screen */
            if (Fullscreen.isEnabled())
                Fullscreen.cancel();
            else
                Fullscreen.all();
            /** Set Full screen to a specific element (bad practice) */
            /** Full screen.enable( document.getElementById('img') ) */
        };
 
        /** Click event function of the Reset button */
        $scope.resetBtn = function() {
			$mdToast.cancel(toast);
            resetExperiment($scope); /** Function defined in experiment.js file */
        };
		
		/** Click event function of the equipment */
		$scope.focus = function() {
           clickEquipment($scope, dialogs); /** Function defined in experiment.js file */
        }
		
		/** Click event function of the fill liquid button */
		$scope.setSolventMass = function() {
			setSolventMassFn($scope); /** Function defined in experiment.js file */
        };
		
		/** Click event function of the fill liquid button */
		$scope.setSoluteMass = function() {
			setSoluteMassFn($scope); /** Function defined in experiment.js file */
        };

		/** Change event function of solvent drop down */
		$scope.changeSolvent =function(){
			changeSolventFn($scope); /** Function defined in experiment.js file */
        }

		/** Change event function of solute drop down */
		$scope.changeSolute =function(){
			changeSoluteFn($scope);	/** Function defined in experiment.js file */	
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