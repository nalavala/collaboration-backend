const {getId} = require("../utils/idUtils");

class RoomMember {
    constructor(name, ip, roomId, response) {
        this.id = getId();
        this.name = name;
        this.ip = ip;
        this.joinAt = new Date();
        this.joinedRoomId = roomId
        this.response = response;
    }


    sanitize = () => {
        let copy = {...this};
        delete copy.response;
        return copy;
    }

}

module.exports = RoomMember
