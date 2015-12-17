///<reference path="../globals.ts" />
///<reference path="queue.ts" />
/* ------------
     Kernel.ts

     Requires globals.ts
              queue.ts

     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var Kernel = (function () {
        function Kernel() {
        }
        //
        // OS Startup and Shutdown Routines
        //
        Kernel.prototype.krnBootstrap = function () {
            TSOS.Control.hostLog("bootstrap", "host"); // Use hostLog because we ALWAYS want this, even if _Trace is off.
            // Initialize our global queues.
            _KernelInterruptQueue = new TSOS.Queue(); // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array(); // Buffers... for the kernel.
            _KernelInputQueue = new TSOS.Queue(); // Where device input lands before being processed out somewhere.
            // Initialize the console.
            _Console = new TSOS.Console(); // The command line interface / console I/O device.
            _Console.init();
            // Initialize standard input and output to the _Console.
            _StdIn = _Console;
            _StdOut = _Console;
            // Initialize Memory and Process Managers
            _ProcessManager = new TSOS.ProcessManager();
            _ProcessManager.init();
            _MemoryManager = new TSOS.MemoryManager();
            _MemoryManager.init();
            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new TSOS.DeviceDriverKeyboard(); // Construct it.
            _krnKeyboardDriver.driverEntry(); // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);
            this.krnTrace("Loading the filesystem device driver.");
            _krnFsDriver = new TSOS.DeviceDriverFileSystem();
            _krnFsDriver.driverEntry();
            this.krnTrace(_krnFsDriver.status);
            //
            // ... more?
            //
            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();
            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new TSOS.Shell();
            _OsShell.init();
            // Finally, initiate student testing protocol.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        };
        Kernel.prototype.krnShutdown = function () {
            this.krnTrace("begin shutdown OS");
            // TODO: Check for running processes.  If there are some, alert and stop. Else...
            // ... Disable the Interrupts.
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();
            //
            // Unload the Device Drivers?
            // More?
            //
            this.krnTrace("end shutdown OS");
        };
        Kernel.prototype.krnOnCPUClockPulse = function () {
            /* This gets called from the host hardware simulation every time there is a hardware clock pulse.
               This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
               This, on the other hand, is the clock pulse from the hardware / VM / host that tells the kernel
               that it has to look for interrupts and process them if it finds any.                           */
            // Check for an interrupt, are any. Page 560
            if (_KernelInterruptQueue.getSize() > 0) {
                // Process the first interrupt on the interrupt queue.
                // TODO: Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
                var interrupt = _KernelInterruptQueue.dequeue();
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            }
            else if (_CPU.isExecuting) {
                _ProcessManager.cycle++;
                _CPU.cycle();
            }
            else {
                this.krnTrace("Idle");
            }
            _ProcessManager.schedule();
        };
        //
        // Interrupt Handling
        //
        Kernel.prototype.krnEnableInterrupts = function () {
            // Keyboard
            TSOS.Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        };
        Kernel.prototype.krnDisableInterrupts = function () {
            // Keyboard
            TSOS.Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        };
        Kernel.prototype.krnHandleSysCall = function (params) {
            var x = params[0];
            var y = params[1];
            if (x === 1) {
                _StdOut.putText(y.toString());
                _StdOut.advanceLine();
                _OsShell.putPrompt();
            }
            else if (x === 2) {
                var address = y;
                var stringChar = TSOS.MemoryManager.read(address, _CPU.CurrentPCB);
                while (stringChar !== "00") {
                    _StdOut.putText(String.fromCharCode(parseInt(stringChar, 16)));
                    address++;
                    stringChar = TSOS.MemoryManager.read(address, _CPU.CurrentPCB);
                }
                _StdOut.advanceLine();
                _OsShell.putPrompt();
            }
            else {
                this.krnTrapError("Error. X register must be either 1 or 2.");
                _CPU.isExecuting = false;
            }
        };
        Kernel.prototype.krnInterruptHandler = function (irq, params) {
            // This is the Interrupt Handler Routine.  See pages 8 and 560.
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on. Page 766.
            this.krnTrace("Handling IRQ~" + irq);
            // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
            // TODO: Consider using an Interrupt Vector in the future.
            // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
            //       Maybe the hardware simulation will grow to support/require that in the future.
            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR(); // Kernel built-in routine for timers (not the clock).
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params); // Kernel mode device driver
                    _StdIn.handleInput();
                    break;
                case SYSCALL_IRQ:
                    this.krnHandleSysCall(params);
                    break;
                case CONTEXT_SWITCH_IRQ:
                    this.krnContextSwitch(params);
                    break;
                case DISK_OPERATION_IRQ:
                    _krnFsDriver.isr(params);
                    break;
                case PAGE_FAULT:
                    this.krnPageFault(params);
                    break;
                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        };
        Kernel.prototype.krnPageFault = function (params) {
            this.krnTrace("Page Fault. Swapping process out of memory.");
            var pid = params[0];
            // STEP 1: Save MRU process
            var pcb = _ProcessManager.mruProcess;
            var program = "";
            for (var i = 0; i < 256; i++) {
                program += TSOS.MemoryManager.read(i, pcb);
            }
            console.log(program);
            var tsb = _krnFsDriver.writeHex(program);
            pcb.onDisk = true;
            pcb.tsb = tsb;
            // STEP 2: Load Process from memory
            var newPcb = null;
            var resList = _ProcessManager.residentList;
            for (var i = 0; i < resList.length; i++) {
                if (resList[i].pid === pid) {
                    newPcb = resList[i];
                    break;
                }
            }
            var newProgram = _krnFsDriver.readData(newPcb.tsb);
            newPcb.base = pcb.base;
            newPcb.limit = pcb.limit;
            newPcb.onDisk = false;
            TSOS.MemoryManager.write(newProgram, 0, newPcb);
            // STEP 3: Delete old process from memory
            _krnFsDriver.deleteBlock(newPcb.tsb);
            newPcb.tsb = null;
            // STEP 4: Start CPU
            _CPU.start(newPcb);
        };
        Kernel.prototype.krnContextSwitch = function (params) {
            this.krnTrace("Context Switch. Swapping out currently running process.");
            if (_CPU.CurrentPCB != null && _CPU.CurrentPCB.processState !== TSOS.ProcessState.TERMINATED) {
                _CPU.CurrentPCB.processState = TSOS.ProcessState.READY;
                _ProcessManager.readyQueue.enqueue(_CPU.CurrentPCB);
                _CPU.stop();
            }
            var process = _ProcessManager.nextProcess();
            if (process != null) {
                if (process.onDisk) {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(PAGE_FAULT, [process.pid]));
                }
                else {
                    _CPU.start(process);
                    _ProcessManager.mruProcess = process;
                }
            }
        };
        Kernel.prototype.krnTimerISR = function () {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
        };
        //
        // System Calls... that generate software interrupts via tha Application Programming Interface library routines.
        //
        // Some ideas:
        // - ReadConsole
        // - WriteConsole
        // - CreateProcess
        // - ExitProcess
        // - WaitForProcessToExit
        // - CreateFile
        // - OpenFile
        // - ReadFile
        // - WriteFile
        // - CloseFile
        //
        // OS Utility Routines
        //
        Kernel.prototype.krnTrace = function (msg) {
            // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
            if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would lag the browser very quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        TSOS.Control.hostLog(msg, "OS");
                    }
                }
                else {
                    TSOS.Control.hostLog(msg, "OS");
                }
            }
        };
        Kernel.prototype.krnTrapError = function (msg) {
            TSOS.Control.hostLog("OS ERROR - TRAP: " + msg);
            // Reset Canvas size to 500x500
            _Canvas.height = 500;
            _Canvas.width = 500;
            var bsodImg = new Image();
            bsodImg.onload = function () {
                _Canvas.getContext('2d').drawImage(bsodImg, 0, 0, 500, 500);
            };
            bsodImg.src = "distrib/images/bsod.png";
            this.krnShutdown();
        };
        return Kernel;
    })();
    TSOS.Kernel = Kernel;
})(TSOS || (TSOS = {}));
