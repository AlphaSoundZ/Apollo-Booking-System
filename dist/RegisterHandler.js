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
Object.defineProperty(exports, "__esModule", { value: true });
const log4js = require("log4js");
const readline_1 = require("readline");
const API_1 = require("./lib/API");
const logger = log4js.getLogger("cli");
const readline = (0, readline_1.createInterface)(process.stdin, process.stdout);
const token = process.env.REGISTER_TOKEN;
class RegisterHandler {
    constructor(api) {
        this.uid = null;
        this.api = api;
    }
    run(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug("[[ Device Types ]]");
            for (const deviceType of API_1.DeviceType.deviceTypes)
                logger.info("    " + deviceType.id + ": " + deviceType.name);
            const result = yield new Promise((resolve) => {
                readline.question('Please enter device type for "' +
                    uid +
                    '" (or return for ' +
                    RegisterHandler.lastSelectedType.name +
                    "): ", (answer) => {
                    resolve(answer);
                });
            });
            let selectedType = API_1.DeviceType.IPad;
            if (result.length > 0)
                try {
                    const raw = Number(result);
                    const temp = API_1.DeviceType.getById(raw);
                    if (temp != null)
                        selectedType = temp;
                }
                catch (_) { }
            RegisterHandler.lastSelectedType = selectedType;
            logger.info('Registering "' + uid + '" as ' + selectedType.name + "...");
            this.register(uid, selectedType);
        });
    }
    register(uid, type) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.api.registerDevice(uid, type, token);
                if (response.success && response.success == 1)
                    logger.info('Successfully registered "' + uid + '" as ' + type.name);
                else
                    logger.error("Error while registering device: " + response.log);
            }
            catch (err) {
                logger.error("Error while registering device:", err);
            }
        });
    }
}
exports.default = RegisterHandler;
RegisterHandler.lastSelectedType = API_1.DeviceType.IPad;
//# sourceMappingURL=RegisterHandler.js.map