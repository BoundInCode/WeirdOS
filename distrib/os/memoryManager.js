///<reference path="../globals.ts" />
/* ------------
 MemoryManager.ts

 Requires globals.ts
 ------------ */
var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager() {
        }
        MemoryManager.prototype.init = function () { };
        MemoryManager.clear = function (start, end) {
            for (var i = start; i < end; i++) {
                _Memory.write("00", i);
            }
        };
        MemoryManager.allocate = function (program) {
            var len = program.length;
            var oldBase = this.base;
            for (var i = 0; i < len / 2; i++) {
                _Memory.write(program.substr(i * 2, 2), this.base + i);
            }
            //this.base += len;
            return oldBase;
        };
        MemoryManager.read = function (location, pcb) {
            return _Memory.read(pcb.base + location);
        };
        MemoryManager.write = function (bytes, location, pcb) {
            var len = bytes.length;
            for (var i = 0; i < len / 2; i++) {
                _Memory.write(bytes.substr(i * 2, 2), pcb.base + location + i);
            }
        };
        MemoryManager.SIZE = 768;
        MemoryManager.base = 0;
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
