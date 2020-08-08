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

function initializeDefaultWallpaper(extensionSettings, key) {
    let gnomeSettings = new Gio.Settings({ schema: 'org.gnome.desktop.background' });
    let currentBackgroundUri = gnomeSettings.get_string('picture-uri');
    extensionSettings.set_string(key, currentBackgroundUri);
}

function init() {
    log(`initializing ${Me.metadata.name} version ${Me.metadata.version}`);
    let settings = getSettings();

    if (settings.get_string('day-wallpaper') == '') {
        initializeDefaultWallpaper(settings, 'day-wallpaper')
    }

    if (settings.get_string('night-wallpaper') == '') {
        initializeDefaultWallpaper(settings, 'night-wallpaper')
    }
}


function enable() {
    log(`enabling ${Me.metadata.name} version ${Me.metadata.version}`);
}


function disable() {
    log(`disabling ${Me.metadata.name} version ${Me.metadata.version}`);
}