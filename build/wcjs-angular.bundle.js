'use strict';
angular.module('wcjs-angular', ['wcjs-angular.plugins']);

'use strict';

angular.module('wcjs-angular').constant('WC_STATES', {
  PLAY: 'play',
  PAUSE: 'pause',
  STOP: 'stop'
}).constant('WC_VOLUME_KEY', 'chimerangularVolume').constant('WC_FULLSCREEN_APIS', {
  w3: {
    enabled: 'fullscreenEnabled',
    element: 'fullscreenElement',
    request: 'requestFullscreen',
    exit: 'exitFullscreen',
    onchange: 'fullscreenchange',
    onerror: 'fullscreenerror'
  },
  newWebkit: {
    enabled: 'webkitFullscreenEnabled',
    element: 'webkitFullscreenElement',
    request: 'webkitRequestFullscreen',
    exit: 'webkitExitFullscreen',
    onchange: 'webkitfullscreenchange',
    onerror: 'webkitfullscreenerror'
  },
  oldWebkit: {
    enabled: 'webkitIsFullScreen',
    element: 'webkitCurrentFullScreenElement',
    request: 'webkitRequestFullScreen',
    exit: 'webkitCancelFullScreen',
    onchange: 'webkitfullscreenchange',
    onerror: 'webkitfullscreenerror'
  },
  moz: {
    enabled: 'mozFullScreen',
    element: 'mozFullScreenElement',
    request: 'mozRequestFullScreen',
    exit: 'mozCancelFullScreen',
    onchange: 'mozfullscreenchange',
    onerror: 'mozfullscreenerror'
  },
  ios: {
    enabled: 'webkitFullscreenEnabled',
    element: 'webkitFullscreenElement',
    request: 'webkitEnterFullscreen',
    exit: 'webkitExitFullscreen',
    onchange: 'webkitfullscreenchange',
    onerror: 'webkitfullscreenerror'
  },
  ms: {
    enabled: 'msFullscreenEnabled',
    element: 'msFullscreenElement',
    request: 'msRequestFullscreen',
    exit: 'msExitFullscreen',
    onchange: 'MSFullscreenChange',
    onerror: 'MSFullscreenError'
  }
}).constant('defaultPlayerConfig', {
  controls: false,
  loop: false,
  autoPlay: true,
  autoHide: true,
  autoHideTime: 3000,
  preload: 'auto',
  sources: null,
  tracks: [],
  poster: null
}).factory('playerConfig', ["defaultPlayerConfig", function(defaultPlayerConfig) {
  return {
    config: angular.copy(defaultPlayerConfig),
    reset: function() {
      return this.config = angular.copy(defaultPlayerConfig);
    },
    merge: function(config) {
      return this.config = angular.merge(this.config, config);
    }
  };
}]);

'use strict';

angular.module('wcjs-angular').controller('wcController', ["$scope", "$window", "wcFullscreen", "wcjsRenderer", "WC_UTILS", "WC_STATES", "WC_VOLUME_KEY", function($scope, $window, wcFullscreen, wcjsRenderer, WC_UTILS, WC_STATES, WC_VOLUME_KEY) {
  var isFullScreenPressed, isMetaDataLoaded;
  isFullScreenPressed = false;
  isMetaDataLoaded = false;
  this.chimerangularElement = null;
  this.clearMedia = function() {
    wcjsRenderer.clearCanvas();
  };
  this.onCanPlay = function() {
    this.isBuffering = false;
    return $scope.$apply($scope.wcCanPlay());
  };
  this.onVideoReady = function() {
    this.isReady = true;
    this.autoPlay = $scope.wcAutoPlay;
    this.playsInline = $scope.wcPlaysInline;
    this.cuePoints = $scope.wcCuePoints;
    this.currentState = WC_STATES.STOP;
    isMetaDataLoaded = true;
    if (WC_UTILS.supportsLocalStorage()) {
      this.setVolume($window.localStorage.getItem(WC_VOLUME_KEY) || '99');
    }
    if ($scope.wcConfig) {
      this.onLoadConfig($scope.wcConfig);
    }
    return $scope.$apply();
  };
  this.onLoadConfig = function(config) {
    this.config = config;
    $scope.wcAutoPlay = this.config.autoPlay;
    $scope.wcPlaysInline = this.config.playsInline;
    $scope.wcCuePoints = this.config.cuePoints;
    return $scope.wcPlayerReady({
      $chimera: this
    });
  };
  this.onLoadMetaData = function(evt) {
    this.isBuffering = false;
    this.onUpdateTime(evt);
  };
  this.onUpdateTime = function(time) {
    this.currentTime = time;
    if (this.wcjsElement.length !== 0) {
      this.totalTime = this.wcjsElement.length;
      this.timeLeft = this.wcjsElement.length - time;
      this.isLive = false;
    } else {
      this.isLive = true;
    }
    if (this.cuePoints) {
      this.checkCuePoints(time);
    }
    $scope.wcUpdateTime({
      $currentTime: time,
      $duration: this.wcjsElement.length
    });
    return $scope.$apply();
  };
  this.checkCuePoints = function(currentTime) {
    var cp, i, l, tl;
    for (tl in this.cuePoints) {
      i = 0;
      l = this.cuePoints[tl].length;
      while (i < l) {
        cp = this.cuePoints[tl][i];
        if (!cp.timeLapse.end) {
          cp.timeLapse.end = cp.timeLapse.start + 1;
        }
        if (currentTime < cp.timeLapse.end) {
          cp.$$isCompleted = false;
        }
        if (currentTime > cp.timeLapse.start) {
          cp.$$isDirty = true;
          if (currentTime < cp.timeLapse.end) {
            if (cp.onUpdate) {
              cp.onUpdate(currentTime, cp.timeLapse, cp.params);
            }
          }
          if (currentTime >= cp.timeLapse.end) {
            if (cp.onComplete && !cp.$$isCompleted) {
              cp.$$isCompleted = true;
              cp.onComplete(currentTime, cp.timeLapse, cp.params);
            }
          }
        } else {
          if (cp.onLeave && cp.$$isDirty) {
            cp.onLeave(currentTime, cp.timeLapse, cp.params);
          }
          cp.$$isDirty = false;
        }
        i++;
      }
    }
  };
  this.getState = function() {
    switch (this.wcjsElement.state) {
      case 0:
        return 'idle';
      case 1:
        return 'opening';
      case 2:
        return 'buffering';
      case 3:
        return 'playing';
      case 4:
        return 'paused';
      case 5:
        return 'stopping';
      case 6:
        return 'ended';
      case 7:
        return 'error';
    }
  };
  this.onPlay = function() {
    this.setState(WC_STATES.PLAY);
    $scope.$apply();
  };
  this.onPause = function() {
    if (this.wcjsElement.time === 0) {
      this.setState(WC_STATES.STOP);
    } else {
      this.setState(WC_STATES.PAUSE);
    }
    $scope.$apply();
  };
  this.onVolumeChange = function() {
    this.volume = this.wcjsElement.volume / 100;
    $scope.$apply();
  };
  this.onPlaybackChange = function() {
    this.playback = this.wcjsElement.playbackRate;
    $scope.$apply();
  };
  this.seekTime = function(value, byPercent) {
    var second;
    if (byPercent) {
      second = value * this.wcjsElement.length / 100;
      this.wcjsElement.time = Math.round(1000 * value);
    } else {
      this.wcjsElement.time = Math.round(1000 * value);
    }
    this.currentTime = value;
  };
  this.playPause = function() {
    if (this.getState() === 'paused') {
      this.play();
    } else {
      this.pause();
    }
  };
  this.setState = function(newState) {
    if (newState && newState !== this.currentState) {
      $scope.wcUpdateState({
        $state: newState
      });
      this.currentState = newState;
    }
    return this.currentState;
  };
  this.play = function() {
    this.wcjsElement.play();
    this.setState(WC_STATES.PLAY);
  };
  this.pause = function() {
    this.wcjsElement.pause();
    this.setState(WC_STATES.PAUSE);
  };
  this.stop = function() {
    if (this.wcjsElement) {
      this.wcjsElement.stop();
      this.wcjsElement.playlist.clear();
    }
    this.clearMedia();
    this.currentTime = 0;
    this.setState(WC_STATES.STOP);
    this.onStop();
  };
  this.toggleFullScreen = function() {
    if (!wcFullscreen.isAvailable || $scope.wcPlaysInline) {
      if (this.isFullScreen) {
        this.chimerangularElement.removeClass('fullscreen');
        this.chimerangularElement.css('z-index', 'auto');
      } else {
        this.chimerangularElement.addClass('fullscreen');
        this.chimerangularElement.css('z-index', WC_UTILS.getZIndex());
      }
      this.isFullScreen = !this.isFullScreen;
    } else {
      if (this.isFullScreen) {
        wcFullscreen.exit();
      } else {
        this.enterElementInFullScreen(this.chimerangularElement[0]);
      }
    }
  };
  this.enterElementInFullScreen = function(element) {
    wcFullscreen.request(element);
  };
  this.changeSource = function(newValue) {
    $scope.wcChangeSource({
      $source: newValue
    });
  };
  this.setVolume = function(newVolume) {
    var volume;
    volume = Math.min(Math.max(0, newVolume), 1);
    $scope.wcUpdateVolume({
      $volume: volume
    });
    this.wcjsElement.volume = volume * 100;
    this.volume = volume;
    if (WC_UTILS.supportsLocalStorage()) {
      $window.localStorage.setItem(WC_VOLUME_KEY, volume.toString());
    }
  };
  this.setPlayback = function(newPlayback) {
    $scope.wcUpdatePlayback({
      $playBack: newPlayback
    });
    this.wcjsElement.input.rate = parseFloat(newPlayback);
    this.playback = newPlayback;
  };
  this.onStartBuffering = function(buffer) {
    if (buffer === 100) {
      this.onCanPlay();
    } else {
      this.isBuffering = true;
    }
    $scope.$apply();
  };
  this.onStartPlaying = function(event) {
    this.isBuffering = false;
    $scope.$apply();
  };
  this.onComplete = function(event) {
    $scope.wcComplete();
    this.setState(WC_STATES.STOP);
    this.isCompleted = true;
    $scope.$apply();
  };
  this.onVideoError = function(event) {
    $scope.wcError({
      $event: event
    });
  };
  this.onStop = function(event) {
    $scope.wcStop({
      $event: event
    });
  };
  this.onMessage = function(event, message) {};
  this.registerEvent = function(event) {
    return this.wcjsElement['on' + event] = function(message) {
      return console.log(event, message);
    };
  };
  this.addListeners = function() {
    this.wcjsElement.onBuffering = this.onStartBuffering.bind(this);
    this.wcjsElement.onPlaying = this.onPlay.bind(this);
    this.wcjsElement.onPaused = this.onPause.bind(this);
    this.wcjsElement.onEncounteredError = this.onVideoError.bind(this);
    this.wcjsElement.onEndReached = this.onComplete.bind(this);
    this.wcjsElement.onTimeChanged = this.onUpdateTime.bind(this);
    this.wcjsElement.onLengthChanged = this.onStartPlaying.bind(this);
  };
  this.init = function() {
    this.isReady = false;
    this.isCompleted = false;
    this.currentTime = 0;
    this.totalTime = 0;
    this.timeLeft = 0;
    this.isLive = false;
    this.isFullScreen = false;
    this.isConfig = $scope.wcConfig !== void 0;
    if (wcFullscreen.isAvailable) {
      this.isFullScreen = wcFullscreen.isFullScreen();
    }
    this.addBindings();
    if (wcFullscreen.isAvailable) {
      document.addEventListener(wcFullscreen.onchange, this.onFullScreenChange.bind(this));
    }
  };
  this.onUpdateAutoPlay = function(newValue) {
    if (newValue && !this.autoPlay) {
      this.autoPlay = newValue;
      this.play(this);
    }
  };
  this.onUpdatePlaysInline = function(newValue) {
    this.playsInline = newValue;
  };
  this.onUpdateCuePoints = function(newValue) {
    this.cuePoints = newValue;
    this.checkCuePoints(this.currentTime);
  };
  this.addBindings = function() {
    $scope.$watch('wcConfig', this.onLoadConfig.bind(this));
    $scope.$watch('wcAutoPlay', this.onUpdateAutoPlay.bind(this));
    $scope.$watch('wcPlaysInline', this.onUpdatePlaysInline.bind(this));
    $scope.$watch('wcCuePoints', this.onUpdateCuePoints.bind(this));
  };
  this.onFullScreenChange = function(event) {
    this.isFullScreen = wcFullscreen.isFullScreen();
    $scope.$apply();
  };
  $scope.$on('$destroy', this.clearMedia.bind(this));
  $scope.$on('$routeChangeStart', this.clearMedia.bind(this));
  this.init();
}]);

'use strict';

angular.module('wcjs-angular').directive('chimerangular', function() {
  return {
    restrict: 'EA',
    scope: {
      wcAutoPlay: '=?',
      wcPlaysInline: '=?',
      wcCuePoints: '=?',
      wcConfig: '=?',
      wcCanPlay: '&',
      wcComplete: '&',
      wcUpdateVolume: '&',
      wcUpdatePlayback: '&',
      wcUpdateTime: '&',
      wcUpdateState: '&',
      wcPlayerReady: '&',
      wcStop: '&',
      wcChangeSource: '&',
      wcError: '&'
    },
    controller: 'wcController',
    controllerAs: 'chimera',
    link: {
      pre: function(scope, elem, attr, controller) {
        return controller.chimerangularElement = angular.element(elem);
      }
    }
  };
});

'use strict';

angular.module('wcjs-angular').directive('wcLoop', function() {
  return {
    restrict: 'A',
    require: '^chimerangular',
    link: {
      pre: function(scope, elem, attr, chimera) {
        var lp;
        lp = void 0;
        scope.setLoop = function(value) {
          return angular.noop();
        };
        if (chimera.isConfig) {
          return scope.$watch(function() {
            return chimera.config;
          }, function() {
            if (chimera.config) {
              return scope.setLoop(chimera.config.loop);
            }
          });
        } else {
          return scope.$watch(attr.wcLoop, function(newValue, oldValue) {
            if ((!lp || newValue !== oldValue) && newValue) {
              lp = newValue;
              return scope.setLoop(lp);
            } else {
              return scope.setLoop();
            }
          });
        }
      }
    }
  };
});

'use strict';

angular.module('wcjs-angular').directive('wcMedia', ["$timeout", "$sce", "WC_UTILS", "WC_STATES", "wcjsRenderer", function($timeout, $sce, WC_UTILS, WC_STATES, wcjsRenderer) {
  return {
    restrict: 'E',
    require: '^chimerangular',
    template: '<canvas></canvas>',
    scope: {
      wcSrc: '=?'
    },
    link: function(scope, elem, attrs, chimera) {
      var sources;
      sources = void 0;
      chimera.wcjsElement = wcjsRenderer.init(elem.find('canvas')[0]);
      chimera.sources = scope.wcSrc;
      chimera.addListeners();
      scope.onChangeSource = function(newValue, oldValue) {
        if ((!sources || newValue !== oldValue) && newValue) {
          sources = newValue;
          if (chimera.currentState !== WC_STATES.PLAY) {
            chimera.currentState = WC_STATES.STOP;
          }
          chimera.sources = sources;
          return scope.changeSource();
        }
      };
      scope.changeSource = function() {
        var i, l;
        i = 0;
        l = sources.length;
        while (i < l) {
          if (sources[i].selected) {
            chimera.wcjsElement.playlist.add($sce.trustAsResourceUrl(sources[i].src));
            break;
          }
          i++;
        }
        return $timeout(function() {
          if (chimera.autoPlay) {
            chimera.play();
          }
          chimera.onVideoReady();
        });
      };
      scope.$watch('wcSrc', scope.onChangeSource);
      scope.$watch(function() {
        return chimera.sources;
      }, scope.onChangeSource);
      if (chimera.isConfig) {
        return scope.$watch(function() {
          return chimera.config;
        }, function() {
          if (chimera.config) {
            return scope.wcSrc = chimera.config.sources;
          }
        });
      }
    }
  };
}]);

'use strict';

angular.module('wcjs-angular').directive('wcPreload', function() {
  return {
    restrict: 'A',
    require: '^chimerangular',
    link: {
      pre: function(scope, elem, attr, chimera) {
        var preload;
        preload = void 0;
        scope.setPreload = function(value) {
          return angular.noop();
        };
        if (chimera.isConfig) {
          return scope.$watch(function() {
            return chimera.config;
          }, function() {
            if (chimera.config) {
              return scope.setPreload(chimera.config.preload);
            }
          });
        } else {
          return scope.$watch(attr.wcPreload, function(newValue, oldValue) {
            if ((!preload || newValue !== oldValue) && newValue) {
              preload = newValue;
              return scope.setPreload(preload);
            } else {
              return scope.setPreload();
            }
          });
        }
      }
    }
  };
});

'use strict';

angular.module('wcjs-angular').directive('wcTracks', function() {
  return {
    restrict: 'A',
    require: '^chimerangular',
    link: {
      pre: function(scope, elem, attr, chimera) {
        var i, l, trackText, tracks;
        tracks = void 0;
        trackText = void 0;
        i = void 0;
        l = void 0;
        scope.changeSource = function() {
          var oldTracks, prop, results;
          oldTracks = chimera.wcjsElement.children();
          i = 0;
          l = oldTracks.length;
          while (i < l) {
            if (oldTracks[i].remove) {
              oldTracks[i].remove();
            }
            i++;
          }
          if (tracks) {
            i = 0;
            l = tracks.length;
            results = [];
            while (i < l) {
              trackText = '';
              trackText += '<track ';
              for (prop in tracks[i]) {
                trackText += prop + '="' + tracks[i][prop] + '" ';
              }
              trackText += '></track>';
              chimera.wcjsElement.append(trackText);
              results.push(i++);
            }
            return results;
          }
        };
        scope.setTracks = function(value) {
          tracks = value;
          chimera.tracks = value;
          return scope.changeSource();
        };
        if (chimera.isConfig) {
          return scope.$watch(function() {
            return chimera.config;
          }, function() {
            if (chimera.config) {
              return scope.setTracks(chimera.config.tracks);
            }
          });
        } else {
          return scope.$watch(attr.wcTracks, function(newValue, oldValue) {
            if (!tracks || newValue !== oldValue) {
              return scope.setTracks(newValue);
            }
          });
        }
      }
    }
  };
});

'use strict';

angular.module('wcjs-angular').service('wcFullscreen', ["WC_UTILS", "WC_FULLSCREEN_APIS", function(WC_UTILS, WC_FULLSCREEN_APIS) {
  var APIS, browser, isFullScreen, polyfill;
  polyfill = null;
  APIS = WC_FULLSCREEN_APIS;
  isFullScreen = function() {
    return document[polyfill.element] !== null;
  };
  for (browser in APIS) {
    if (APIS[browser].enabled in document) {
      polyfill = APIS[browser];
      break;
    }
  }
  this.isAvailable = polyfill !== null;
  if (polyfill) {
    this.onchange = polyfill.onchange;
    this.onerror = polyfill.onerror;
    this.isFullScreen = isFullScreen;
    this.exit = function() {
      document[polyfill.exit]();
    };
    this.request = function(elem) {
      elem[polyfill.request]();
    };
  }
}]);

'use strict';

angular.module('wcjs-angular').factory('Texture', function() {
  var Texture;
  return Texture = (function() {
    function Texture(gl, width, height) {
      this.gl = gl;
      this.width = width;
      this.height = height;
      this.texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, width, height, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return;
    }

    Texture.prototype.bind = function(n, program, name) {
      var gl;
      gl = this.gl;
      gl.activeTexture([gl.TEXTURE0, gl.TEXTURE1, gl.TEXTURE2][n]);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.uniform1i(gl.getUniformLocation(program, name), n);
    };

    Texture.prototype.fill = function(data) {
      var gl;
      gl = this.gl;
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, this.width, this.height, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, data);
    };

    return Texture;

  })();
}).provider('wcjsRenderer', function() {
  var wcAddonPath;
  wcAddonPath = null;
  return {
    setAddonPath: function(path) {
      return wcAddonPath = path;
    },
    $get: ["$log", "Texture", function($log, Texture) {
      var frameSetup, render, renderFallback, setupCanvas;
      render = function(canvas, videoFrame, vlc) {
        var gl, len;
        if (!vlc.playing) {
          return;
        }
        gl = canvas.gl;
        len = videoFrame.length;
        videoFrame.y.fill(videoFrame.subarray(0, videoFrame.uOffset));
        videoFrame.u.fill(videoFrame.subarray(videoFrame.uOffset, videoFrame.vOffset));
        videoFrame.v.fill(videoFrame.subarray(videoFrame.vOffset, len));
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      };
      renderFallback = function(canvas, videoFrame) {
        var buf, height, i, j, o, width;
        buf = canvas.img.data;
        width = videoFrame.width;
        height = videoFrame.height;
        i = 0;
        while (i < height) {
          j = 0;
          while (j < width) {
            o = (j + width * i) * 4;
            buf[o + 0] = videoFrame[o + 2];
            buf[o + 1] = videoFrame[o + 1];
            buf[o + 2] = videoFrame[o + 0];
            buf[o + 3] = videoFrame[o + 3];
            ++j;
          }
          ++i;
        }
        canvas.ctx.putImageData(canvas.img, 0, 0);
      };
      setupCanvas = function(canvas, vlc, fallbackRenderer) {
        var fragmentShader, fragmentShaderSource, gl, program, texCoordBuffer, textureCoordAttribute, vertexPositionAttribute, vertexShader, vertexShaderSource, verticesBuffer;
        if (!fallbackRenderer) {
          canvas.gl = canvas.getContext('webgl');
        }
        gl = canvas.gl;
        if (!gl || fallbackRenderer) {
          console.log(fallbackRenderer ? 'Fallback renderer forced, not using WebGL' : 'Unable to initialize WebGL, falling back to canvas rendering');
          vlc.pixelFormat = vlc.RV32;
          canvas.ctx = canvas.getContext('2d');
          delete canvas.gl;
          return;
        }
        vlc.pixelFormat = vlc.I420;
        canvas.I420Program = gl.createProgram();
        program = canvas.I420Program;
        vertexShaderSource = ['attribute highp vec4 aVertexPosition;', 'attribute vec2 aTextureCoord;', 'varying highp vec2 vTextureCoord;', 'void main(void) {', ' gl_Position = aVertexPosition;', ' vTextureCoord = aTextureCoord;', '}'].join('\n');
        vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);
        fragmentShaderSource = ['precision highp float;', 'varying lowp vec2 vTextureCoord;', 'uniform sampler2D YTexture;', 'uniform sampler2D UTexture;', 'uniform sampler2D VTexture;', 'const mat4 YUV2RGB = mat4', '(', ' 1.1643828125, 0, 1.59602734375, -.87078515625,', ' 1.1643828125, -.39176171875, -.81296875, .52959375,', ' 1.1643828125, 2.017234375, 0, -1.081390625,', ' 0, 0, 0, 1', ');', 'void main(void) {', ' gl_FragColor = vec4( texture2D(YTexture, vTextureCoord).x, texture2D(UTexture, vTextureCoord).x, texture2D(VTexture, vTextureCoord).x, 1) * YUV2RGB;', '}'].join('\n');
        fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          console.log('Shader link failed.');
        }
        vertexPositionAttribute = gl.getAttribLocation(program, 'aVertexPosition');
        gl.enableVertexAttribArray(vertexPositionAttribute);
        textureCoordAttribute = gl.getAttribLocation(program, 'aTextureCoord');
        gl.enableVertexAttribArray(textureCoordAttribute);
        verticesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1.0, 1.0, 0.0, -1.0, 1.0, 0.0, 1.0, -1.0, 0.0, -1.0, -1.0, 0.0]), gl.STATIC_DRAW);
        gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
        texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0]), gl.STATIC_DRAW);
        gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
      };
      frameSetup = function(canvas, width, height, pixelFormat, videoFrame) {
        var gl, program;
        gl = canvas.gl;
        canvas.width = width;
        canvas.height = height;
        if (!gl) {
          canvas.img = canvas.ctx.createImageData(width, height);
          return;
        }
        program = canvas.I420Program;
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        videoFrame.y = new Texture(gl, width, height);
        videoFrame.u = new Texture(gl, width >> 1, height >> 1);
        videoFrame.v = new Texture(gl, width >> 1, height >> 1);
        videoFrame.y.bind(0, program, 'YTexture');
        videoFrame.u.bind(1, program, 'UTexture');
        videoFrame.v.bind(2, program, 'VTexture');
      };
      return {
        init: function(canvas, params, fallbackRenderer) {
          var setFrame, vlc, wcAddon;
          if (params == null) {
            params = {};
          }
          this._canvas = canvas;
          if (!wcAddonPath) {
            $log.error('wcAddonPath not found, use wcjsRenderer.setAddonPath \'path\' to set');
            return;
          }
          wcAddon = require(wcAddonPath + '/WebChimera.js.node');
          vlc = wcAddon.createPlayer(params);
          setupCanvas(canvas, vlc, fallbackRenderer);
          vlc.onFrameSetup = function(width, height, pixelFormat, videoFrame) {
            frameSetup(canvas, width, height, pixelFormat, videoFrame);
            canvas.addEventListener('webglcontextlost', (function(event) {
              event.preventDefault();
            }), false);
            canvas.addEventListener('webglcontextrestored', (function(w, h, p, v) {
              return function(event) {
                setupCanvas(canvas, vlc);
                frameSetup(canvas, w, h, p, v);
              };
            })(width, height, pixelFormat, videoFrame), false);
          };
          setFrame = this;
          vlc.onFrameReady = function(videoFrame) {
            (canvas.gl ? render : renderFallback)(canvas, videoFrame, vlc);
            setFrame._lastFrame = videoFrame;
          };
          return vlc;
        },
        clearCanvas: function() {
          var arr1, arr2, gl, i;
          if (this._lastFrame) {
            gl = this._canvas.gl;
            arr1 = new Uint8Array(this._lastFrame.uOffset);
            arr2 = new Uint8Array(this._lastFrame.vOffset - this._lastFrame.uOffset);
            i = 0;
            while (i < arr2.length) {
              arr2[i] = 128;
              ++i;
            }
            this._lastFrame.y.fill(arr1);
            this._lastFrame.u.fill(arr2);
            this._lastFrame.v.fill(arr2);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
          }
        },
        _lastFrame: false,
        _canvas: false
      };
    }]
  };
});

'use strict';

angular.module('wcjs-angular').service('WC_UTILS', ["$window", function($window) {

  /**
   * There's no offsetX in Firefox, so we fix that.
   * Solution provided by Jack Moore in this post:
   * http://www.jacklmoore.com/notes/mouse-position/
   * @param $event
   * @returns {*}
   */
  this.fixEventOffset = function($event) {
    var borderLeftWidth, borderTopWidth, matchedFF, offsetX, offsetY, rect, style;
    matchedFF = navigator.userAgent.match(/Firefox\/(\d+)/i);
    if (matchedFF && Number.parseInt(matchedFF.pop()) < 39) {
      style = $event.currentTarget.currentStyle || window.getComputedStyle($event.target, null);
      borderLeftWidth = parseInt(style['borderLeftWidth'], 10);
      borderTopWidth = parseInt(style['borderTopWidth'], 10);
      rect = $event.currentTarget.getBoundingClientRect();
      offsetX = $event.clientX - borderLeftWidth - rect.left;
      offsetY = $event.clientY - borderTopWidth - rect.top;
      $event.offsetX = offsetX;
      $event.offsetY = offsetY;
    }
    return $event;
  };

  /**
   * Inspired by Paul Irish
   * https://gist.github.com/paulirish/211209
   * @returns {number}
   */
  this.getZIndex = function() {
    var elementZIndex, i, l, tags, zIndex;
    zIndex = 1;
    elementZIndex = void 0;
    tags = document.getElementsByTagName('*');
    i = 0;
    l = tags.length;
    while (i < l) {
      elementZIndex = parseInt(window.getComputedStyle(tags[i])['z-index']);
      if (elementZIndex > zIndex) {
        zIndex = elementZIndex + 1;
      }
      i++;
    }
    return zIndex;
  };

  /**
   * Test the browser's support for HTML5 localStorage.
   * @returns {boolean}
   */
  this.supportsLocalStorage = function() {
    var e, storage, testKey;
    testKey = 'chimerangular-test-key';
    storage = $window.sessionStorage;
    try {
      storage.setItem(testKey, '1');
      storage.removeItem(testKey);
      return 'localStorage' in $window && $window['localStorage'] !== null;
    } catch (_error) {
      e = _error;
      return false;
    }
  };
}]);

'use strict';

angular.module('wcjs-angular.plugins', []);

'use strict';

angular.module('wcjs-angular.plugins').directive('wcAnalytics', ["$analytics", "WC_STATES", function($analytics, WC_STATES) {
  return {
    restrict: 'E',
    require: '^chimerangular',
    scope: {
      wcTrackInfo: '=?'
    },
    link: function(scope, elem, attr, chimera) {
      var currentState, info, progressTracks, totalMiliseconds;
      info = null;
      currentState = null;
      totalMiliseconds = null;
      progressTracks = [];
      scope.chimera = chimera;
      scope.trackEvent = function(eventName) {
        return $analytics.eventTrack(eventName, info);
      };
      scope.onPlayerReady = function(isReady) {
        if (isReady) {
          return scope.trackEvent('ready');
        }
      };
      scope.onChangeState = function(state) {
        currentState = state;
        switch (state) {
          case WC_STATES.PLAY:
            if (scope.wcTrackInfo.events.play) {
              return scope.trackEvent('play');
            }
            break;
          case WC_STATES.PAUSE:
            if (scope.wcTrackInfo.events.pause) {
              return scope.trackEvent('pause');
            }
            break;
          case WC_STATES.STOP:
            if (scope.wcTrackInfo.events.stop) {
              return scope.trackEvent('stop');
            }
        }
      };
      scope.onCompleteVideo = function(isCompleted) {
        if (isCompleted) {
          return scope.trackEvent('complete');
        }
      };
      scope.onUpdateTime = function(newCurrentTime) {
        if (progressTracks.length > 0 && newCurrentTime >= progressTracks[0].jump) {
          scope.trackEvent('progress ' + progressTracks[0].percent + '%');
          return progressTracks.shift();
        }
      };
      scope.updateTrackInfo = function(newVal) {
        if (scope.wcTrackInfo.category) {
          info.category = scope.wcTrackInfo.category;
        }
        if (scope.wcTrackInfo.label) {
          return info.label = scope.wcTrackInfo.label;
        }
      };
      scope.addWatchers = function() {
        var totalTimeWatch;
        if (scope.wcTrackInfo.category || scope.wcTrackInfo.label) {
          info = {};
          scope.updateTrackInfo(scope.wcTrackInfo);
        }
        scope.$watch('wcTrackInfo', scope.updateTrackInfo, true);
        if (scope.wcTrackInfo.events.ready) {
          scope.$watch(function() {
            return chimera.isReady;
          }, function(newVal, oldVal) {
            return scope.onPlayerReady(newVal);
          });
        }
        if (scope.wcTrackInfo.events.play || scope.wcTrackInfo.events.pause || scope.wcTrackInfo.events.stop) {
          scope.$watch(function() {
            return chimera.currentState;
          }, function(newVal, oldVal) {
            if (newVal !== oldVal) {
              return scope.onChangeState(newVal);
            }
          });
        }
        if (scope.wcTrackInfo.events.complete) {
          scope.$watch(function() {
            return chimera.isCompleted;
          }, function(newVal, oldVal) {
            return scope.onCompleteVideo(newVal);
          });
        }
        if (scope.wcTrackInfo.events.progress) {
          scope.$watch(function() {
            return chimera.currentTime;
          }, function(newVal, oldVal) {
            return scope.onUpdateTime(newVal / 1000);
          });
          return totalTimeWatch = scope.$watch(function() {
            return chimera.totalTime;
          }, function(newVal, oldVal) {
            var i, progressJump, totalTracks;
            totalMiliseconds = newVal / 1000;
            if (totalMiliseconds > 0) {
              totalTracks = scope.wcTrackInfo.events.progress - 1;
              progressJump = Math.floor(totalMiliseconds / scope.wcTrackInfo.events.progress);
              i = 0;
              while (i < totalTracks) {
                progressTracks.push({
                  percent: (i + 1) * scope.wcTrackInfo.events.progress,
                  jump: (i + 1) * progressJump
                });
                i++;
              }
              return totalTimeWatch();
            }
          });
        }
      };
      if (chimera.isConfig) {
        return scope.$watch('chimera.config', function() {
          if (scope.chimera.config) {
            scope.wcTrackInfo = scope.chimera.config.plugins.analytics;
            return scope.addWatchers();
          }
        });
      } else {
        return scope.addWatchers();
      }
    }
  };
}]);

'use strict';

angular.module('wcjs-angular.plugins').directive('wcControlsContainer', function() {
  return {
    restrict: 'A',
    link: function(scope, elem, attr) {
      return scope.wcAutohideClass = {
        value: null
      };
    }
  };
}).directive('wcBottomControls', ["$timeout", "WC_STATES", function($timeout, WC_STATES) {
  return {
    restrict: 'E',
    require: '^chimerangular',
    transclude: true,
    templateUrl: 'plugins/wc-bottom-controls/wc-bottom-controls.html',
    scope: {
      wcAutohide: '=?',
      wcAutohideTime: '=?',
      wcAutohideClass: '='
    },
    link: function(scope, elem, attr, chimera) {
      var autoHideTime, h, hideInterval, w;
      w = 0;
      h = 0;
      autoHideTime = 2000;
      hideInterval = void 0;
      scope.chimera = chimera;
      scope.onMouseMove = function() {
        if (scope.wcAutohide) {
          return scope.showControls();
        }
      };
      scope.setAutohide = function(value) {
        if (value && chimera.currentState === WC_STATES.PLAY) {
          return hideInterval = $timeout(scope.hideControls, autoHideTime);
        } else {
          scope.wcAutohideClass = '';
          $timeout.cancel(hideInterval);
          return scope.showControls();
        }
      };
      scope.setAutohideTime = function(value) {
        return autoHideTime = value;
      };
      scope.hideControls = function() {
        return scope.wcAutohideClass = 'hide-animation';
      };
      scope.showControls = function() {
        scope.wcAutohideClass = 'show-animation';
        $timeout.cancel(hideInterval);
        if (scope.wcAutohide && chimera.currentState === WC_STATES.PLAY) {
          return hideInterval = $timeout(scope.hideControls, autoHideTime);
        }
      };
      if (chimera.isConfig) {
        return scope.$watch('chimera.config', function() {
          var ahValue, ahtValue, ref, ref1, ref2, ref3;
          if (scope.chimera.config) {
            ahValue = ((ref = scope.chimera) != null ? (ref1 = ref.config) != null ? ref1.autoHide : void 0 : void 0) || false;
            ahtValue = ((ref2 = scope.chimera) != null ? (ref3 = ref2.config) != null ? ref3.autoHideTime : void 0 : void 0) || 2000;
            scope.wcAutohide = ahValue;
            scope.wcAutohideTime = ahtValue;
            scope.setAutohideTime(ahtValue);
            return scope.setAutohide(ahValue);
          }
        });
      } else {
        if (scope.wcAutohide !== void 0) {
          scope.$watch('wcAutohide', scope.setAutohide);
        }
        if (scope.wcAutohideTime !== void 0) {
          return scope.$watch('wcAutohideTime', scope.setAutohideTime);
        }
      }
    }
  };
}]);

'use strict';

angular.module('wcjs-angular.plugins').directive('wcFullscreenButton', function() {
  return {
    restrict: 'E',
    require: '^chimerangular',
    scope: {},
    templateUrl: 'plugins/wc-bottom-controls/wc-fullscreen-button/wc-fullscreen-button.html',
    link: function(scope, elem, attr, chimera) {
      scope.onChangeFullScreen = function(isFullScreen) {
        if (isFullScreen) {
          return scope.fullscreenIcon = 'fullscreen_exit';
        } else {
          return scope.fullscreenIcon = 'fullscreen';
        }
      };
      scope.onClickFullScreen = function() {
        return chimera.toggleFullScreen();
      };
      scope.fullscreenIcon = 'fullscreen';
      return scope.$watch(function() {
        return chimera.isFullScreen;
      }, function(newVal, oldVal) {
        if (newVal !== oldVal) {
          return scope.onChangeFullScreen(newVal);
        }
      });
    }
  };
});

'use strict';

angular.module('wcjs-angular.plugins').directive('wcPlayPauseButton', ["WC_STATES", function(WC_STATES) {
  return {
    restrict: 'E',
    require: '^chimerangular',
    scope: {},
    templateUrl: 'plugins/wc-bottom-controls/wc-play-pause-button/wc-play-pause-button.html',
    link: function(scope, elem, attr, chimera) {
      scope.setState = function(newState) {
        switch (newState) {
          case WC_STATES.PLAY:
            return scope.playPauseIcon = 'pause';
          case WC_STATES.PAUSE:
          case WC_STATES.STOP:
            return scope.playPauseIcon = 'play_arrow';
        }
      };
      scope.onClickPlayPause = function() {
        return chimera.playPause();
      };
      scope.playPauseIcon = 'play_arrow';
      return scope.$watch(function() {
        return chimera.currentState;
      }, function(newVal, oldVal) {
        return scope.setState(newVal);
      });
    }
  };
}]);

'use strict';

angular.module('wcjs-angular.plugins').directive('wcPlaybackButton', ["WC_UTILS", function(WC_UTILS) {
  return {
    restrict: 'E',
    require: '^chimerangular',
    templateUrl: 'plugins/wc-bottom-controls/wc-playback-button/wc-playback-button.html',
    link: function(scope, elem, attr, chimera) {
      scope.playback = '1.0';
      scope.onClickPlayback = function() {
        var nextPlaybackRate, playbackOptions;
        playbackOptions = ['.5', '1.0', '1.5', '2.0'];
        nextPlaybackRate = playbackOptions.indexOf(scope.playback) + 1;
        if (nextPlaybackRate >= playbackOptions.length) {
          scope.playback = playbackOptions[0];
        } else {
          scope.playback = playbackOptions[nextPlaybackRate];
        }
        return chimera.setPlayback(scope.playback);
      };
      return scope.$watch(function() {
        return chimera.playback;
      });
    }
  };
}]);

'use strict';

angular.module('wcjs-angular.plugins').directive('wcScrubBarCuePoints', function() {
  return {
    restrict: 'E',
    require: '^chimerangular',
    templateUrl: 'plugins/wc-bottom-controls/wc-scrub-bar/wc-scrub-bar-cue-points.html',
    scope: {
      'wcCuePoints': '='
    },
    link: function(scope, elem, attr, chimera) {
      scope.onPlayerReady = function() {
        return scope.updateCuePoints(scope.wcCuePoints);
      };
      scope.updateCuePoints = function(cuePoints) {
        var cuePointDuration, i, l, percentWidth, position, results, totalWidth;
        totalWidth = void 0;
        if (cuePoints) {
          totalWidth = parseInt(elem[0].clientWidth);
          i = 0;
          l = cuePoints.length;
          results = [];
          while (i < l) {
            cuePointDuration = (cuePoints[i].timeLapse.end - cuePoints[i].timeLapse.start) * 1000;
            position = cuePoints[i].timeLapse.start * 100 / chimera.totalTime * 1000 + '%';
            percentWidth = 0;
            if (typeof cuePointDuration === 'number' && chimera.totalTime) {
              percentWidth = cuePointDuration * 100 / chimera.totalTime + '%';
            }
            cuePoints[i].$$style = {
              width: percentWidth,
              left: position
            };
            results.push(i++);
          }
          return results;
        }
      };
      scope.$watch('wcCuePoints', scope.updateCuePoints);
      return scope.$watch(function() {
        return chimera.totalTime;
      }, function(newVal, oldVal) {
        if (newVal > 0) {
          return scope.onPlayerReady();
        }
      });
    }
  };
});

'use strict';

angular.module('wcjs-angular.plugins').directive('wcScrubBarCurrentTime', function() {
  return {
    restrict: 'E',
    require: '^chimerangular',
    link: function(scope, elem, attr, chimera) {
      var percentTime;
      percentTime = 0;
      scope.onUpdateTime = function(newCurrentTime) {
        if (typeof newCurrentTime === 'number' && chimera.totalTime) {
          percentTime = 100 * (newCurrentTime / chimera.totalTime);
          return elem.css('width', percentTime + '%');
        } else {
          return elem.css('width', 0);
        }
      };
      return scope.$watch(function() {
        return chimera.currentTime;
      }, function(newVal, oldVal) {
        return scope.onUpdateTime(newVal);
      });
    }
  };
});

'use strict';

angular.module('wcjs-angular.plugins').filter('formatTime', function() {
  return function(input) {
    var hours, minutes, seconds;
    input = Math.floor(input / 1000);
    if (input < 3600) {
      minutes = Math.floor(input / 60);
      seconds = input - (minutes * 60);
      return minutes + ':' + ('0' + seconds).slice(-2);
    } else {
      hours = Math.floor(input / 3600);
      minutes = Math.floor((input - (hours * 3600)) / 60);
      seconds = input - (hours * 3600) - (minutes * 60);
      return hours + ':' + ('0' + minutes).slice(-2) + ':' + ('0' + seconds).slice(-2);
    }
  };
}).directive('wcScrubBar', ["WC_STATES", "WC_UTILS", function(WC_STATES, WC_UTILS) {
  return {
    restrict: 'E',
    require: '^chimerangular',
    transclude: true,
    templateUrl: 'plugins/wc-bottom-controls/wc-scrub-bar/wc-scrub-bar.html',
    link: function(scope, elem, attr, chimera) {
      var LEFT, NUM_PERCENT, RIGHT, isPlaying, isPlayingWhenSeeking, isSeeking, touchStartX;
      isSeeking = false;
      isPlaying = false;
      isPlayingWhenSeeking = false;
      touchStartX = 0;
      LEFT = 37;
      RIGHT = 39;
      NUM_PERCENT = 5;
      scope.chimera = chimera;
      scope.ariaTime = function(time) {
        return Math.round(time);
      };
      scope.onScrubBarTouchStart = function($event) {
        var event, touchX, touches;
        event = $event.originalEvent || $event;
        touches = event.touches;
        touchX = void 0;
        if (WC_UTILS.isiOSDevice()) {
          touchStartX = (touches[0].clientX - event.layerX) * -1;
        } else {
          touchStartX = event.layerX;
        }
        touchX = touches[0].clientX + touchStartX - touches[0].target.offsetLeft;
        isSeeking = true;
        if (isPlaying) {
          isPlayingWhenSeeking = true;
        }
        chimera.pause();
        chimera.seekTime(touchX * chimera.wcjsElement.length / elem[0].scrollWidth);
        scope.$apply();
      };
      scope.onScrubBarTouchEnd = function($event) {
        var event;
        event = $event.originalEvent || $event;
        if (isPlayingWhenSeeking) {
          isPlayingWhenSeeking = false;
          chimera.play();
        }
        isSeeking = false;
        scope.$apply();
      };
      scope.onScrubBarTouchMove = function($event) {
        var event, touchX, touches;
        event = $event.originalEvent || $event;
        touches = event.touches;
        touchX = void 0;
        if (isSeeking) {
          touchX = touches[0].clientX + touchStartX - touches[0].target.offsetLeft;
          chimera.seekTime(touchX * chimera.wcjsElement.length / elem[0].scrollWidth);
        }
        scope.$apply();
      };
      scope.onScrubBarTouchLeave = function(event) {
        isSeeking = false;
        scope.$apply();
      };
      scope.onScrubBarMouseDown = function(event) {
        event = WC_UTILS.fixEventOffset(event);
        isSeeking = true;
        if (isPlaying) {
          isPlayingWhenSeeking = true;
        }
        chimera.pause();
        chimera.seekTime(event.offsetX * (chimera.wcjsElement.length / 1000) / elem[0].scrollWidth);
        scope.$apply();
      };
      scope.onScrubBarMouseUp = function(event) {
        if (isPlayingWhenSeeking) {
          isPlayingWhenSeeking = false;
          chimera.play();
        }
        isSeeking = false;
        scope.$apply();
      };
      scope.onScrubBarMouseMove = function(event) {
        if (isSeeking) {
          event = WC_UTILS.fixEventOffset(event);
          chimera.seekTime(event.offsetX * chimera.wcjsElement.length / elem[0].scrollWidth);
        }
        scope.$apply();
      };
      scope.onScrubBarMouseLeave = function(event) {
        isSeeking = false;
        scope.$apply();
      };
      scope.onScrubBarKeyDown = function(event) {
        var currentPercent;
        currentPercent = chimera.currentTime / chimera.totalTime * 100;
        if (event.which === LEFT || event.keyCode === LEFT) {
          chimera.seekTime(currentPercent - NUM_PERCENT, true);
          event.preventDefault();
        } else if (event.which === RIGHT || event.keyCode === RIGHT) {
          chimera.seekTime(currentPercent + NUM_PERCENT, true);
          event.preventDefault();
        }
      };
      scope.setState = function(newState) {
        if (!isSeeking) {
          switch (newState) {
            case WC_STATES.PLAY:
              return isPlaying = true;
            case WC_STATES.PAUSE:
              return isPlaying = false;
            case WC_STATES.STOP:
              return isPlaying = false;
          }
        }
      };
      scope.$watch(function() {
        return chimera.currentState;
      }, function(newVal, oldVal) {
        if (newVal !== oldVal) {
          return scope.setState(newVal);
        }
      });
      elem.bind('mousedown', scope.onScrubBarMouseDown);
      elem.bind('mouseup', scope.onScrubBarMouseUp);
      elem.bind('mousemove', scope.onScrubBarMouseMove);
      return elem.bind('mouseleave', scope.onScrubBarMouseLeave);
    }
  };
}]);

'use strict';

angular.module('wcjs-angular.plugins').directive('wcSubtitle', function() {
  return {
    restrict: 'E',
    scope: {
      subtitles: '=',
      currentSubtitle: '='
    },
    require: '^chimerangular',
    template: '<button class="iconButton" ng-click="onClick()" aria-label=\'Closed Caption\' type=\'button\'>\n  <md-icon md-font-set="material-icons">closed_caption</md-icon>\n</button>\n<wc-subtitle-selector></<wc-subtitle-selector>',
    link: function(scope, elem, attr, chimera) {
      var onMouseLeaveSubtitle;
      scope.onClick = function() {
        scope.$evalAsync(function() {
          scope.subtitleVisibility = 'visible';
        });
      };
      onMouseLeaveSubtitle = function() {
        scope.$evalAsync(function() {
          scope.subtitleVisibility = 'hidden';
        });
      };
      scope.subtitleVisibility = 'hidden';
      return elem.bind('mouseleave', onMouseLeaveSubtitle);
    }
  };
}).directive('wcSubtitleSelector', function() {
  return {
    restrict: 'E',
    require: '^chimerangular',
    template: '<ul>\n  <li ng-repeat="subtitle in subtitles" ng-class="{ \'active\': currentSubtitle.name === subtitle.name }" ng-click="changeSubtitle(subtitle)">\n    {{ subtitle.name }}\n  </li>\n</ul>',
    link: function(scope, elem, attr, chimera) {
      var onChangeVisibility;
      scope.changeSubtitle = function(subtitle) {
        scope.currentSubtitle = subtitle;
        scope.subtitleVisibility = 'hidden';
        chimera.wcjsElement.playlist.add($sce.trustAsResourceUrl(subtitle.url));
      };
      onChangeVisibility = function(value) {
        elem.css('visibility', value);
      };
      scope.$watch('subtitleVisibility', onChangeVisibility);
    }
  };
});

'use strict';

angular.module('wcjs-angular.plugins').directive('wcTimeDisplay', function() {
  return {
    require: '^chimerangular',
    restrict: 'E',
    link: function(scope, elem, attr, chimera) {
      scope.currentTime = chimera.currentTime;
      scope.timeLeft = chimera.timeLeft;
      scope.totalTime = chimera.totalTime;
      scope.isLive = chimera.isLive;
      scope.$watch(function() {
        return chimera.currentTime;
      }, function(newVal, oldVal) {
        return scope.currentTime = newVal;
      });
      scope.$watch(function() {
        return chimera.timeLeft;
      }, function(newVal, oldVal) {
        return scope.timeLeft = newVal;
      });
      scope.$watch(function() {
        return chimera.totalTime;
      }, function(newVal, oldVal) {
        return scope.totalTime = newVal;
      });
      return scope.$watch(function() {
        return chimera.isLive;
      }, function(newVal, oldVal) {
        return scope.isLive = newVal;
      });
    }
  };
});

'use strict';

angular.module('wcjs-angular.plugins').directive('wcMuteButton', function() {
  return {
    restrict: 'E',
    require: '^chimerangular',
    templateUrl: 'plugins/wc-bottom-controls/wc-volume/wc-mute-button.html',
    link: function(scope, elem, attr, chimera) {
      var CHANGE_PER_PRESS, DOWN, UP, isMuted;
      isMuted = false;
      UP = 38;
      DOWN = 40;
      CHANGE_PER_PRESS = 0.05;
      scope.onClickMute = function() {
        if (isMuted) {
          scope.currentVolume = scope.defaultVolume;
        } else {
          scope.currentVolume = 0;
          scope.muteIcon = 'volume_up';
        }
        isMuted = !isMuted;
        return chimera.setVolume(scope.currentVolume);
      };
      scope.onMuteButtonFocus = function() {
        return scope.volumeVisibility = 'visible';
      };
      scope.onMuteButtonLoseFocus = function() {
        return scope.volumeVisibility = 'hidden';
      };
      scope.onMuteButtonKeyDown = function(event) {
        var currentVolume, newVolume;
        currentVolume = chimera.volume !== null ? chimera.volume : 1;
        newVolume = void 0;
        if (event.which === UP || event.keyCode === UP) {
          newVolume = currentVolume + CHANGE_PER_PRESS;
          if (newVolume > 1) {
            newVolume = 1;
          }
          chimera.setVolume(newVolume);
          return event.preventDefault();
        } else if (event.which === DOWN || event.keyCode === DOWN) {
          newVolume = currentVolume - CHANGE_PER_PRESS;
          if (newVolume < 0) {
            newVolume = 0;
          }
          chimera.setVolume(newVolume);
          return event.preventDefault();
        }
      };
      scope.onSetVolume = function(newVolume) {
        var percentValue;
        scope.currentVolume = newVolume;
        isMuted = scope.currentVolume === 0;
        if (!isMuted) {
          scope.defaultVolume = newVolume;
        } else {
          if (newVolume > 0) {
            scope.defaultVolume = newVolume;
          }
        }
        percentValue = Math.round(newVolume * 100);
        if (percentValue === 0) {
          return scope.muteIcon = 'volume_off';
        } else if (percentValue > 0 && percentValue < 33) {
          return scope.muteIcon = 'volume_mute';
        } else if (percentValue >= 33 && percentValue < 66) {
          return scope.muteIcon = 'volume_down';
        } else if (percentValue >= 66) {
          return scope.muteIcon = 'volume_up';
        }
      };
      scope.defaultVolume = 100;
      scope.currentVolume = scope.defaultVolume;
      scope.muteIcon = 'volume_up';
      scope.onSetVolume(chimera.volume);
      return scope.$watch(function() {
        return chimera.volume;
      }, function(newVal, oldVal) {
        if (newVal !== oldVal) {
          return scope.onSetVolume(newVal);
        }
      });
    }
  };
});

'use strict';

angular.module('wcjs-angular.plugins').directive('wcVolumeBar', ["WC_UTILS", function(WC_UTILS) {
  return {
    restrict: 'E',
    require: '^chimerangular',
    templateUrl: 'plugins/wc-bottom-controls/wc-volume/wc-volume-bar.html',
    link: function(scope, elem, attr, chimera) {
      var isChangingVolume, volumeBackElem, volumeValueElem;
      isChangingVolume = false;
      volumeBackElem = angular.element(elem[0].getElementsByClassName('volumeBackground'));
      volumeValueElem = angular.element(elem[0].getElementsByClassName('volumeValue'));
      scope.onClickVolume = function(event) {
        var value, volValue, volumeHeight;
        event = WC_UTILS.fixEventOffset(event);
        volumeHeight = parseInt(volumeBackElem.prop('offsetHeight'));
        value = event.offsetY * 100 / volumeHeight;
        volValue = 1 - value / 100;
        return chimera.setVolume(volValue);
      };
      scope.onMouseDownVolume = function() {
        return isChangingVolume = true;
      };
      scope.onMouseUpVolume = function() {
        return isChangingVolume = false;
      };
      scope.onMouseLeaveVolume = function() {
        return isChangingVolume = false;
      };
      scope.onMouseMoveVolume = function(event) {
        var value, volValue, volumeHeight;
        if (isChangingVolume) {
          event = WC_UTILS.fixEventOffset(event);
          volumeHeight = parseInt(volumeBackElem.prop('offsetHeight'));
          value = event.offsetY * 100 / volumeHeight;
          volValue = 1 - value / 100;
          return chimera.setVolume(volValue);
        }
      };
      scope.updateVolumeView = function(value) {
        value = value * 100;
        volumeValueElem.css('height', value + '%');
        return volumeValueElem.css('top', 100 - value + '%');
      };
      scope.onChangeVisibility = function(value) {
        return elem.css('visibility', value);
      };
      elem.css('visibility', scope.volumeVisibility);
      scope.$watch('volumeVisibility', scope.onChangeVisibility);
      scope.updateVolumeView(chimera.volume);
      return scope.$watch(function() {
        return chimera.volume;
      }, function(newVal, oldVal) {
        if (newVal !== oldVal) {
          return scope.updateVolumeView(newVal);
        }
      });
    }
  };
}]);

'use strict';

angular.module('wcjs-angular.plugins').directive('wcVolume', ["WC_UTILS", function(WC_UTILS) {
  return {
    restrict: 'E',
    link: function(scope, elem, attr) {
      scope.onMouseOverVolume = function() {
        return scope.$evalAsync(function() {
          return scope.volumeVisibility = 'visible';
        });
      };
      scope.onMouseLeaveVolume = function() {
        return scope.$evalAsync(function() {
          return scope.volumeVisibility = 'hidden';
        });
      };
      scope.volumeVisibility = 'hidden';
      elem.bind('mouseover', scope.onMouseOverVolume);
      return elem.bind('mouseleave', scope.onMouseLeaveVolume);
    }
  };
}]);

'use strict';

angular.module('wcjs-angular.plugins').directive('wcBuffering', ["WC_STATES", "WC_UTILS", function(WC_STATES, WC_UTILS) {
  return {
    restrict: 'E',
    require: '^chimerangular',
    templateUrl: 'plugins/wc-buffering/wc-buffering.html',
    link: function(scope, elem, attr, chimera) {
      scope.showSpinner = function() {
        scope.spinnerClass = {
          stop: chimera.isBuffering
        };
        return elem.css('display', 'block');
      };
      scope.hideSpinner = function() {
        scope.spinnerClass = {
          stop: chimera.isBuffering
        };
        return elem.css('display', 'none');
      };
      scope.setState = function(isBuffering) {
        if (isBuffering) {
          return scope.showSpinner();
        } else {
          return scope.hideSpinner();
        }
      };
      scope.onStateChange = function(state) {
        if (state === WC_STATES.STOP) {
          return scope.hideSpinner();
        }
      };
      scope.onPlayerReady = function(isReady) {
        if (isReady) {
          return scope.hideSpinner();
        }
      };
      scope.showSpinner();
      scope.$watch(function() {
        return chimera.isReady;
      }, function(newVal, oldVal) {
        if (chimera.isReady === true || newVal !== oldVal) {
          return scope.onPlayerReady(newVal);
        }
      });
      scope.$watch(function() {
        return chimera.currentState;
      }, function(newVal, oldVal) {
        if (newVal !== oldVal) {
          return scope.onStateChange(newVal);
        }
      });
      return scope.$watch(function() {
        return chimera.isBuffering;
      }, function(newVal, oldVal) {
        if (newVal !== oldVal) {
          return scope.setState(newVal);
        }
      });
    }
  };
}]);

'use strict';

angular.module('wcjs-angular.plugins').directive('wcDash', function() {
  return {
    restrict: 'A',
    require: '^chimerangular',
    link: function(scope, elem, attr, chimera) {
      var context, player;
      context = void 0;
      player = void 0;
      scope.isDASH = function(url) {
        if (url.indexOf) {
          return url.indexOf('.mpd') > 0;
        }
      };
      scope.onSourceChange = function(url) {
        if (scope.isDASH(url)) {
          context = new Dash.di.DashContext;
          player = new MediaPlayer(context);
          player.setAutoPlay(chimera.autoPlay);
          player.startup();
          player.attachView(chimera.wcjsElement);
          return player.attachSource(url);
        } else {
          if (player) {
            player.reset();
            return player = null;
          }
        }
      };
      return scope.$watch(function() {
        return chimera.sources;
      }, function(newVal, oldVal) {
        return scope.onSourceChange(newVal[0].src);
      });
    }
  };
});

'use strict';

angular.module('wcjs-angular.plugins').directive('wcImaAds', ["$window", "WC_STATES", function($window, WC_STATES) {
  return {
    restrict: 'E',
    require: '^chimerangular',
    scope: {
      wcNetwork: '=?',
      wcUnitPath: '=?',
      wcCompanion: '=?',
      wcCompanionSize: '=?',
      wcAdTagUrl: '=?',
      wcSkipButton: '=?'
    },
    link: function(scope, elem, attr, chimera) {
      var adDisplayContainer, adsLoaded, adsLoader, adsManager, currentAd, h, onContentEnded, skipButton, w;
      adDisplayContainer = new google.ima.AdDisplayContainer(elem[0]);
      adsLoader = new google.ima.AdsLoader(adDisplayContainer);
      adsManager = null;
      adsLoaded = false;
      w = void 0;
      h = void 0;
      onContentEnded = function() {
        return adsLoader.contentComplete();
      };
      currentAd = 0;
      skipButton = angular.element(scope.wcSkipButton);
      scope.chimera = chimera;
      scope.onPlayerReady = function(isReady) {
        if (isReady) {
          chimera.wcjsElement.events.on('ended', onContentEnded);
          adsLoader.addEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, scope.onAdsManagerLoaded, false, this);
          adsLoader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, scope.onAdError, false, this);
          return scope.loadAds();
        }
      };
      scope.onUpdateAds = function(newVal, oldVal) {
        if (newVal !== oldVal) {
          scope.loadAds();
          chimera.pause();
          adDisplayContainer.initialize();
          return scope.requestAds(scope.wcAdTagUrl);
        }
      };
      scope.loadAds = function() {
        if (scope.wcCompanion) {
          return googletag.cmd.push(function() {
            googletag.defineSlot('/' + scope.wcNetwork + '/' + scope.wcUnitPath, scope.wcCompanionSize, scope.wcCompanion).addService(googletag.companionAds()).addService(googletag.pubads());
            googletag.companionAds().setRefreshUnfilledSlots(true);
            googletag.pubads().enableVideoAds();
            return googletag.enableServices();
          });
        }
      };
      scope.onUpdateState = function(newState) {
        switch (newState) {
          case WC_STATES.PLAY:
            if (!adsLoaded) {
              chimera.pause();
              adDisplayContainer.initialize();
              scope.requestAds(scope.wcAdTagUrl);
              return adsLoaded = true;
            }
            break;
          case WC_STATES.STOP:
            return adsLoader.contentComplete();
        }
      };
      scope.requestAds = function(adTagUrl) {
        var adsRequest, computedStyle;
        scope.show();
        adsRequest = new google.ima.AdsRequest;
        computedStyle = $window.getComputedStyle(elem[0]);
        adsRequest.adTagUrl = adTagUrl;
        adsRequest.linearAdSlotWidth = parseInt(computedStyle.width, 10);
        adsRequest.linearAdSlotHeight = parseInt(computedStyle.height, 10);
        adsRequest.nonLinearAdSlotWidth = parseInt(computedStyle.width, 10);
        adsRequest.nonLinearAdSlotHeight = parseInt(computedStyle.height, 10);
        adsLoader.requestAds(adsRequest);
      };
      scope.onAdsManagerLoaded = function(adsManagerLoadedEvent) {
        scope.show();
        adsManager = adsManagerLoadedEvent.getAdsManager(chimera.wcjsElement[0]);
        scope.processAdsManager(adsManager);
      };
      scope.processAdsManager = function(adsManager) {
        w = chimera.chimerangularElement[0].offsetWidth;
        h = chimera.chimerangularElement[0].offsetHeight;
        adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, scope.onContentPauseRequested, false, this);
        adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, scope.onContentResumeRequested, false, this);
        adsManager.addEventListener(google.ima.AdEvent.Type.SKIPPABLE_STATE_CHANGED, scope.onSkippableStateChanged, false, this);
        adsManager.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, scope.onAllAdsComplete, false, this);
        adsManager.addEventListener(google.ima.AdEvent.Type.COMPLETE, scope.onAdComplete, false, this);
        adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, scope.onAdError, false, this);
        adsManager.init(w, h, google.ima.ViewMode.NORMAL);
        return adsManager.start();
      };
      scope.onSkippableStateChanged = function() {
        var isSkippable;
        isSkippable = adsManager.getAdSkippableState();
        if (isSkippable) {
          return skipButton.css('display', 'block');
        } else {
          return skipButton.css('display', 'none');
        }
      };
      scope.onClickSkip = function() {
        return adsManager.skip();
      };
      scope.onContentPauseRequested = function() {
        scope.show();
        chimera.wcjsElement.events.on('ended', onContentEnded);
        return chimera.pause();
      };
      scope.onContentResumeRequested = function() {
        cchimera.wcjsElement.events.on('ended', onContentEnded);
        chimera.play();
        return scope.hide();
      };
      scope.onAdError = function() {
        if (adsManager) {
          adsManager.destroy();
        }
        scope.hide();
        return chimera.play();
      };
      scope.onAllAdsComplete = function() {
        scope.hide();
        if (adsManager.getCuePoints().join().indexOf('-1') >= 0) {
          return chimera.stop();
        }
      };
      scope.onAdComplete = function() {
        return currentAd++;
      };
      scope.show = function() {
        elem.css('display', 'block');
      };
      scope.hide = function() {
        elem.css('display', 'none');
      };
      skipButton.bind('click', scope.onClickSkip);
      elem.prepend(skipButton);
      angular.element($window).bind('resize', function() {
        w = chimera.chimerangularElement[0].offsetWidth;
        h = chimera.chimerangularElement[0].offsetHeight;
        if (adsManager) {
          if (chimera.isFullScreen) {
            return adsManager.resize(w, h, google.ima.ViewMode.FULLSCREEN);
          } else {
            return adsManager.resize(w, h, google.ima.ViewMode.NORMAL);
          }
        }
      });
      if (chimera.isConfig) {
        scope.$watch('chimera.config', function() {
          if (scope.chimera.config) {
            scope.wcNetwork = scope.chimera.config.plugins['ima-ads'].network;
            scope.wcUnitPath = scope.chimera.config.plugins['ima-ads'].unitPath;
            scope.wcCompanion = scope.chimera.config.plugins['ima-ads'].companion;
            scope.wcCompanionSize = scope.chimera.config.plugins['ima-ads'].companionSize;
            scope.wcAdTagUrl = scope.chimera.config.plugins['ima-ads'].adTagUrl;
            scope.wcSkipButton = scope.chimera.config.plugins['ima-ads'].skipButton;
            return scope.onPlayerReady(true);
          }
        });
      } else {
        scope.$watch('wcAdTagUrl', scope.onUpdateAds.bind(scope));
      }
      scope.$watch(function() {
        return chimera.isReady;
      }, function(newVal, oldVal) {
        if (chimera.isReady === true || newVal !== oldVal) {
          return scope.onPlayerReady(newVal);
        }
      });
      return scope.$watch(function() {
        return chimera.currentState;
      }, function(newVal, oldVal) {
        if (newVal !== oldVal) {
          return scope.onUpdateState(newVal);
        }
      });
    }
  };
}]);

'use strict';

angular.module('wcjs-angular.plugins').directive('wcNextVideo', ["$timeout", function($timeout) {
  return {
    restrict: 'E',
    require: '^chimerangular',
    templateUrl: 'plugins/wc-next-video/wc-next-video.html',
    scope: {
      wcNext: '=',
      wcTime: '=?'
    },
    link: function(scope, elem, attr, chimera) {
      var cancelTimer, count, current, currentVideo, isCompleted, max, nextVideos, onComplete, onLoadData, timer;
      max = scope.wcTime || 5000;
      current = 0;
      currentVideo = 0;
      timer = null;
      isCompleted = false;
      nextVideos = [];
      onLoadData = function(episodes) {
        return nextVideos = episodes;
      };
      count = function() {
        current += 10;
        if (current >= max) {
          $timeout.cancel(timer);
          chimera.autoPlay = true;
          chimera.isCompleted = false;
          current = 0;
          isCompleted = false;
          currentVideo++;
          if (currentVideo === nextVideos.length) {
            return currentVideo = 0;
          }
        } else {
          return timer = $timeout(count.bind(this), 10);
        }
      };
      cancelTimer = function() {
        $timeout.cancel(timer);
        current = 0;
        return isCompleted = false;
      };
      onComplete = function(newVal) {
        isCompleted = newVal;
        if (newVal) {
          return timer = $timeout(count.bind(this), 10);
        }
      };
      scope.$watch(function() {
        return chimera.isCompleted;
      }, onComplete);
      return scope.$watch('wcNext', onLoadData);
    }
  };
}]).service('wcNextVideoService', ["$http", "$q", "$sce", function($http, $q, $sce) {
  var deferred;
  deferred = $q.defer();
  this.loadData = function(url) {
    $http.get(url).then(this.onLoadData.bind(this), this.onLoadError.bind(this));
    return deferred.promise;
  };
  this.onLoadData = function(response) {
    var i, l, mediaFile, mediaSources, mi, ml, result;
    result = [];
    i = 0;
    l = response.data.length;
    while (i < l) {
      mediaSources = [];
      mi = 0;
      ml = response.data[i].length;
      while (mi < ml) {
        mediaFile = {
          src: $sce.trustAsResourceUrl(response.data[i][mi].src),
          type: response.data[i][mi].type
        };
        mediaSources.push(mediaFile);
        mi++;
      }
      result.push(mediaSources);
      i++;
    }
    return deferred.resolve(result);
  };
  this.onLoadError = function(error) {
    return deferred.reject(error);
  };
  return this;
}]);

'use strict';

angular.module('wcjs-angular.plugins').directive('wcOverlayPlay', ["WC_STATES", function(WC_STATES) {
  return {
    restrict: 'E',
    require: '^chimerangular',
    scope: {},
    templateUrl: 'plugins/wc-overlay-play/wc-overlay-play.html',
    link: function(scope, elem, attr, chimera) {
      scope.chimera = chimera;
      scope.onChangeState = function(newState) {
        switch (newState) {
          case WC_STATES.PLAY:
            return scope.overlayPlayIcon = false;
          case WC_STATES.PAUSE:
            return scope.overlayPlayIcon = true;
          case WC_STATES.STOP:
            return scope.overlayPlayIcon = true;
        }
      };
      scope.onClickOverlayPlay = function(event) {
        return chimera.playPause();
      };
      scope.overlayPlayIcon = false;
      return scope.$watch(function() {
        return chimera.currentState;
      }, function(newVal, oldVal) {
        return scope.onChangeState(newVal);
      });
    }
  };
}]);

'use strict';

angular.module('wcjs-angular.plugins').directive('wcPoster', function() {
  return {
    restrict: 'E',
    require: '^chimerangular',
    scope: {
      poster: '=?'
    },
    templateUrl: 'plugins/wc-poster/wc-poster.html',
    link: function(scope, elem, attr, chimera) {
      return scope.chimera = chimera;
    }
  };
});

'use strict';

angular.module('wcjs-angular.plugins').directive('wcCloseButton', function() {
  return {
    restrict: 'E',
    require: '^chimerangular',
    templateUrl: 'plugins/wc-top-controls/wc-close-button/wc-close-button.html',
    link: function(scope, elem, attr, chimera) {
      return scope.onClosePlayer = function() {
        return chimera.stop();
      };
    }
  };
});

'use strict';

angular.module('wcjs-angular.plugins').directive('wcTitle', function() {
  return {
    restrict: 'E',
    require: '^chimerangular',
    templateUrl: 'plugins/wc-top-controls/wc-title/wc-title.html',
    link: function(scope, elem, attr, chimera) {
      return scope.chimera = chimera;
    }
  };
});

'use strict';

angular.module('wcjs-angular.plugins').directive('wcTopControls', ["$timeout", "WC_STATES", function($timeout, WC_STATES) {
  return {
    restrict: 'E',
    require: '^chimerangular',
    transclude: true,
    templateUrl: 'plugins/wc-top-controls/wc-top-controls.html',
    scope: {
      wcAutohide: '=?',
      wcAutohideTime: '=?',
      wcAutohideClass: '='
    },
    link: function(scope, elem, attr, chimera) {
      var autoHideTime, h, hideInterval, w;
      w = 0;
      h = 0;
      autoHideTime = 2000;
      hideInterval = void 0;
      scope.chimera = chimera;
      scope.onMouseMove = function() {
        if (scope.wcAutohide) {
          return scope.showControls();
        }
      };
      scope.setAutohide = function(value) {
        if (value && chimera.currentState === WC_STATES.PLAY) {
          return hideInterval = $timeout(scope.hideControls, autoHideTime);
        } else {
          scope.wcAutohideClass = '';
          $timeout.cancel(hideInterval);
          return scope.showControls();
        }
      };
      scope.setAutohideTime = function(value) {
        return autoHideTime = value;
      };
      scope.hideControls = function() {
        return scope.wcAutohideClass = 'hide-animation';
      };
      scope.showControls = function() {
        scope.wcAutohideClass = 'show-animation';
        $timeout.cancel(hideInterval);
        if (scope.wcAutohide && chimera.currentState === WC_STATES.PLAY) {
          return hideInterval = $timeout(scope.hideControls, autoHideTime);
        }
      };
      if (chimera.isConfig) {
        return scope.$watch('chimera.config', function() {
          var ahValue, ahtValue, ref, ref1, ref2, ref3, ref4;
          if ((ref = scope.chimera) != null ? ref.config : void 0) {
            ahValue = ((ref1 = scope.chimera) != null ? (ref2 = ref1.config) != null ? ref2.autoHide : void 0 : void 0) || false;
            ahtValue = ((ref3 = scope.chimera) != null ? (ref4 = ref3.config) != null ? ref4.autoHideTime : void 0 : void 0) || 2000;
            scope.wcAutohide = ahValue;
            scope.wcAutohideTime = ahtValue;
            scope.setAutohideTime(ahtValue);
            return scope.setAutohide(ahValue);
          }
        });
      } else {
        if (scope.wcAutohide !== void 0) {
          scope.$watch('wcAutohide', scope.setAutohide);
        }
        if (scope.wcAutohideTime !== void 0) {
          return scope.$watch('wcAutohideTime', scope.setAutohideTime);
        }
      }
    }
  };
}]);

'use strict';

angular.module('wcjs-angular.plugins').directive('wcVideoInfo', function() {
  return {
    restrict: 'E',
    require: '^chimerangular',
    scope: {
      torrent: '=?wcVideo',
      player: '=?wcPlayer'
    },
    templateUrl: 'plugins/wc-video-info/wc-video-info.html',
    link: function(scope, elem, attr, chimera) {
      return scope.stopPlaying = function() {
        return chimera.stop();
      };
    }
  };
});

angular.module('wcjs-angular').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('plugins/wc-bottom-controls/wc-bottom-controls.html',
    "<div class=\"controls-container\" ng-mousemove=\"onMouseMove()\" ng-class=\"wcAutohideClass\" ng-transclude></div>\n"
  );


  $templateCache.put('plugins/wc-bottom-controls/wc-fullscreen-button/wc-fullscreen-button.html',
    "<md-button class='iconButton'\n" +
    "        ng-click='onClickFullScreen()'\n" +
    "        aria-label='Toggle full screen'\n" +
    "        type='button'>\n" +
    "        <md-icon md-font-set=\"material-icons\">{{ fullscreenIcon }}</md-icon>\n" +
    "</md-button>\n"
  );


  $templateCache.put('plugins/wc-bottom-controls/wc-play-pause-button/wc-play-pause-button.html',
    "<button class='iconButton' ng-click='onClickPlayPause()' aria-label='Play/Pause' type='button'>\n" +
    "  <md-icon md-font-set=\"material-icons\">{{ playPauseIcon }}</md-icon>\n" +
    "</button>\n"
  );


  $templateCache.put('plugins/wc-bottom-controls/wc-playback-button/wc-playback-button.html',
    "<md-button class=\"playbackValue iconButton\" ng-click=\"onClickPlayback()\">{{ playback }}x</md-button>"
  );


  $templateCache.put('plugins/wc-bottom-controls/wc-scrub-bar/wc-scrub-bar-cue-points.html',
    "<div class=\"cue-point-timeline\" ng-style=\"timelineWidth\">\n" +
    "  <div ng-repeat=\"cuePoint in vgCuePoints\" class=\"cue-point\" ng-style=\"cuePoint.$$style\"></div>\n" +
    "</div>"
  );


  $templateCache.put('plugins/wc-bottom-controls/wc-scrub-bar/wc-scrub-bar.html',
    "<div role=\"slider\"\n" +
    "     aria-valuemax=\"{{ariaTime(chimera.totalTime)}}\"\n" +
    "     aria-valuenow=\"{{ariaTime(chimera.currentTime)}}\"\n" +
    "     aria-valuemin=\"0\"\n" +
    "     aria-label=\"Time scrub bar\"\n" +
    "     tabindex=\"0\"\n" +
    "     ng-transclude\n" +
    "     ng-keydown=\"onScrubBarKeyDown($event)\">\n" +
    "</div>\n"
  );


  $templateCache.put('plugins/wc-bottom-controls/wc-volume/wc-mute-button.html',
    "<button class='iconButton'\n" +
    "        ng-click='onClickMute()'\n" +
    "        ng-focus='onMuteButtonFocus()'\n" +
    "        ng-blur='onMuteButtonLoseFocus()'\n" +
    "        ng-keydown='onMuteButtonKeyDown($event)'\n" +
    "        aria-label='Mute'\n" +
    "        type='button'>\n" +
    "        <md-icon md-font-set=\"material-icons\">{{ muteIcon }}</md-icon>\n" +
    "</button>"
  );


  $templateCache.put('plugins/wc-bottom-controls/wc-volume/wc-volume-bar.html',
    "<div class='verticalVolumeBar'>\n" +
    "    <div class='volumeBackground'\n" +
    "         ng-click='onClickVolume($event)'\n" +
    "         ng-mousedown='onMouseDownVolume()'\n" +
    "         ng-mouseup='onMouseUpVolume()'\n" +
    "         ng-mousemove='onMouseMoveVolume($event)'\n" +
    "         ng-mouseleave='onMouseLeaveVolume()'>\n" +
    "        <div class='volumeValue'></div>\n" +
    "        <div class='volumeClickArea'></div>\n" +
    "    </div>\n" +
    "</div>\n"
  );


  $templateCache.put('plugins/wc-buffering/wc-buffering.html',
    "<div class='bufferingContainer'>\n" +
    "    <div ng-class='spinnerClass' class='loadingSpinner'></div>\n" +
    "</div>\n"
  );


  $templateCache.put('plugins/wc-next-video/wc-next-video.html',
    "<div class=\"loader-container\" ng-if=\"video.isCompleted\">\n" +
    "  <div round-progress max=\"video.max\" current=\"video.current\" color=\"#eeeeee\" bgcolor=\"#333333\" radius=\"50\" stroke=\"10\">\n" +
    "  </div>\n" +
    "  <div class=\"cancel\" ng-click=\"video.cancelTimer()\">\n" +
    "    cancel\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('plugins/wc-overlay-play/wc-overlay-play.html',
    "<div class='overlayPlayContainer' ng-click='onClickOverlayPlay()' ng-show=\"overlayPlayIcon\">\n" +
    "    <div class='iconButton'>\n" +
    "      <md-icon md-font-set=\"material-icons\">play_circle_filled</md-icon>\n" +
    "    </div>\n" +
    "</div>\n"
  );


  $templateCache.put('plugins/wc-poster/wc-poster.html',
    "<img image-loaded ng-src=\"{{ poster }}\">\n"
  );


  $templateCache.put('plugins/wc-top-controls/wc-close-button/wc-close-button.html',
    "<md-button class='iconButton close'\n" +
    "        ng-click='onClosePlayer()'\n" +
    "        aria-label='Close Player'\n" +
    "        type='button'>\n" +
    "        <md-icon md-font-set=\"material-icons\">close</md-icon>\n" +
    "</md-button>\n"
  );


  $templateCache.put('plugins/wc-top-controls/wc-title/wc-title.html',
    "<h1>{{ chimera.wcjsElement.currentItem() }}</h1>\n"
  );


  $templateCache.put('plugins/wc-top-controls/wc-top-controls.html',
    "<div class=\"controls-container\" ng-mousemove=\"onMouseMove()\" ng-class=\"wcAutohideClass\" ng-transclude></div>\n"
  );


  $templateCache.put('plugins/wc-video-info/wc-video-info.html',
    "<page-header>\n" +
    "    <md-button ng-click=\"stopPlaying()\" class=\"back md-icon-button\" role=\"button\">\n" +
    "        <md-icon md-font-set=\"material-icons\" role=\"button\" tabindex=\"0\" aria-label=\"arrow-back\">close</md-icon>\n" +
    "    </md-button>\n" +
    "\n" +
    "    <div class=\"title\">{{ player.detail.title }}</div>\n" +
    "    <div class=\"episode-info\">{{ player.episode.title }}</div>\n" +
    "</page-header>\n" +
    "\n" +
    "<div class=\"meta-container\">\n" +
    "    <div class=\"status\">{{ state }}</div>\n" +
    "    <md-progress-linear class=\"md-warn progressbar\" md-mode=\"indeterminate\"></md-progress-linear>\n" +
    "    <div class=\"stats\">Download: {{ torrent.stats.speed.down | fileSize }} &bullet; Upload: {{ torrent.stats.speed.up | fileSize }} &bullet; Active Peers: {{ torrent.stats.peers.total }}</div>\n" +
    "</div>\n"
  );


  $templateCache.put('webchimera.html',
    "\n" +
    "<div chimerangular wc-player-ready=\"chimera.onPlayerReady($API)\"\n" +
    "     wc-config=\"chimera.config\"\n" +
    "     wc-complete=\"chimera.onCompleteVideo()\"\n" +
    "     wc-error=\"chimera.onError($event)\"\n" +
    "     wc-stop=\"chimera.player = null\"\n" +
    "     wc-can-play=\"chimera.player.canplay = true\"\n" +
    "     wc-update-time=\"chimera.onUpdateTime($currentTime, $duration)\"\n" +
    "     wc-update-volume=\"chimera.onUpdateVolume($volume)\"\n" +
    "     wc-update-state=\"chimera.onUpdateState($state)\"\n" +
    "     wc-auto-play=\"chimera.config.autoPlay\"\n" +
    "     wc-plays-inline=\"chimera.config.playsInline\">\n" +
    "\n" +
    "    <wc-media ng-show=\"chimera.player.torrentLink\" wc-src=\"chimera.torrent.files\"\n" +
    "              wc-loop=\"chimera.config.loop\"\n" +
    "              wc-preload=\"chimera.config.preload\">\n" +
    "    </wc-media>\n" +
    "\n" +
    "    <wc-poster ng-hide=\"chimera.player.canplay\" ng-if=\"chimera.config.poster\" poster=\"chimera.config.poster\"></wc-poster>\n" +
    "    <wc-detail ng-hide=\"chimera.player.torrentLink\" player=\"chimera.player\" torrent=\"chimera.torrent\" config=\"chimera.config\"></wc-detail>\n" +
    "\n" +
    "    <div ng-if=\"chimera.player.torrentLink\" ng-init=\"wcAutohideClass = { value: 'hide-animation' }\">\n" +
    "        <wc-top-controls ng-show=\"chimera.config.controls && chimera.player.canplay\" wc-autohide=\"chimera.config.autoHide\" wc-autohide-time=\"chimera.config.autoHideTime\" wc-autohide-class=\"wcAutohideClass.value\">\n" +
    "            <wc-close-button></wc-close-button>\n" +
    "        </wc-top-controls>\n" +
    "\n" +
    "        <wc-bottom-controls ng-show=\"chimera.config.controls && chimera.player.canplay\" wc-autohide=\"chimera.config.autoHide\" wc-autohide-time=\"chimera.config.autoHideTime\" wc-autohide-class=\"wcAutohideClass.value\">\n" +
    "            <wc-play-pause-button></wc-play-pause-button>\n" +
    "            <wc-time-display>{{ currentTime | formatTime }}</wc-time-display>\n" +
    "            \n" +
    "            <wc-scrub-bar>\n" +
    "                <wc-scrub-bar-current-time></wc-scrub-bar-current-time>\n" +
    "            </wc-scrub-bar>\n" +
    "            \n" +
    "            <wc-time-display>{{ timeLeft | formatTime }}</wc-time-display>\n" +
    "            <wc-playback-button></wc-playback-button>\n" +
    "            \n" +
    "            <wc-subtitle subtitles=\"chimera.config.tracks\" current-subtitle=\"chimera.config.track\"></wc-subtitle>\n" +
    "            \n" +
    "            <wc-volume>\n" +
    "                <wc-mute-button></wc-mute-button>\n" +
    "                <wc-volume-bar></wc-volume-bar>\n" +
    "            </wc-volume>\n" +
    "            \n" +
    "            <wc-fullscreen-button></wc-fullscreen-button>\n" +
    "        </wc-bottom-controls>\n" +
    "\n" +
    "        <wc-next-video wc-next=\"chimera.config.next\" wc-time=\"3000\"></wc-next-video>\n" +
    "        <wc-torrent-info ng-hide=\"chimera.config.controls && chimera.player.canplay\" wc-torrent=\"chimera.torrent\" wc-player=\"chimera.player\"></wc-torrent-info>\n" +
    "        <wc-buffering ng-show=\"chimera.player.canplay\"></wc-buffering>\n" +
    "        <wc-overlay-play ng-if=\"chimera.config.controls && chimera.player.canplay\"></wc-overlay-play>\n" +
    "    </div>\n" +
    "</div>"
  );

}]);
