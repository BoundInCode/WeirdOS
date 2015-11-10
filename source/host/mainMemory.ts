///<reference path="../globals.ts" />

module TSOS {

    export class MainMemory {

        public memory: Array<string>;
        private memTable: any;


        constructor(private size: number) {
            this.memory = new Array(size);
            this.memTable = <HTMLTableElement>document.getElementById("memTable");
        }

        public init(): void {
            document.getElementById("memoryMessage").hidden = true;

            var nextRow: string = "";

            for (var i = 0, len = this.memory.length; i < len; i++) {
                this.memory[i] = "00";

                // Initiate UI
                if (i % 8 === 0) {
                    nextRow = "<tr><td>0x" + i.toString(16) + "</td>"
                }
                nextRow += "<td id='mem" + i + "'>00</td>";
                if (i % 8 === 7) {
                    nextRow += "</tr>";
                    this.memTable.innerHTML += nextRow;
                }
            }
        }

        public load(program: String, position: number = 0): void {
            for (var i = 0, len = program.length; i < len-1; i+=2) {
                this.memory[i] = program[i, i+1];
            }
        }

        public read(pos: number): string {
            var memId = "mem" + pos;
            (<HTMLTableElement>document.getElementById(memId)).className = "active";
            return this.memory[pos];
        }

        public write(byteStr: string, pos: number): void {
            this.memory[pos] = byteStr;

            // Update UI
            var memId = "mem" + pos;
            (<HTMLTableElement>document.getElementById(memId)).innerHTML = byteStr;
        }

        public clear(pos: number): void {
            this.write("00", pos);

            // Update UI
            var memId = "mem" + pos;
            (<HTMLTableElement>document.getElementById(memId)).className = "";
        }

    }
}
