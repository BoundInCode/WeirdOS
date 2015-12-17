///<reference path="../globals.ts" />

module TSOS {

    export class TSB {

        public track: number;
        public sector: number;
        public block: number;

        constructor(track: number, sector: number, block: number) {
            this.track = track;
            this.sector = sector;
            this.block = block;
        }

        public init(): void { }

        public toString(): String {
            return this.track + "" + this.sector + "" + this.block;
        }
    }
}
