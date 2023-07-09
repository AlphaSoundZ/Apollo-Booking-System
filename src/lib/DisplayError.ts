import { ResponseType } from "./API";

export enum ReturnTarget {
    USER_HOME = "user_home",
    HOME = "home",
}

export default class DisplayError {
    public status: ResponseType;
    public message: string;
    public returnTarget: ReturnTarget;

    constructor(status: ResponseType, message: string, returnTarget = ReturnTarget.HOME) {
        if (!status.error) this.status = ResponseType.UNEXPECTED_ERROR;
        else this.status = status;
        this.message = message;
        this.returnTarget = returnTarget;
    }
}
