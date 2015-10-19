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
            this.processControlBlocks = new Array();
            this.readyQueue = new TSOS.Queue();
            this.currentPID = 1;
        }
        ProcessManager.prototype.init = function () { };
        ProcessManager.prototype.load = function (program) {
            var programText = program.replace(/\s/g, '');
            var base = TSOS.MemoryManager.allocate(programText);
            var limit = base + programText.length;
            var processControlBlock = new TSOS.PCB(this.currentPID, base, limit);
            this.processControlBlocks[this.currentPID] = processControlBlock;
            this.currentPID++;
            return processControlBlock.pid;
        };
        ProcessManager.prototype.run = function (pid) {
            if (pid > this.currentPID) {
                _StdOut.putText("Process " + pid + " does not exist.");
                return;
            }
            var process = this.processControlBlocks[pid];
            //process.processState = ProcessState.READY;
            //this.readyQueue.enqueue(process);
            _CPU.CurrentPCB = process;
            _CPU.isExecuting = true;
        };
        return ProcessManager;
    })();
    TSOS.ProcessManager = ProcessManager;
})(TSOS || (TSOS = {}));
