# Borgstatus
Borgstatus is a gnome shell extension that displays status information of Borg backups in the gnome panel.

The running extension looks like this: ![Running Borgstatus extension](https://github.com/KwnyPwny/borgstatus/blob/main/borgstatus.png)

## Installation
1. Clone repository: `git clone https://github.com/KwnyPwny/borgstatus.git`
2. Copy extension to extensions folder`cp borgstatus/borgstatus@kpwn.de ~/.local/share/gnome-shell/extensions/`
3. Enable extension: `gnome-extensions enable borgstatus@kpwn.de`
4. It might be necessary to restart Gnome for changes to take effect: `Alt+F2`, `r`, `Enter`

## Usage
The extension relies on Borg status files to be present. This is not a default Borg mechanism but has to be configured in your Borg setup.

In general, the extension reads the contents of two files
* `~/.local/share/borgstatus/last_bup`: This file has to contain the datetime of the last successful backup.
* `~/.local/share/borgstatus/status`:  This file has to contain an integer from -1 to 2. This value represents the status of the last backup. It is mapped to an indicator as shown in the following table. The meaning of the status can of course be chosen according to ones needs.

| Status | Indicator | Meaning                         |
| ------ |:---------:| ------------------------------- |
| -1     | ◯        | Backup drive not mounted        |
|  0     | 🟢        | Backup successful               |
|  1     | 🟡        | Backup successful with warnings |
|  2     | 🔴        | Backup erroneous                |


An exemplary setup is presented in the following.

```bash
#!/bin/bash

# Check if drive is mounted:
if ! grep -qs '/media/Backup ' /proc/mounts
then
	echo -1  > ~/.local/share/borgstatus/status
	exit 1
fi

# Backup
/usr/bin/borg create [...]
rc_create=$?

/usr/bin/borg prune [...]
rc_prune=$?

# Evaluate return codes
if [ $rc_create -eq 0 ] && [ $rc_prune -eq 0 ]
then
	/usr/bin/date '+%d.%m. %H:%M' > ~/.local/share/borgstatus/last_bup
	echo 0 > ~/.local/share/borgstatus/status
elif [ $rc_create -eq 1 ] || [ $rc_prune -eq 1 ]
then
	/usr/bin/date '+%d.%m. %H:%M' > ~/.local/share/borgstatus/last_bup
	echo 1 > ~/.local/share/borgstatus/status
else
	echo 2 > ~/.local/share/borgstatus/status
fi
```
