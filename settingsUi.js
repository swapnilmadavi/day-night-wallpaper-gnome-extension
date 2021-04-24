#!/usr/bin/gjs

'use strict';

const { GObject, Gtk } = imports.gi;

var WallpaperSettingsSection = GObject.registerClass(
class WallpaperSettingsSection extends Gtk.Grid {
    _init(title, pictureOptions) {
        super._init({
            column_spacing: 12,
            row_spacing: 12,
        })

        this._pictureOptions = pictureOptions.sort();

        // Image files filter
        const _imageFileFilter = new Gtk.FileFilter();
        _imageFileFilter.set_name('Image files');
        _imageFileFilter.add_mime_type('image/jpg');
        _imageFileFilter.add_mime_type('image/png');
        _imageFileFilter.add_mime_type('image/jpeg');
        _imageFileFilter.add_mime_type('image/bmp');

        // Title
        const _sectionTitleLabel = new Gtk.Label({
            label: `<b>${title}</b>`,
            halign: Gtk.Align.START,
            hexpand: true,
            use_markup: true
        });
        this.attach(_sectionTitleLabel, 0, 1, 1, 1)

        // Image
        const _imageLabel = new Gtk.Label({
            label: 'Image',
            halign: Gtk.Align.START,
            hexpand: true
        });

        this.imageChooserButton = new Gtk.FileChooserButton({
            title: 'Image File',
            action: Gtk.FileChooserAction.OPEN,
            halign: Gtk.Align.END,
            width_chars: 40,
            filter: _imageFileFilter
        });

        this.attach(_imageLabel, 0, 2, 1, 1);
        this.attach_next_to(this.imageChooserButton, _imageLabel, Gtk.PositionType.RIGHT, 1, 1);

        // Adjustment
        const _adjustmentLabel = new Gtk.Label({
            label: 'Adjustment',
            halign: Gtk.Align.START,
            hexpand: true
        });

        this.adjustmentComboBoxText = new Gtk.ComboBoxText();
        for (let i = 0; i < this._pictureOptions.length; i++) {
            this.adjustmentComboBoxText.append_text(this._capitalise(this._pictureOptions[i]));
        }

        this.attach(_adjustmentLabel, 0, 3, 1, 1);
        this.attach_next_to(this.adjustmentComboBoxText, _adjustmentLabel, Gtk.PositionType.RIGHT, 1, 1);

        // Switch Time
        const _switchTimeLabel = new Gtk.Label({
            label: 'Switch Time (24-hour)',
            halign: Gtk.Align.START,
            hexpand: true
        });

        this.switchTimeWidget = new SwitchTimeWidget();

        this.attach(_switchTimeLabel, 0, 4, 1, 1);
        this.attach_next_to(this.switchTimeWidget, _switchTimeLabel, Gtk.PositionType.RIGHT, 1, 1);
    }

    setWallpaperUri(uri) {
        this.imageChooserButton.set_uri(uri);
    }

    getWallpaperUri() {
        return this.imageChooserButton.get_uri();
    }

    getWallpaperAdjustment() {
        const activeItem = this.adjustmentComboBoxText.get_active();
        return this._pictureOptions[activeItem];
    }

    setWallpaperAdjustment(adjustmentOption) {
        this.adjustmentComboBoxText.set_active(this._pictureOptions.indexOf(adjustmentOption));
    }

    setWallpaperSwitchTime(switchHour, switchMinute) {
        this.switchTimeWidget.setSwitchTime(switchHour, switchMinute);
    }

    _capitalise(string) {
        return string.charAt(0).toUpperCase() + string.slice(1)
    }
});

var SwitchTimeWidget = GObject.registerClass(
    class SwitchTimeWidget extends Gtk.Box {
        _init() {
            super._init({
                spacing: 4,
                halign: Gtk.Align.CENTER
            })

            const _hourSpinAdustment = new Gtk.Adjustment({
                lower: 0,
                upper: 23,
                step_increment: 1
            });
            const _minuteSpinAdustment = new Gtk.Adjustment({
                lower: 0,
                upper: 59,
                step_increment: 1
            });
            const _timeColonLabel = Gtk.Label.new(':');

            this.hourSpinButton = new Gtk.SpinButton({
                adjustment: _hourSpinAdustment,
                wrap: true,
                width_chars: 2,
                max_width_chars: 2,
                snap_to_ticks: true,
                numeric: true,
                orientation: Gtk.Orientation.VERTICAL
            });

            this.minuteSpinButton = new Gtk.SpinButton({
                adjustment: _minuteSpinAdustment,
                wrap: true,
                width_chars: 2,
                max_width_chars: 2,
                snap_to_ticks: true,
                numeric: true,
                orientation: Gtk.Orientation.VERTICAL
            });

            this.hourSpinButton.connect('output', this._padValueWithLeadingZero.bind(this));
            this.minuteSpinButton.connect('output', this._padValueWithLeadingZero.bind(this));

            this.pack_start(this.hourSpinButton, false, false, 0);
            this.pack_start(_timeColonLabel, false, false, 0);
            this.pack_start(this.minuteSpinButton, false, false, 0);
        }

        setSwitchTime(switchHour, switchMinute) {
            this.hourSpinButton.set_value(switchHour);
            this.minuteSpinButton.set_value(switchMinute);
        }

        _padValueWithLeadingZero(spinButton) {
            const adjustment = spinButton.get_adjustment();
            const value = parseInt(adjustment.get_value());
            const paddedValue = (value < 10 ? '0' : '') + value;
            spinButton.set_text(paddedValue);
            return true;
        }
    });

var AboutSection = GObject.registerClass(
    class AboutSection extends Gtk.Box {
        _init() {
            super._init({
                orientation: Gtk.Orientation.VERTICAL,
                spacing: 6,
                halign: Gtk.Align.CENTER
            })

            const createdByLabel = new Gtk.Label({
                label: '<span font="10" foreground="#6c757d">Created by Swapnil Madavi</span>',
                halign: Gtk.Align.CENTER,
                use_markup: true
            });

            const homepageLabel = new Gtk.Label({
                label: '<a href="https://github.com/swapnilmadavi/day-night-wallpaper-gnome-extension"><span foreground="#6c757d">Homepage</span></a>',
                halign: Gtk.Align.CENTER,
                use_markup: true
            });

            this.pack_start(createdByLabel, false, true, 0);
            this.pack_start(homepageLabel, false, true, 0);
        }
    });