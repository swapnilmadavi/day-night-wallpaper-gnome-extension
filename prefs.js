'use strict';

const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

class PrefsWidgetBuilder {
    constructor() {
        this.prefsWidget = new Gtk.Grid({
            margin: 18,
            column_spacing: 12,
            row_spacing: 12,
            column_homogeneous: true,
            visible: true
        });
    }

    attachWallpapersSection() {
        // Wallpapers Header
        let title = new Gtk.Label({
            label: '<b>Wallpapers</b>',
            halign: Gtk.Align.START,
            use_markup: true,
            visible: true
        });
        this.prefsWidget.attach(title, 0, 0, 2, 1);
    
        // Day Wallpaper
        let dayWallpaperLabel = new Gtk.Label({
            label: 'Day',
            visible: true
        });
        this.prefsWidget.attach(dayWallpaperLabel, 0, 1, 1, 1);
    
        let dayWallpaperChooserButton = new Gtk.FileChooserButton({
            title: 'Day Wallpaper',
            action: Gtk.FileChooserAction.OPEN,
            // filter: filter,
            visible: true
        });
        this.prefsWidget.attach(dayWallpaperChooserButton, 1, 1, 1, 1);
    
        // Night Wallpaper
        let nightWallpaperLabel = new Gtk.Label({
            label: 'Night',
            visible: true
        });
        this.prefsWidget.attach(nightWallpaperLabel, 0, 2, 1, 1);
    
        let nightWallpaperChooserButton = new Gtk.FileChooserButton({
            title: 'Night Wallpaper',
            action: Gtk.FileChooserAction.OPEN,
            visible: true
        });
        this.prefsWidget.attach(nightWallpaperChooserButton, 1, 2, 1, 1);
    }

    build() {
      this.attachWallpapersSection()
      return this.prefsWidget
    }
} 

function init() {
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

    // Parent prefs window
    let prefsWidget = new PrefsWidgetBuilder().build()

    // let filter = new Gtk.FileFilter();
    // filter.add_mime_type('image/*');

    // Bind the switch to the `show-indicator` key
    // this.settings.bind(
    //     'show-indicator',
    //     toggle,
    //     'active',
    //     Gio.SettingsBindFlags.DEFAULT
    // );

    // Return our widget which will be added to the window
    return prefsWidget;
}