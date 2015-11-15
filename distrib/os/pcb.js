/* ------------
pcb.ts

Process Control Block prototype for the OS
 ------------ */
var TSOS;
(function (TSOS) {
    var PCB = (function () {
        function PCB(pid, base, limit) {
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
        }
        PCB.prototype.getTurnAroundTime = function () {
            return this.endTime - this.startTime;
        };
        return PCB;
    })();
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
