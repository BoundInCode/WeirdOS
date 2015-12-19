///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

/* ----------------------------------
   DeviceDriverFileSystem.ts

   Requires deviceDriver.ts

   The Kernel File System Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverFileSystem extends DeviceDriver {

        private files: Object = new Object();
        private AVAILABLE   = "0";
        private UNAVAILABLE = "1";
        private HEADER_SIZE = 4;
        private ZERO_BLOCK = "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
        private UNAVAILABLE_BLOCK = "10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"

        constructor() {
            // Override the base method pointers.
            super(this.krnFsDriverEntry, this.krnHandleDiskOperation);
        }

        public krnFsDriverEntry() {
            // Initialization routine for this, the kernel-mode File System Device Driver.
            this.status = "loaded";
        }

        public krnHandleDiskOperation(params) {
            var action = params[0];
            switch(action) {
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
        }

        private stringToHex(str: string): string {
            var hex = "";
            for (var i = 0; i < str.length; i++) {
                var c = str.charCodeAt(i);
                hex += c.toString(16);
            }
            return hex;
        }

        private hexToString(str: string): string {
            var arr = str.match(/.{2}/g);
            var s = '';
            for (var i = 0; i < arr.length; i++) {
                var c = String.fromCharCode(parseInt(arr[i], 16) );
                s += c;
            }
            return s;
        }

        public writeHex(program: string): TSB {
            _Kernel.krnTrace("Writing program to disk");
            var block = this.nextAvailableBlock();
            _HDD.write(block, this.UNAVAILABLE_BLOCK); // reserved
            var nextBlock = new TSB(0,0,0);
            var str = program;
            var maxLength = _HDD.blockSize * 2 - this.HEADER_SIZE;

            if (program.length > maxLength) {
                nextBlock = this.writeHex(program.substring(maxLength));
                str = program.substring(0, maxLength);
            }
            _HDD.write(block, this.UNAVAILABLE + nextBlock + str);
            return block;
        }

        public writeFileContents(fileContents: string): TSB {
            _Kernel.krnTrace("Saving data to disk");
            var block = this.nextAvailableBlock();
            var nextBlock = new TSB(0,0,0);
            var str = fileContents;
            var maxLength = _HDD.blockSize - this.HEADER_SIZE / 2;

            if (fileContents.length > maxLength) {
                nextBlock = this.writeFileContents(str.substring(maxLength));
                str = str.substring(0,maxLength);
            }
            str = this.stringToHex(str);
            _HDD.write(block, this.UNAVAILABLE + nextBlock + str);
            return block;
        }

        public nextAvailableBlock(): TSB {
            for (var i = 1; i < _HDD.tracks; i++) {
                for (var j = 0; j < _HDD.sectors; j++) {
                    for (var k = 0; k < _HDD.blocks; k++) {
                        var tsb = new TSB(i, j, k);
                        var data = _HDD.read(tsb);
                        if (this.isAvailable(data)) {
                            var block = new TSB(i, j, k)
                            // _HDD.write(block, this.UNAVAILABLE_BLOCK); // reserved
                            return block;
                        }
                    }
                }
            }
            return null;
        }

        public createFile(filename: string): void {
            if (!_HDD.formatted) {
                _StdOut.putText("Please format the HDD before duing any Disk I/O.");
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
                    var tsb = new TSB(0, i, j);
                    var data = _HDD.read(tsb)
                    if (this.isAvailable(data)) {
                        this.files[filename] = tsb;
                        var str =  this.stringToHex(filename);
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
        }

        private isAvailable(data: string): boolean {
            if (data === null) { return false; }
            return data.substring(0, 1) === this.AVAILABLE;
        }

        private getTSB(block: String): TSB {
            var t = parseInt(block.charAt(1));
            var s = parseInt(block.charAt(2));
            var b = parseInt(block.charAt(3));
            return new TSB(t,s,b);
        }

        public deleteBlock(tsb: TSB): void {
            _HDD.write(tsb, this.ZERO_BLOCK);
        }

        public writeFile(filename, data): void {
            if (!_HDD.formatted) {
                _StdOut.putText("Please format the HDD before duing any Disk I/O.");
                return;
            }
            if (!this.files[filename]) {
                _StdOut.putText("File '" + filename + "' does not exist.");
                return;
            }
            this.deleteFile(filename);
            var filenameTsb = this.files[filename];
            var tsb = this.getTSB(_HDD.read(filenameTsb));
            while (tsb.track == 0 && tsb.sector == 0 && tsb.block == 0) {
                tsb = this.nextAvailableBlock();
                var str =  this.stringToHex(filename);
                _HDD.write(filenameTsb, this.UNAVAILABLE + tsb + str);
            }

            if (data.length > 60) {
                var nextBlock = this.writeFileContents(data.substring(60));
                var str = this.stringToHex(data.substring(60));
                _HDD.write(tsb,this.UNAVAILABLE + nextBlock + str);
            } else {
                var str = this.UNAVAILABLE + "000" + this.stringToHex(data);
                _HDD.write(tsb, str);
            }
            _StdOut.putText("File '" + filename + "' written.");
            _StdOut.advanceLine();
            _OsShell.putPrompt();
            _Kernel.krnTrace("[WRITE] Writing file: " + filename);
        }

        public readData(tsb: TSB): string {
            var program = "";
            var data = _HDD.read(tsb);
            var nextBlock = this.getTSB(data);
            while (nextBlock.toString() != "000") {
                program += data.substring(4);
                data = _HDD.read(nextBlock);
                nextBlock = this.getTSB(data);
                // console.log("data: " + data);
                // console.log("nextBlock: " + nextBlock);
            }
            program += data.substring(4);
            return program;
        }

        public readFile(filename): void {
            if (!_HDD.formatted) {
                _StdOut.putText("Please format the HDD before duing any Disk I/O.");
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
        }

        public deleteFile(filename): void {
            if (!_HDD.formatted) {
                _StdOut.putText("Please format the HDD before duing any Disk I/O.");
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
        }

        public format(): void {
            this.files = new Object();
            for (var i = 0; i < _HDD.tracks; i++) {
                for (var j = 0; j < _HDD.sectors; j++) {
                    for (var k = 0; k < _HDD.blocks; k++) {
                        var tsb = new TSB(i, j, k);
                        _HDD.write(tsb, this.ZERO_BLOCK);
                    }
                }
            }
            _StdOut.putText("Disk formatted.");
            _StdOut.advanceLine();
            _OsShell.putPrompt();
            _Kernel.krnTrace("[FORMAT] Formatting disk.");
            _HDD.formatted = true;
        }

        public ls(): void {
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
        }
    }
}
