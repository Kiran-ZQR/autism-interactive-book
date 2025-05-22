"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChoiceCards = ChoiceCards;
function ChoiceCards(_a) {
    var options = _a.options, onPick = _a.onPick;
    return (<div className="grid grid-cols-2 gap-3 mt-4">
      {options.map(function (op) { return (<button key={op} onClick={function () { return onPick(op); }} className="bg-white border-2 rounded-xl p-4 hover:bg-blue-50 text-lg transition">
          {op}
        </button>); })}
    </div>);
}
