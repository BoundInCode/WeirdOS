///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var MainMemory = (function () {
        function MainMemory(size) {
            this.size = size;
            this.memory = new Array(size / 2);
        }
        MainMemory.prototype.init = function () {
            for (var i = 0, len = this.memory.length; i < len - 1; i += 2) {
                this.memory[i] = "00";
            }
        };
        MainMemory.prototype.load = function (program, position) {
            if (position === void 0) { position = 0; }
            for (var i = 0, len = program.length; i < len - 1; i += 2) {
                this.memory[i] = program[i, i + 1];
            }
        };
        return MainMemory;
    })();
    TSOS.MainMemory = MainMemory;
})(TSOS || (TSOS = {}));
