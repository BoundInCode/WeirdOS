/* ------------
pcb.ts

Process Control Block prototype for the OS
 ------------ */

module TSOS {

    enum ProcessState {
        NEW,
        WAITING,
        READY,
        HALTED,
        RUNNING,
        TERMINATED
    }

    export class PCB {

        private pid: number;
        private x: number;
        private y: number;
        private z: boolean;
        private pc: number;
        private acc: number;
        private processState: ProcessState;
        private program: string;

        constructor() {
            this.x = 0;
            this.y = 0;
            this.z = false;
            this.pc = 0;
            this.acc = 0;
            this.processState = ProcessState.NEW;
        }

        public toString() {
            var retVal = "";
            return retVal;
        }
    }
}
