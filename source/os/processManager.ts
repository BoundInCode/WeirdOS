///<reference path="../globals.ts" />

/* ------------
 processManager.ts

 Requires globals.ts
 ------------ */

module TSOS {

    export enum ProcessState {
        NEW,
        WAITING,
        READY,
        HALTED,
        RUNNING,
        TERMINATED
    }

    export class ProcessManager {

        private static currentPID: number;

        public processControlBlocks: Array<TSOS.PCB>;
        public readyQueue: Queue;
        private currentPID: number;

        constructor() {
            this.processControlBlocks = new Array();
            this.readyQueue = new Queue();
            this.currentPID = 0;
        }

        public init(): void { }

        public load(program: string): number {
            var programText = program.replace(/\s/g, '');
            var base = MemoryManager.allocate(programText);
            var limit = base + programText.length;

            var processControlBlock = new PCB(this.currentPID, base, limit);
            this.processControlBlocks[this.currentPID] = processControlBlock;

            this.currentPID++;
            return processControlBlock.pid;
        }

        public run(pid: number): void {
            if (pid > this.currentPID) {
                _StdOut.putText("Process " + pid + " does not exist.");
                return;
            }

            var process = this.processControlBlocks[pid];
            process.processState = ProcessState.READY;

            _CPU.CurrentPCB = process;
            _CPU.isExecuting = true;
        }

    }
}
