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

        public read(track: number, sector: number, block: number): string {
            var key = this.getKey(track, sector, block);
            return localStorage.getItem(key);
        }

        public write(data: string, track: number, sector: number, block: number): void {
            var key = this.getKey(track, sector, block);
            localStorage.setItem(key, data);
        }

        private getKey(track: number, sector: number, block: number): string {
            return track + "-" + sector + "-" + block;
        }
    }
}
