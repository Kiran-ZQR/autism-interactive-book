"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Alert = Alert;
var react_1 = require("react");
function Alert(_a) {
    var children = _a.children, _b = _a.variant, variant = _b === void 0 ? 'default' : _b;
    var variantClasses = {
        default: 'bg-blue-50 border-blue-200 text-blue-800',
        destructive: 'bg-red-50 border-red-200 text-red-800',
        warning: 'bg-amber-50 border-amber-200 text-amber-800'
    };
    return (<div className={"p-4 mb-4 border rounded-md ".concat(variantClasses[variant])}>
      {children}
    </div>);
}
