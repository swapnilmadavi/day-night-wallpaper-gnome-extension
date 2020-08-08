#!/usr/bin/gjs

'use strict';

function isWallpaperSet(extensionSettings, wallpaperKey) {
    return extensionSettings.get_string(wallpaperKey) == '';
}

function fallbackToSystemWallpaper(extensionSettings, wallpaperKey) {
    const Gio = imports.gi.Gio;
    let gnomeSettings = new Gio.Settings({ schema: 'org.gnome.desktop.background' });
    let systemBackgroundUri = gnomeSettings.get_string('picture-uri');
    extensionSettings.set_string(wallpaperKey, systemBackgroundUri);
}