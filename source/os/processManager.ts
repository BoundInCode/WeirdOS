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

        public residentList: Array<TSOS.PCB>;
        public readyQueue: Queue;
        private currentPID: number;
        public cycle: number;
        public residentListDiv: any;

        constructor() {
            this.residentList = new Array();
            this.readyQueue = new Queue();
            this.currentPID = 0;
            this.cycle = 0;
            this.residentListDiv = <HTMLCanvasElement>document.getElementById("residentList");
        }

        public init(): void { }

        public load(program: string): number {
            var programText = program.replace(/\s/g, '');

            // Clear old program
            //MemoryManager.clear(0, 255);

            // Load new program
            var base = MemoryManager.allocate(programText);
            var limit = base + 256;// programText.length;

            if (base === -1) {
                return -1;
            }

            var processControlBlock = new PCB(this.currentPID, base, limit);
            this.addPCB(processControlBlock)

            this.currentPID++;
            return processControlBlock.pid;
        }

        public addPCB(pcb: PCB): void {
            this.residentList.push(pcb);

            var processName: string;

            switch (pcb.processState) {
                case ProcessState.NEW:
                    processName = "New";
                    break;
                case ProcessState.WAITING:
                    processName = "Waiting";
                    break;
                case ProcessState.READY:
                    processName = "Ready";
                    break;
                case ProcessState.HALTED:
                    processName = "Halted";
                    break;
                case ProcessState.RUNNING:
                    processName = "Running";
                    break;
                case ProcessState.TERMINATED:
                    processName = "Terminated";
                    break;
            }

            var innerHTML = "";
            innerHTML += "<tr id='pcb" + pcb.pid + "'>";
            innerHTML += "<td>" + pcb.pid + "</td>";
            innerHTML += "<td>" + pcb.pc + "</td>";
            innerHTML += "<td>" + pcb.acc + "</td>";
            innerHTML += "<td>" + pcb.x + "</td>";
            innerHTML += "<td>" + pcb.y + "</td>";
            innerHTML += "<td>" + pcb.z + "</td>";
            innerHTML += "<td>" + pcb.base + "</td>";
            innerHTML += "<td>" + pcb.limit + "</td>";
            innerHTML += "<td>" + processName + "</td>";
            innerHTML += "</tr>";

            this.residentListDiv.innerHTML += innerHTML;
        }

        public updatePCB(pcb: PCB): void {
            var pcbTR = <HTMLCanvasElement>document.getElementById("pcb" + pcb.pid);

            var processName: string;

            switch (pcb.processState) {
                case ProcessState.NEW:
                    processName = "New";
                    break;
                case ProcessState.WAITING:
                    processName = "Waiting";
                    break;
                case ProcessState.READY:
                    processName = "Ready";
                    break;
                case ProcessState.HALTED:
                    processName = "Halted";
                    break;
                case ProcessState.RUNNING:
                    processName = "Running";
                    break;
                case ProcessState.TERMINATED:
                    processName = "Terminated";
                    break;
            }

            var innerHTML = "";
            innerHTML += "<td>" + pcb.pid + "</td>";
            innerHTML += "<td>" + pcb.pc + "</td>";
            innerHTML += "<td>" + pcb.acc + "</td>";
            innerHTML += "<td>" + pcb.x + "</td>";
            innerHTML += "<td>" + pcb.y + "</td>";
            innerHTML += "<td>" + pcb.z + "</td>";
            innerHTML += "<td>" + pcb.base + "</td>";
            innerHTML += "<td>" + pcb.limit + "</td>";
            innerHTML += "<td>" + processName + "</td>";

            pcbTR.innerHTML = innerHTML;
        }

        public killAll(): void {
            for (var i = 0; i < this.residentList.length; i++) {
                var process = this.residentList[i];
                if (process.processState !== ProcessState.TERMINATED) {
                    this.kill(process.pid);
                }
            }
        }

        public kill(pid: number): boolean {
            for (var i = 0; i < this.residentList.length; i++) {
                if (this.residentList[i].pid === pid) {
                    var process = this.residentList[i];
                    if (process.processState === ProcessState.RUNNING) {
                        _CPU.isExecuting = false;
                    }
                    process.processState = ProcessState.TERMINATED;
                    _ProcessManager.updatePCB(process);
                    return true;
                }
            }
            return false;
        }

        public nextProcess(): PCB {
            // Round Robin
            var retVal = null;
            if (this.readyQueue.getSize() > 0) {
                retVal = this.readyQueue.dequeue();
            }
            return retVal;
        }

        public schedule(): void {

            if (_CPU.isExecuting) {
                if (this.cycle >= _Quantum) {
                    if (!this.readyQueue.isEmpty()) {
                        _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, null));
                        this.cycle = 0;
                    }
                }
            } else { // Nothing is executing. Pop a process off the ready queue.
                if (!this.readyQueue.isEmpty()) {
                    _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, null));
                    this.cycle = 0;
                }
            }
        }

        public runAll(): void {
           for (var i = 0; i < this.residentList.length; i++) {
                   this.run(this.residentList[i].pid);
           }
        }

        public run(pid: number): void {
            for (var i = 0; i < this.residentList.length; i++) {
                if (this.residentList[i].pid === pid) {
                    var process = this.residentList[i];
                    if (process.processState === ProcessState.NEW) {
                        process.processState = ProcessState.READY;
                        this.readyQueue.enqueue(process);
                    }
                    return;
                }
            }
            _StdOut.putText("Process " + pid + " does not exist.");
        }
    }
}
