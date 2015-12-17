///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var TSB = (function () {
        function TSB(track, sector, block) {
            this.track = track;
            this.sector = sector;
            this.block = block;
        }
        TSB.prototype.init = function () { };
        TSB.prototype.toString = function () {
            return this.track + "" + this.sector + "" + this.block;
        };
        return TSB;
    })();
    TSOS.TSB = TSB;
})(TSOS || (TSOS = {}));
