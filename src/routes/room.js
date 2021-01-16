const express = require('express');
const {
    createNewRoom,
    joinRoom,getRoom,
    postData,
    removeMember,
    removeRoom} 
=  require('./../controllers/room');


const router = express.Router();


// Create Room route
router.post('/', createNewRoom);

// Join Room route
router.get('/join/:roomId/:memberName', joinRoom);

// Get Room Route
router.get('/:id', getRoom);

// Sent data to room Member Route
router.post("/:roomId/post", postData);

// Remove Member Route
router.delete('/:roomId/:memberId', removeMember);

// delete room and its member route
router.delete('/:roomId', removeRoom)

module.exports = router;
