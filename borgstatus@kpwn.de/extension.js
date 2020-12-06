/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.	If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

'use strict';

const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
const Mainloop = imports.mainloop;

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const Config = imports.misc.config;
const SHELL_MINOR = parseInt(Config.PACKAGE_VERSION.split('.')[1]);

const refreshTime = 300.0;

var status = '';
var lastBup = '';
var mainLabel, lastBupItem;
var statusDisplay = {'-1' : '◯', '0' : '🟢', '1' : '🟡', '2' : '🔴'}


function readFile(path, maxLines) {
	let file = Gio.File.new_for_path(path);
	let fileInputStream = file.read(null);
	let dataInputStream = Gio.DataInputStream.new(fileInputStream);

	let line = '';
	let content = '';
	// This is not a while loop, such that no infinite loop can emerge.
	for(let i = 0; i < maxLines; i++) {
		line = String(dataInputStream.read_line(null));
		if(line == ',0') break;
		content += line.split(/,/)[0];
	}
	fileInputStream.close(null);
	dataInputStream.close(null);
	return content;
}


function getStatus() {
	status = readFile('.local/share/borgstatus/status', 5);
	lastBup = readFile('.local/share/borgstatus/last_bup', 5);
	mainLabel.set_text('Borg: ' + statusDisplay[status]);
	lastBupItem.label.set_text('Last Backup: ' + lastBup);
	return true;
}


var MyIndicator = class MyIndicator extends PanelMenu.Button {
	_init() {
		super._init(0.0, `BorgStatusIndicator`, false);

		mainLabel = new St.Label({
			text: 'Borg: -',
			style_class: 'backupLabelUnmount',
			y_align: Clutter.ActorAlign.CENTER
		});

		lastBupItem = new PopupMenu.PopupMenuItem('Last Backup: -' + lastBup);

		this.add_child(mainLabel);
		this.menu.addMenuItem(lastBupItem);
	}
}


// Compatibility with gnome-shell >= 3.32
if (SHELL_MINOR > 30) {
	MyIndicator = GObject.registerClass({GTypeName: 'MyIndicator'}, MyIndicator);
}


var indicator = null;


function init() {
}


function enable() {
	indicator = new MyIndicator();
	Main.panel.addToStatusArea(`BorgStatusIndicator`, indicator);
	getStatus()
	timeout = Mainloop.timeout_add_seconds(refreshTime, getStatus);
}


function disable() {
	if (indicator !== null) {
		indicator.destroy();
		indicator = null;
	}
}
