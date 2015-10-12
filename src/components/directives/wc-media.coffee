'use strict'

angular.module 'wcjs-angular'

.directive 'wcMedia', ($timeout, $sce, WC_STATES, wcjsRenderer) ->
  restrict: 'E'
  require: '^chimerangular'
  template: '<canvas></canvas>'
  scope:
    wcSrc: '=?'
  link: (scope, elem, attrs, chimera) ->
    chimera.wcjsElement = wcjsRenderer.init elem.find('canvas')[0]
    chimera.sources = scope.wcSrc

    chimera.addListeners()
    
    onChangeSource = (sources, oldSources) ->
      if sources and sources != oldSource
        
        if chimera.currentState != WC_STATES.PLAY
          chimera.currentState = WC_STATES.STOP
        
        chimera.sources = sources

        while i < sources.length
          chimera.wcjsElement.playlist.add $sce.trustAsResourceUrl sources[i].url
          i++

        $timeout ->
          if chimera.autoPlay
            chimera.play()

          chimera.onVideoReady()
          return

      return

    scope.$watch 'wcSrc', onChangeSource
    
    scope.$watch ->
      chimera.sources
    , onChangeSource
