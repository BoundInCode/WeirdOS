///<reference path="../globals.ts" />

module TSOS {

    export class HDD {

        public tracks: number;
        public sectors: number;
        public blocks: number;
        public blockSize: number = 64;

        constructor(tracks: number, sectors: number, blocks: number) {
            this.tracks = tracks;
            this.sectors = sectors;
            this.blocks = blocks;
        }

        public init(): void { }

        public read(tsb: TSB): string {
            var key = this.getKey(tsb);
            return localStorage.getItem(key);
        }

        public write(tsb: TSB, data: string): void {
            if (data.length > this.blockSize*2) {
                alert("ERROR. Trying to write " + data.length + " bytes in one block.");
            }
            var zeros = "";
            for (var i = 0; i < this.blockSize*2 - data.length; i++) { zeros += "0" }
            var key = this.getKey(tsb);
            localStorage.setItem(key, data + zeros);
        }

        private getKey(tsb: TSB): string {
            return tsb.track + "-" + tsb.sector + "-" + tsb.block;
        }
    }
}
