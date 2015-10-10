'use strict'

angular.module 'wcjs-angular.plugins'

.directive 'wcCloseButton', ->
  restrict: 'E'
  require: '^chimerangular'
  templateUrl: 'plugins/wc-top-controls/wc-close-button/wc-close-button.html'
  link: (scope, elem, attr, chimera) ->
    scope.onClosePlayer = ->
      chimera.stop()