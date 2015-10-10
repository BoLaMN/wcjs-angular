'use strict'

angular.module 'wcjs-angular', [
  'wcjs-angular.plugins'
]

.directive 'ptDetail', ->
  restrict: 'E'
  templateUrl: 'webchimera/webchimera.html'
  controller: 'detailCtrl as chimera'

.controller 'detailCtrl', ($scope, playerConfig) ->
  vm = this

  vm.config = playerConfig.config

  $scope.$watch 'chimera.torrent.ready', (readyState) ->
    vm.config.controls = readyState

  return