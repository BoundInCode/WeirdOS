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
            this.readyQueue = new TSOS.Queue();
            this.currentPID = 0;
            this.cycle = 0;
            this.residentListDiv = document.getElementById("residentList");
            this.currentSchedulingMethod = "rr";
            this.mruProcess = null;
        }
        ProcessManager.prototype.init = function () { };
        ProcessManager.prototype.load = function (program) {
            var programText = program.replace(/\s/g, '');
            // Load new program
            var base = TSOS.MemoryManager.allocate(programText);
            var limit = base + 256; // programText.length;
            var processControlBlock = new TSOS.PCB(this.currentPID, base, limit);
            this.addPCB(processControlBlock);
            // Out of Memory. Store on disk
            if (base === -1) {
                var tsb = _krnFsDriver.writeHex(program);
                processControlBlock.onDisk = true;
                processControlBlock.tsb = tsb;
            }
            console.log(localStorage);
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
            var processState;
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
        };
        ProcessManager.prototype.killAll = function () {
            for (var i = 0; i < this.residentList.length; i++) {
                var process = this.residentList[i];
                if (process.processState !== ProcessState.TERMINATED) {
                    this.kill(process.pid);
                }
            }
        };
        ProcessManager.prototype.kill = function (pid) {
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
        };
        ProcessManager.prototype.nextProcess = function () {
            var retVal = null;
            if (this.currentSchedulingMethod === "priority") {
                this.readyQueue.q.sort(function (a, b) {
                    return a.priority - b.priority;
                });
            }
            if (this.readyQueue.getSize() > 0) {
                retVal = this.readyQueue.dequeue();
            }
            return retVal;
        };
        ProcessManager.prototype.roundRobin = function () {
            if (_CPU.isExecuting) {
                if (this.cycle >= _Quantum) {
                    if (!this.readyQueue.isEmpty()) {
                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, null));
                        this.cycle = 0;
                    }
                }
            }
            else {
                if (!this.readyQueue.isEmpty()) {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, null));
                    this.cycle = 0;
                }
            }
        };
        ProcessManager.prototype.firstComeFirstServe = function () {
            if (!_CPU.isExecuting) {
                if (!this.readyQueue.isEmpty()) {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, null));
                    this.cycle = 0;
                }
            }
        };
        ProcessManager.prototype.priority = function () {
            if (!_CPU.isExecuting) {
                if (!this.readyQueue.isEmpty()) {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, null));
                    this.cycle = 0;
                }
            }
        };
        ProcessManager.prototype.schedule = function () {
            // Increment Wait times
            for (var i = 0, len = this.readyQueue.q.length; i < len; i++) {
                this.readyQueue.q[i].waitTime++;
            }
            switch (this.currentSchedulingMethod) {
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
        };
        ProcessManager.prototype.runAll = function () {
            for (var i = 0; i < this.residentList.length; i++) {
                this.run(this.residentList[i].pid);
            }
        };
        ProcessManager.prototype.run = function (pid) {
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
        };
        return ProcessManager;
    })();
    TSOS.ProcessManager = ProcessManager;
})(TSOS || (TSOS = {}));
