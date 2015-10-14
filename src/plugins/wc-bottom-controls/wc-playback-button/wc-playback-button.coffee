'use strict'

angular.module 'wcjs-angular.plugins'

.directive 'wcPlaybackButton', (WC_UTILS, hotkeys) ->
  restrict: 'E'
  require: '^chimerangular'
  templateUrl: 'plugins/wc-bottom-controls/wc-playback-button/wc-playback-button.html'
  link: (scope, elem, attr, chimera) ->
    scope.playback = '1.0'

    playbackOptions = ['.5', '1.0', '1.5', '2.0']

    scope.onClickPlayback = (playrate) ->
      if playrate
        nextPlaybackRate = playbackOptions.indexOf(scope.playback) + playrate
        
        if nextPlaybackRate >= playbackOptions.length
          scope.playback = playbackOptions[0]
        else
          scope.playback = playbackOptions[nextPlaybackRate]
      else scope.playback = '1.0'

      chimera.setPlayback scope.playback

    scope.$watch ->
      chimera.playback

    hotkeys.bindTo scope

      .add 
        combo: "-"
        description: "Slower"
        callback: (event) ->
          event.preventDefault()
          scope.onClickPlayback -1
          return   

      .add 
        combo: "=",
        description: "Normal"
        callback: (event) ->
          event.preventDefault()
          scope.onClickPlayback 0
          return

      .add 
        combo: "+"
        description: "Faster"
        callback: (event) ->
          event.preventDefault()
          scope.onClickPlayback 1
          return        
      
    return