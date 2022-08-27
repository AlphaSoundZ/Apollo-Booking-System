import axios, { AxiosInstance } from "axios";

interface RawBookingResponse {
    response: number;
    message: string;
    user?: {
        name: string;
        lastname: string;
        user_id: number;
        class: string;
        status: string;
        history?: Array<unknown>;
    };
    device?: {
        id: number;
        device_type: string;
        status: boolean;
        rfid_code: string;
    };
}

export class ResponseType {
    public static SUCCESS = new ResponseType(0, "SUCCESS");
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
    public static INTERNAL_SERVER_ERROR_500 = new ResponseType(500, "INTERNAL_SERVER_ERROR", true);
    public static AUTHORIZATION_ERROR = new ResponseType(401, "AUTHORIZATION_ERROR", true);

    private static RESPONSE_TYPES = [
        this.SUCCESS,
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
        this.INTERNAL_SERVER_ERROR_500,
        this.AUTHORIZATION_ERROR,
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

export interface User {
    name: string;
    lastname: string;
    user_id: number;
    class: string;
    teacher?: boolean;
    history?: Array<unknown>;
}

export interface Device {
    id: number;
    device_type: string;
    status: boolean;
    rfid_code: string;
}

export interface BookingResponse {
    response: ResponseType;
    message: string;
    user?: User;
    device?: Device;
}

export interface RegisterDeviceResponse {
    response: ResponseType;
    message: string;
}

export interface CheckTokenResponse {
    response: ResponseType;
    message: string;
    permissions: string[];
}

export default class API {
    private apiUrl: string;
    private apiToken: string;
    private client: AxiosInstance;

    constructor(apiUrl: string, apiToken: string) {
        this.apiUrl = apiUrl;
        this.apiToken = apiToken;
        this.client = axios.create({
            baseURL: this.apiUrl,
            headers: { Authorization: "Bearer " + this.apiToken },
            responseType: "json",
        });
    }

    public async checkToken(): Promise<CheckTokenResponse> {
        const data = (await this.client.post("/check_token")).data;
        return Object.assign(data, { response: ResponseType.getByIdentifier(data.response) });
    }

    public async registerDevice(uid: string, type: DeviceType): Promise<RegisterDeviceResponse> {
        const data = (await this.client.post("/add_device", { rfid_code: uid, type: type.id }))
            .data;
        return Object.assign(data, { response: ResponseType.getByIdentifier(data.response) });
    }

    public async unknownActionForUid(uid: string): Promise<BookingResponse> {
        return this.parseBookingResponse(
            await this.client.post<RawBookingResponse>("/booking", {
                uid_1: uid,
            }),
        );
    }

    public async book(userUid: string, deviceUid: string): Promise<BookingResponse> {
        return this.parseBookingResponse(
            await this.client.post<RawBookingResponse>("/booking", {
                uid_1: userUid,
                uid_2: deviceUid,
            }),
        );
    }

    private parseBookingResponse(response: { data: RawBookingResponse }): BookingResponse {
        return Object.assign(response.data, {
            response: ResponseType.getByIdentifier(response.data.response),
            user: response.data.user
                ? Object.assign(response.data.user, {
                      teacher: response.data.user && response.data.user.class == "Lehrer",
                  })
                : undefined,
        });
    }
}
