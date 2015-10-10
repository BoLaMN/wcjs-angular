'use strict'

angular.module 'wcjs-angular.plugins.bottom-controls'

.directive 'wcVolume', (WC_UTILS) ->
  restrict: 'E'
  link: (scope, elem, attr) ->

    scope.onMouseOverVolume = ->
      scope.$evalAsync ->
        scope.volumeVisibility = 'visible'

    scope.onMouseLeaveVolume = ->
      scope.$evalAsync ->
        scope.volumeVisibility = 'hidden'

    scope.volumeVisibility = 'hidden'
    elem.bind 'mouseover', scope.onMouseOverVolume
    elem.bind 'mouseleave', scope.onMouseLeaveVolume
