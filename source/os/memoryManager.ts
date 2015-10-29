///<reference path="../globals.ts" />

/* ------------
 MemoryManager.ts

 Requires globals.ts
 ------------ */

module TSOS {

    export class MemoryManager {

        private static SIZE = 768;
        private static base = 0;

        public init(): void { }

        public static clear(start: number, end: number) {
            for (var i = start; i < end; i++) {
                _Memory.write("00", i);
            }
        }

        public static allocate(program: string): number {
            var len = program.length;
            var oldBase = this.base;
            for (var i = 0; i < len/2; i++) {
                _Memory.write(program.substr(i*2, 2), this.base + i);
            }

            //this.base += len;
            return oldBase;
        }

        public static read(location: number, pcb: PCB): string {
            return _Memory.read(pcb.base + location);
        }

        public static write(bytes: string, location: number, pcb: PCB): void {
            var len = bytes.length;
            for (var i = 0; i < len/2; i++) {
                _Memory.write(bytes.substr(i*2, 2), pcb.base + location + i);
            }
        }
    }
}
