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
        HDD.prototype.read = function (track, sector, block) {
            var key = this.getKey(track, sector, block);
            return localStorage.getItem(key);
        };
        HDD.prototype.write = function (data, track, sector, block) {
            var key = this.getKey(track, sector, block);
            localStorage.setItem(key, data);
        };
        HDD.prototype.getKey = function (track, sector, block) {
            return track + "-" + sector + "-" + block;
        };
        return HDD;
    })();
    TSOS.HDD = HDD;
})(TSOS || (TSOS = {}));
