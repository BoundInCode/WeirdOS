///<reference path="../globals.ts" />

module TSOS {

    export class HDD {

        public tracks: number;
        public sectors: number;
        public blocks: number;
        public blockSize: number = 64;
        private hddTable: any;

        constructor(tracks: number, sectors: number, blocks: number) {
            this.tracks = tracks;
            this.sectors = sectors;
            this.blocks = blocks;
            this.hddTable = <HTMLTableElement>document.getElementById("hddTable");
        }

        public init(): void {
            var nextRow;
            for (var i = 0; i < _HDD.tracks; i++) {
                for (var j = 0; j < _HDD.sectors; j++) {
                    for (var k = 0; k < _HDD.blocks; k++) {
                        var tsb = new TSB(i, j, k);
                        var key = this.getKey(tsb);
                        nextRow = "<tr><td><strong>" + key + "</strong></td>"
                            + "<td id='hdd" + key + "'>" + this.read(tsb) + "</td>";
                        this.hddTable.innerHTML += nextRow;
                    }
                }
            }
        }

        public read(tsb: TSB): string {
            var key = this.getKey(tsb);
            return localStorage.getItem(key);
        }

        public write(tsb: TSB, data: string): void {
            if (data.length > this.blockSize*2) {
                alert("ERROR. Trying to write " + data.length + " bytes in one block.");
            }
            for (var i = data.length; i < this.blockSize*2; i++) { data += "0" }
            var key = this.getKey(tsb);
            localStorage.setItem(key, data);
            var hddId = "hdd" + key;
            (<HTMLTableElement>document.getElementById(hddId)).innerHTML = data;
        }

        private getKey(tsb: TSB): string {
            return tsb.track + "-" + tsb.sector + "-" + tsb.block;
        }
    }
}
