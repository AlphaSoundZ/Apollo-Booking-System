"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReturnTarget = void 0;
const API_1 = require("./API");
var ReturnTarget;
(function (ReturnTarget) {
    ReturnTarget["USER_HOME"] = "user_home";
    ReturnTarget["HOME"] = "home";
})(ReturnTarget = exports.ReturnTarget || (exports.ReturnTarget = {}));
class DisplayError {
    constructor(response, message, returnTarget = ReturnTarget.HOME) {
        if (!response.error)
            this.response = API_1.ResponseType.UNEXPECTED_ERROR;
        else
            this.response = response;
        this.message = message;
        this.returnTarget = returnTarget;
    }
}
exports.default = DisplayError;
//# sourceMappingURL=DisplayError.js.map