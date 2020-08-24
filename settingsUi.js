#!/usr/bin/gjs

'use strict';

const { GObject, Gtk } = imports.gi;

// For compatibility checks
const Config = imports.misc.config;
const SHELL_MINOR = parseInt(Config.PACKAGE_VERSION.split('.')[1]);

var WallpapersSection = class WallpapersSection extends Gtk.Grid {
    _init() {
        super._init({
            column_spacing: 12,
            row_spacing: 12,
        })

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

        this.dayWallpaperChooserButton = new Gtk.FileChooserButton({
            title: 'Day Wallpaper',
            action: Gtk.FileChooserAction.OPEN,
            halign: Gtk.Align.END,
            width_chars: 40,
            filter: wallpaperFileFilter
        });

        this.attach(dayWallpaperLabel, 0, 1, 1, 1);
        this.attach_next_to(this.dayWallpaperChooserButton, dayWallpaperLabel, Gtk.PositionType.RIGHT, 1, 1);

        // Night Wallpaper
        const nightWallpaperLabel = new Gtk.Label({
            label: 'Night',
            halign: Gtk.Align.START,
            hexpand: true
        });

        this.nightWallpaperChooserButton = new Gtk.FileChooserButton({
            title: 'Night Wallpaper',
            action: Gtk.FileChooserAction.OPEN,
            halign: Gtk.Align.END,
            width_chars: 40,
            filter: wallpaperFileFilter
        });

        this.attach(nightWallpaperLabel, 0, 2, 1, 1);
        this.attach_next_to(this.nightWallpaperChooserButton, nightWallpaperLabel, Gtk.PositionType.RIGHT, 1, 1);
    }

    setDayWallpaperUri(uri) {
        this.dayWallpaperChooserButton.set_uri(uri);
    }

    setNightWallpaperUri(uri) {
        this.nightWallpaperChooserButton.set_uri(uri);
    }

    getDayWallpaperUri() {
        return this.dayWallpaperChooserButton.get_uri();
    }

    getNightWallpaperUri() {
        return this.nightWallpaperChooserButton.get_uri();
    }
}

var SwitchTimesSection = class SwitchTimesSection extends Gtk.Box {
    _init() {
        super._init({ spacing: 6 })

        this.daySwitchTimeWidget = new SwitchTimeWidget('Day Time');
        this.nightSwitchTimeWidget = new SwitchTimeWidget('Night Time');

        this.pack_start(this.daySwitchTimeWidget, true, true, 0);
        this.pack_start(this.nightSwitchTimeWidget, true, true, 0);
    }

    setDayWallpaperSwitchTime(switchHour, switchMinute) {
        this.daySwitchTimeWidget.setSwitchTime(switchHour, switchMinute);
    }

    setNightWallpaperSwitchTime(switchHour, switchMinute) {
        this.nightSwitchTimeWidget.setSwitchTime(switchHour, switchMinute);
    }
}

var SwitchTimeWidget = class SwitchTimeWidget extends Gtk.Box {
    _init(title) {
        super._init({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 6,
            halign: Gtk.Align.CENTER
        })

        const switchTimeLabel = new Gtk.Label({
            label: title,
            halign: Gtk.Align.CENTER
        });
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
        const timeColonLabel = Gtk.Label.new(':');

        this.timeWidget = new Gtk.Box({ spacing: 4, halign: Gtk.Align.CENTER });

        this.hourSpinButton = new Gtk.SpinButton({
            adjustment: hourSpinAdustment,
            wrap: true,
            width_chars: 2,
            max_width_chars: 2,
            snap_to_ticks: true,
            numeric: true,
            orientation: Gtk.Orientation.VERTICAL
        });

        this.minuteSpinButton = new Gtk.SpinButton({
            adjustment: minuteSpinAdustment,
            wrap: true,
            width_chars: 2,
            max_width_chars: 2,
            snap_to_ticks: true,
            numeric: true,
            orientation: Gtk.Orientation.VERTICAL
        });

        this.hourSpinButton.connect('output', this._padValueWithLeadingZero.bind(this));
        this.minuteSpinButton.connect('output', this._padValueWithLeadingZero.bind(this));

        this.timeWidget.pack_start(this.hourSpinButton, false, false, 0);
        this.timeWidget.pack_start(timeColonLabel, false, false, 0);
        this.timeWidget.pack_start(this.minuteSpinButton, false, false, 0);

        this.pack_start(this.timeWidget, true, true, 0);
        this.pack_start(switchTimeLabel, true, true, 0);
    }

    setSwitchTime(switchHour, switchMinute) {
        this.hourSpinButton.set_value(switchHour);
        this.minuteSpinButton.set_value(switchMinute);
    }

    _padValueWithLeadingZero(spinButton) {
        let adjustment = spinButton.get_adjustment();
        let value = parseInt(adjustment.get_value());
        let paddedValue = (value < 10 ? '0' : '') + value;
        spinButton.set_text(paddedValue);
        return true;
    }
}

// Compatibility with gnome-shell >= 3.32
if (SHELL_MINOR > 30) {
    WallpapersSection = GObject.registerClass(
        { GTypeName: 'WallpapersSection' },
        WallpapersSection
    );

    SwitchTimesSection = GObject.registerClass(
        { GTypeName: 'SwitchTimesSection' },
        SwitchTimesSection
    );

    SwitchTimeWidget = GObject.registerClass(
        { GTypeName: 'SwitchTimeWidget' },
        SwitchTimeWidget
    );
}