///<reference path="../globals.ts" />

/* ------------
     CPU.ts

     Requires global.ts.

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Cpu {

        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public CurrentPCB: PCB = null,
                    public isExecuting: boolean = false,
                    public symTD: any = null,
                    public irTD: any = null,
                    public argTD: any = null) {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.CurrentPCB = null;
            this.isExecuting = false;
            this.symTD = <HTMLCanvasElement>document.getElementById("sym-value");
            this.irTD = <HTMLCanvasElement>document.getElementById("ir-value");
            this.argTD = <HTMLCanvasElement>document.getElementById("arg-value");
        }

        public hexStr(num: number): string {
            var str = num.toString(16);
            if (str.length === 1) {
                return "0"+str;
            }
            return str;
        }

        // AD
        public loadAccFromMem(): void {
            this.irTD.innerHTML = "Load Accumulator From Memory (LDA)";
            this.symTD.innerHTML = "AD";
            this.PC++;


            var arg = MemoryManager.read(this.PC, this.CurrentPCB);
            var address = parseInt(arg, 16);
            this.argTD.innerHTML = arg;

            var contentsAtAddress = MemoryManager.read(address, this.CurrentPCB);
            this.Acc = parseInt(contentsAtAddress, 16);
            this.PC++;
            MemoryManager.read(this.PC, this.CurrentPCB); // Update UI
            this.PC++;
        }

        // A9
        public loadAccWithConst(): void {
            this.irTD.innerHTML = "Load Accumulator With Constant (LDA)";
            this.symTD.innerHTML = "A9";
            this.PC++;

            var constant = MemoryManager.read(this.PC, this.CurrentPCB);
            this.argTD.innerHTML = constant;

            this.Acc = parseInt(constant, 16);
            this.PC++;
        }

        public storeAcc(): void {
            this.irTD.innerHTML = "Store Accumulator (STA)";
            this.symTD.innerHTML = "8D";
            this.PC++;

            var arg = MemoryManager.read(this.PC, this.CurrentPCB);
            var address = parseInt(arg, 16);
            this.argTD.innerHTML = arg;

            var accStr = this.hexStr(this.Acc);
            MemoryManager.write(accStr, address, this.CurrentPCB);
            this.PC++;
            MemoryManager.read(this.PC, this.CurrentPCB); // Update UI
            this.PC++;
        }

        public addWithCarry(): void {
            this.irTD.innerHTML = "Add With Carry (ADC)";
            this.symTD.innerHTML = "6D";
            this.PC++;

            var arg = MemoryManager.read(this.PC, this.CurrentPCB);
            var address = parseInt(arg, 16);
            this.argTD.innerHTML = arg;

            var contentsFromMemory = MemoryManager.read(address, this.CurrentPCB);
            this.Acc += parseInt(contentsFromMemory, 16);
            this.PC++;
            MemoryManager.read(this.PC, this.CurrentPCB); // Update UI
            this.PC++;
        }

        public loadXWithConst(): void {
            this.irTD.innerHTML = "Load X With Constant (LDX)";
            this.symTD.innerHTML = "A2";
            this.PC++;

            var constant = parseInt(MemoryManager.read(this.PC, this.CurrentPCB), 16);
            this.argTD.innerHTML = constant;

            this.Xreg = constant;
            this.PC++;
        }

        public loadXFromMem(): void {
            this.irTD.innerHTML = "Load X From Memory (LDX)";
            this.symTD.innerHTML = "AE";
            this.PC++;

            var arg = MemoryManager.read(this.PC, this.CurrentPCB);
            var address = parseInt(arg, 16);
            this.argTD.innerHTML = arg;

            var contentsFromMemory = MemoryManager.read(address, this.CurrentPCB);
            this.Xreg = parseInt(contentsFromMemory, 16);
            this.PC++;
            MemoryManager.read(this.PC, this.CurrentPCB); // Update UI
            this.PC++;
        }

        public loadYWithConst(): void {
            this.irTD.innerHTML = "Load Y with Constant (LDY)";
            this.symTD.innerHTML = "A0";
            this.PC++;

            var constant = MemoryManager.read(this.PC, this.CurrentPCB);
            this.argTD.innerHTML = constant;

            this.Yreg = parseInt(constant, 16);
            this.PC++;
        }

        public loadYFromMem(): void {
            this.irTD.innerHTML = "Load Y From Memory (LDY)";
            this.symTD.innerHTML = "AC";
            this.PC++;

            var arg = MemoryManager.read(this.PC, this.CurrentPCB);
            var address = parseInt(arg, 16);
            this.argTD.innerHTML = arg;

            var contentsFromMemory = MemoryManager.read(address, this.CurrentPCB);
            this.Yreg = parseInt(contentsFromMemory, 16);
            this.PC++
            MemoryManager.read(this.PC, this.CurrentPCB); // Update UI
            this.PC++;
        }

        public nop(): void {
            this.irTD.innerHTML = "No Operation (NOP)";
            this.symTD.innerHTML = "EA";
            this.argTD.innerHTML = "N/A";

            this.PC++;
        }

        public break(): void {
            this.irTD.innerHTML = "Break (BRK)";
            this.symTD.innerHTML = "00";
            this.argTD.innerHTML = "N/A";

            this.isExecuting = false;
        }

        public compareToX(): void {
            this.irTD.innerHTML = "Compare to X (CPX)";
            this.symTD.innerHTML = "EC";
            this.PC++;

            var arg = MemoryManager.read(this.PC, this.CurrentPCB);
            var address = parseInt(arg, 16);
            this.argTD.innerHTML = arg;

            var contentsFromMemory = parseInt(MemoryManager.read(address, this.CurrentPCB), 16);
            this.Zflag = (contentsFromMemory === this.Xreg) ?1 :0;
            this.PC++;
            MemoryManager.read(this.PC, this.CurrentPCB); // Update UI
            this.PC++;
        }

        public branch(): void {
            this.irTD.innerHTML = "Branch Not Equal (BNE)";
            this.symTD.innerHTML = "D0";
            this.PC++;

            var numBytes = MemoryManager.read(this.PC, this.CurrentPCB);
            this.argTD.innerHTML = numBytes;

            this.PC++;
            if (this.Zflag === 0) {
                this.PC += parseInt(numBytes, 16);
            }
        }

        public inc(): void {
            this.irTD.innerHTML = "Increment (INC)";
            this.symTD.innerHTML = "EE";
            this.PC++;

            var arg = MemoryManager.read(this.PC, this.CurrentPCB);
            var address = parseInt(arg, 16);
            this.argTD.innerHTML = arg;

            var contentsFromMemory = parseInt(MemoryManager.read(address, this.CurrentPCB), 16);
            var incBytes = this.hexStr(contentsFromMemory+1);
            MemoryManager.write(incBytes, address, this.CurrentPCB);
            this.PC++;
            MemoryManager.read(this.PC, this.CurrentPCB); // Update UI
            this.PC++;
        }

        public syscall(): void {
            this.irTD.innerHTML = "System Call (SYS)";
            this.symTD.innerHTML = "FF";
            this.argTD.innerHTML = "N/A";

            this.PC++;
            var params = [this.Xreg, this.Yreg];
            _KernelInterruptQueue.enqueue(new Interrupt(SYSCALL_IRQ, params));

        }

        public execute(instruction: string): void {
            switch (instruction) {
                case "A9":
                    this.loadAccWithConst();
                    break;
                case "AD":
                    this.loadAccFromMem();
                    break;
                case "8D":
                    this.storeAcc();
                    break;
                case "6D":
                    this.addWithCarry();
                    break;
                case "A2":
                    this.loadXWithConst();
                    break;
                case "AE":
                    this.loadXFromMem();
                    break;
                case "A0":
                    this.loadYWithConst();
                    break;
                case "AC":
                    this.loadYFromMem();
                    break;
                case "EA":
                    this.nop();
                    break;
                case "00":
                    this.break();
                    break;
                case "EC":
                    this.compareToX();
                    break;
                case "D0":
                    this.branch();
                    break;
                case "EE":
                    this.inc();
                    break;
                case "FF":
                    this.syscall();
                    break;
                default: alert("Unknown instruction: " + instruction);
            }
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            this.PC = this.PC % (this.CurrentPCB.base + 256);
            var instruction: string = MemoryManager.read(this.PC, this.CurrentPCB);
            this.execute(instruction);

            // Update UI on CPU Cycle
            (<HTMLCanvasElement>document.getElementById("pc-value")).innerHTML = this.PC.toString(16);
            (<HTMLCanvasElement>document.getElementById("acc-value")).innerHTML = this.Acc.toString(16);
            (<HTMLCanvasElement>document.getElementById("x-value")).innerHTML = this.Xreg.toString(16);
            (<HTMLCanvasElement>document.getElementById("y-value")).innerHTML = this.Yreg.toString(16);
            (<HTMLCanvasElement>document.getElementById("z-value")).innerHTML = this.Zflag.toString(16);

            if(_IsSingleStepMode) {
                this.isExecuting = false;
            }
        }
    }
}
