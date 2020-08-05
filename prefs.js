'use strict';

const { Gio, GObject, Gtk } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const DayNightWallpaperPrefsWidget = GObject.registerClass(
    class DayNightWallpaperPrefsWidget extends Gtk.Grid {
        _init() {
            super._init({
                margin: 18,
                column_spacing: 12,
                row_spacing: 12,
                // column_homogeneous: true
            })

            // Wallpapers section
            const wallpapersSectionLabel = new Gtk.Label({
                label: '<b>Wallpapers</b>',
                halign: Gtk.Align.START,
                use_markup: true
            });
            this.attach(wallpapersSectionLabel, 0, 0, 2, 1);

            // Day Wallpaper
            const dayWallpaperLabel = new Gtk.Label({
                label: 'Day',
                halign: Gtk.Align.START,
                hexpand: true
            });
            this.attach(dayWallpaperLabel, 0, 1, 1, 1);
        
            const dayWallpaperChooserButton = new Gtk.FileChooserButton({
                title: 'Day Wallpaper',
                action: Gtk.FileChooserAction.OPEN,
                halign: Gtk.Align.END,
                width_chars: 40
                // filter: filter,
            });
            this.attach_next_to(dayWallpaperChooserButton, dayWallpaperLabel, Gtk.PositionType.RIGHT, 1, 1);
        
            // Night Wallpaper
            const nightWallpaperLabel = new Gtk.Label({
                label: 'Night',
                halign: Gtk.Align.START,
                hexpand: true
            });
            this.attach(nightWallpaperLabel, 0, 2, 1, 1);
        
            const nightWallpaperChooserButton = new Gtk.FileChooserButton({
                title: 'Night Wallpaper',
                action: Gtk.FileChooserAction.OPEN,
                halign: Gtk.Align.END,
                width_chars: 40
            });
            this.attach_next_to(nightWallpaperChooserButton, nightWallpaperLabel, Gtk.PositionType.RIGHT, 1, 1);

            // Switch Times section
            const switchTimesSectionLabel = new Gtk.Label({
                label: '<b>Switch Times</b>',
                halign: Gtk.Align.START,
                use_markup: true
            });
            this.attach(switchTimesSectionLabel, 0, 3, 2, 1);

            // Day Wallpaper
            const dayWallpaperLabel1 = new Gtk.Label({
                label: 'Day Time',
                halign: Gtk.Align.START,
                hexpand: true
            });
            this.attach(dayWallpaperLabel1, 0, 4, 1, 1);
        
            const dayWallpaperChooserButton1 = new Gtk.FileChooserButton({
                title: 'Day Wallpaper',
                action: Gtk.FileChooserAction.OPEN,
                halign: Gtk.Align.END,
                width_chars: 40
            });
            this.attach_next_to(dayWallpaperChooserButton1, dayWallpaperLabel1, Gtk.PositionType.RIGHT, 1, 1);
        }
    });

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
    let prefsWidget = new DayNightWallpaperPrefsWidget();
    prefsWidget.show_all();

    return prefsWidget;

    // let filter = new Gtk.FileFilter();
    // filter.add_mime_type('image/*');

    // Bind the switch to the `show-indicator` key
    // this.settings.bind(
    //     'show-indicator',
    //     toggle,
    //     'active',
    //     Gio.SettingsBindFlags.DEFAULT
    // );
}