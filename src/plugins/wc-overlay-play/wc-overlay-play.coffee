'use strict'

angular.module 'wcjs-angular.plugins'

.directive 'wcOverlayPlay', (WC_STATES) ->
  restrict: 'E'
  require: '^chimerangular'
  scope: {}
  templateUrl: 'plugins/wc-overlay-play/wc-overlay-play.html'
  link: (scope, elem, attr, chimera) ->
    scope.chimera = chimera

    scope.onChangeState = (newState) ->
      switch newState
        when WC_STATES.PLAY
          scope.overlayPlayIcon = false
        when WC_STATES.PAUSE
          scope.overlayPlayIcon = true
        when WC_STATES.STOP
          scope.overlayPlayIcon = true

    scope.onClickOverlayPlay = (event) ->
      chimera.playPause()

    scope.overlayPlayIcon = false
    
    scope.$watch ->
      chimera.currentState
    , (newVal, oldVal) ->
      scope.onChangeState newVal
