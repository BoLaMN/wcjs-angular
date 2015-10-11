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
