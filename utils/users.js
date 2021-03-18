const users = [];

// Join user to chat

function userJoin(id, username, room) {
    const user = {id, username, room};
    users.push(user);
    return user;
}

// Get current user
function getCurrentUser(id) {
    return users.find(user => user.id === id)
}

// User Leave chat

function userLeave(id) {
    const userIndex = users.findIndex(user => user.id === id)

    if (userIndex !== -1) {
        return users.splice(userIndex, 1)[0]
    }
}

function getRoomUsers(room) {
    return users.filter(user => user.room === room)
}

module.exports = {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
}