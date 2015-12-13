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
        private AVAILABLE = "0";
        private UNAVAILABLE = "1";
        private ZERO_BLOCK = "0000000000000000000000000000000000000000000000000000000000000000"

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

        public writeProgram(program: string): void {
            _Kernel.krnTrace("Saving program to disk");

            // get next available block
            // Note: track 0 is reserved for filenames
            for (var i = 1; i < _HDD.tracks; i++) {
                for (var j = 0; j < _HDD.sectors; j++) {
                    for (var k = 0; k < _HDD.blocks; k++) {
                        var data = _HDD.read(i, j, k)
                        if (this.isAvailable(data)) {
                            _HDD.write(this.block(program, i, j, k), i, j, k);
                            return;
                        }
                    }
                }
            }
        }

        public nextAvailableBlock(): void {
        }

        public createFile(filename: string): void {
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
                    var data = _HDD.read(0, i, j)
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
        }

        private block(filename: string, t: number, s: number, b: number): string {
            return this.UNAVAILABLE + t + s + b;
        }

        private isAvailable(data: string): boolean {
            if (data === null) { return false; }
            return data.substring(0, 1) === this.AVAILABLE;
        }

        public writeFile(filename, data): void {
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
        }

        public readFile(filename): void {
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
        }

        public deleteFile(filename): void {
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
        }

        public format(): void {
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
        }

        public ls(): void {
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
