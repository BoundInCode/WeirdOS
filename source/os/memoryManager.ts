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

        public static allocate(program: string): number {
            var len = program.length;
            var oldBase = this.base;
            for (var i = 0; i < len/2; i++) {
                _Memory[this.base + i] = program.substr(i*2, 2);
            }
            this.base += len;

            return oldBase;
        }

        public static read(location: number, pcb: PCB): string {
            return _Memory[pcb.base + location];
        }

        public static write(bytes: string, location: number, pcb: PCB): void {
            var len = bytes.length;
            for (var i = 0; i < len/2; i++) {
                _Memory[pcb.base + location + i] = bytes.substr(i*2, 2);
            }
        }
    }
}
