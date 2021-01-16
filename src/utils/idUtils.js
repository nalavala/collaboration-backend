const { nanoid } = require('nanoid')

const getId = () => {
    return nanoid(10);
}

module.exports = {
    getId
}