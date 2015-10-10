'use strict'

angular.module 'wcjs-angular.plugins.video-info', []

.directive 'wcVideoInfo', ->
  restrict: 'E'
  require: '^chimerangular'
  scope: { torrent: '=?wcVideo', player: '=?wcPlayer'  }
  templateUrl: 'plugins/wc-video-info/wc-video-info.html'
  link: (scope, elem, attr, chimera) ->

    scope.stopPlaying = ->
      chimera.stop()
