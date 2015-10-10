'use strict'

angular.module 'wcjs-angular.plugins.top-controls'

.directive 'wcTitle', ->
  restrict: 'E'
  require: '^chimerangular'
  templateUrl: 'plugins/wc-top-controls/wc-title/wc-title.html'
  link: (scope, elem, attr, chimera) ->
    scope.chimera = chimera