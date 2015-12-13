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
var TSOS;
(function (TSOS) {
    var Shell = (function () {
        function Shell() {
            // Properties
            this.promptStr = "> ";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
        }
        Shell.prototype.init = function () {
            var sc;
            //
            // Load the command list.
            // gamify
            sc = new TSOS.ShellCommand(this.shellGamify, "gamify", "- Toggles instant gamification. (Warning: Very Obnoxious)");
            this.commandList[this.commandList.length] = sc;
            // status
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "- Set the status in the Host.");
            this.commandList[this.commandList.length] = sc;
            // load
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "- Loads the user program into the OS memory.");
            this.commandList[this.commandList.length] = sc;
            // clear memory
            sc = new TSOS.ShellCommand(this.shellClearMem, "clearmem", "- Clear all the memory partitions.");
            this.commandList[this.commandList.length] = sc;
            // run
            sc = new TSOS.ShellCommand(this.shellRun, "run", "- Run a program in memory given it's PID.");
            this.commandList[this.commandList.length] = sc;
            // set schedule
            sc = new TSOS.ShellCommand(this.shellSetSchedule, "setschedule", "- Sets the CPU's scheduling algorithm. Options: Round Robin (rr), First Come, First Serve (fcfs), or Priority (priority)");
            this.commandList[this.commandList.length] = sc;
            // get schedule
            sc = new TSOS.ShellCommand(this.shellGetSchedule, "getschedule", "- Gets the CPU's current scheduling algorithm.");
            this.commandList[this.commandList.length] = sc;
            // run all
            sc = new TSOS.ShellCommand(this.shellRunAll, "runall", "- Run all the programs loaded in the resident list.");
            this.commandList[this.commandList.length] = sc;
            //kill all
            sc = new TSOS.ShellCommand(this.shellKillAll, "killall", "- Kill all the programs loaded in the resident list.");
            this.commandList[this.commandList.length] = sc;
            // quantum
            sc = new TSOS.ShellCommand(this.shellQuantum, "quantum", "- Set the Round Robin quantum (Number of clock ticks spent running each process.");
            this.commandList[this.commandList.length] = sc;
            // ps
            sc = new TSOS.ShellCommand(this.shellProcesses, "ps", "- Show a list of the currently running processes.");
            this.commandList[this.commandList.length] = sc;
            // create file
            sc = new TSOS.ShellCommand(this.shellCreateFile, "create", "- Create a file <filename> on the hard drive.");
            this.commandList[this.commandList.length] = sc;
            // write file
            sc = new TSOS.ShellCommand(this.shellWriteFile, "write", "- Writes a file <filename> with the contents <data> on the hard drive.");
            this.commandList[this.commandList.length] = sc;
            // read file
            sc = new TSOS.ShellCommand(this.shellReadFile, "read", "- Reads the contents of a file <filename> on the hard drive.");
            this.commandList[this.commandList.length] = sc;
            // delete file
            sc = new TSOS.ShellCommand(this.shellDeleteFile, "delete", "- Deletes a file <filename> from the hard drive.");
            this.commandList[this.commandList.length] = sc;
            // format
            sc = new TSOS.ShellCommand(this.shellFormat, "format", "- Formats the hard drive. All blocks, sectors, and tracks will be reinitialized.");
            this.commandList[this.commandList.length] = sc;
            // ls
            sc = new TSOS.ShellCommand(this.shellLs, "ls", "- Lists all the files on the hard drive.");
            this.commandList[this.commandList.length] = sc;
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;
            // Tests BSOD
            sc = new TSOS.ShellCommand(this.shellBSOD, "bsod", "- Shows the Blue Screen of Death for the OS. (For testing only.)");
            this.commandList[this.commandList.length] = sc;
            // date
            sc = new TSOS.ShellCommand(this.shellDate, "date", "- Displays the current date.");
            this.commandList[this.commandList.length] = sc;
            // whereami
            sc = new TSOS.ShellCommand(this.shellWhereami, "whereami", "- Tells the user where in the world they are.");
            this.commandList[this.commandList.length] = sc;
            // help
            sc = new TSOS.ShellCommand(this.shellKill, "kill", "- Terminate a currently running process.");
            this.commandList[this.commandList.length] = sc;
            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.
            //
            // Display the initial prompt.
            this.putPrompt();
            document.getElementById("dateBadge").innerHTML = new Date().toLocaleDateString();
        };
        Shell.prototype.putPrompt = function () {
            _StdOut.putText(this.promptStr);
        };
        Shell.prototype.handleInput = function (buffer) {
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
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            }
            else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) {
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {
                    this.execute(this.shellApology);
                }
                else if (/^\s*$/.test(cmd)) {
                    _StdOut.advanceLine();
                    this.putPrompt();
                }
                else {
                    this.execute(this.shellInvalidCommand);
                }
            }
        };
        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
        Shell.prototype.execute = function (fn, args) {
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
        };
        Shell.prototype.parseInput = function (buffer) {
            var retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);
            // 2. Lower-case it.
            buffer = buffer.toLowerCase();
            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");
            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;
            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        };
        //
        // Shell Command Functions.  Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        Shell.prototype.shellInvalidCommand = function () {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        };
        Shell.prototype.shellCurse = function () {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        };
        Shell.prototype.shellApology = function () {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        };
        Shell.prototype.shellStatus = function (args) {
            document.getElementById("status").innerHTML = args.join(" ");
        };
        Shell.prototype.shellGamify = function () {
            _Gamify = !_Gamify;
            _EnergyLevel = 100;
            document.getElementById("energyBar").style.width = 100 + "%";
            document.getElementById("energyDiv").hidden = !_Gamify;
            var ads = document.getElementsByClassName("gamify-img");
            for (var i = 0; i < ads.length; i++) {
                ads[i].hidden = !_Gamify;
            }
        };
        Shell.prototype.shellProcesses = function () {
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
        };
        Shell.prototype.shellRun = function (pid) {
            if (pid === undefined) {
                _StdOut.putText("Missing argument. run <PID>.");
            }
            else {
                _ProcessManager.run(parseInt(pid));
            }
        };
        Shell.prototype.shellClearMem = function () {
            MemoryManager.clearAll();
            _StdOut.putText("Memory successfully cleared.");
        };
        Shell.prototype.shellGetSchedule = function () {
            _StdOut.putText("Current Process Schedule: " + _ProcessManager.currentSchedulingMethod);
        };
        Shell.prototype.shellSetSchedule = function (args) {
            var schedule = args[0];
            switch (schedule) {
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
        };
        Shell.prototype.shellRunAll = function () {
            _ProcessManager.runAll();
        };
        Shell.prototype.shellQuantum = function (arg) {
            var quantum = parseInt(arg);
            if (quantum > 0) {
                _Quantum = quantum;
                _StdOut.putText("Quantum successfully set to " + quantum + ".");
            }
            else {
                _StdOut.putText("Quantum could not be set to " + quantum + ".");
            }
        };
        Shell.prototype.shellLoad = function () {
            var programInput = document.getElementById("taProgramInput").value;
            programInput = programInput.replace(/(\r\n|\n|\r)/gm, "");
            if (programInput.length === 0) {
                _StdOut.putText("Error. The program input field is empty.");
            }
            else if (/^[a-fA-F0-9 ]*$/.test(programInput)) {
                var pid = _ProcessManager.load(programInput);
                if (pid === -1) {
                    _StdOut.putText("Out of Memory. Could not load program.");
                }
                else {
                    _StdOut.putText("Program successfully loaded. PID: " + pid);
                }
            }
            else {
                _StdOut.putText("Error. Text input must consist only of hex or spaces.");
            }
        };
        Shell.prototype.shellKill = function (pid) {
            var success = _ProcessManager.kill(parseInt(pid));
            if (success) {
                _StdOut.putText("Pid " + pid + " successfully removed.");
            }
            else {
                _StdOut.putText("Error.");
            }
        };
        Shell.prototype.shellKillAll = function () {
            _ProcessManager.killAll();
        };
        Shell.prototype.shellCreateFile = function (filename) {
            var params = ["create", filename];
            _KernelInterruptQueue.enqueue(new Interrupt(DISK_OPERATION_IRQ, params));
        };
        Shell.prototype.shellWriteFile = function (args) {
            var filename = args[0];
            var data = args.splice(1).join(" ");
            if (/^"[^"]+"$/.test(data)) {
                var params = ["write", filename, data.slice(1, -1)];
                _KernelInterruptQueue.enqueue(new Interrupt(DISK_OPERATION_IRQ, params));
            }
            else {
                _StdOut.putText("File contents must be wrapped in quotes.");
            }
        };
        Shell.prototype.shellReadFile = function (filename) {
            var params = ["read", filename];
            _KernelInterruptQueue.enqueue(new Interrupt(DISK_OPERATION_IRQ, params));
        };
        Shell.prototype.shellDeleteFile = function (filename) {
            var params = ["delete", filename];
            _KernelInterruptQueue.enqueue(new Interrupt(DISK_OPERATION_IRQ, params));
        };
        Shell.prototype.shellFormat = function () {
            var params = ["format"];
            _KernelInterruptQueue.enqueue(new Interrupt(DISK_OPERATION_IRQ, params));
        };
        Shell.prototype.shellLs = function () {
            var params = ["ls"];
            _KernelInterruptQueue.enqueue(new Interrupt(DISK_OPERATION_IRQ, params));
        };
        Shell.prototype.shellBSOD = function (args) {
            // Display BSOD
            _Kernel.krnTrapError("testing...");
        };
        Shell.prototype.shellVer = function (args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        };
        Shell.prototype.shellHelp = function (args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        };
        Shell.prototype.shellDate = function (args) {
            _StdOut.putText(new Date().toLocaleDateString());
        };
        Shell.prototype.shellWhereami = function (args) {
            _StdOut.putText("Right where you need to be.");
        };
        Shell.prototype.shellShutdown = function (args) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        };
        Shell.prototype.shellCls = function (args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        };
        Shell.prototype.shellMan = function (args) {
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
            }
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        };
        Shell.prototype.shellTrace = function (args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        }
                        else {
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
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        };
        Shell.prototype.shellRot13 = function (args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellPrompt = function (args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        };
        return Shell;
    })();
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=shell.js.map