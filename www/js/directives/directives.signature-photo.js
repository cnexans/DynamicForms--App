directives.directive('signaturePhoto', [ '$ionicModal', function($ionicModal) {
		var canvasPad, signaturePad;
		return {
			/* Only use as <SignaturePad> tag */
			restrict: 'E',

			/* Our template */
			templateUrl: 'templates/directives/signature-photo.html',

			link: function(scope, element, attrs) {

				scope.parentsignature = attrs.parentsignature || ' ';

				$ionicModal.fromTemplateUrl('templates/directives/signature-photo-modal.html', {
					scope: scope,
					animation: 'slide-in-up'
				}).then(function (modal)
				{
					scope.modal = modal;
				});

				scope.openSignPad = function() {

					scope.modal.show();
					canvasPad = document.getElementById("signature-pad");
					scope.resizeCanvas(); // To re size the canvas according to the mobile devices
					signaturePad          = new SignaturePad(canvasPad);
					signaturePad.minWidth = 1;
					signaturePad.maxWidth = 1;
					signaturePad.dotSize  = 3;
					signaturePad.penColor = "rgb(66, 133, 244)";

				};
				scope.closeModal = function() {
					scope.modal.hide();
				};
				//Cleanup the modal when we're done with it!
				scope.$on('$destroy', function() {
					scope.modal.remove();
				});
				// Execute action on hide modal
				scope.$on('modal.hidden', function() {
					// Execute action
				});
				// Execute action on remove modal
				scope.$on('modal.removed', function() {
					// Execute action
				});

				scope.savePSign = function() {
					scope.parentsignature = signaturePad.toDataURL();             
					scope.closeModal();
				};
				scope.clearPSign = function() {
					signaturePad.clear();
				};

				scope.resizeCanvas= function() {
					var ratio        = 1;
					canvasPad.width  = canvasPad.offsetWidth * ratio;
					canvasPad.height = canvasPad.offsetHeight * ratio;

					canvasPad.getContext("2d").scale(ratio, ratio);
				};

			}
		}
	}
]);