var WeirdOS;
(function (WeirdOS) {
    var CommandHistory = (function () {
        function CommandHistory(commandStack, index) {
            if (commandStack === void 0) { commandStack = []; }
            if (index === void 0) { index = 0; }
            this.commandStack = commandStack;
            this.index = index;
        }
        CommandHistory.prototype.init = function () {
            this.commandStack = [];
            this.index = 0;
        };
        CommandHistory.prototype.push = function (command) {
            this.commandStack.unshift(command);
            this.index = 0;
        };
        CommandHistory.prototype.upHistory = function () {
            var prevCommand = this.commandStack[this.index % this.commandStack.length];
            this.index++;
            return prevCommand;
        };
        CommandHistory.prototype.downHistory = function () {
            this.index = Math.max(this.index - 1, 0);
            return this.commandStack[this.index];
        };
        return CommandHistory;
    })();
    WeirdOS.CommandHistory = CommandHistory;
})(WeirdOS || (WeirdOS = {}));
//# sourceMappingURL=gamify.js.map