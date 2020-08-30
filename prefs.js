#!/usr/bin/gjs

'use strict';

const { Gio, GObject, Gtk } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const SettingsUi = Me.imports.settingsUi;
const Utils = Me.imports.utils;

let DayNightWallpaperPrefsWidget = GObject.registerClass(
class DayNightWallpaperPrefsWidget extends Gtk.Box {
    _init(settings) {
        super._init({
            margin: 18,
            spacing: 12,
            orientation: Gtk.Orientation.VERTICAL
        })

        this._settings = settings;

        // Wallpapers section
        const wallpapersSectionLabel = new Gtk.Label({
            label: '<b>Wallpapers</b>',
            halign: Gtk.Align.START,
            use_markup: true
        });
        this.wallpapersSection = new SettingsUi.WallpapersSection();

        this.wallpapersSection.setDayWallpaperUri(settings.get_string('day-wallpaper'));
        this.wallpapersSection.setNightWallpaperUri(settings.get_string('night-wallpaper'));

        this.wallpapersSection.dayWallpaperChooserButton.connect('file-set', () => {
            const wallpaperUri = this.wallpapersSection.getDayWallpaperUri()
            this._settings.set_string('day-wallpaper', wallpaperUri);
        });
        this.wallpapersSection.nightWallpaperChooserButton.connect('file-set', () => {
            const wallpaperUri = this.wallpapersSection.getNightWallpaperUri()
            this._settings.set_string('night-wallpaper', wallpaperUri);
        });

        this.pack_start(wallpapersSectionLabel, false, true, 0);
        this.pack_start(this.wallpapersSection, false, true, 0);

        // Switch Times section
        const switchTimesSectionLabel = new Gtk.Label({
            label: '<b>Switch Times (24-hour)</b>',
            halign: Gtk.Align.START,
            use_markup: true
        });
        this.switchTimesSection = new SettingsUi.SwitchTimesSection();
        
        this._readDayWallpaperSwitchTime(settings.get_double('day-wallpaper-switch-time'));
        this._readNightWallpaperSwitchTime(settings.get_double('night-wallpaper-switch-time'));

        this.switchTimesSection.daySwitchTimeWidget.hourSpinButton.connect('value-changed', this._onDayWallpaperSwitchTimeChanged.bind(this));
        this.switchTimesSection.daySwitchTimeWidget.minuteSpinButton.connect('value-changed', this._onDayWallpaperSwitchTimeChanged.bind(this));

        this.switchTimesSection.nightSwitchTimeWidget.hourSpinButton.connect('value-changed', this._onNightWallpaperSwitchTimeChanged.bind(this));
        this.switchTimesSection.nightSwitchTimeWidget.minuteSpinButton.connect('value-changed', this._onNightWallpaperSwitchTimeChanged.bind(this));

        this.pack_start(switchTimesSectionLabel, false, true, 0);
        this.pack_start(this.switchTimesSection, false, true, 0);

        // About section
        const aboutSection = new SettingsUi.AboutSection();
        aboutSection.set_margin_top(30);
        this.pack_start(aboutSection, false, true, 0);
    }

    _readDayWallpaperSwitchTime(dayWallpaperSwitchTimeFromSettings) {
        const dayWallpaperSwitchTime = Utils.SwitchTime.newFromSettings(dayWallpaperSwitchTimeFromSettings);
        this.switchTimesSection.setDayWallpaperSwitchTime(dayWallpaperSwitchTime.switchHour, dayWallpaperSwitchTime.switchMinute);
    }

    _readNightWallpaperSwitchTime(nightWallpaperSwitchTimeFromSettings) {
        const nightWallpaperSwitchTime = Utils.SwitchTime.newFromSettings(nightWallpaperSwitchTimeFromSettings);
        this.switchTimesSection.setNightWallpaperSwitchTime(nightWallpaperSwitchTime.switchHour, nightWallpaperSwitchTime.switchMinute);
    }

    _onDayWallpaperSwitchTimeChanged(spinButton) {
        const daySwitchHour = this.switchTimesSection.daySwitchTimeWidget.hourSpinButton.get_value_as_int();
        const daySwitchMinute = this.switchTimesSection.daySwitchTimeWidget.minuteSpinButton.get_value_as_int();
        const daySwitchTime = new Utils.SwitchTime(daySwitchHour, daySwitchMinute);
        this._settings.set_double('day-wallpaper-switch-time', daySwitchTime.toSettingsFormat());
    }

    _onNightWallpaperSwitchTimeChanged(spinButton) {
        const nightSwitchHour = this.switchTimesSection.nightSwitchTimeWidget.hourSpinButton.get_value_as_int();
        const nightSwitchMinute = this.switchTimesSection.nightSwitchTimeWidget.minuteSpinButton.get_value_as_int();
        const nightSwitchTime = new Utils.SwitchTime(nightSwitchHour, nightSwitchMinute);
        this._settings.set_double('night-wallpaper-switch-time', nightSwitchTime.toSettingsFormat());
    }
});

function init() {
    Utils.checkExtensionSettings();
}

function buildPrefsWidget() {
    const settings = ExtensionUtils.getSettings();
    const prefsWidget = new DayNightWallpaperPrefsWidget(settings);
    prefsWidget.show_all();

    return prefsWidget;
}