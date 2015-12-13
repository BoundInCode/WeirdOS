///<reference path="../globals.ts" />
/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var TSOS;
(function (TSOS) {
    var CommandHistory = (function () {
        function CommandHistory(commandStack, index) {
            if (commandStack === void 0) { commandStack = []; }
            if (index === void 0) { index = 0; }
            this.commandStack = commandStack;
            this.index = index;
        }
        CommandHistory.prototype.init = function () {
            this.commandStack = [];
            this.index = -1;
        };
        CommandHistory.prototype.push = function (command) {
            this.commandStack.unshift(command);
            this.index = -1;
        };
        CommandHistory.prototype.reset = function () {
            this.index = -1;
        };
        CommandHistory.prototype.upHistory = function () {
            if (this.commandStack.length === 0) {
                return "";
            }
            this.index = Math.min(this.index + 1, this.commandStack.length - 1);
            var prevCommand = this.commandStack[this.index];
            return prevCommand;
        };
        CommandHistory.prototype.downHistory = function () {
            if (this.commandStack.length === 0) {
                return "";
            }
            this.index = Math.max(this.index - 1, 0);
            var nextCommand = this.commandStack[this.index];
            return nextCommand;
        };
        return CommandHistory;
    })();
    TSOS.CommandHistory = CommandHistory;
    var Console = (function () {
        function Console(currentFont, currentFontSize, currentXPosition, currentYPosition, buffer, regenEnergyTimeoutId, commandHistory) {
            if (currentFont === void 0) { currentFont = _DefaultFontFamily; }
            if (currentFontSize === void 0) { currentFontSize = _DefaultFontSize; }
            if (currentXPosition === void 0) { currentXPosition = 0; }
            if (currentYPosition === void 0) { currentYPosition = _DefaultFontSize; }
            if (buffer === void 0) { buffer = ""; }
            if (regenEnergyTimeoutId === void 0) { regenEnergyTimeoutId = null; }
            if (commandHistory === void 0) { commandHistory = new CommandHistory(); }
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
            this.regenEnergyTimeoutId = regenEnergyTimeoutId;
            this.commandHistory = commandHistory;
        }
        Console.prototype.init = function () {
            this.clearScreen();
            this.resetXY();
        };
        Console.prototype.clearScreen = function () {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
            _Canvas.height = _DefaultCanvasHeight;
        };
        Console.prototype.resetXY = function () {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        };
        Console.prototype.handleInput = function () {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) {
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.commandHistory.push(this.buffer);
                    this.buffer = "";
                }
                else if (chr === String.fromCharCode(9)) {
                    for (var i = 0; i < _OsShell.commandList.length; i++) {
                        var command = _OsShell.commandList[i].command;
                        if (command.startsWith(this.buffer)) {
                            this.putText(command.substr(this.buffer.length));
                            this.buffer = command;
                            break;
                        }
                    }
                }
                else if (chr === String.fromCharCode(38)) {
                    this.clearText(this.buffer);
                    this.buffer = this.commandHistory.upHistory();
                    if (this.buffer.length > 0) {
                        this.putText(this.buffer);
                    }
                }
                else if (chr === String.fromCharCode(40)) {
                    this.clearText(this.buffer);
                    this.buffer = this.commandHistory.downHistory();
                    if (this.buffer.length > 0) {
                        this.putText(this.buffer);
                    }
                }
                else if (chr === String.fromCharCode(8)) {
                    this.commandHistory.reset();
                    var bufferLen = this.buffer.length;
                    this.clearText(this.buffer.substr(bufferLen - 1));
                    this.buffer = this.buffer.substr(0, bufferLen - 1);
                }
                else {
                    if (_Gamify) {
                        _EnergyLevel = Math.max(0, _EnergyLevel - 5);
                        document.getElementById("energyBar").style.width = _EnergyLevel + "%";
                        if (_EnergyLevel <= 0) {
                            $('#energy-modal').modal('show');
                        }
                        // Screenshake
                        this.shake(100 - _EnergyLevel);
                        // Artificial Lag
                        var lag = (100 - _EnergyLevel);
                        this.sleep(lag);
                        this.putText(chr);
                        this.buffer += chr;
                        // Recharge energy
                        clearTimeout(this.regenEnergyTimeoutId);
                        this.regenEnergyTimeoutId = setTimeout(function () {
                            _EnergyLevel = 100;
                            document.getElementById("energyBar").style.width = _EnergyLevel + "%";
                        }, 2000);
                    }
                    else {
                        // This is a "normal" character, so ...
                        // ... draw it on the screen...
                        this.putText(chr);
                        // ... and add it to our buffer.
                        this.buffer += chr;
                    }
                }
            }
        };
        Console.prototype.shake = function (power) {
            var interval = 100;
            var distance = power * 0.2;
            var times = power * 0.05;
            $("body").css('position', 'relative');
            for (var iter = 0; iter < (times + 1); iter++) {
                $("body").animate({
                    left: ((iter % 2 == 0 ? distance : distance * -1))
                }, interval);
            }
            $("body").animate({ left: 0 }, interval);
        };
        Console.prototype.sleep = function (milliseconds) {
            var e = new Date().getTime() + (milliseconds);
            while (new Date().getTime() <= e) { }
        };
        // Remove text at the end of the buffer
        Console.prototype.clearText = function (text) {
            var charWidth = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
            var charHeight = _DefaultFontSize + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize);
            _DrawingContext.clearRect(this.currentXPosition - charWidth, this.currentYPosition - charHeight, charWidth, charHeight + _DefaultFontSize);
            this.currentXPosition -= charWidth;
        };
        Console.prototype.putText = function (text) {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            //
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            //         Consider fixing that.
            if (text !== "") {
                var textSegment = "";
                for (var i = 0; i < text.length; i++) {
                    var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, textSegment);
                    if (this.currentXPosition + offset > _DefaultCanvasWidth) {
                        this.advanceLine();
                    }
                    if (text[i] === " ") {
                        // Draw the text at the current X and Y coordinates.
                        _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, textSegment);
                        // Move the current X position.
                        this.currentXPosition = this.currentXPosition + offset;
                        textSegment = " ";
                    }
                    else {
                        textSegment += text[i];
                    }
                }
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, textSegment);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, textSegment);
                this.currentXPosition = this.currentXPosition + offset;
                if (_Canvas.height > _DefaultCanvasHeight) {
                    var divConsole = document.getElementById("divConsole");
                    divConsole.scrollTop = divConsole.scrollHeight;
                }
            }
        };
        Console.prototype.advanceLine = function () {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            this.currentYPosition += _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
            if (this.currentYPosition > _Canvas.height) {
                var imgData = _Canvas.getContext('2d').getImageData(0, 0, _Canvas.width, _Canvas.height);
                var divConsole = document.getElementById("divConsole");
                _Canvas.height = this.currentYPosition + _FontHeightMargin * 2;
                _Canvas.getContext('2d').putImageData(imgData, 0, 0);
                divConsole.scrollTop = divConsole.scrollHeight;
            }
        };
        return Console;
    })();
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=console.js.map