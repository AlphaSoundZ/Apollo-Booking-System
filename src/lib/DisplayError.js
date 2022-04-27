"use strict";
exports.__esModule = true;
exports.ReturnTarget = void 0;
var API_1 = require("./API");
var ReturnTarget;
(function (ReturnTarget) {
    ReturnTarget["USER_HOME"] = "user_home";
    ReturnTarget["HOME"] = "home";
})(ReturnTarget = exports.ReturnTarget || (exports.ReturnTarget = {}));
var DisplayError = /** @class */ (function () {
    function DisplayError(response, message, returnTarget) {
        if (returnTarget === void 0) { returnTarget = ReturnTarget.HOME; }
        if (!response.error)
            this.response = API_1.ResponseType.UNEXPECTED_ERROR;
        else
            this.response = response;
        this.message = message;
        this.returnTarget = returnTarget;
    }
    return DisplayError;
}());
exports["default"] = DisplayError;
