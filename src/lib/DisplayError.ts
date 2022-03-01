import { ResponseType } from "./API";

export enum ReturnTarget {
    USER_HOME = "user_home",
    HOME = "home",
}

export default class DisplayError {
    public response: ResponseType;
    public message: string;
    public returnTarget: ReturnTarget;

    constructor(response: ResponseType, message: string, returnTarget = ReturnTarget.HOME) {
        if (!response.error) this.response = ResponseType.UNEXPECTED_ERROR;
        else this.response = response;
        this.message = message;
        this.returnTarget = returnTarget;
    }
}
