/* ------------
pcb.ts

Process Control Block prototype for the OS
 ------------ */

module TSOS {

    export class PCB {

        public pid: number;
        public base: number;
        public limit: number;

        public x: number;
        public y: number;
        public z: boolean;

        public pc: number;
        public acc: number;

        // Stats
        public startTime: number;
        public endTime: number;
        public waitTime: number;

        public processState: TSOS.ProcessState;
        public onDisk: boolean;
        public tsb: TSB;
        public priority: number;

        constructor(pid: number, base: number, limit: number, priority: number) {
            this.pid = pid;
            this.base = base;
            this.limit = limit;
            this.x = 0;
            this.y = 0;
            this.z = false;
            this.pc = 0;
            this.acc = 0;
            this.processState = TSOS.ProcessState.NEW;

            this.startTime = _OSclock;
            this.endTime = _OSclock;
            this.waitTime = 0;
            this.onDisk = false;
            this.tsb = null;
            this.priority = priority;
        }

        public getTurnAroundTime() {
            return this.endTime - this.startTime;
        }
    }
}
