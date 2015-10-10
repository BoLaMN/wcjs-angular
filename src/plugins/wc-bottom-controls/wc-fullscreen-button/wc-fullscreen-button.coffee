'use strict'

angular.module 'wcjs-angular.plugins'

.directive 'wcFullscreenButton', ->
  restrict: 'E'
  require: '^chimerangular'
  scope: {}
  templateUrl: 'plugins/wc-bottom-controls/wc-fullscreen-button/wc-fullscreen-button.html'
  link: (scope, elem, attr, chimera) ->

    scope.onChangeFullScreen = (isFullScreen) ->
      if isFullScreen
        scope.fullscreenIcon = 'fullscreen_exit'
      else scope.fullscreenIcon = 'fullscreen'

    scope.onClickFullScreen = ->
      chimera.toggleFullScreen()

    scope.fullscreenIcon = 'fullscreen'

    scope.$watch ->
      chimera.isFullScreen
    , (newVal, oldVal) ->
      if newVal != oldVal
        scope.onChangeFullScreen newVal
