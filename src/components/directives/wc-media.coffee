'use strict'

angular.module 'wcjs-angular'

.directive 'wcMedia', ($timeout, $sce, WC_STATES, wcjsRenderer) ->
  restrict: 'E'
  require: '^chimerangular'
  template: '<canvas></canvas>'
  link: (scope, elem, attrs, chimera) ->
    chimera.wcjsElement = wcjsRenderer.init elem.find('canvas')[0]
    chimera.addListeners()
    
    onChangeSource = (sources, oldSources) ->
      console.log sources
      if sources.length
        if chimera.currentState != WC_STATES.PLAY
          chimera.currentState = WC_STATES.STOP
        
        chimera.sources = sources
        
        i = 0

        while i < sources.length
          console.log sources[i].file
          chimera.wcjsElement.playlist.add $sce.trustAsResourceUrl sources[i].file
          i++

        $timeout ->
          if chimera.autoPlay
            chimera.play()

        chimera.onVideoReady()
        return

      return

    scope.$watchCollection ->
      chimera.config.sources
    , onChangeSource
