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
            this.HEADER_SIZE = 4;
            this.ZERO_BLOCK = "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
            this.UNAVAILABLE_BLOCK = "10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
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
        DeviceDriverFileSystem.prototype.stringToHex = function (str) {
            var hex = "";
            for (var i = 0; i < str.length; i++) {
                var c = str.charCodeAt(i);
                hex += c.toString(16);
            }
            return hex;
        };
        DeviceDriverFileSystem.prototype.hexToString = function (str) {
            var arr = str.match(/.{2}/g);
            var s = '';
            for (var i = 0; i < arr.length; i++) {
                var c = String.fromCharCode(parseInt(arr[i], 16));
                s += c;
            }
            return s;
        };
        DeviceDriverFileSystem.prototype.writeHex = function (program) {
            _Kernel.krnTrace("Writing program to disk");
            var block = this.nextAvailableBlock();
            _HDD.write(block, this.UNAVAILABLE_BLOCK); // reserved
            var nextBlock = new TSOS.TSB(0, 0, 0);
            var str = program;
            var maxLength = _HDD.blockSize * 2 - this.HEADER_SIZE;
            if (program.length > maxLength) {
                nextBlock = this.writeHex(program.substring(maxLength));
                str = program.substring(0, maxLength);
            }
            _HDD.write(block, this.UNAVAILABLE + nextBlock + str);
            return block;
        };
        DeviceDriverFileSystem.prototype.writeFileContents = function (fileContents, tsb) {
            _Kernel.krnTrace("Saving data to disk");
            var block = (tsb !== null) ? tsb : this.nextAvailableBlock();
            var nextBlock = new TSOS.TSB(0, 0, 0);
            var str = fileContents;
            var maxLength = _HDD.blockSize - this.HEADER_SIZE / 2;
            if (fileContents.length > maxLength) {
                nextBlock = this.writeFileContents(str.substring(maxLength));
                str = str.substring(0, maxLength);
            }
            str = this.stringToHex(str);
            _HDD.write(block, this.UNAVAILABLE + nextBlock + str);
            return block;
        };
        DeviceDriverFileSystem.prototype.nextAvailableBlock = function () {
            for (var i = 1; i < _HDD.tracks; i++) {
                for (var j = 0; j < _HDD.sectors; j++) {
                    for (var k = 0; k < _HDD.blocks; k++) {
                        var tsb = new TSOS.TSB(i, j, k);
                        var data = _HDD.read(tsb);
                        if (this.isAvailable(data)) {
                            var block = new TSOS.TSB(i, j, k);
                            // _HDD.write(block, this.UNAVAILABLE_BLOCK); // reserved
                            return block;
                        }
                    }
                }
            }
            return null;
        };
        DeviceDriverFileSystem.prototype.createFile = function (filename) {
            if (!_HDD.formatted) {
                _StdOut.putText("Please format the HDD before duing any Disk I/O.");
                _StdOut.advanceLine();
                _OsShell.putPrompt();
                return;
            }
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
                    var tsb = new TSOS.TSB(0, i, j);
                    var data = _HDD.read(tsb);
                    if (this.isAvailable(data)) {
                        this.files[filename] = tsb;
                        var str = this.stringToHex(filename);
                        _HDD.write(tsb, this.UNAVAILABLE + "000" + str);
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
        DeviceDriverFileSystem.prototype.isAvailable = function (data) {
            if (data === null) {
                return false;
            }
            return data.substring(0, 1) === this.AVAILABLE;
        };
        DeviceDriverFileSystem.prototype.getTSB = function (block) {
            var t = parseInt(block.charAt(1));
            var s = parseInt(block.charAt(2));
            var b = parseInt(block.charAt(3));
            return new TSOS.TSB(t, s, b);
        };
        DeviceDriverFileSystem.prototype.deleteBlock = function (tsb) {
            var block = _HDD.read(tsb);
            var nextBlock = this.getTSB(block);
            if (nextBlock.toString() !== "000") {
                this.deleteBlock(nextBlock);
            }
            _HDD.write(tsb, this.ZERO_BLOCK);
        };
        DeviceDriverFileSystem.prototype.writeFile = function (filename, data) {
            if (!_HDD.formatted) {
                _StdOut.putText("Please format the HDD before duing any Disk I/O.");
                _StdOut.advanceLine();
                _OsShell.putPrompt();
                return;
            }
            else if (!this.files[filename]) {
                _StdOut.putText("File '" + filename + "' does not exist.");
                return;
            }
            var filenameTsb = this.files[filename];
            var tsb = this.getTSB(_HDD.read(filenameTsb));
            if (tsb.toString() === "000") {
                var tsb = this.nextAvailableBlock();
            }
            // clear file beforehand
            this.deleteBlock(tsb);
            this.writeFileContents(data, tsb);
            _StdOut.putText("File '" + filename + "' written.");
            _StdOut.advanceLine();
            _OsShell.putPrompt();
            _Kernel.krnTrace("[WRITE] Writing file: " + filename);
        };
        DeviceDriverFileSystem.prototype.readData = function (tsb) {
            var program = "";
            var data = _HDD.read(tsb);
            var nextBlock = this.getTSB(data);
            while (nextBlock.toString() != "000") {
                program += data.substring(4);
                data = _HDD.read(nextBlock);
                nextBlock = this.getTSB(data);
            }
            program += data.substring(4);
            return program;
        };
        DeviceDriverFileSystem.prototype.readFile = function (filename) {
            if (!_HDD.formatted) {
                _StdOut.putText("Please format the HDD before duing any Disk I/O.");
                _StdOut.advanceLine();
                _OsShell.putPrompt();
                return;
            }
            console.log(localStorage);
            if (!this.files[filename]) {
                _StdOut.putText("File '" + filename + "' does not exist.");
                return;
            }
            var filenameTsb = this.files[filename];
            var tsb = this.getTSB(_HDD.read(filenameTsb));
            var data = _HDD.read(tsb);
            var nextBlock = this.getTSB(data);
            while (nextBlock.track != 0 || nextBlock.sector != 0 || nextBlock.block != 0) {
                _StdOut.putText(this.hexToString(data.substring(4)));
                data = _HDD.read(nextBlock);
                nextBlock = this.getTSB(data);
            }
            _StdOut.putText(this.hexToString(data.substring(4)));
            _StdOut.advanceLine();
            _OsShell.putPrompt();
            _Kernel.krnTrace("[READ] Reading file: " + filename);
        };
        DeviceDriverFileSystem.prototype.deleteFile = function (filename) {
            if (!_HDD.formatted) {
                _StdOut.putText("Please format the HDD before duing any Disk I/O.");
                _StdOut.advanceLine();
                _OsShell.putPrompt();
                return;
            }
            if (!this.files[filename]) {
                _StdOut.putText("File '" + filename + "' does not exist.");
                return;
            }
            var filenameTsb = this.files[filename];
            var tsb = this.getTSB(_HDD.read(filenameTsb));
            var data = _HDD.read(tsb);
            var nextBlock = this.getTSB(data);
            while (nextBlock.track != 0 || nextBlock.sector != 0 || nextBlock.block != 0) {
                var newData = this.AVAILABLE + data.substring(1);
                _HDD.write(tsb, newData);
                var data = _HDD.read(filenameTsb);
                var nextBlock = this.getTSB(data);
            }
            _StdOut.putText("File '" + filename + "' deleted.");
            _StdOut.advanceLine();
            _OsShell.putPrompt();
            delete this.files[filename];
            _Kernel.krnTrace("[DELETE] Deleting file: " + filename);
        };
        DeviceDriverFileSystem.prototype.format = function () {
            this.files = new Object();
            for (var i = 0; i < _HDD.tracks; i++) {
                for (var j = 0; j < _HDD.sectors; j++) {
                    for (var k = 0; k < _HDD.blocks; k++) {
                        var tsb = new TSOS.TSB(i, j, k);
                        _HDD.write(tsb, this.ZERO_BLOCK);
                    }
                }
            }
            _StdOut.putText("Disk formatted.");
            _StdOut.advanceLine();
            _OsShell.putPrompt();
            _Kernel.krnTrace("[FORMAT] Formatting disk.");
            _HDD.formatted = true;
        };
        DeviceDriverFileSystem.prototype.ls = function () {
            if (!_HDD.formatted) {
                _StdOut.putText("Please format the HDD before duing any Disk I/O.");
                return;
            }
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
