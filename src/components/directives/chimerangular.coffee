'use strict'

angular.module 'wcjs-angular'

.directive 'chimerangular', ->
  restrict: 'EA'
  scope:
    wcAutoPlay: '=?'
    wcPlaysInline: '=?'
    wcCuePoints: '=?'
    wcConfig: '=?'
    wcCanPlay: '&'
    wcComplete: '&'
    wcUpdateVolume: '&'
    wcUpdatePlayback: '&'
    wcUpdateTime: '&'
    wcUpdateState: '&'
    wcPlayerReady: '&'
    wcStop: '&'
    wcChangeSource: '&'
    wcError: '&'
  controller: 'wcController'
  controllerAs: 'chimera'
  link: 
    pre: (scope, elem, attr, controller) ->
      controller.chimerangularElement = angular.element elem
