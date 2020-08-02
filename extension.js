'use strict';

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();


function init() {
    log(`initializing ${Me.metadata.name} version ${Me.metadata.version}`);
}


function enable() {
    log(`enabling ${Me.metadata.name} version ${Me.metadata.version}`);
}


function disable() {
    log(`disabling ${Me.metadata.name} version ${Me.metadata.version}`);
}