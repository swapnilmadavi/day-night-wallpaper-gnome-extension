#!/usr/bin/gjs

'use strict';

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const Gio = imports.gi.Gio;
const Mainloop = imports.mainloop;

let timeout;

function setDesktopBackground(uri) {
    const backgroundSettings = new Gio.Settings({ schema: 'org.gnome.desktop.background' });
    // let previousBackgroundUri = gnomeSettings.get_string('picture-uri');
    backgroundSettings.set_string('picture-uri', uri);
    // gsettings.set_string('picture-options', 'zoom');
}

function onDayWallpaperTimeout() {
    const settings = ExtensionUtils.getSettings();
    const uri = settings.get_string('day-wallpaper');
    setDesktopBackground(uri);
    timeout = Mainloop.timeout_add_seconds(5, onNightWallpaperTimeout);
    return false;
}

function onNightWallpaperTimeout() {
    const settings = ExtensionUtils.getSettings();
    const uri = settings.get_string('night-wallpaper');
    setDesktopBackground(uri);
    timeout = Mainloop.timeout_add_seconds(5, onDayWallpaperTimeout);
    return false
}

function init() {
    log(`initializing ${Me.metadata.name} version ${Me.metadata.version}`);

    const Utils = Me.imports.utils;
    let settings = ExtensionUtils.getSettings();

    if (!Utils.isWallpaperSet(settings, 'day-wallpaper')) {
        Utils.fallbackToSystemWallpaper(settings, 'day-wallpaper')
    }

    if (!Utils.isWallpaperSet(settings, 'night-wallpaper')) {
        Utils.fallbackToSystemWallpaper(settings, 'night-wallpaper')
    }
}

function enable() {
    log(`enabling ${Me.metadata.name} version ${Me.metadata.version}`);
    timeout = Mainloop.timeout_add_seconds(5, this.onDayWallpaperTimeout);
}

function disable() {
    log(`disabling ${Me.metadata.name} version ${Me.metadata.version}`);
    if (timeout) {
        Mainloop.source_remove(timeout);
    }
    timeout = undefined;
}