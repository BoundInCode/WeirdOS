///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var MainMemory = (function () {
        function MainMemory(size) {
            this.size = size;
            this.memory = new Array(size);
            this.memTable = document.getElementById("memTable");
        }
        MainMemory.prototype.init = function () {
            document.getElementById("memoryMessage").hidden = true;
            var nextRow = "";
            for (var i = 0, len = this.memory.length; i < len; i++) {
                this.memory[i] = "00";
                // Initiate UI
                if (i % 8 === 0) {
                    nextRow += "</tr>";
                    this.memTable.innerHTML += nextRow;
                    nextRow = "<tr><td>0x" + i.toString(16) + "</td>";
                }
                nextRow += "<td id='mem" + i + "'>00</td>";
            }
        };
        MainMemory.prototype.load = function (program, position) {
            if (position === void 0) { position = 0; }
            for (var i = 0, len = program.length; i < len - 1; i += 2) {
                this.memory[i] = program[i, i + 1];
            }
        };
        MainMemory.prototype.read = function (pos) {
            var memId = "mem" + pos;
            document.getElementById(memId).className = "active";
            return this.memory[pos];
        };
        MainMemory.prototype.write = function (byteStr, pos) {
            this.memory[pos] = byteStr;
            // Update UI
            var memId = "mem" + pos;
            document.getElementById(memId).innerHTML = byteStr;
        };
        return MainMemory;
    })();
    TSOS.MainMemory = MainMemory;
})(TSOS || (TSOS = {}));
