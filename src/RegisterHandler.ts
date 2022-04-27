import * as log4js from "log4js";
import { createInterface as createReadlineInterface } from "readline";
import Handler from "./Handler";
import API from "./lib/API";
import { DeviceType } from "./lib/API";

const logger = log4js.getLogger("cli");
const readline = createReadlineInterface(process.stdin, process.stdout);
const token = process.env.REGISTER_TOKEN;

export default class RegisterHandler implements Handler {
    private static lastSelectedType: DeviceType = DeviceType.IPad;

    public uid: string | null = null;
    private api: API;

    constructor(api: API) {
        this.api = api;
    }

    public async run(uid: string) {
        logger.debug("[[ Device Types ]]");
        for (const deviceType of DeviceType.deviceTypes)
            logger.info("    " + deviceType.id + ": " + deviceType.name);

        const result = await new Promise<string>((resolve) => {
            readline.question(
                'Please enter device type for "' +
                    uid +
                    '" (or return for ' +
                    RegisterHandler.lastSelectedType.name +
                    "): ",
                (answer) => {
                    resolve(answer);
                },
            );
        });
        let selectedType = DeviceType.IPad;
        if (result.length > 0)
            try {
                const raw = Number(result);
                const temp = DeviceType.getById(raw);
                if (temp != null) selectedType = temp;
            } catch (_) {}

        RegisterHandler.lastSelectedType = selectedType;

        logger.info('Registering "' + uid + '" as ' + selectedType.name + "...");

        this.register(uid, selectedType);
    }

    private async register(uid: string, type: DeviceType) {
        try {
            const response = await this.api.registerDevice(uid, type, token);
            if (response.success && response.success == 1)
                logger.info('Successfully registered "' + uid + '" as ' + type.name);
            else
                logger.error("Error while registering device: " + response.log);
        } catch (err) {
            logger.error("Error while registering device:", err);
        }
        
    }
}
