"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Spinner = Spinner;
function Spinner(_a) {
    var _b = _a.className, className = _b === void 0 ? '' : _b;
    return (<div className={"animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full ".concat(className)}/>);
}
