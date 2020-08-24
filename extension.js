#!/usr/bin/gjs

'use strict';

const { Gio, GLib } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Mainloop = imports.mainloop;

let dayNigthWallpaperExtension;

const DayNightWallpaperExtension = class DayNightWallpaperExtension {
    constructor(settings) {
        this.settings = settings;
        this._scheduledTimeout = null;
    }

    start() {
        log('Starting DayNightWallpaperExtension...')

        this._connectSettings();

        let daySwitchTime = this.settings.get_double('day-wallpaper-switch-time');
        let nightSwitchTime = this.settings.get_double('night-wallpaper-switch-time');

        let now = GLib.DateTime.new_now_local();
        let daySwitchUnixTimestamp = this._convertSwitchTimeToUnixTimestamp(daySwitchTime, now);
        let nigthSwitchUnixTimestamp = this._convertSwitchTimeToUnixTimestamp(nightSwitchTime, now);

        if (daySwitchUnixTimestamp < nigthSwitchUnixTimestamp) { // Day Switch Timestamp is nearest to now
            // Schedule day wallpaper switch
            let secondsLeftForDayWallpaperSwitch = daySwitchUnixTimestamp - now.to_unix();
            this._scheduleDayWallpaperSwitch(secondsLeftForDayWallpaperSwitch);
        } else if (nigthSwitchUnixTimestamp < daySwitchUnixTimestamp) { // Night Switch Timestamp is nearest to now
            // Schedule night wallpaper switch
            let secondsLeftForNightWallpaperSwitch = nigthSwitchUnixTimestamp - now.to_unix();
            this._scheduleNightWallpaperSwitch(secondsLeftForNightWallpaperSwitch);
        }
    }

    stop() {
        log('Stopping DayNightWallpaperExtension...')

        this._disconnectSettings();

        if (this._scheduledTimeout) {
            Mainloop.source_remove(this._scheduledTimeout);
        }
        this._scheduledTimeout = null;
    }

    _setDesktopBackground(uri) {
        let backgroundSettings = new Gio.Settings({ schema: 'org.gnome.desktop.background' });
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
    _constructSwitchDateTime(switchHour, switchMinute, now) {
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

    _getMinuteFromSwitchTime(switchTime, switchHour) {
        let decimal = switchTime - switchHour;
        decimal = parseFloat(decimal.toFixed(2));
        return Math.round(decimal * 60);
    }

    _convertSwitchTimeToUnixTimestamp(switchTime, now) {
        let switchHour = parseInt(switchTime);
        let switchMinute = this._getMinuteFromSwitchTime(switchTime, switchHour)

        return this._constructSwitchDateTime(switchHour, switchMinute, now).to_unix();
    }

    _onDayWallpaperTimeout() {
        const uri = this.settings.get_string('day-wallpaper');
        this._setDesktopBackground(uri);
        this._scheduleNightWallpaperSwitch();
        return false;
    }

    _onNightWallpaperTimeout() {
        const uri = this.settings.get_string('night-wallpaper');
        this._setDesktopBackground(uri);
        this._scheduleDayWallpaperSwitch();
        return false
    }

    _scheduleDayWallpaperSwitch(secondsLeftForDayWallpaperSwitch) {
        log('Scheduling switch for day wallpaper');
        if (secondsLeftForDayWallpaperSwitch == undefined) {
            let daySwitchTime = this.settings.get_double('day-wallpaper-switch-time');
            let now = GLib.DateTime.new_now_local();
            let daySwitchUnixTimestamp = this._convertSwitchTimeToUnixTimestamp(daySwitchTime, now);
            secondsLeftForDayWallpaperSwitch = daySwitchUnixTimestamp - now.to_unix();
        }
        log(`secondsLeftForDayWallpaperSwitch => ${secondsLeftForDayWallpaperSwitch}`);
        this._scheduledTimeout = Mainloop.timeout_add_seconds(secondsLeftForDayWallpaperSwitch, this._onDayWallpaperTimeout.bind(this));
    }

    _scheduleNightWallpaperSwitch(secondsLeftForNightWallpaperSwitch) {
        log('Scheduling switch for night wallpaper');
        if (secondsLeftForNightWallpaperSwitch == undefined) {
            let nightSwitchTime = this.settings.get_double('night-wallpaper-switch-time');
            let now = GLib.DateTime.new_now_local();
            let nigthSwitchUnixTimestamp = this._convertSwitchTimeToUnixTimestamp(nightSwitchTime, now);
            secondsLeftForNightWallpaperSwitch = nigthSwitchUnixTimestamp - now.to_unix();
        }
        log(`secondsLeftForNightWallpaperSwitch => ${secondsLeftForNightWallpaperSwitch}`);
        this._scheduledTimeout = Mainloop.timeout_add_seconds(secondsLeftForNightWallpaperSwitch, this._onNightWallpaperTimeout.bind(this));
    }

    _onDayWallpaperSwitchTimeChanged(settings, key) {
        log(`_onDayWallpaperSwitchTimeChanged => key = ${key}`);
    }

    _onNightWallpaperSwitchTimeChanged(settings, key) {
        log(`_onNightWallpaperSwitchTimeChanged => key = ${key}`);
    }

    _connectSettings() {
        log('Connecting settings...');
        this._onDayWallpaperSwitchTimeChangedId = this.settings.connect('changed::day-wallpaper-switch-time', this._onDayWallpaperSwitchTimeChanged.bind(this));
        this._onNightWallpaperSwitchTimeChangedId = this.settings.connect('changed::night-wallpaper-switch-time', this._onNightWallpaperSwitchTimeChanged.bind(this));
    }

    _disconnectSettings() {
        log('Disconnecting settings...');
        this.settings.disconnect(this._onDayWallpaperSwitchTimeChangedId);
        this.settings.disconnect(this._onNightWallpaperSwitchTimeChangedId);
    }
}

function init() {
    log(`initializing ${Me.metadata.name} version ${Me.metadata.version}`);

    const Utils = Me.imports.utils;
    let settings = ExtensionUtils.getSettings();

    if (!Utils.isWallpaperSet(settings, 'day-wallpaper')) {
        Utils.fallbackToSystemWallpaper(settings, 'day-wallpaper');
    }

    if (!Utils.isWallpaperSet(settings, 'night-wallpaper')) {
        Utils.fallbackToSystemWallpaper(settings, 'night-wallpaper');
    }
}

function enable() {
    log(`enabling ${Me.metadata.name} version ${Me.metadata.version}`);
    let settings = ExtensionUtils.getSettings();
    dayNigthWallpaperExtension = new DayNightWallpaperExtension(settings);
    dayNigthWallpaperExtension.start();
}

function disable() {
    log(`disabling ${Me.metadata.name} version ${Me.metadata.version}`);
    dayNigthWallpaperExtension.stop();
    dayNigthWallpaperExtension = null;
}