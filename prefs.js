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

            const _pictureOptions = Utils.getAvailablePictureOptions();
    
            // ** Day Wallpaper Settings section **
            this._dayWallpaperSettingsSection = new SettingsUi.WallpaperSettingsSection('Day Wallpaper', _pictureOptions);
    
            this._dayWallpaperSettingsSection.setWallpaperUri(settings.get_string('day-wallpaper'));
            this._dayWallpaperSettingsSection.setWallpaperAdjustment(settings.get_string('day-wallpaper-adjustment'));
            const _dayWallpaperSwitchTime = Utils.SwitchTime.newFromSettings(settings.get_double('day-wallpaper-switch-time'));
            this._dayWallpaperSettingsSection.setWallpaperSwitchTime(_dayWallpaperSwitchTime.switchHour, _dayWallpaperSwitchTime.switchMinute);
    
            this._dayWallpaperSettingsSection.imageChooserButton.connect('file-set', () => {
                const wallpaperUri = this._dayWallpaperSettingsSection.getWallpaperUri()
                this._settings.set_string('day-wallpaper', wallpaperUri);
            });
            this._dayWallpaperSettingsSection.adjustmentComboBoxText.connect('changed', () => {
                const wallpaperAdjustment = this._dayWallpaperSettingsSection.getWallpaperAdjustment()
                this._settings.set_string('day-wallpaper-adjustment', wallpaperAdjustment);
            });
            this._dayWallpaperSettingsSection.switchTimeWidget.hourSpinButton.connect('value-changed', this._onDayWallpaperSwitchTimeChanged.bind(this));
            this._dayWallpaperSettingsSection.switchTimeWidget.minuteSpinButton.connect('value-changed', this._onDayWallpaperSwitchTimeChanged.bind(this));

            this.pack_start(this._dayWallpaperSettingsSection, false, true, 0);

            // ** Night Wallpaper Settings section **
            this._nightWallpaperSettingsSection = new SettingsUi.WallpaperSettingsSection('Night Wallpaper', _pictureOptions);
    
            this._nightWallpaperSettingsSection.setWallpaperUri(settings.get_string('night-wallpaper'));
            this._nightWallpaperSettingsSection.setWallpaperAdjustment(settings.get_string('night-wallpaper-adjustment'));
            const _nightWallpaperSwitchTime = Utils.SwitchTime.newFromSettings(settings.get_double('night-wallpaper-switch-time'));
            this._nightWallpaperSettingsSection.setWallpaperSwitchTime(_nightWallpaperSwitchTime.switchHour, _nightWallpaperSwitchTime.switchMinute);
    
            this._nightWallpaperSettingsSection.imageChooserButton.connect('file-set', () => {
                const wallpaperUri = this._nightWallpaperSettingsSection.getWallpaperUri()
                this._settings.set_string('night-wallpaper', wallpaperUri);
            });
            this._nightWallpaperSettingsSection.adjustmentComboBoxText.connect('changed', () => {
                const wallpaperAdjustment = this._nightWallpaperSettingsSection.getWallpaperAdjustment()
                this._settings.set_string('night-wallpaper-adjustment', wallpaperAdjustment);
            });
            this._nightWallpaperSettingsSection.switchTimeWidget.hourSpinButton.connect('value-changed', this._onNightWallpaperSwitchTimeChanged.bind(this));
            this._nightWallpaperSettingsSection.switchTimeWidget.minuteSpinButton.connect('value-changed', this._onNightWallpaperSwitchTimeChanged.bind(this));

            this.pack_start(this._nightWallpaperSettingsSection, false, true, 0);
    
            // ** About section **
            const _aboutSection = new SettingsUi.AboutSection();
            _aboutSection.set_margin_top(30);
            this.pack_start(_aboutSection, false, true, 0);
        }

        _onDayWallpaperSwitchTimeChanged(spinButton) {
            const daySwitchHour = this._dayWallpaperSettingsSection.switchTimeWidget.hourSpinButton.get_value_as_int();
            const daySwitchMinute = this._dayWallpaperSettingsSection.switchTimeWidget.minuteSpinButton.get_value_as_int();
            const daySwitchTime = new Utils.SwitchTime(daySwitchHour, daySwitchMinute);
            this._settings.set_double('day-wallpaper-switch-time', daySwitchTime.toSettingsFormat());
        }
    
        _onNightWallpaperSwitchTimeChanged(spinButton) {
            const nightSwitchHour = this._nightWallpaperSettingsSection.switchTimeWidget.hourSpinButton.get_value_as_int();
            const nightSwitchMinute = this._nightWallpaperSettingsSection.switchTimeWidget.minuteSpinButton.get_value_as_int();
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