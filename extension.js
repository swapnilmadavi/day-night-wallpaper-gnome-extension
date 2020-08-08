#!/usr/bin/gjs

'use strict';

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const Gio = imports.gi.Gio;

function getSettings() {
    let gschema = Gio.SettingsSchemaSource.new_from_directory(
        Me.dir.get_child('schemas').get_path(),
        Gio.SettingsSchemaSource.get_default(),
        false
    );

    let settings = new Gio.Settings({
        settings_schema: gschema.lookup('org.gnome.shell.extensions.day-night-wallpaper', true)
    });

    return settings;
}

function init() {
    log(`initializing ${Me.metadata.name} version ${Me.metadata.version}`);

    const Utils = Me.imports.utils;
    let settings = getSettings();

    if (!Utils.isWallpaperSet(settings, 'day-wallpaper')) {
        Utils.fallbackToSystemWallpaper(settings, 'day-wallpaper')
    }

    if (!Utils.isWallpaperSet(settings, 'night-wallpaper')) {
        Utils.fallbackToSystemWallpaper(settings, 'night-wallpaper')
    }
}


function enable() {
    log(`enabling ${Me.metadata.name} version ${Me.metadata.version}`);
}


function disable() {
    log(`disabling ${Me.metadata.name} version ${Me.metadata.version}`);
}