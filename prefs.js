#!/usr/bin/gjs

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

            // Wallpaper files filter
            const wallpaperFileFilter = new Gtk.FileFilter();
            wallpaperFileFilter.set_name('Image files');
            wallpaperFileFilter.add_mime_type('image/jpg');
            wallpaperFileFilter.add_mime_type('image/png');
            wallpaperFileFilter.add_mime_type('image/jpeg');
            wallpaperFileFilter.add_mime_type('image/bmp');

            // Day Wallpaper
            const dayWallpaperLabel = new Gtk.Label({
                label: 'Day',
                halign: Gtk.Align.START,
                hexpand: true
            });
        
            const dayWallpaperChooserButton = new Gtk.FileChooserButton({
                title: 'Day Wallpaper',
                action: Gtk.FileChooserAction.OPEN,
                halign: Gtk.Align.END,
                width_chars: 40,
                filter: wallpaperFileFilter
            });

            this.attach(dayWallpaperLabel, 0, 1, 1, 1);
            this.attach_next_to(dayWallpaperChooserButton, dayWallpaperLabel, Gtk.PositionType.RIGHT, 1, 1);
        
            // Night Wallpaper
            const nightWallpaperLabel = new Gtk.Label({
                label: 'Night',
                halign: Gtk.Align.START,
                hexpand: true
            });
        
            const nightWallpaperChooserButton = new Gtk.FileChooserButton({
                title: 'Night Wallpaper',
                action: Gtk.FileChooserAction.OPEN,
                halign: Gtk.Align.END,
                width_chars: 40,
                filter: wallpaperFileFilter
            });

            this.attach(nightWallpaperLabel, 0, 2, 1, 1);
            this.attach_next_to(nightWallpaperChooserButton, nightWallpaperLabel, Gtk.PositionType.RIGHT, 1, 1);

            // Switch Times section
            const switchTimesSectionLabel = new Gtk.Label({
                label: '<b>Switch Times</b>',
                halign: Gtk.Align.START,
                use_markup: true
            });
            this.attach(switchTimesSectionLabel, 0, 3, 2, 1);

            const switchTimesWidget = this._buildSwitchTimesWidget()
            switchTimesWidget.set_halign(Gtk.Align.CENTER)
            this.attach(switchTimesWidget, 0, 4, 2, 1);
        }

        _buildSwitchTimesWidget() {
            const timeWidget = new Gtk.Box({spacing: 4});
            const hourSpinAdustment = new Gtk.Adjustment({
                lower: 0,
                upper: 23,
                step_increment: 1
            });
            const minuteSpinAdustment = new Gtk.Adjustment({
                lower: 0,
                upper: 59,
                step_increment: 1
            });
            
            let timeColonLabel = Gtk.Label.new(':');

            // Day Time
            const dayHourSpinButton = new Gtk.SpinButton({
                adjustment: hourSpinAdustment,
                wrap: true,
                max_width_chars: 2,
                orientation: Gtk.Orientation.VERTICAL
            });

            const dayMinuteSpinButton = new Gtk.SpinButton({
                adjustment: minuteSpinAdustment,
                wrap: true,
                max_width_chars: 2,
                orientation: Gtk.Orientation.VERTICAL
            });
           
            timeWidget.pack_start(dayHourSpinButton, false, false, 0);
            timeWidget.pack_start(timeColonLabel, false, false, 0);
            timeWidget.pack_start(dayMinuteSpinButton, false, false, 0);

            // Night Time
            const nightHourSpinButton = new Gtk.SpinButton({
                adjustment: hourSpinAdustment,
                wrap: true,
                max_width_chars: 2,
                orientation: Gtk.Orientation.VERTICAL
            });

            timeColonLabel = Gtk.Label.new(':');

            const nightMinuteSpinButton = new Gtk.SpinButton({
                adjustment: minuteSpinAdustment,
                wrap: true,
                max_width_chars: 2,
                orientation: Gtk.Orientation.VERTICAL
            });

            timeWidget.pack_start(nightHourSpinButton, false, false, 0);
            timeWidget.pack_start(timeColonLabel, false, false, 0);
            timeWidget.pack_start(nightMinuteSpinButton, false, false, 0);

            return timeWidget;
        };
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