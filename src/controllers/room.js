const Room = require('./../classes/room');
const RoomMember = require('./../classes/room-member');
const logger = require('./../common/logger');
const rooms = [];
const members = [];

/**
 * Created new room with 0 clients/member for collaboration a
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const createRoom = (req, res, next) => {
    try {
        logger.info("Request to create Room : ", req.body);
        const roomName = req.body.name;
        const desc = req.body.description;
        const createdBy = req.body.creatorName;
        const clientIp = req.ip;
        // Checks
        // TODO : use validator
        if(!roomName) {
            return res.status(404).json({
                error: "Room name must be compulsary"
            });
        }
        if (rooms[roomName]) {
            return res.status(422).json({
                error: "room already exists"
            });
        }
        const room = new Room(roomName, clientIp, desc, createdBy);
        rooms[room.id] = room;
        logger.info(`Room has creadted with name = ${room.name} and id = ${room.id}`);
        res.json(rooms[room.id]);
    } catch(error) {
        logger.error(error);
        res.status(500).json({
            "error" : error.message
        })
    } 
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const getRoom = (req, res, next) => {

    try {
        logger.info("Request to get Room : ", req.params.id);
        const roomId = req.params.id;
        
        if (!rooms[roomId]) {
            return res.status(404).json({
                error: "room doesn't exists"
            });
        }

        const copy = rooms[roomId].sanitize()
        return res.json(rooms[roomId].sanitize());
    } catch (error) {
        logger.error(error);
        res.status(500).json({
            "error" : error.message
        })
    }
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const joinRoom = (req, res, next) => {
    try {
        const roomId = req.params.roomId;
        const memberName = req.params.memberName;
        const memberIp = req.ip;
    
        logger.info(`Join request: Room Id = ${roomId} and Member Name = ${memberName}`);
        // TODO : use validator
        if(!rooms[roomId]) {
            res.status(401).json({
                error: ["No room found"]
            });
            return;
        }
        const member = new RoomMember(memberName, memberIp, roomId, res);
        rooms[roomId].members.push(member);
        
        logger.info(`Member = ${memberName} joined room : ${roomId}`);
        const headers = {
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        };
        res.writeHead(200, headers);
        req.on('close', () => {
            logger.info(`Client Name = ${member.name} and client Id = ${member.id} Connection closed!`);
            rooms[roomId].members = rooms[roomId].members.filter(m => m.id !== member.id);
            sendCloseEvent(rooms[roomId], member);
        });
        setTimeout(function () {
            sendJoinClientEvent(rooms[roomId], member);
        }, 0) 
    } catch(err) {
        logger.error(error);
        res.status(500).json({
            "error" : error.message
        })
    }
} 

const postData = (req, res, next) => {
    try {
        const roomId = req.params.roomId;
        if(!rooms[roomId]) {
            res.status(404).json({
                error: "No room found"
            });
            return;
        }
        rooms[roomId].content = req.body.data;
        res.status(200).json({"body" : "posted successfully"});
        broadcaseDataToAllClients(rooms[roomId], req.body.data);

    } catch(error) {
        logger.error(error);
        res.status(500).json({
            "error" : error.message
        })
    }
}


/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const removeMember = (req, res, next) => {

    try {
        const roomId = req.params.roomId;
        const memberId = req.params.memberId;
    
        if(!rooms[roomId]) {
            res.status(404).json({
                error: "No room found"
            });
            return;
        }
        const room = rooms[roomId];
        const member = room.members.find(member => member.id == memberId)
        if(!member) {
            res.status(404).json({
                error : "No Member Found" 
            })
            return;
        }
        // End session
        member.response.end()
        room.members = room.members.filter(member => member.id !== memberId);
        rooms[roomId] = room;
        logger.info(`The member with name = ${member.name} has been remove from room whose id = ${roomId}`)
    
        res.sendStatus(200);
    
    } catch(error) {
        logger.error(error);
        res.status(500).json({
            "error" : error.message
        })
    }
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const removeRoom = (req, res, next) => {
    try {
        const roomId = req.params.roomId;
        const room = rooms[roomId];
        if(!room) {
            res.status(404).json({
                error: "No room found"
            });
            return;
        }
        room.members.forEach(member => {
            member.response.end()
        })

        delete rooms[roomId];
        res.sendStatus(200);
        logger.info(`The Room = #${roomId} successfully deleted`)
    } catch(error) {
        logger.error(error);
        res.status(500).json({
            "error" : error.message
        })
    }
}


// TODO : MOVE TO  SEPARATE FILE
const sendJoinClientEvent = (room, member) => {
    const eventData = {
        memberName : member.name,
        room : room.sanitize()
    }
    room.members.forEach(m => {
        m.response?.write("event: CLIENT_JOIN\n");
        m.response?.write(`data: ${JSON.stringify(eventData)}\n\n`)
    })
    logger.info(`Sent JOIN EVENT for all members of room : #${room.id}`)
}

const sendCloseEvent = (room, member) => {
    const eventData = {
        memberName : member.name,
        room : room.sanitize()
    }
    room.members.forEach(m => {
        m.response?.write("event: CLIENT_EXIT\n");
        m.response?.write(`data: ${JSON.stringify(eventData)}\n\n`)
    })
    logger.info(`Sent CLOSE Event for all members of room : #${room.id}`)
}


const broadcaseDataToAllClients = (room, data) => {
    room.members.forEach(c => {
        c.response?.write("event: DATA\n");
        c.response?.write(`data: ${JSON.stringify(data)}\n\n`)
    })
    logger.info(`Sent DATA Event for all members of room : #{room.id}`);
}
module.exports = {
    createNewRoom : createRoom,
    joinRoom,
    getRoom,
    postData,
    removeMember,
    removeRoom
}