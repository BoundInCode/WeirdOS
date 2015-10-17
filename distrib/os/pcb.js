/* ------------
pcb.ts

Process Control Block prototype for the OS
 ------------ */
var TSOS;
(function (TSOS) {
    var ProcessState;
    (function (ProcessState) {
        ProcessState[ProcessState["NEW"] = 0] = "NEW";
        ProcessState[ProcessState["WAITING"] = 1] = "WAITING";
        ProcessState[ProcessState["READY"] = 2] = "READY";
        ProcessState[ProcessState["HALTED"] = 3] = "HALTED";
        ProcessState[ProcessState["RUNNING"] = 4] = "RUNNING";
        ProcessState[ProcessState["TERMINATED"] = 5] = "TERMINATED";
    })(ProcessState || (ProcessState = {}));
    var PCB = (function () {
        function PCB() {
            this.x = 0;
            this.y = 0;
            this.z = false;
            this.pc = 0;
            this.acc = 0;
            this.processState = ProcessState.NEW;
        }
        PCB.prototype.toString = function () {
            var retVal = "";
            return retVal;
        };
        return PCB;
    })();
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
