///<reference path="../globals.ts" />
/* ------------
 processManager.ts

 Requires globals.ts
 ------------ */
var TSOS;
(function (TSOS) {
    (function (ProcessState) {
        ProcessState[ProcessState["NEW"] = 0] = "NEW";
        ProcessState[ProcessState["WAITING"] = 1] = "WAITING";
        ProcessState[ProcessState["READY"] = 2] = "READY";
        ProcessState[ProcessState["HALTED"] = 3] = "HALTED";
        ProcessState[ProcessState["RUNNING"] = 4] = "RUNNING";
        ProcessState[ProcessState["TERMINATED"] = 5] = "TERMINATED";
    })(TSOS.ProcessState || (TSOS.ProcessState = {}));
    var ProcessState = TSOS.ProcessState;
    var ProcessManager = (function () {
        function ProcessManager() {
            this.residentList = new Array();
            this.readyQueue = new Queue();
            this.currentPID = 0;
            this.cycle = 0;
            this.residentListDiv = document.getElementById("residentList");
        }
        ProcessManager.prototype.init = function () { };
        ProcessManager.prototype.load = function (program) {
            var programText = program.replace(/\s/g, '');
            // Clear old program
            //MemoryManager.clear(0, 255);
            // Load new program
            var base = MemoryManager.allocate(programText);
            var limit = base + 256; // programText.length;
            if (base === -1) {
                return -1;
            }
            var processControlBlock = new PCB(this.currentPID, base, limit);
            //this.residentList.push(processControlBlock);
            this.addPCB(processControlBlock);
            this.currentPID++;
            return processControlBlock.pid;
        };
        ProcessManager.prototype.addPCB = function (pcb) {
            this.residentList.push(pcb);
            var processName;
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
        };
        ProcessManager.prototype.updatePCB = function (pcb) {
            var pcbTR = document.getElementById("pcb" + pcb.pid);
            var processName;
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
        };
        ProcessManager.prototype.kill = function (pid) {
            for (var i = 0; i < this.residentList.length; i++) {
                if (this.residentList[i].pid === pid) {
                    var process = this.residentList[pid];
                    if (process.processState === ProcessState.RUNNING) {
                        _CPU.CurrentPCB = null;
                        _CPU.isExecuting = false;
                    }
                    process.processState = ProcessState.TERMINATED;
                    return true;
                }
            }
            return false;
        };
        ProcessManager.prototype.nextProcess = function () {
            // Round Robin
            return this.readyQueue.dequeue();
        };
        ProcessManager.prototype.schedule = function () {
            if (_CPU.isExecuting) {
                if (this.cycle >= _Quantum) {
                    if (!this.readyQueue.isEmpty()) {
                        _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, null));
                        this.cycle = 0;
                    }
                }
            }
            else {
                if (!this.readyQueue.isEmpty()) {
                    _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, null));
                    this.cycle = 0;
                }
            }
        };
        ProcessManager.prototype.runAll = function () {
            for (var i = 0; i < this.residentList.length; i++) {
                this.run(this.residentList[i].pid);
            }
        };
        ProcessManager.prototype.run = function (pid) {
            for (var i = 0; i < this.residentList.length; i++) {
                if (this.residentList[i].pid === pid) {
                    var process = this.residentList[pid];
                    process.processState = ProcessState.READY;
                    this.readyQueue.enqueue(process);
                    return;
                }
            }
            _StdOut.putText("Process " + pid + " does not exist.");
        };
        return ProcessManager;
    })();
    TSOS.ProcessManager = ProcessManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=processManager.js.map