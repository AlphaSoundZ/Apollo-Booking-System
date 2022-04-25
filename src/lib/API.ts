import axios from "axios";

interface RawAPIResponse {
    response: string;
    user: null | {
        klasse: string;
    };
}

export class ResponseType {
    public static DEVICE_BOOKED = new ResponseType(0, "DEVICE_BOOKED");
    public static DEVICE_RETURNED = new ResponseType(1, "DEVICE_RETURNED");
    public static USER_INFO = new ResponseType(2, "USER_INFO");
    public static UUID_NOT_FOUND = new ResponseType(3, "UUID_NOT_FOUND", true);
    public static DEVICE_NOT_FOUND = new ResponseType(4, "DEVICE_NOT_FOUND", true);
    public static YOU_ALREADY_BOOKING = new ResponseType(5, "YOU_ALREADY_BOOKING", true);
    public static DEVICE_ALREADY_BOOKED = new ResponseType(6, "DEVICE_ALREADY_BOOKED", true);
    public static NOT_A_DEVICE = new ResponseType(7, "NOT_A_DEVICE", true);
    public static NO_UUID_SPECIFIED = new ResponseType(8, "NO_UUID_SPECIFIED", true);
    public static UNEXPECTED_ERROR = new ResponseType(9, "UNEXPECTED_ERROR", true);
    public static INTERNAL_SERVER_ERROR = new ResponseType(10, "INTERNAL_SERVER_ERROR", true);

    private static RESPONSE_TYPES = [
        this.DEVICE_BOOKED,
        this.DEVICE_RETURNED,
        this.USER_INFO,
        this.UUID_NOT_FOUND,
        this.DEVICE_NOT_FOUND,
        this.YOU_ALREADY_BOOKING,
        this.DEVICE_ALREADY_BOOKED,
        this.NOT_A_DEVICE,
        this.NO_UUID_SPECIFIED,
        this.UNEXPECTED_ERROR,
        this.INTERNAL_SERVER_ERROR,
    ];

    public readonly identifier: number;
    public readonly name: string;
    public readonly error: boolean;

    constructor(identifier: number, name: string, error = false) {
        this.identifier = identifier;
        this.name = name;
        this.error = error;
    }

    public static getByIdentifier(id: number) {
        for (const responseType of this.RESPONSE_TYPES) {
            if (responseType.identifier == id) return responseType;
        }
        return null;
    }
}

export class DeviceType {
    public static readonly IPad = new DeviceType("Ipad", 1);
    public static readonly UserCard = new DeviceType("UserCard", 2);
    public static readonly SurfaceBook = new DeviceType("Surface Book", 3);
    public static readonly Laptop = new DeviceType("Laptop", 4);

    public static readonly deviceTypes = [this.IPad, this.UserCard, this.SurfaceBook, this.Laptop];

    public static getByName(name: string): DeviceType {
        for (const deviceType of this.deviceTypes) if (deviceType.name == name) return deviceType;
        return null;
    }

    public static getById(id: number): DeviceType {
        for (const deviceType of this.deviceTypes) if (deviceType.id == id) return deviceType;
        return null;
    }

    public readonly name: string;
    public readonly id: number;

    private constructor(name: string, id: number) {
        this.name = name;
        this.id = id;
    }
}

export interface APIUser {
    name: string;
    lastname: string;
    user_id: number;
    class: string;
    teacher?: boolean;
    history: Array<unknown> | null;
}

export interface APIDevice {
    id: number;
    device_type: string;
    status: string;
    rfid_code: string;
}

export interface APIResponse {
    response: ResponseType;
    message: string;
    user: APIUser | null;
    device: APIDevice | null;
}

export default class API {
    private apiUrl: string;

    constructor(apiUrl: string) {
        this.apiUrl = apiUrl;
    }

    public async status(): Promise<APIResponse> {
        return this.parseApiResponse(await this.makeRequest({}));
    }

    public async unknownActionForUid(uid: string): Promise<APIResponse> {
        return this.parseApiResponse(await this.makeRequest({ rfid1: uid }));
    }

    public async book(userUid: string, deviceUid: string): Promise<APIResponse> {
        return this.parseApiResponse(await this.makeRequest({ rfid1: userUid, rfid2: deviceUid }));
    }

    public async registerDevice(uid: string, type: DeviceType, token: string) {
        return await axios.post(
            this.apiUrl,
            { rfid_code: uid, type: type.id },
            { headers: { Authorization: "Bearer " + token } },
        );
    }

    private parseApiResponse(response: unknown): APIResponse {
        (response as any).response = ResponseType.getByIdentifier(
            Number.parseInt((response as RawAPIResponse).response),
        );
        if (
            (response as RawAPIResponse).user &&
            (response as RawAPIResponse).user.klasse == "Lehrer"
        )
            (response as any).user.teacher = true;

        return response as APIResponse;
    }

    private async makeRequest(data: any): Promise<unknown> {
        return (
            await axios.get(this.apiUrl + "?" + new URLSearchParams(data).toString(), {
                responseType: "json",
            })
        ).data;
    }
}
