///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var HDD = (function () {
        function HDD(tracks, sectors, blocks) {
            this.blockSize = 64;
            this.tracks = tracks;
            this.sectors = sectors;
            this.blocks = blocks;
        }
        HDD.prototype.init = function () { };
        HDD.prototype.read = function (tsb) {
            var key = this.getKey(tsb);
            return localStorage.getItem(key);
        };
        HDD.prototype.write = function (tsb, data) {
            if (data.length > this.blockSize * 2) {
                alert("ERROR. Trying to write " + data.length + " bytes in one block.");
            }
            var zeros = "";
            for (var i = 0; i < this.blockSize * 2 - data.length; i++) {
                zeros += "0";
            }
            var key = this.getKey(tsb);
            localStorage.setItem(key, data + zeros);
        };
        HDD.prototype.getKey = function (tsb) {
            return tsb.track + "-" + tsb.sector + "-" + tsb.block;
        };
        return HDD;
    })();
    TSOS.HDD = HDD;
})(TSOS || (TSOS = {}));
