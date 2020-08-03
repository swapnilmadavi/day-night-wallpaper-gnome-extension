'use strict';

const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();


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

    // Create a parent widget that we'll return from this function
    let prefsWidget = new Gtk.Grid({
        margin: 18,
        column_spacing: 12,
        row_spacing: 12,
        column_homogeneous: true,
        visible: true
    });

    let filter = new Gtk.FileFilter();
    filter.add_mime_type('image/*');

    // Add a simple title and add it to the prefsWidget
    let title = new Gtk.Label({
        label: '<b>Wallpapers</b>',
        halign: Gtk.Align.START,
        use_markup: true,
        visible: true
    });
    prefsWidget.attach(title, 0, 0, 2, 1);

    // Create a label & switch for `show-indicator`
    let dayWallpaperLabel = new Gtk.Label({
        label: 'Day',
        visible: true
    });
    prefsWidget.attach(dayWallpaperLabel, 0, 1, 1, 1);

    let dayWallpaperChooserButton = new Gtk.FileChooserButton({
        title: 'Day Wallpaper',
        action: Gtk.FileChooserAction.OPEN,
        filter: filter,
        visible: true
    });
    prefsWidget.attach(dayWallpaperChooserButton, 1, 1, 1, 1);

    let hSeparator = new Gtk.Separator({
        orientation: Gtk.Orientation.HORIZONTAL,
        visible: true
    })
    prefsWidget.attach(hSeparator, 0, 2, 2, 1);

    // Create a label & switch for `show-indicator`
    let nightWallpaperLabel = new Gtk.Label({
        label: 'Night',
        visible: true
    });
    prefsWidget.attach(nightWallpaperLabel, 0, 3, 1, 1);

    let nightWallpaperChooserButton = new Gtk.FileChooserButton({
        title: 'Night Wallpaper',
        action: Gtk.FileChooserAction.OPEN,
        visible: true
    });
    prefsWidget.attach(nightWallpaperChooserButton, 1, 3, 1, 1);

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