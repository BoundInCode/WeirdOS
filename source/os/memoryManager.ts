///<reference path="../globals.ts" />

/* ------------
 MemoryManager.ts

 Requires globals.ts
 ------------ */

module TSOS {

    export class MemoryManager {

        private static SIZE = 768;

        public init(): void { }

        public static clear(start: number, end: number) {
            for (var i = start; i < end; i++) {
                _Memory.write("00", i);
            }
        }

        public static allocate(program: string): number {
            // Find free block
            var blockStart = -1;
            for (var i = 0; i < this.SIZE; i+=256) {
                if (_Memory.read(i) === "00") {
                    blockStart = i;
                    break;
                }
            }
            if (blockStart == -1) { return -1; }

            for (var i = 0; i < program.length/2; i++) {
                _Memory.write(program.substr(i+i, 2), blockStart + i);
            }
            return blockStart;
        }

        public static read(location: number, pcb: PCB): string {
            return _Memory.read(pcb.base + location);
        }

        public static clearAll(): void {
            for (var i = 0; i < this.SIZE; i++) {
                _Memory.clear(i);
            }
        }

        public static write(bytes: string, location: number, pcb: PCB): void {
            var len = bytes.length;
            for (var i = 0; i < len/2; i++) {
                _Memory.write(bytes.substr(i*2, 2), pcb.base + location + i);
            }
        }
    }
}
