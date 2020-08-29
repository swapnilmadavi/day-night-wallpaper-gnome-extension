#!/usr/bin/gjs

'use strict';

const Gio = imports.gi.Gio;
const ExtensionUtils = imports.misc.extensionUtils;

var switchType = {
    DAY: 1,
    NIGHT: 2
}

function getExtensionSettings() {
    const extension = ExtensionUtils.getCurrentExtension();
    const schema = extension.metadata['settings-schema'];

    // Get the GSchema source so we can lookup our settings
    let gschema = Gio.SettingsSchemaSource.new_from_directory(
        extension.dir.get_child('schemas').get_path(),
        Gio.SettingsSchemaSource.get_default(),
        false
    );

    return new Gio.Settings({
        settings_schema: gschema.lookup(schema, true)
    });
}

function getBackgroundSettings() {
    return new Gio.Settings({ schema: 'org.gnome.desktop.background' });
}

function isWallpaperSelected(extensionSettings, wallpaperKey) {
    return extensionSettings.get_string(wallpaperKey) != '';
}

function fallbackToSystemWallpaper(extensionSettings, wallpaperKey) {
    const backgroundSettings = getBackgroundSettings();
    const systemBackgroundUri = backgroundSettings.get_string('picture-uri');
    extensionSettings.set_string(wallpaperKey, systemBackgroundUri);
}

function checkExtensionSettings() {
    const extensionSettings = getExtensionSettings();

    if (!isWallpaperSelected(extensionSettings, 'day-wallpaper')) {
        fallbackToSystemWallpaper(extensionSettings, 'day-wallpaper')
    }

    if (!isWallpaperSelected(extensionSettings, 'night-wallpaper')) {
        fallbackToSystemWallpaper(extensionSettings, 'night-wallpaper')
    }
}

var SwitchTime = class SwitchTime {
    constructor(switchHour, switchMinute) {
        this._switchHour = switchHour;
        this._switchMinute = switchMinute;
    }

    get switchHour() {
        return this._switchHour;
    }

    get switchMinute() {
        return this._switchMinute;
    }

    toSettingsFormat() {
        let decimal = this._switchMinute / 60;
        decimal = parseFloat(decimal.toFixed(2));
        return this._switchHour + decimal;
    }

    static newFromSettings(switchTimeFromSettings) {
        let switchHour = parseInt(switchTimeFromSettings);
        let decimal = switchTimeFromSettings - switchHour;
        decimal = parseFloat(decimal.toFixed(2));
        let switchMinute = Math.round(decimal * 60);
        return new SwitchTime(switchHour, switchMinute);
    }
}

var NextWallpaperSwitch = class NextWallpaperSwitch {
    constructor(type, secondsLeftForSwitch) {
        this._type = type;
        this._secondsLeftForSwitch = secondsLeftForSwitch;
    }

    get type() {
        return this._type;
    }

    get secondsLeftForSwitch() {
        return this._secondsLeftForSwitch;
    }
}