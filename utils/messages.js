const moment = require('moment')

function formatMessage(username, text, type, sender, receiverName) {
    return {
        username,
        text,
        type,
        sender,
        receiverName,
        time: moment().format('h:mm a'),
    }
}

module.exports = formatMessage;