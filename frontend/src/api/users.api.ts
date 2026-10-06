import { ApiPost } from "./axios";

class SendNotABot extends ApiPost<null> {
    constructor() {
        super("/users/not-a-bot");
    }
}

class SendFromQrCode extends ApiPost<null> {
    constructor() {
        super("/users/from-qrcode");
    }
}

export { SendNotABot, SendFromQrCode };
