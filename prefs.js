#!/usr/bin/gjs

'use strict';

const { Gio, GObject, Gtk } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const SettingsUi = Me.imports.settingsUi;
const Utils = Me.imports.utils;

let DayNightWallpaperPrefsWidget = GObject.registerClass(
class DayNightWallpaperPrefsWidget extends Gtk.Grid {
    _init(settings) {
        super._init({
            margin: 18,
            column_spacing: 12,
            row_spacing: 12,
        })

        // Day-Night Wallpaper settings
        this._settings = settings;

        // Image adjustment options
        this._pictureOptions = Utils.getAvailablePictureOptions().sort();

        // Image files filter
        this._imageFileFilter = new Gtk.FileFilter();
        this._imageFileFilter.set_name('Image files');
        this._imageFileFilter.add_mime_type('image/jpg');
        this._imageFileFilter.add_mime_type('image/png');
        this._imageFileFilter.add_mime_type('image/jpeg');
        this._imageFileFilter.add_mime_type('image/bmp');

        this._dayWallpaperImageChooserButton = this._createWallpaperImageChooserButton(settings.get_string('day-wallpaper'));
        this._dayWallpaperAdjustmentComboBoxText = this._createWallpaperAdjustmentComboBoxText(settings.get_string('day-wallpaper-adjustment'));
        this._dayWallpaperSwitchTimeWidget = new SettingsUi.SwitchTimeWidget();
        const _dayWallpaperSwitchTime = Utils.SwitchTime.newFromSettings(settings.get_double('day-wallpaper-switch-time'));
        this._dayWallpaperSwitchTimeWidget.setSwitchTime(_dayWallpaperSwitchTime.switchHour, _dayWallpaperSwitchTime.switchMinute);

        this._nightWallpaperImageChooserButton = this._createWallpaperImageChooserButton(settings.get_string('night-wallpaper'));
        this._nightWallpaperAdjustmentComboBoxText = this._createWallpaperAdjustmentComboBoxText(settings.get_string('night-wallpaper-adjustment'));
        this._nightWallpaperSwitchTimeWidget = new SettingsUi.SwitchTimeWidget();
        const _nightWallpaperSwitchTime = Utils.SwitchTime.newFromSettings(settings.get_double('night-wallpaper-switch-time'));
        this._nightWallpaperSwitchTimeWidget.setSwitchTime(_nightWallpaperSwitchTime.switchHour, _nightWallpaperSwitchTime.switchMinute);

        this._buildDayWallpaperSection();
        this._buildNightWallpaperSection();
        this._buildAboutSection();

        this._connectSettings();
    }

    _createWallpaperImageChooserButton(imageUri) {
        let wallpaperImageChooserButton = new Gtk.FileChooserButton({
            title: 'Image File',
            action: Gtk.FileChooserAction.OPEN,
            halign: Gtk.Align.END,
            width_chars: 40,
            filter: this._imageFileFilter
        });
        wallpaperImageChooserButton.set_uri(imageUri);
        return wallpaperImageChooserButton;
    }

    _createWallpaperAdjustmentComboBoxText(adjustmentOption) {
        let wallpaperAdjustmentComboBoxText = new Gtk.ComboBoxText();
        let adjustmentOptionIndex = 0;
        for (let i = 0; i < this._pictureOptions.length; i++) {
            if (this._pictureOptions[i] == adjustmentOption) {
                adjustmentOptionIndex = i;
            }
            wallpaperAdjustmentComboBoxText.append_text(this._capitalise(this._pictureOptions[i]));
        }
        wallpaperAdjustmentComboBoxText.set_active(adjustmentOptionIndex);
        return wallpaperAdjustmentComboBoxText;
    }

    _buildDayWallpaperSection() {
        // Day wallpaper title
        const _dayWallpaperTitleLabel = new Gtk.Label({
            label: `<b>Day Wallpaper</b>`,
            halign: Gtk.Align.START,
            use_markup: true
        });
        this.attach(_dayWallpaperTitleLabel, 0, 1, 2, 1);

        // Day wallpaper image
        const _dayWallpaperImageLabel = new Gtk.Label({
            label: 'Image',
            halign: Gtk.Align.START,
            hexpand: true
        });
        this.attach(_dayWallpaperImageLabel, 0, 2, 1, 1);
        this.attach_next_to(this._dayWallpaperImageChooserButton, _dayWallpaperImageLabel, Gtk.PositionType.RIGHT, 1, 1);

        // Day wallpaper adjustment
        const _dayWallpaperAdjustmentLabel = new Gtk.Label({
            label: 'Adjustment',
            halign: Gtk.Align.START,
            hexpand: true
        });
        this.attach(_dayWallpaperAdjustmentLabel, 0, 3, 1, 1);
        this.attach_next_to(this._dayWallpaperAdjustmentComboBoxText, _dayWallpaperAdjustmentLabel, Gtk.PositionType.RIGHT, 1, 1);

        // Day wallpaper switch time
        const _dayWallpaperSwitchTimeLabel = new Gtk.Label({
            label: 'Switch Time (24-hour)',
            halign: Gtk.Align.START,
            hexpand: true
        });
        this.attach(_dayWallpaperSwitchTimeLabel, 0, 4, 1, 1);
        this.attach_next_to(this._dayWallpaperSwitchTimeWidget, _dayWallpaperSwitchTimeLabel, Gtk.PositionType.RIGHT, 1, 1);
    }

    _buildNightWallpaperSection() {
        // Night wallpaper title
        const _nightWallpaperTitleLabel = new Gtk.Label({
            label: `<b>Night Wallpaper</b>`,
            halign: Gtk.Align.START,
            use_markup: true,
            margin_top: 18
        });
        this.attach(_nightWallpaperTitleLabel, 0, 5, 2, 1)

        // Night wallpaper image
        const _nightWallpaperImageLabel = new Gtk.Label({
            label: 'Image',
            halign: Gtk.Align.START,
            hexpand: true
        });
        this.attach(_nightWallpaperImageLabel, 0, 6, 1, 1);
        this.attach_next_to(this._nightWallpaperImageChooserButton, _nightWallpaperImageLabel, Gtk.PositionType.RIGHT, 1, 1);

        // Night wallpaper adjustment
        const _nightWallpaperAdjustmentLabel = new Gtk.Label({
            label: 'Adjustment',
            halign: Gtk.Align.START,
            hexpand: true
        });
        this.attach(_nightWallpaperAdjustmentLabel, 0, 7, 1, 1);
        this.attach_next_to(this._nightWallpaperAdjustmentComboBoxText, _nightWallpaperAdjustmentLabel, Gtk.PositionType.RIGHT, 1, 1);

        // Night wallpaper switch time
        const _nightWallpaperSwitchTimeLabel = new Gtk.Label({
            label: 'Switch Time (24-hour)',
            halign: Gtk.Align.START,
            hexpand: true
        });
        this.attach(_nightWallpaperSwitchTimeLabel, 0, 8, 1, 1);
        this.attach_next_to(this._nightWallpaperSwitchTimeWidget, _nightWallpaperSwitchTimeLabel, Gtk.PositionType.RIGHT, 1, 1);
    }

    _buildAboutSection() {
        const _aboutSection = new SettingsUi.AboutSection();
        _aboutSection.set_margin_top(18);
        this.attach(_aboutSection, 0, 9, 2, 1);
    }

    _onDayWallpaperSwitchTimeChanged(spinButton) {
        const daySwitchHour = this._dayWallpaperSwitchTimeWidget.hourSpinButton.get_value_as_int();
        const daySwitchMinute = this._dayWallpaperSwitchTimeWidget.minuteSpinButton.get_value_as_int();
        const daySwitchTime = new Utils.SwitchTime(daySwitchHour, daySwitchMinute);
        this._settings.set_double('day-wallpaper-switch-time', daySwitchTime.toSettingsFormat());
    }

    _onNightWallpaperSwitchTimeChanged(spinButton) {
        const nightSwitchHour = this._nightWallpaperSwitchTimeWidget.hourSpinButton.get_value_as_int();
        const nightSwitchMinute = this._nightWallpaperSwitchTimeWidget.minuteSpinButton.get_value_as_int();
        const nightSwitchTime = new Utils.SwitchTime(nightSwitchHour, nightSwitchMinute);
        this._settings.set_double('night-wallpaper-switch-time', nightSwitchTime.toSettingsFormat());
    }

    _connectSettings() {
        this._dayWallpaperImageChooserButton.connect('file-set', () => {
            this._settings.set_string('day-wallpaper', this._dayWallpaperImageChooserButton.get_uri());
        });
        this._dayWallpaperAdjustmentComboBoxText.connect('changed', () => {
            const activeItem = this._dayWallpaperAdjustmentComboBoxText.get_active();
            this._settings.set_string('day-wallpaper-adjustment', this._pictureOptions[activeItem]);
        });
        this._dayWallpaperSwitchTimeWidget.hourSpinButton.connect('value-changed', this._onDayWallpaperSwitchTimeChanged.bind(this));
        this._dayWallpaperSwitchTimeWidget.minuteSpinButton.connect('value-changed', this._onDayWallpaperSwitchTimeChanged.bind(this));

        this._nightWallpaperImageChooserButton.connect('file-set', () => {
            this._settings.set_string('night-wallpaper', this._nightWallpaperImageChooserButton.get_uri());
        });
        this._nightWallpaperAdjustmentComboBoxText.connect('changed', () => {
            const activeItem = this._nightWallpaperAdjustmentComboBoxText.get_active();
            this._settings.set_string('night-wallpaper-adjustment', this._pictureOptions[activeItem]);
        });
        this._nightWallpaperSwitchTimeWidget.hourSpinButton.connect('value-changed', this._onNightWallpaperSwitchTimeChanged.bind(this));
        this._nightWallpaperSwitchTimeWidget.minuteSpinButton.connect('value-changed', this._onNightWallpaperSwitchTimeChanged.bind(this));
    }

    _capitalise(string) {
        return string.charAt(0).toUpperCase() + string.slice(1)
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