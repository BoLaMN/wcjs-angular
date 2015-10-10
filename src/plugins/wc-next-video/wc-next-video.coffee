'use strict'

angular.module 'wcjs-angular.plugins'

.directive 'wcNextVideo', ($timeout) ->
  restrict: 'E'
  require: '^chimerangular'
  templateUrl: 'plugins/wc-next-video/wc-next-video.html'
  scope:
    wcNext: '='
    wcTime: '=?'
  link: (scope, elem, attr, chimera) ->
    max = scope.wcTime or 5000

    current = 0
    currentVideo = 0

    timer = null
    isCompleted = false

    nextVideos = []

    onLoadData = (episodes) ->
      nextVideos = episodes

    count = ->
      current += 10
      
      if current >= max
        $timeout.cancel timer

        chimera.autoPlay = true
        chimera.isCompleted = false

        current = 0
        isCompleted = false

        currentVideo++
        
        if currentVideo is nextVideos.length
          currentVideo = 0
      else
        timer = $timeout(count.bind(this), 10)

    cancelTimer = ->
      $timeout.cancel timer
      
      current = 0
      isCompleted = false

    onComplete = (newVal) ->
      isCompleted = newVal

      if newVal
        timer = $timeout(count.bind(this), 10)

    scope.$watch ->
      chimera.isCompleted
    , onComplete

    scope.$watch 'wcNext', onLoadData

.service 'wcNextVideoService', ($http, $q, $sce) ->
  deferred = $q.defer()

  @loadData = (url) ->
    $http.get(url).then @onLoadData.bind(this), @onLoadError.bind(this)
    deferred.promise

  @onLoadData = (response) ->
    result = []
    i = 0
    l = response.data.length
    
    while i < l
      mediaSources = []
      mi = 0
      ml = response.data[i].length
    
      while mi < ml
        mediaFile = 
          src: $sce.trustAsResourceUrl response.data[i][mi].src
          type: response.data[i][mi].type
        mediaSources.push mediaFile
        mi++
    
      result.push mediaSources
      i++
    
    deferred.resolve result

  @onLoadError = (error) ->
    deferred.reject error

  @