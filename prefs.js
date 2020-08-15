#!/usr/bin/gjs

'use strict';

const { Gio, GObject, Gtk } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const SettingsUi = Me.imports.settingsUi;

const DayNightWallpaperPrefsWidget = GObject.registerClass(
    class DayNightWallpaperPrefsWidget extends Gtk.Box {
        _init(settings) {
            super._init({
                margin: 18,
                spacing: 12,
                orientation: Gtk.Orientation.VERTICAL
            })

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
                let wallpaperUri = this.wallpapersSection.getDayWallpaperUri()
                settings.set_string('day-wallpaper', wallpaperUri);
            });
            this.wallpapersSection.nightWallpaperChooserButton.connect('file-set', () => {
                let wallpaperUri = this.wallpapersSection.getNightWallpaperUri()
                settings.set_string('night-wallpaper', wallpaperUri);
            });

            this.pack_start(wallpapersSectionLabel, false, true, 0);
            this.pack_start(this.wallpapersSection, false, true, 0);

            // Switch Times section
            const switchTimesSectionLabel = new Gtk.Label({
                label: '<b>Switch Times</b>',
                halign: Gtk.Align.START,
                use_markup: true
            });
            this.switchTimesSection = new SettingsUi.SwitchTimesSection();
            this.pack_start(switchTimesSectionLabel, false, true, 0);
            this.pack_start(this.switchTimesSection, false, true, 0);
        }

        _getACookie() {
            this.switchTimesSection.daySwitchTimeWidget.hourSpinButton.set_value(3);
        }
    });

function init() {
    const Utils = Me.imports.utils;
    let settings = ExtensionUtils.getSettings();

    if (!Utils.isWallpaperSet(settings, 'day-wallpaper')) {
        Utils.fallbackToSystemWallpaper(settings, 'day-wallpaper')
    }

    if (!Utils.isWallpaperSet(settings, 'night-wallpaper')) {
        Utils.fallbackToSystemWallpaper(settings, 'night-wallpaper')
    }
}

function buildPrefsWidget() {
    let settings = ExtensionUtils.getSettings();
    let prefsWidget = new DayNightWallpaperPrefsWidget(settings);
    prefsWidget.show_all();

    return prefsWidget;
}