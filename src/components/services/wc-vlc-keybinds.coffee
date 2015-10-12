

.constant 'HotKeyBinds', 
  section_order: [
    "General"
    "Navigation"
    "Browsing & Playback Adjustments"
    "Manage"
  ]

  sections:
    General: [
      {
        combo: "f"
        description: "Fullscreen"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "space"
        description: "Play/Pause"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "v"
        description: "Subtitles cycle/off"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "b"
        description: "Audio track cycle"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "ctrl+up"
        description: "Volume Up"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "ctrl+down"
        description: "Volume down"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "ctrl+o"
        description: "Open Single file(s)"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
    ]

    Navigation: [
      {
        combo: "ctrl+t"
        description: "Goto/jump to time"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "shift+left"
        description: "Very short jump – back 3 secs"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "shift+right"
        description: "Very short jump – forward 3 secs"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "alt+left"
        description: "Short jump – back 10 secs"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "alt+right"
        description: "Short jump – forward 10 secs"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "ctrl+left"
        description: "Medium jump – back 1 min"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "ctrl+right"
        description: "Medium jump – forward 1 min"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "ctrl+alt+left"
        description: "Long jump back"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "ctrl+alt+right"
        description: "Long jump forward"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "e"
        description: "Next frame"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "n"
        description: "Next in playlist"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "p"
        description: "Current from beginning/Previous in playlist"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
    ]

    "Browsing & Playback Adjustments": [
      {
        combo: "ctrl+d"
        description: "Open disc menu"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "ctrl+p"
        description: "Open folder (browse folder menu)"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "ctrl+r"
        description: "Advanced open file"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "ctrl+o"
        description: "Open single file(s)"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "m"
        description: "Mute and unmute audio"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "s"
        description: "Stop movie"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "esc"
        description: "Exit full screen mode"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "+"
        description: "Faster"
        callback: (event, hotkey) ->
          event.preventDefault()
          return        
      }
      {
        combo: "-"
        description: "Slower"
        callback: (event, hotkey) ->
          event.preventDefault()
          return        
      }
      {
        combo: "="
        description: "Normal"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "a"
        description: "Aspect ratio"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "c"
        description: "Crop screen"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "g"
        description: "Increase subtitle delay"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "h"
        description: "Decrease subtitle delay"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "j"
        description: "Increase audio delay"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "k"
        description: "Decrease audio delay"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "z"
        description: "Change zoom mode"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "t"
        description: "Show time"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "r"
        description: "Random"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
    ]

    Manage: [
      {
        combo: "ctrl+h"
        description: "Hide / unhide controls"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "ctrl+p"
        description: "Preferences / interface settings"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "ctrl+e"
        description: "Adjustments and audio/video effects"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "ctrl+b"
        description: "Edit bookmarks"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "ctrl+m"
        description: "Open messages"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "ctrl+n"
        description: "Open network"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "ctrl+c"
        description: "Open capture device"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "ctrl+l"
        description: "Open playlist"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "ctrl+y"
        description: "Save playlist"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "ctrl+i"
        description: "Media information"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "alt+a"
        description: "Open audio menu"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "alt+h"
        description: "Open help menu"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "alt+m"
        description: "Open media menu"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "alt+p"
        description: "Open playlist menu"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "alt+t"
        description: "Open tool menu"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "alt+v"
        description: "Open video menu"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "alt+l"
        description: "Open playback menu"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "d"
        description: "Show movie path"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "f1"
        description: "Show Help"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "f11"
        description: "Window fullscreen"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "alt+f4"
        description: "Quit VLC"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
      {
        combo: "ctrl+q"
        description: "Quit VLC (alternative)"
        callback: (event, hotkey) ->
          event.preventDefault()
          return
      }
    ]