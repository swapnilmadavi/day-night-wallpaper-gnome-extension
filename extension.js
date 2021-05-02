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
        this._currentMode = null;
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
        this._currentMode = null;
    }

    _refresh() {
        const nextWallpaperSwitch = this._decideNextWallpaperSwitch();
        const currentBackgroundUri = this._getDesktopBackgroundImage();
        const currentBackgroundAdjustment = this._getDesktopBackgroundAdjustment();

        if (nextWallpaperSwitch.mode == Utils.wallpaperMode.DAY) {
            this._currentMode = Utils.wallpaperMode.NIGHT;
            const nightWallpaperUri = this._settings.get_string('night-wallpaper');
            const nightWallpaperAdjustment = this._settings.get_string('night-wallpaper-adjustment');
            if (currentBackgroundUri != nightWallpaperUri) {
                this._setDesktopBackgroundImage(nightWallpaperUri);
            }
            if (currentBackgroundAdjustment != nightWallpaperAdjustment) {
                this._setDesktopBackgroundAdjustment(nightWallpaperAdjustment);
            }
            this._scheduleDayWallpaperSwitch(nextWallpaperSwitch.secondsLeftForSwitch);
        } else {
            this._currentMode = Utils.wallpaperMode.DAY;
            const dayWallpaperUri = this._settings.get_string('day-wallpaper');
            const dayWallpaperAdjustment = this._settings.get_string('day-wallpaper-adjustment');
            if (currentBackgroundUri != dayWallpaperUri) {
                this._setDesktopBackgroundImage(dayWallpaperUri);
            }
            if (currentBackgroundAdjustment != dayWallpaperAdjustment) {
                this._setDesktopBackgroundAdjustment(dayWallpaperAdjustment);
            }
            this._scheduleNightWallpaperSwitch(nextWallpaperSwitch.secondsLeftForSwitch);
        }
    }

    _setDesktopBackground(uri, adjustment) {
        log(`Setting desktop background => ${uri}, ${adjustment}`);
        const backgroundSettings = Utils.getDesktopBackgroundSettings();
        backgroundSettings.set_string('picture-uri', uri);
        backgroundSettings.set_string('picture-options', adjustment);
    }

    _setDesktopBackgroundImage(uri) {
        log(`Setting desktop background image => ${uri}`);
        const backgroundSettings = Utils.getDesktopBackgroundSettings();
        backgroundSettings.set_string('picture-uri', uri);
    }

    _getDesktopBackgroundImage() {
        const backgroundSettings = Utils.getDesktopBackgroundSettings();
        return backgroundSettings.get_string('picture-uri');
    }

    _setDesktopBackgroundAdjustment(adjustment) {
        log(`Setting desktop background adjustment => ${adjustment}`);
        const backgroundSettings = Utils.getDesktopBackgroundSettings();
        backgroundSettings.set_string('picture-options', adjustment);
    }

    _getDesktopBackgroundAdjustment() {
        const backgroundSettings = Utils.getDesktopBackgroundSettings();
        return backgroundSettings.get_string('picture-options');
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
            return new Utils.NextWallpaperSwitch(Utils.wallpaperMode.DAY, secondsLeftForDayWallpaperSwitch);
        } else {
            // Schedule night wallpaper switch
            return new Utils.NextWallpaperSwitch(Utils.wallpaperMode.NIGHT, secondsLeftForNightWallpaperSwitch);
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
        this._currentMode = Utils.wallpaperMode.DAY;
        const uri = this._settings.get_string('day-wallpaper');
        const adjustment = this._settings.get_string('day-wallpaper-adjustment');
        this._setDesktopBackground(uri, adjustment);
        this._scheduleNightWallpaperSwitch();
        return GLib.SOURCE_REMOVE;
    }

    _onNightWallpaperTimeout() {
        this._currentMode = Utils.wallpaperMode.NIGHT;
        const uri = this._settings.get_string('night-wallpaper');
        const adjustment = this._settings.get_string('night-wallpaper-adjustment');
        this._setDesktopBackground(uri, adjustment);
        this._scheduleDayWallpaperSwitch();
        return GLib.SOURCE_REMOVE;
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

    _onWallpaperSwitchTimeChanged(settings, key) {
        if (this._scheduledTimeoutId) {
            GLib.source_remove(this._scheduledTimeoutId);
        }

        this._scheduledTimeoutId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 2, () => {
            this._refresh();
            return GLib.SOURCE_REMOVE;
        });
    }

    _onDayWallpaperChanged() {
        if (this._currentMode == Utils.wallpaperMode.DAY) {
            const currentBackgroundUri = this._getDesktopBackgroundImage();
            const dayWallpaperUri = this._settings.get_string('day-wallpaper');
            if (currentBackgroundUri != dayWallpaperUri) {
                this._setDesktopBackgroundImage(dayWallpaperUri);
            }
        }
    }

    _onNightWallpaperChanged() {
        if (this._currentMode == Utils.wallpaperMode.NIGHT) {
            const currentBackgroundUri = this._getDesktopBackgroundImage();
            const nightWallpaperUri = this._settings.get_string('night-wallpaper');
            if (currentBackgroundUri != nightWallpaperUri) {
                this._setDesktopBackgroundImage(nightWallpaperUri);
            }
        }
    }

    _onDayWallpaperAdjustmentChanged() {
        if (this._currentMode == Utils.wallpaperMode.DAY) {
            const currentBackgroundAdjustment = this._getDesktopBackgroundAdjustment();
            const dayWallpaperAdjustment = this._settings.get_string('day-wallpaper-adjustment');
            if (currentBackgroundAdjustment != dayWallpaperAdjustment) {
                this._setDesktopBackgroundAdjustment(dayWallpaperAdjustment);
            }
        }
    }

    _onNightWallpaperAdjustmentChanged() {
        if (this._currentMode == Utils.wallpaperMode.NIGHT) {
            const currentBackgroundAdjustment = this._getDesktopBackgroundAdjustment();
            const nightWallpaperAdjustment = this._settings.get_string('night-wallpaper-adjustment');
            if (currentBackgroundAdjustment != nightWallpaperAdjustment) {
                this._setDesktopBackgroundAdjustment(nightWallpaperAdjustment);
            }
        }
    }

    _connectSettings() {
        this._onDayWallpaperSwitchTimeChangedId = this._settings.connect('changed::day-wallpaper-switch-time', this._onWallpaperSwitchTimeChanged.bind(this));
        this._onNightWallpaperSwitchTimeChangedId = this._settings.connect('changed::night-wallpaper-switch-time', this._onWallpaperSwitchTimeChanged.bind(this));
        this._onDayWallpaperChangedId = this._settings.connect('changed::day-wallpaper', this._onDayWallpaperChanged.bind(this));
        this._onNightWallpaperChangedId = this._settings.connect('changed::night-wallpaper', this._onNightWallpaperChanged.bind(this));
        this._onDayWallpaperAdjustmentChangedId = this._settings.connect('changed::day-wallpaper-adjustment', this._onDayWallpaperAdjustmentChanged.bind(this));
        this._onNightWallpaperAdjustmentChangedId = this._settings.connect('changed::night-wallpaper-adjustment', this._onNightWallpaperAdjustmentChanged.bind(this));
    }

    _disconnectSettings() {
        this._settings.disconnect(this._onDayWallpaperSwitchTimeChangedId);
        this._settings.disconnect(this._onNightWallpaperSwitchTimeChangedId);
        this._settings.disconnect(this._onDayWallpaperChangedId);
        this._settings.disconnect(this._onNightWallpaperChangedId);
        this._settings.disconnect(this._onDayWallpaperAdjustmentChangedId);
        this._settings.disconnect(this._onNightWallpaperAdjustmentChangedId);
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