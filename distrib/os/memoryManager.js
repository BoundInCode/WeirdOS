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
        MemoryManager.allocate = function (program) {
            var len = program.length;
            var oldBase = this.base;
            for (var i = 0; i < len / 2; i++) {
                //_Memory[this.base + i] = program.substr(i*2, 2);
                _Memory.write(program.substr(i * 2, 2), this.base + i);
            }
            this.base += len;
            return oldBase;
        };
        MemoryManager.read = function (location, pcb) {
            //return _Memory[pcb.base + location];
            return _Memory.read(pcb.base + location);
        };
        MemoryManager.write = function (bytes, location, pcb) {
            var len = bytes.length;
            for (var i = 0; i < len / 2; i++) {
                //_Memory[pcb.base + location + i] = bytes.substr(i*2, 2);
                _Memory.write(bytes.substr(i * 2, 2), pcb.base + location + i);
            }
        };
        MemoryManager.SIZE = 768;
        MemoryManager.base = 0;
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
