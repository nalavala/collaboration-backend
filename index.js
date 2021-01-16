// Require needed modules and initialize Express app
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const room_router = require('./src/routes/room');
const logger = require("./src/common/logger")

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/room', room_router);
const PORT = 3001;
app.listen(PORT, () => {
    logger.info(`App started at port ${PORT}`)
})
