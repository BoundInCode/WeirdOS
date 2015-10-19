/**
 * Created by liam on 10/17/15.
 */
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
    var ProcessManager = (function () {
        function ProcessManager() {
            this.processControlBlocks = new Array();
        }
        ProcessManager.prototype.init = function () {
        };
        ProcessManager.prototype.toString = function () {
            var retVal = "";
            return retVal;
        };
        return ProcessManager;
    })();
    TSOS.ProcessManager = ProcessManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map