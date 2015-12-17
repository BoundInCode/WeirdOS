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

        public currentSchedulingMethod: string
        public residentList: Array<TSOS.PCB>;
        public readyQueue: Queue;
        public cycle: number;
        public residentListDiv: any;
        public mruProcess: TSOS.PCB;

        private currentPID: number;
        private static currentPID: number;

        constructor() {
            this.residentList = new Array();
            this.readyQueue = new Queue();
            this.currentPID = 0;
            this.cycle = 0;
            this.residentListDiv = <HTMLCanvasElement>document.getElementById("residentList");
            this.currentSchedulingMethod = "rr";
            this.mruProcess = null;
        }

        public init(): void { }

        public load(program: string): number {
            var programText = program.replace(/\s/g, '');

            // Load new program
            var base = MemoryManager.allocate(programText);
            var limit = base + 256;// programText.length;

            var processControlBlock = new PCB(this.currentPID, base, limit);
            this.addPCB(processControlBlock)

            // Out of Memory. Store on disk
            if (base === -1) {
                var tsb = _krnFsDriver.writeData(program, true);
                processControlBlock.onDisk = true;
                processControlBlock.tsb = tsb;
            }

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

            var processState: string;

            switch (pcb.processState) {
                case ProcessState.NEW:
                    processState = "New";
                    break;
                case ProcessState.WAITING:
                    processState = "Waiting";
                    break;
                case ProcessState.READY:
                    processState = "Ready";
                    break;
                case ProcessState.HALTED:
                    processState = "Halted";
                    break;
                case ProcessState.RUNNING:
                    processState = "Running";
                    break;
                case ProcessState.TERMINATED:
                    processState = "Terminated";
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
            innerHTML += "<td>" + processState + "</td>";
            //innerHTML += "<td>" + pcb.getTurnAroundTime() + "</td>";
            //innerHTML += "<td>" + pcb.waitTime + "</td>";

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
            var retVal = null;
            if (this.currentSchedulingMethod === "priority") {
                this.readyQueue.q.sort(function(a, b){
                    return a.priority - b.priority;
                });
            }
            if (this.readyQueue.getSize() > 0) {
                retVal = this.readyQueue.dequeue();
            }
            return retVal;
        }

        public roundRobin(): void {
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

        public firstComeFirstServe(): void {
            if (!_CPU.isExecuting) {
                if (!this.readyQueue.isEmpty()) {
                    _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, null));
                    this.cycle = 0;
                }
            }
        }

        public priority(): void {
            if (!_CPU.isExecuting) {
                if (!this.readyQueue.isEmpty()) {
                    _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, null));
                    this.cycle = 0;
                }
            }
        }

        public schedule(): void {
            // Increment Wait times
            for (var i = 0, len = this.readyQueue.q.length; i < len; i++) {
                this.readyQueue.q[i].waitTime++;
            }
            switch(this.currentSchedulingMethod) {
                case "rr":
                    this.roundRobin();
                    break;
                case "priority":
                    this.priority();
                    break;
                case "fcfs":
                    this.firstComeFirstServe();
                    break;
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
