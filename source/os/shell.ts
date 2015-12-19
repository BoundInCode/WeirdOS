///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
    ///<reference path="shellCommand.ts" />
    ///<reference path="userCommand.ts" />


/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
    export class Shell {
        // Properties
        public promptStr = "> ";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";

        constructor() {
        }

        public init() {
            var sc;
            //
            // Load the command list.

            // gamify
            sc = new ShellCommand(this.shellGamify,
                "gamify",
                "- Toggles instant gamification. (Warning: Very Obnoxious)");
            this.commandList[this.commandList.length] = sc;

            // status
            sc = new ShellCommand(this.shellStatus,
                 "status",
                 "- Set the status in the Host.");
            this.commandList[this.commandList.length] = sc;

            // load
            sc = new ShellCommand(this.shellLoad,
                "load",
                "- Loads the user program into the OS memory.");
            this.commandList[this.commandList.length] = sc;

            // clear memory
            sc = new ShellCommand(this.shellClearMem,
                "clearmem",
                "- Clear all the memory partitions.");
            this.commandList[this.commandList.length] = sc;

            // run
            sc = new ShellCommand(this.shellRun,
                "run",
                "- Run a program in memory given it's PID.");
            this.commandList[this.commandList.length] = sc;

            // set schedule
            sc = new ShellCommand(this.shellSetSchedule,
                "setschedule",
                "- Sets the CPU's scheduling algorithm. Options: Round Robin (rr), First Come, First Serve (fcfs), or Priority (priority)");
            this.commandList[this.commandList.length] = sc;

            // get schedule
            sc = new ShellCommand(this.shellGetSchedule,
                "getschedule",
                "- Gets the CPU's current scheduling algorithm.");
            this.commandList[this.commandList.length] = sc;

            // run all
            sc = new ShellCommand(this.shellRunAll,
                "runall",
                "- Run all the programs loaded in the resident list.");
            this.commandList[this.commandList.length] = sc;

            //kill all
            sc = new ShellCommand(this.shellKillAll,
                "killall",
                "- Kill all the programs loaded in the resident list.");
            this.commandList[this.commandList.length] = sc;

            // quantum
            sc = new ShellCommand(this.shellQuantum,
                "quantum",
                "- Set the Round Robin quantum (Number of clock ticks spent running each process.");
            this.commandList[this.commandList.length] = sc;

            // ps
            sc = new ShellCommand(this.shellProcesses,
                "ps",
                "- Show a list of the currently running processes.");
            this.commandList[this.commandList.length] = sc;

            // create file
            sc = new ShellCommand(this.shellCreateFile,
                "create",
                "- Create a file <filename> on the hard drive.");
            this.commandList[this.commandList.length] = sc;

            // write file
            sc = new ShellCommand(this.shellWriteFile,
                "write",
                "- Writes a file <filename> with the contents <data> on the hard drive.");
            this.commandList[this.commandList.length] = sc;

            // read file
            sc = new ShellCommand(this.shellReadFile,
                "read",
                "- Reads the contents of a file <filename> on the hard drive.");
            this.commandList[this.commandList.length] = sc;

            // delete file
            sc = new ShellCommand(this.shellDeleteFile,
                "delete",
                "- Deletes a file <filename> from the hard drive.");
            this.commandList[this.commandList.length] = sc;

            // format
            sc = new ShellCommand(this.shellFormat,
                "format",
                "- Formats the hard drive. All blocks, sectors, and tracks will be reinitialized.");
            this.commandList[this.commandList.length] = sc;

            // ls
            sc = new ShellCommand(this.shellLs,
                "ls",
                "- Lists all the files on the hard drive.");
            this.commandList[this.commandList.length] = sc;


            // ver
            sc = new ShellCommand(this.shellVer,
                                  "ver",
                                  "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // Tests BSOD
            sc = new ShellCommand(this.shellBSOD,
                "bsod",
                "- Shows the Blue Screen of Death for the OS. (For testing only.)");
            this.commandList[this.commandList.length] = sc;

            // date
            sc = new ShellCommand(this.shellDate,
                                  "date",
                                  "- Displays the current date.");
            this.commandList[this.commandList.length] = sc;

            // whereami
            sc = new ShellCommand(this.shellWhereami,
                "whereami",
                "- Tells the user where in the world they are.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellKill,
                "kill",
                "- Terminate a currently running process.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                                  "help",
                                  "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                                  "shutdown",
                                  "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                                  "cls",
                                  "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                                  "man",
                                  "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                                  "trace",
                                  "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                                  "rot13",
                                  "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                                  "prompt",
                                  "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.

            //
            // Display the initial prompt.
            this.putPrompt();
            document.getElementById("dateBadge").innerHTML = new Date().toLocaleDateString();
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match.  TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index: number = 0;
            var found: boolean = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses.
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {        // Check for apologies.
                    this.execute(this.shellApology);
                } else if (/^\s*$/.test(cmd)) {        // Check for blank
                    _StdOut.advanceLine();
                    this.putPrompt();
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
        public execute(fn, args?) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        }

        public parseInput(buffer): UserCommand {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        //
        // Shell Command Functions.  Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
           if (_SarcasticMode) {
              _StdOut.putText("I think we can put our differences behind us.");
              _StdOut.advanceLine();
              _StdOut.putText("For science . . . You monster.");
              _SarcasticMode = false;
           } else {
              _StdOut.putText("For what?");
           }
        }

        public shellStatus(args){
            document.getElementById("status").innerHTML = args.join(" ");
        }

        public shellGamify(){
            _Gamify = !_Gamify;
            _EnergyLevel = 100;
            document.getElementById("energyBar").style.width = 100 + "%";
            document.getElementById("energyDiv").hidden = !_Gamify;

            var ads = document.getElementsByClassName("gamify-img");
            for(var i = 0; i < ads.length; i++) {
                (<HTMLElement>ads[i]).hidden = !_Gamify;
            }
        }

        public shellProcesses() {
            _StdOut.putText("PID  Process");
            _StdOut.advanceLine();
            _StdOut.putText("--  ------");
            _StdOut.advanceLine();

            for (var i = 0; i < _ProcessManager.residentList.length; i++) {
                var process = _ProcessManager.residentList[i];
                if (process.processState === ProcessState.RUNNING ||
                    process.processState === ProcessState.READY) {
                    _StdOut.putText(process.pid + "     " + process.processState);
                    _StdOut.advanceLine();
                }
            }
        }

        public shellRun(pid){
            if(pid === undefined) {
                _StdOut.putText("Missing argument. run <PID>.");
            } else {
                _ProcessManager.run(parseInt(pid));
            }
        }

        public shellClearMem() {
            MemoryManager.clearAll();
            _StdOut.putText("Memory successfully cleared.");
        }

        public shellGetSchedule() {
            _StdOut.putText("Current Process Schedule: " + _ProcessManager.currentSchedulingMethod);
        }

        public shellSetSchedule(args: Array<string>) {
            var schedule = args[0];
            switch(schedule) {
                case "rr":
                    _ProcessManager.currentSchedulingMethod = "rr";
                    _StdOut.putText("Switching CPU scheduling algorithm to Round Robin.");
                    break;
                case "fcfs":
                    _ProcessManager.currentSchedulingMethod = "fcfs";
                    _StdOut.putText("Switching CPU scheduling algorithm to First Come, First Serve.");
                    break;
                case "priority":
                    _ProcessManager.currentSchedulingMethod = "priority";
                    _StdOut.putText("Switching CPU scheduling algorithm to Priority.");
                    break;
                default:
                    _StdOut.putText("Error. Priority Algorithm '" + schedule + "' does not exist. Try 'rr', 'fcfs', or 'priority' instead.");
            }
        }

        public shellRunAll() {
            _ProcessManager.runAll();
        }

        public shellQuantum(arg: string){
            var quantum = parseInt(arg);

            if (quantum > 0) {
                _Quantum = quantum;
                _StdOut.putText("Quantum successfully set to " + quantum + ".");
            } else {
                _StdOut.putText("Quantum could not be set to " + quantum + ".");
            }
        }

        public shellLoad(args: Array<string>) {
            var programInput = (<HTMLTextAreaElement>document.getElementById("taProgramInput")).value;
            programInput = programInput.replace(/(\s|\r\n|\n|\r)/gm,"");
            var priority = 5;

            if (args.length > 0) {
                if (parseInt(args[0]) {
                    priority = args[0]
                } else {
                    _StdOut.putText("Error. Priority must be an int.");
                    return;
                }
            }

            if (programInput.length === 0) {
                _StdOut.putText("Error. The program input field is empty.");
            } else if(/^[a-fA-F0-9 ]*$/.test(programInput)) {
                var pid = _ProcessManager.load(programInput, priority);
                if (pid === -1) {
                    _StdOut.putText("Out of Memory. Could not load program.");
                } else {
                    _StdOut.putText("Program successfully loaded. PID: " + pid);
                }
            } else {
                _StdOut.putText("Error. Text input must consist only of hex or spaces.");
            }
        }

        public shellKill(pid: string){
            var success = _ProcessManager.kill(parseInt(pid));
            if (success) {
                _StdOut.putText("Pid " + pid + " successfully removed.");
            } else {
                _StdOut.putText("Error.");
            }
        }

        public shellKillAll() {
            _ProcessManager.killAll();
        }

        public shellCreateFile(args: Array<string>) {
            var filename = args[0];
            var params = ["create", filename];
            _KernelInterruptQueue.enqueue(new Interrupt(DISK_OPERATION_IRQ, params));
        }

        public shellWriteFile(args: Array<string>) {
            var filename = args[0];
            var data = args.splice(1).join(" ");
            if (/^"[^"]+"$/.test(data)) {
                var params = ["write", filename, data.slice(1, -1)];
                _KernelInterruptQueue.enqueue(new Interrupt(DISK_OPERATION_IRQ, params));
            } else {
                _StdOut.putText("File contents must be wrapped in quotes.");
            }
        }

        public shellReadFile(args: Array<string>) {
            var filename = args[0];
            var params = ["read", filename];
            _KernelInterruptQueue.enqueue(new Interrupt(DISK_OPERATION_IRQ, params));
        }

        public shellDeleteFile(args: Array<string>) {
            var filename = args[0];
            var params = ["delete", filename];
            _KernelInterruptQueue.enqueue(new Interrupt(DISK_OPERATION_IRQ, params));
        }

        public shellFormat() {
            var params = ["format"];
            _KernelInterruptQueue.enqueue(new Interrupt(DISK_OPERATION_IRQ, params));
        }

        public shellLs() {
            var params = ["ls"];
            _KernelInterruptQueue.enqueue(new Interrupt(DISK_OPERATION_IRQ, params));
        }

        public shellBSOD(args) {
            // Display BSOD
            _Kernel.krnTrapError("testing...");
        }

        public shellVer(args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }

        public shellHelp(args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellDate(args) {
            _StdOut.putText(new Date().toLocaleDateString());
        }

        public shellWhereami(args){
            _StdOut.putText("Right where you need to be.");
        }

        public shellShutdown(args) {
             _StdOut.putText("Shutting down...");
             // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        }

        public shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }

        public shellMan(args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    // TODO: Make descriptive MANual page entries for the the rest of the shell commands here.
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        } else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

    }
}
