# Playback feature

Owns client playback state, transport controls, and playback adapters. Catalog
selection is translated into the playback `load` command by `app/`; playback
does not import catalog models or metadata.

`useAudioPlayback` owns one persistent `HTMLAudioElement` for the application
session. Browser media events are the source of playback status, duration, and
time; lyrics and explanation overlays consume state but never recreate or own
the media element.

The current source is the project-authored CC0 fixture documented under
`public/media/`. Local-file and YouTube adapters will preserve the controller
boundary while exposing their different capabilities in later increments.
