export default interface Handler {
    run(uid: string): Promise<void>;
}
