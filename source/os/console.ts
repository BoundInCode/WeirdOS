///<reference path="../globals.ts" />

/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module WeirdOS {

    export class CommandHistory {
        constructor(public commandStack = [],
                    public index = 0) {

        }
        public init(): void {
            this.commandStack = [];
            this.index = 0;
        }

        public push(command) {
            this.commandStack.unshift(command);
            this.index = 0;
        }

        public upHistory(): string {
            var prevCommand = this.commandStack[this.index % this.commandStack.length];
            this.index++;
            return prevCommand;
        }

        public downHistory(): string {
            this.index = Math.max(this.index - 1, 0);
            return this.commandStack[this.index];
        }
    }

    export class Console {

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "",
                    public commandHistory:CommandHistory = new CommandHistory()) {
        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        private clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
            _Canvas.height = _DefaultCanvasHeight;
        }

        private resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { //     Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.commandHistory.push(this.buffer);
                    this.buffer = "";
                } else if (chr === String.fromCharCode(9)) {  // Tab
                    for (var i = 0; i < _OsShell.commandList.length; i++) {
                        var command = _OsShell.commandList[i].command;
                        if (command.startsWith(this.buffer)) {
                            this.putText(command.substr(this.buffer.length));
                            this.buffer = command;
                            break;
                        }
                    }
                } else if (chr === String.fromCharCode(38)) { // Up Arrow
                    this.clearText(this.buffer);
                    this.buffer = this.commandHistory.upHistory();
                    if (this.buffer.length > 0) {
                        this.putText(this.buffer);
                    }
                } else if (chr === String.fromCharCode(8)) { // Backspace
                    var bufferLen = this.buffer.length;
                    this.clearText(this.buffer.substr(bufferLen - 1));
                    this.buffer = this.buffer.substr(0, bufferLen - 1);
                } else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Write a case for Ctrl-C.
            }
        }

        // Remove text at the end of the buffer
        public clearText(text): void {
            var charWidth = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
            var charHeight = _DefaultFontSize + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize);
            _DrawingContext.clearRect(this.currentXPosition - charWidth, this.currentYPosition - charHeight, charWidth, charHeight + _FontHeightMargin);
            this.currentXPosition -= charWidth;
        }

        public putText(text): void {
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
                    } else {
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
         }

        public advanceLine(): void {
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
                var imgData = _Canvas.getContext('2d').getImageData(0,0, _Canvas.width, _Canvas.height);
                var divConsole = document.getElementById("divConsole");
                _Canvas.height = this.currentYPosition + _FontHeightMargin*2;
                _Canvas.getContext('2d').putImageData(imgData,0,0);
                divConsole.scrollTop = divConsole.scrollHeight;
            }
        }
    }
 }
