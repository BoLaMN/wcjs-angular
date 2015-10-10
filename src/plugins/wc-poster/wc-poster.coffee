'use strict'

angular.module 'wcjs-angular.plugins'

.directive 'wcPoster', ->
  restrict: 'E'
  require: '^chimerangular'
  scope: { poster: '=?' }
  templateUrl: 'plugins/wc-poster/wc-poster.html'
  link: (scope, elem, attr, chimera) ->
    scope.chimera = chimera
