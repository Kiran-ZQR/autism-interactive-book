"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cn = cn;
// client/src/lib/utils.ts
function cn() {
    var cls = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        cls[_i] = arguments[_i];
    }
    return cls.filter(Boolean).join(' ');
}
