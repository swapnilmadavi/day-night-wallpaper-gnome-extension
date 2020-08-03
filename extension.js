'use strict';

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const Gio = imports.gi.Gio;

// function getSettings() {
//      // Get the GSchema source so we can lookup our settings
//      let gschema = Gio.SettingsSchemaSource.new_from_directory(
//         Me.dir.get_child('schemas').get_path(),
//         Gio.SettingsSchemaSource.get_default(),
//         false
//     );
// }

function init() {
    log(`initializing ${Me.metadata.name} version ${Me.metadata.version}`);
}


function enable() {
    log(`enabling ${Me.metadata.name} version ${Me.metadata.version}`);
}


function disable() {
    log(`disabling ${Me.metadata.name} version ${Me.metadata.version}`);
}