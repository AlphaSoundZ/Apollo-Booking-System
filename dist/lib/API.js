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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceType = exports.ResponseType = void 0;
const axios_1 = require("axios");
const registrationUrl = process.env.REGISTRATION_API_URL;
class ResponseType {
    constructor(identifier, name, error = false) {
        this.identifier = identifier;
        this.name = name;
        this.error = error;
    }
    static getByIdentifier(id) {
        for (const responseType of this.RESPONSE_TYPES) {
            if (responseType.identifier == id)
                return responseType;
        }
        return null;
    }
}
exports.ResponseType = ResponseType;
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
ResponseType.INTERNAL_SERVER_ERROR = new ResponseType(10, "INTERNAL_SERVER_ERROR", true);
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
    _a.INTERNAL_SERVER_ERROR,
];
class DeviceType {
    constructor(name, id) {
        this.name = name;
        this.id = id;
    }
    static getByName(name) {
        for (const deviceType of this.deviceTypes)
            if (deviceType.name == name)
                return deviceType;
        return null;
    }
    static getById(id) {
        for (const deviceType of this.deviceTypes)
            if (deviceType.id == id)
                return deviceType;
        return null;
    }
}
exports.DeviceType = DeviceType;
_b = DeviceType;
DeviceType.IPad = new DeviceType("Ipad", 1);
DeviceType.UserCard = new DeviceType("UserCard", 2);
DeviceType.SurfaceBook = new DeviceType("Surface Book", 3);
DeviceType.Laptop = new DeviceType("Laptop", 4);
DeviceType.deviceTypes = [_b.IPad, _b.UserCard, _b.SurfaceBook, _b.Laptop];
class API {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
    }
    status() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.parseApiResponse(yield this.makeRequest({}));
        });
    }
    unknownActionForUid(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.parseApiResponse(yield this.makeRequest({ rfid1: uid }));
        });
    }
    book(userUid, deviceUid) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.parseApiResponse(yield this.makeRequest({ rfid1: userUid, rfid2: deviceUid }));
        });
    }
    registerDevice(uid, type, token) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield axios_1.default.post(registrationUrl, { rfid_code: uid, type: type.id }, { headers: { Authorization: "Bearer " + token } })).data;
        });
    }
    parseApiResponse(response) {
        response.response = ResponseType.getByIdentifier(Number.parseInt(response.response));
        if (response.user &&
            response.user.klasse == "Lehrer")
            response.user.teacher = true;
        return response;
    }
    makeRequest(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield axios_1.default.get(this.apiUrl + "?" + new URLSearchParams(data).toString(), {
                responseType: "json",
            })).data;
        });
    }
}
exports.default = API;
//# sourceMappingURL=API.js.map