#!/usr/bin/gjs

'use strict';

const { Gio, GLib } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Utils = Me.imports.utils;

let dayNigthWallpaperExtension;

const DayNightWallpaperExtension = class DayNightWallpaperExtension {
    constructor(settings) {
        this._settings = settings;
        this._scheduledTimeoutId = null;
    }

    start() {
        this._connectSettings();
        this._refresh();
    }

    stop() {
        this._disconnectSettings();

        if (this._scheduledTimeoutId) {
            GLib.source_remove(this._scheduledTimeoutId);
        }
        this._scheduledTimeoutId = null;
    }

    _refresh() {
        const nextWallpaperSwitch = this._decideNextWallpaperSwitch();
        const currentBackgroundUri = this._getDesktopBackground();

        if (nextWallpaperSwitch.type == Utils.switchType.DAY) {
            const nightWallpaperUri = this._settings.get_string('night-wallpaper');
            if (currentBackgroundUri != nightWallpaperUri) {
                this._setDesktopBackground(nightWallpaperUri);
            }
            this._scheduleDayWallpaperSwitch(nextWallpaperSwitch.secondsLeftForSwitch);
        } else {
            const dayWallpaperUri = this._settings.get_string('day-wallpaper');
            if (currentBackgroundUri != dayWallpaperUri) {
                this._setDesktopBackground(dayWallpaperUri);
            }
            this._scheduleNightWallpaperSwitch(nextWallpaperSwitch.secondsLeftForSwitch);
        }
    }

    _setDesktopBackground(uri) {
        log(`Setting desktop background => ${uri}`);
        const backgroundSettings = new Gio.Settings({ schema: 'org.gnome.desktop.background' });
        backgroundSettings.set_string('picture-uri', uri);
    }

    _getDesktopBackground() {
        const backgroundSettings = Utils.getBackgroundSettings();
        return backgroundSettings.get_string('picture-uri');
    }

    _decideNextWallpaperSwitch() {
        const dayWallpaperSwitchTime = Utils.SwitchTime.newFromSettings(this._settings.get_double('day-wallpaper-switch-time'));
        const nightWallpaperSwitchTime = Utils.SwitchTime.newFromSettings(this._settings.get_double('night-wallpaper-switch-time'));

        const now = GLib.DateTime.new_now_local();
        const secondsLeftForDayWallpaperSwitch = this._calculateSecondsLeftForSwitch(dayWallpaperSwitchTime, now);
        const secondsLeftForNightWallpaperSwitch = this._calculateSecondsLeftForSwitch(nightWallpaperSwitchTime, now);

        // Nearest switch time is scheduled first.
        // If both Day & Night wallpaper switch times are same then
        // day wallpaper is scheduled first.
        if (secondsLeftForDayWallpaperSwitch <= secondsLeftForNightWallpaperSwitch) {
            // Schedule day wallpaper switch
            return new Utils.NextWallpaperSwitch(Utils.switchType.DAY, secondsLeftForDayWallpaperSwitch);
        } else {
            // Schedule night wallpaper switch
            return new Utils.NextWallpaperSwitch(Utils.switchType.NIGHT, secondsLeftForNightWallpaperSwitch);
        }
    }

    _calculateSecondsLeftForSwitch(switchTime, now) {
        const switchDateTime = this._constructSwitchDateTime(switchTime, now);
        return switchDateTime.to_unix() - now.to_unix();
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
     * @param {Utils.SwitchTime} switchTime 
     * @param {GLib.DateTime} now 
     * @returns {GLib.DateTime} Switch DateTime object
     */
    _constructSwitchDateTime(switchTime, now) {
        let timezone = GLib.TimeZone.new_local();
        let switchDateTime = GLib.DateTime.new(
            timezone,
            now.get_year(),
            now.get_month(),
            now.get_day_of_month(),
            switchTime.switchHour,
            switchTime.switchMinute,
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
         * 
         * Example 3:-
         * Switch time => 09:00 Hrs
         * Now => 19 Aug 2020 09:00 Hrs
         * Result => 20 Aug 2020 09:00 Hrs
         * */
        const nowHour = now.get_hour();
        if (switchTime.switchHour == nowHour) { // Example 1 & 3
            const nowMinute = now.get_minute();
            if (switchTime.switchMinute <= nowMinute) {
                switchDateTime = switchDateTime.add_days(1);
            }
        } else if (switchTime.switchHour < nowHour) { // Example 2
            switchDateTime = switchDateTime.add_days(1);
        }

        return switchDateTime;
    }

    _onDayWallpaperTimeout() {
        const uri = this._settings.get_string('day-wallpaper');
        this._setDesktopBackground(uri);
        this._scheduleNightWallpaperSwitch();
        return GLib.SOURCE_REMOVE;
    }

    _onNightWallpaperTimeout() {
        const uri = this._settings.get_string('night-wallpaper');
        this._setDesktopBackground(uri);
        this._scheduleDayWallpaperSwitch();
        return GLib.SOURCE_REMOVE;
    }

    _onWallpaperSwitchTimeChanged(settings, key) {
        if (this._scheduledTimeoutId) {
            GLib.source_remove(this._scheduledTimeoutId);
        }

        this._scheduledTimeoutId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 2, () => {
            this._refresh();
            return GLib.SOURCE_REMOVE;
        });
    }

    _scheduleDayWallpaperSwitch(secondsLeftForDayWallpaperSwitch) {
        log('Scheduling switch for day wallpaper...');
        if (secondsLeftForDayWallpaperSwitch == undefined) {
            const daySwitchTime = Utils.SwitchTime.newFromSettings(this._settings.get_double('day-wallpaper-switch-time'));
            const now = GLib.DateTime.new_now_local();
            secondsLeftForDayWallpaperSwitch = this._calculateSecondsLeftForSwitch(daySwitchTime, now);
        }
        this._scheduledTimeoutId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, secondsLeftForDayWallpaperSwitch, this._onDayWallpaperTimeout.bind(this));
    }

    _scheduleNightWallpaperSwitch(secondsLeftForNightWallpaperSwitch) {
        log('Scheduling switch for night wallpaper...');
        if (secondsLeftForNightWallpaperSwitch == undefined) {
            const nightSwitchTime = Utils.SwitchTime.newFromSettings(this._settings.get_double('night-wallpaper-switch-time'));
            const now = GLib.DateTime.new_now_local();
            secondsLeftForNightWallpaperSwitch = this._calculateSecondsLeftForSwitch(nightSwitchTime, now);
        }
        this._scheduledTimeoutId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, secondsLeftForNightWallpaperSwitch, this._onNightWallpaperTimeout.bind(this));
    }

    _connectSettings() {
        this._onDayWallpaperSwitchTimeChangedId = this._settings.connect('changed::day-wallpaper-switch-time', this._onWallpaperSwitchTimeChanged.bind(this));
        this._onNightWallpaperSwitchTimeChangedId = this._settings.connect('changed::night-wallpaper-switch-time', this._onWallpaperSwitchTimeChanged.bind(this));
    }

    _disconnectSettings() {
        this._settings.disconnect(this._onDayWallpaperSwitchTimeChangedId);
        this._settings.disconnect(this._onNightWallpaperSwitchTimeChangedId);
    }
}

function init() {
    log(`Initializing ${Me.metadata.name}...`);
    Utils.checkExtensionSettings();
}

function enable() {
    log(`Enabling ${Me.metadata.name}...`);
    const settings = ExtensionUtils.getSettings();
    dayNigthWallpaperExtension = new DayNightWallpaperExtension(settings);
    dayNigthWallpaperExtension.start();
}

function disable() {
    log(`Disabling ${Me.metadata.name}...`);
    dayNigthWallpaperExtension.stop();
    dayNigthWallpaperExtension = null;
}