export default class UIState {
    public static GETTING_CHIP_INFO = new UIState("gettingChipInfo", "Loading", {
        message: "Lade Daten...",
    });
    public static DEVICE_RETURNED = new UIState("deviceReturned", "Success", {
        message: "Gerät erfolgreich zurückgegeben.",
    });
    public static DEVICE_BOOKING_LOADING = new UIState("bookingDevice", "Loading", {
        message: "Gerät wird ausgeliehen...",
    });
    public static DEVICE_BOOKING_COMPLETED = new UIState("bookingCompleted", "Success", {
        message: "Gerät erfolgreich ausgeliehen.",
    });
    public static USER_INFO = new UIState("userInfo", "User");
    public static USER_LOGOUT = new UIState("userLogout", "Success", {
        message: "Erfolgreich abgemeldet.",
    });
    public static HOME = new UIState("home", "Waiting");
    public static ERROR = new UIState("error", "Error");

    public static getByIdentifier(identifier: string) {
        const STATES: Array<UIState> = [
            this.GETTING_CHIP_INFO,
            this.DEVICE_RETURNED,
            this.DEVICE_BOOKING_LOADING,
            this.DEVICE_BOOKING_COMPLETED,
            this.USER_INFO,
            this.USER_LOGOUT,
            this.HOME,
        ];

        for (const state of STATES) {
            if (state.identifier === identifier) return state;
        }
        return null;
    }

    public identifier: string;
    public pageName: string;
    public props: any;

    constructor(identifier: string, pageName: string, props: any = {}) {
        this.identifier = identifier;
        this.pageName = pageName;
        this.props = props;
    }
}
