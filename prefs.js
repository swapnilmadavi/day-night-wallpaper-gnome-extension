#!/usr/bin/gjs

'use strict';

const { Gio, GObject, Gtk } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const SettingsUi = Me.imports.settingsUi;

function getSettings() {
    let gschema = Gio.SettingsSchemaSource.new_from_directory(
        Me.dir.get_child('schemas').get_path(),
        Gio.SettingsSchemaSource.get_default(),
        false
    );

    let settings = new Gio.Settings({
        settings_schema: gschema.lookup('org.gnome.shell.extensions.day-night-wallpaper', true)
    });

    return settings;
}

const DayNightWallpaperPrefsWidget = GObject.registerClass(
    class DayNightWallpaperPrefsWidget extends Gtk.Box {
        _init() {
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

            this.wallpapersSection.dayWallpaperChooserButton.connect('file-set', () => {
                let uri = dayWallpaperChooserButton.get_uri();
                log(`Uri: ${uri}`);
            });

            this.wallpapersSection.dayWallpaperChooserButton.connect('file-set', this._getACookie.bind(this));
        }

        _getACookie() {
            this.switchTimesSection.daySwitchTimeWidget.hourSpinButton.set_value(3);
        }
    });

function init() {
    const Utils = Me.imports.utils;
    let settings = getSettings();

    if (!Utils.isWallpaperSet(settings, 'day-wallpaper')) {
        Utils.fallbackToSystemWallpaper(settings, 'day-wallpaper')
    }

    if (!Utils.isWallpaperSet(settings, 'night-wallpaper')) {
        Utils.fallbackToSystemWallpaper(settings, 'night-wallpaper')
    }
}

function buildPrefsWidget() {
    let gschema = Gio.SettingsSchemaSource.new_from_directory(
        Me.dir.get_child('schemas').get_path(),
        Gio.SettingsSchemaSource.get_default(),
        false
    );

    this.settings = new Gio.Settings({
        settings_schema: gschema.lookup('org.gnome.shell.extensions.day-night-wallpaper', true)
    });

    let prefsWidget = new DayNightWallpaperPrefsWidget();
    prefsWidget.show_all();

    return prefsWidget;
}