const {getId} = require("./../utils/idUtils");

class Room {
    constructor(name, ip, description, createdBy, content) {
        this.id = getId();
        this.name = name;
        this.ip = ip;
        this.description = description;
        this.createdBy = createdBy;
        this.createdAt = new Date();
        this.updtaedAt = new Date();
        this.active = true;
        this.content = content
        this.members = []
    }

    sanitize = () => {
        let copy = {...this};
        copy.members = this.members.map(member => member.sanitize());
        return copy;
    }

}

module.exports = Room
