/* ------------
   Interrupt.ts
   ------------ */
var WeirdOS;
(function (WeirdOS) {
    var Interrupt = (function () {
        function Interrupt(irq, params) {
            this.irq = irq;
            this.params = params;
        }
        return Interrupt;
    })();
    WeirdOS.Interrupt = Interrupt;
})(WeirdOS || (WeirdOS = {}));
//# sourceMappingURL=interrupt.js.map