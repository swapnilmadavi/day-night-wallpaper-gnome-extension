#!/usr/bin/gjs

'use strict';

const { Gio, GLib } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const Mainloop = imports.mainloop;

let timeout;

function setDesktopBackground(uri) {
    const backgroundSettings = new Gio.Settings({ schema: 'org.gnome.desktop.background' });
    // let previousBackgroundUri = gnomeSettings.get_string('picture-uri');
    backgroundSettings.set_string('picture-uri', uri);
    // gsettings.set_string('picture-options', 'zoom');
}

function constructSwitchDateTime(switchHour, switchMinute, now) {
    let switchDateTime = GLib.DateTime.new(
        now.get_timezone(),
        now.get_year(),
        now.get_month(),
        now.get_day_of_month(),
        switchHour,
        switchMinute,
        0.0
    );

    /**
     * Adjust the day component for weird switch time.
     * Example 1:- 
     * Day switch time => 09:00 Hrs
     * Night switch time => 07:30 Hrs
     * 
     * Example 2:-
     * Day switch time => 09:30 Hrs
     * Night switch time => 09:00 Hrs
     * */
    let nowHour = now.get_hour();
    if (switchHour == nowHour) { // Example 2
        let nowMinute = now.get_minute();
        if (switchMinute < nowMinute) {
            switchDateTime = switchDateTime.add_days(1);
        }
    } else if (switchHour < nowHour) { // Example 1
        switchDateTime = switchDateTime.add_days(1);
    }

    log(`now => ${now.format_iso8601()}`);
    log(`switchDateTime => ${switchDateTime.format_iso8601()}`);

    return switchDateTime;
}

function calculateSecondsForNextSwitch(switchHour, switchMinute) {
    log(`calculating seconds for ${switchHour}:${switchMinute}`);
    let now = GLib.DateTime.new_now_local();
    let switchDateTime = constructSwitchDateTime(switchHour, switchMinute, now);
    return switchDateTime.to_unix() - now.to_unix();
}

function onDayWallpaperTimeout() {
    const settings = ExtensionUtils.getSettings();
    const uri = settings.get_string('day-wallpaper');
    setDesktopBackground(uri);
    // const nightWallpaperSwitchTime = 20.08
    const secondsLeftForNextSwitch = calculateSecondsForNextSwitch(22, 5);
    log(`secondsLeftForNextSwitch => ${secondsLeftForNextSwitch}`);
    timeout = Mainloop.timeout_add_seconds(secondsLeftForNextSwitch, onNightWallpaperTimeout);
    return false;
}

function onNightWallpaperTimeout() {
    const settings = ExtensionUtils.getSettings();
    const uri = settings.get_string('night-wallpaper');
    setDesktopBackground(uri);
    // const nightWallpaperSwitchTime = 20.08
    const secondsLeftForNextSwitch = calculateSecondsForNextSwitch(22, 0);
    log(`secondsLeftForNextSwitch => ${secondsLeftForNextSwitch}`);
    timeout = Mainloop.timeout_add_seconds(secondsLeftForNextSwitch, onDayWallpaperTimeout);
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
    let secondsLeftForNextSwitch = calculateSecondsForNextSwitch(21, 55);
    log(`secondsLeftForNextSwitch => ${secondsLeftForNextSwitch}`);
    timeout = Mainloop.timeout_add_seconds(secondsLeftForNextSwitch, this.onNightWallpaperTimeout);
}

function disable() {
    log(`disabling ${Me.metadata.name} version ${Me.metadata.version}`);
    if (timeout) {
        Mainloop.source_remove(timeout);
    }
    timeout = undefined;
}