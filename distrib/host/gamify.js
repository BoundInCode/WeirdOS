///<reference path="../globals.ts" />
/* ------------
 gamify.ts

 Requires globals.ts

An obnoxious ts file that adds gamification to the OS.
 ------------ */
var WeirdOS;
(function (WeirdOS) {
    var Gamify = (function () {
        function Gamify(energyLevel, gamify) {
            if (energyLevel === void 0) { energyLevel = 100; }
            if (gamify === void 0) { gamify = false; }
            this.energyLevel = energyLevel;
            this.gamify = gamify;
        }
        Gamify.prototype.init = function () {
            this.energyLevel = 100;
            this.gamify = false;
        };
        Gamify.prototype.charTyped = function () {
            if (!this.gamify)
                return;
            this.energyLevel = Math.max(0, this.energyLevel - 5);
        };
        return Gamify;
    })();
    WeirdOS.Gamify = Gamify;
})(WeirdOS || (WeirdOS = {}));
