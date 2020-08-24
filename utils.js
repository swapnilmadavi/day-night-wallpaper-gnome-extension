#!/usr/bin/gjs

'use strict';

function isWallpaperSet(extensionSettings, wallpaperKey) {
    return extensionSettings.get_string(wallpaperKey) != '';
}

function fallbackToSystemWallpaper(extensionSettings, wallpaperKey) {
    const Gio = imports.gi.Gio;
    let gnomeSettings = new Gio.Settings({ schema: 'org.gnome.desktop.background' });
    let systemBackgroundUri = gnomeSettings.get_string('picture-uri');
    extensionSettings.set_string(wallpaperKey, systemBackgroundUri);
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