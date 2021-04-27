#!/usr/bin/gjs

'use strict';

const { GObject, Gtk } = imports.gi;

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