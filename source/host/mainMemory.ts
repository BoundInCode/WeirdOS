///<reference path="../globals.ts" />

module TSOS {

    export class MainMemory {

        public memory: Array<string>;


        constructor(private size: number) {
            this.memory = new Array(size);
        }

        public init(): void {
            for (var i = 0, len = this.memory.length; i < len; i++) {
                this.memory[i] = "00";
            }
        }

        public load(program: String, position: number = 0): void {
            for (var i = 0, len = program.length; i < len-1; i+=2) {
                this.memory[i] = program[i, i+1];
            }
        }

    }
}
