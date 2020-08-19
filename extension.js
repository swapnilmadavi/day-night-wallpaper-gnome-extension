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

/**
 * Constructs GLib.DateTime object for the next switch with respect to the 
 * current i.e. now DateTime instance.
 * 
 * If the current time has already crossed the passed switch time
 * then the resultant DateTime will be of the next day.
 * Example:- 
 * Switch time => 09:00 Hrs
 * Now => 19 Aug 2020 11:30 Hrs
 * Result => 20 Aug 2020 09:00 Hrs
 * 
 * @param {Number} switchHour 
 * @param {Number} switchMinute 
 * @param {GLib.DateTime} now 
 * @returns {GLib.DateTime} Switch DateTime object
 */
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
     * Adjust the day component for switch time.
     * Example 1:- 
     * Switch time => 09:00 Hrs
     * Now => 19 Aug 2020 09:30 Hrs
     * Result => 20 Aug 2020 09:00 Hrs
     * 
     * Example 2:-
     * Switch time => 07:00 Hrs
     * Now => 19 Aug 2020 09:30 Hrs
     * Result => 20 Aug 2020 07:00 Hrs
     * */
    let nowHour = now.get_hour();
    if (switchHour == nowHour) { // Example 1
        let nowMinute = now.get_minute();
        if (switchMinute < nowMinute) {
            switchDateTime = switchDateTime.add_days(1);
        }
    } else if (switchHour < nowHour) { // Example 2
        switchDateTime = switchDateTime.add_days(1);
    }

    log(`now => ${now.format_iso8601()}`);
    log(`switchDateTime => ${switchDateTime.format_iso8601()}`);

    return switchDateTime;
}

function getMinuteFromSwitchTime(switchTime, switchHour) {
    let decimal = switchTime - switchHour;
    decimal = parseFloat(decimal.toFixed(2));
    return Math.round(decimal * 60);
}

function convertSwitchTimeToUnixTimestamp(switchTime, now) {
    let switchHour = parseInt(switchTime);
    let switchMinute = getMinuteFromSwitchTime(switchTime, switchHour)

    return constructSwitchDateTime(switchHour, switchMinute, now).to_unix();
}

function calculateSecondsForNextSwitch(switchTime) {
    let now = GLib.DateTime.new_now_local();
    let switchTimeAsUnixTimestamp = convertSwitchTimeToUnixTimestamp(switchTime, now);
    return switchTimeAsUnixTimestamp - now.to_unix();
}

function onDayWallpaperTimeout() {
    const settings = ExtensionUtils.getSettings();
    const uri = settings.get_string('day-wallpaper');
    setDesktopBackground(uri);
    // const nightWallpaperSwitchTime = 20.08
    const secondsLeftForNextSwitch = calculateSecondsForNextSwitch(9.5);
    log(`secondsLeftForNextSwitch => ${secondsLeftForNextSwitch}`);
    timeout = Mainloop.timeout_add_seconds(secondsLeftForNextSwitch, onNightWallpaperTimeout);
    return false;
}

function onNightWallpaperTimeout() {
    const settings = ExtensionUtils.getSettings();
    const uri = settings.get_string('night-wallpaper');
    setDesktopBackground(uri);
    // const dayWallpaperSwitchTime = 20.08
    const secondsLeftForNextSwitch = calculateSecondsForNextSwitch(9.33);
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

    let daySwitchTime = 9.33;
    let nightSwitchTime = 9.5;

    let now = GLib.DateTime.new_now_local();
    let daySwitchUnixTimestamp = convertSwitchTimeToUnixTimestamp(daySwitchTime, now);
    let nigthSwitchUnixTimestamp = convertSwitchTimeToUnixTimestamp(nightSwitchTime, now);

    if (daySwitchUnixTimestamp < nigthSwitchUnixTimestamp) { // Day Switch Timestamp is nearest to now
        // Schedule day wallpaper switch
        log('Scheduling switch for day wallpaper');
        let secondsLeftForDayWallpaperSwitch = daySwitchUnixTimestamp - now.to_unix();
        log(`secondsLeftForDayWallpaperSwitch => ${secondsLeftForDayWallpaperSwitch}`);
        timeout = Mainloop.timeout_add_seconds(secondsLeftForDayWallpaperSwitch, this.onDayWallpaperTimeout);
    } else if (nigthSwitchUnixTimestamp < daySwitchUnixTimestamp) { // Night Switch Timestamp is nearest to now
        // Schedule night wallpaper switch
        log('Scheduling switch for night wallpaper');
        let secondsLeftForNightWallpaperSwitch = nigthSwitchUnixTimestamp - now.to_unix();
        log(`secondsLeftForNightWallpaperSwitch => ${secondsLeftForNightWallpaperSwitch}`);
        timeout = Mainloop.timeout_add_seconds(secondsLeftForNightWallpaperSwitch, this.onNightWallpaperTimeout);
    }
}

function disable() {
    log(`disabling ${Me.metadata.name} version ${Me.metadata.version}`);
    if (timeout) {
        Mainloop.source_remove(timeout);
    }
    timeout = undefined;
}