///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var HDD = (function () {
        function HDD(tracks, sectors, blocks) {
            this.blockSize = 64;
            this.formatted = false;
            this.tracks = tracks;
            this.sectors = sectors;
            this.blocks = blocks;
            this.hddTable = document.getElementById("hddTable");
        }
        HDD.prototype.init = function () {
            var nextRow;
            for (var i = 0; i < _HDD.tracks; i++) {
                for (var j = 0; j < _HDD.sectors; j++) {
                    for (var k = 0; k < _HDD.blocks; k++) {
                        var tsb = new TSOS.TSB(i, j, k);
                        var key = this.getKey(tsb);
                        nextRow = "<tr><td><strong>" + key + "</strong></td>"
                            + "<td id='hdd" + key + "'>" + this.read(tsb) + "</td>";
                        this.hddTable.innerHTML += nextRow;
                    }
                }
            }
        };
        HDD.prototype.read = function (tsb) {
            var key = this.getKey(tsb);
            return localStorage.getItem(key);
        };
        HDD.prototype.write = function (tsb, data) {
            if (data.length > this.blockSize * 2) {
                alert("ERROR. Trying to write " + data.length + " bytes in one block.");
            }
            for (var i = data.length; i < this.blockSize * 2; i++) {
                data += "0";
            }
            var key = this.getKey(tsb);
            localStorage.setItem(key, data);
            var hddId = "hdd" + key;
            document.getElementById(hddId).innerHTML = data;
        };
        HDD.prototype.getKey = function (tsb) {
            return tsb.track + "-" + tsb.sector + "-" + tsb.block;
        };
        return HDD;
    })();
    TSOS.HDD = HDD;
})(TSOS || (TSOS = {}));
