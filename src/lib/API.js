"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.ResponseType = void 0;
var axios_1 = require("axios");
var ResponseType = /** @class */ (function () {
    function ResponseType(identifier, name, error) {
        if (error === void 0) { error = false; }
        this.identifier = identifier;
        this.name = name;
        this.error = error;
    }
    ResponseType.getByIdentifier = function (id) {
        for (var _i = 0, _b = this.RESPONSE_TYPES; _i < _b.length; _i++) {
            var responseType = _b[_i];
            if (responseType.identifier == id)
                return responseType;
        }
        return null;
    };
    var _a;
    _a = ResponseType;
    ResponseType.DEVICE_BOOKED = new ResponseType(0, "DEVICE_BOOKED");
    ResponseType.DEVICE_RETURNED = new ResponseType(1, "DEVICE_RETURNED");
    ResponseType.USER_INFO = new ResponseType(2, "USER_INFO");
    ResponseType.UUID_NOT_FOUND = new ResponseType(3, "UUID_NOT_FOUND", true);
    ResponseType.DEVICE_NOT_FOUND = new ResponseType(4, "DEVICE_NOT_FOUND", true);
    ResponseType.YOU_ALREADY_BOOKING = new ResponseType(5, "YOU_ALREADY_BOOKING", true);
    ResponseType.DEVICE_ALREADY_BOOKED = new ResponseType(6, "DEVICE_ALREADY_BOOKED", true);
    ResponseType.NOT_A_DEVICE = new ResponseType(7, "NOT_A_DEVICE", true);
    ResponseType.NO_UUID_SPECIFIED = new ResponseType(8, "NO_UUID_SPECIFIED", true);
    ResponseType.UNEXPECTED_ERROR = new ResponseType(9, "UNEXPECTED_ERROR", true);
    ResponseType.RESPONSE_TYPES = [
        _a.DEVICE_BOOKED,
        _a.DEVICE_RETURNED,
        _a.USER_INFO,
        _a.UUID_NOT_FOUND,
        _a.DEVICE_NOT_FOUND,
        _a.YOU_ALREADY_BOOKING,
        _a.DEVICE_ALREADY_BOOKED,
        _a.NOT_A_DEVICE,
        _a.NO_UUID_SPECIFIED,
        _a.UNEXPECTED_ERROR,
    ];
    return ResponseType;
}());
exports.ResponseType = ResponseType;
var API = /** @class */ (function () {
    function API(apiUrl) {
        this.apiUrl = apiUrl;
    }
    API.prototype.status = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = this.parseApiResponse;
                        return [4 /*yield*/, this.makeRequest({})];
                    case 1: return [2 /*return*/, _b.apply(this, [_c.sent()])];
                }
            });
        });
    };
    API.prototype.unknownActionForUid = function (uid) {
        return __awaiter(this, void 0, void 0, function () {
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = this.parseApiResponse;
                        return [4 /*yield*/, this.makeRequest({ rfid1: uid })];
                    case 1: return [2 /*return*/, _b.apply(this, [_c.sent()])];
                }
            });
        });
    };
    API.prototype.book = function (userUid, deviceUid) {
        return __awaiter(this, void 0, void 0, function () {
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = this.parseApiResponse;
                        return [4 /*yield*/, this.makeRequest({ rfid1: userUid, rfid2: deviceUid })];
                    case 1: return [2 /*return*/, _b.apply(this, [_c.sent()])];
                }
            });
        });
    };
    API.prototype.parseApiResponse = function (response) {
        response.response = ResponseType.getByIdentifier(Number.parseInt(response.response));
        if (response.user &&
            response.user["class"] == "Lehrer")
            response.user.teacher = true;
        return response;
    };
    API.prototype.makeRequest = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, axios_1["default"].get(this.apiUrl + "?" + new URLSearchParams(data).toString(), {
                            responseType: "json"
                        })];
                    case 1: return [2 /*return*/, (_b.sent()).data];
                }
            });
        });
    };
    return API;
}());
exports["default"] = API;
