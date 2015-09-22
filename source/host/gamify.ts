///<reference path="../globals.ts" />

/* ------------
 gamify.ts

 Requires globals.ts

An obnoxious ts file that adds gamification to the OS.
 ------------ */

module WeirdOS {

    export class Gamify {
        constructor(public energyLevel = 100,
                    public gamify = false) {

        }

        public init():void {
            this.energyLevel = 100;
            this.gamify = false;
        }

        public charTyped() {
            if (!this.gamify)
                return;
            this.energyLevel = Math.max(0, this.energyLevel - 5);
        }
    }
}
