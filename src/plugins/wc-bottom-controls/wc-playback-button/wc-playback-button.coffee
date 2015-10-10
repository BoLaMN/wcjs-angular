'use strict'

angular.module 'wcjs-angular.plugins.bottom-controls'

.directive 'wcPlaybackButton', (WC_UTILS) ->
  restrict: 'E'
  require: '^chimerangular'
  templateUrl: 'plugins/wc-bottom-controls/wc-playback-button/wc-playback-button.html'
  link: (scope, elem, attr, chimera) ->
    scope.playback = '1.0'

    scope.onClickPlayback = ->
      playbackOptions = ['.5', '1.0', '1.5', '2.0']

      nextPlaybackRate = playbackOptions.indexOf(scope.playback) + 1
      
      if nextPlaybackRate >= playbackOptions.length
        scope.playback = playbackOptions[0]
      else
        scope.playback = playbackOptions[nextPlaybackRate]
      
      chimera.setPlayback scope.playback

    scope.$watch ->
      chimera.playback
