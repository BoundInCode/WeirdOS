///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/* ----------------------------------
   DeviceDriverFileSystem.ts

   Requires deviceDriver.ts

   The Kernel File System Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var DeviceDriverFileSystem = (function (_super) {
        __extends(DeviceDriverFileSystem, _super);
        function DeviceDriverFileSystem() {
            // Override the base method pointers.
            _super.call(this, this.krnFsDriverEntry, this.krnHandleDiskOperation);
            this.files = new Object();
            this.AVAILABLE = "0";
            this.UNAVAILABLE = "1";
            this.ZERO_BLOCK = "0000000000000000000000000000000000000000000000000000000000000000";
        }
        DeviceDriverFileSystem.prototype.krnFsDriverEntry = function () {
            // Initialization routine for this, the kernel-mode File System Device Driver.
            this.status = "loaded";
        };
        DeviceDriverFileSystem.prototype.krnHandleDiskOperation = function (params) {
            var action = params[0];
            switch (action) {
                case "create":
                    var filename = params[1];
                    this.createFile(filename);
                    break;
                case "write":
                    var filename = params[1];
                    var data = params[2];
                    this.writeFile(filename, data);
                    break;
                case "read":
                    var filename = params[1];
                    this.readFile(filename);
                    break;
                case "delete":
                    var filename = params[1];
                    this.deleteFile(filename);
                    break;
                case "format":
                    this.format();
                    break;
                case "ls":
                    this.ls();
                    break;
            }
        };
        DeviceDriverFileSystem.prototype.writeProgram = function (program) {
            _Kernel.krnTrace("Saving program to disk");
            // get next available block
            // Note: track 0 is reserved for filenames
            for (var i = 1; i < _HDD.tracks; i++) {
                for (var j = 0; j < _HDD.sectors; j++) {
                    for (var k = 0; k < _HDD.blocks; k++) {
                        var data = _HDD.read(i, j, k);
                        if (this.isAvailable(data)) {
                            _HDD.write(this.block(program, i, j, k), i, j, k);
                            return;
                        }
                    }
                }
            }
        };
        DeviceDriverFileSystem.prototype.nextAvailableBlock = function () {
        };
        DeviceDriverFileSystem.prototype.createFile = function (filename) {
            _Kernel.krnTrace("Creating file: " + filename);
            if (this.files[filename]) {
                // File already exists
                _StdOut.putText("File already exists with name: '" + filename + "'");
                _StdOut.advanceLine();
                _OsShell.putPrompt();
                return;
            }
            // get next available block
            for (var i = 0; i < _HDD.sectors; i++) {
                for (var j = 0; j < _HDD.blocks; j++) {
                    var data = _HDD.read(0, i, j);
                    if (this.isAvailable(data)) {
                        this.files[filename] = [0, i, j];
                        _HDD.write(this.block(filename, 0, i, j), 0, i, j);
                        _StdOut.putText("Created file: '" + filename + "'");
                        _StdOut.advanceLine();
                        _OsShell.putPrompt();
                        return;
                    }
                }
            }
            _StdOut.putText("Error. Disk space full. Could not create file.");
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        };
        DeviceDriverFileSystem.prototype.block = function (filename, t, s, b) {
            return this.UNAVAILABLE + t + s + b;
        };
        DeviceDriverFileSystem.prototype.isAvailable = function (data) {
            if (data === null) {
                return false;
            }
            return data.substring(0, 1) === this.AVAILABLE;
        };
        DeviceDriverFileSystem.prototype.writeFile = function (filename, data) {
            if (!this.files[filename]) {
                _StdOut.putText("File '" + filename + "' does not exist.");
                return;
            }
            var filenameTsb = this.files[filename];
            var tsb = _HDD.read(parseInt(filenameTsb[0]), parseInt(filenameTsb[1]), parseInt(filenameTsb[2]));
            _HDD.write(data, parseInt(tsb[0]), parseInt(tsb[1]), parseInt(tsb[2]));
            _StdOut.putText("File '" + filename + "' written.");
            _StdOut.advanceLine();
            _OsShell.putPrompt();
            _Kernel.krnTrace("[WRITE] Writing file: " + filename);
        };
        DeviceDriverFileSystem.prototype.readFile = function (filename) {
            if (!this.files[filename]) {
                _StdOut.putText("File '" + filename + "' does not exist.");
                return;
            }
            var filenametsb = this.files[filename];
            var tsb = _HDD.read(filenametsb[0], filenametsb[1], filenametsb[2]);
            var data = _HDD.read(parseInt(tsb[0]), parseInt(tsb[1]), parseInt(tsb[2]));
            _StdOut.putText(data);
            _StdOut.advanceLine();
            _OsShell.putPrompt();
            _Kernel.krnTrace("[READ] Reading file: " + filename);
        };
        DeviceDriverFileSystem.prototype.deleteFile = function (filename) {
            if (!this.files[filename]) {
                _StdOut.putText("File '" + filename + "' does not exist.");
                return;
            }
            var filenameTsb = this.files[filename];
            var tsb = _HDD.read(parseInt(filenameTsb[0]), parseInt(filenameTsb[1]), parseInt(filenameTsb[2]));
            var fnBlock = this.AVAILABLE + filenameTsb + filename;
            _HDD.write(fnBlock, parseInt(filenameTsb[0]), parseInt(filenameTsb[1]), parseInt(filenameTsb[2]));
            var data = _HDD.read(parseInt(tsb[0]), parseInt(tsb[1]), parseInt(tsb[2]));
            var block = this.AVAILABLE + tsb + data;
            _HDD.write(block, parseInt(tsb[0]), parseInt(tsb[1]), parseInt(tsb[2]));
            _StdOut.putText("File '" + filename + "' deleted.");
            _StdOut.advanceLine();
            _OsShell.putPrompt();
            delete this.files[filename];
            _Kernel.krnTrace("[DELETE] Deleting file: " + filename);
        };
        DeviceDriverFileSystem.prototype.format = function () {
            for (var i = 0; i < _HDD.tracks; i++) {
                for (var j = 0; j < _HDD.sectors; j++) {
                    for (var k = 0; k < _HDD.blocks; k++) {
                        _HDD.write(this.ZERO_BLOCK, i, j, k);
                    }
                }
            }
            _StdOut.putText("Disk formatted.");
            _StdOut.advanceLine();
            _OsShell.putPrompt();
            _Kernel.krnTrace("[FORMAT] Formatting disk.");
        };
        DeviceDriverFileSystem.prototype.ls = function () {
            for (var filename in this.files) {
                _StdOut.putText(filename);
                _StdOut.advanceLine();
            }
            _StdOut.advanceLine();
            _OsShell.putPrompt();
            _Kernel.krnTrace("[LS] Listing all the files on the disk.");
        };
        return DeviceDriverFileSystem;
    })(TSOS.DeviceDriver);
    TSOS.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(TSOS || (TSOS = {}));
