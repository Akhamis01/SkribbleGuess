const fs = require('fs');
const users = [];
const unavailableRooms = [];
const firstGuessRoomsList = [];
const all_words = JSON.parse(fs.readFileSync('./words.json'));


// Adding a user to the list
const addUser = (param) => {
    let {id, name, room} = param;
    let user;

    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();

    const existingUser = users.find( (user) => user.room === room && user.name === name);
    const isRoomUnavailable = unavailableRooms.find( (temp_room) => temp_room === room);

    if(existingUser){
        return {error: 'Username is taken'};
    }

    if(isRoomUnavailable){
        return {error: 'Room is already is progress, please join another room.'};
    }


    const roomExists = users.find( (user) => user.room === room);
    if(!roomExists){
        user = {id, name, room, host:true, isDrawing:true, points:0, hasGuessed:false};
        users.push(user);
    } else{
        user = {id, name, room, host:false, isDrawing:false, points:0, hasGuessed:false};
        users.push(user);
    }

    return { user };
}


// Removing user from the list
const removeUser = (id) => {

    const index = users.findIndex( (user) => user.id === id);

    if(index !== -1){
        return users.splice(index,1)[0];
    }

}


// Returns user based on ID
const getUser = (id, listOfUsers = users) => {
    return listOfUsers.find( (user) => user.id === id);
}

// Returns list of users based on room number
const getUsersInRoom = (room, listOfUsers = users) => {
    return listOfUsers.filter( (user) => user.room === room);
}

// Returns the player currently drawing based on room number
const getCurrentDrawer = (room, listOfUsers = users) => {
    return listOfUsers.find( (user) => user.room === room && user.isDrawing === true);
}

// Temporary list update so game keeps track of who is drawing, so each person gets a turn
const updateUsersList = (newIndex, room, currentList) => {
    const newUserList = getUsersInRoom(room, currentList);

    if(newUserList[newIndex] !== undefined){
        newUserList[newIndex].isDrawing = false;
    }
    newIndex += 1;

    if(newUserList[newIndex] === undefined){
        newIndex = 0;
        newUserList[newIndex].isDrawing = true;
    } else{
        newUserList[newIndex].isDrawing = true;
    }

    // Reinitializes the hasGuessed
    newUserList.forEach( (user) => {
        user.hasGuessed = false;
    });

    return {newUserList, newIndex};
}


// Adds a room that has already started to a list
const updateAvailableRooms = (room) => {
    unavailableRooms.push(room);
}

// Removes room from unavailable rooms list when all users have left
const removeUnavailableRooms = (room) => {
    const index = unavailableRooms.findIndex( (temp_room) => temp_room === room);

    if(index !== -1){
        return unavailableRooms.splice(index,1)[0];
    }
}

// Adds room with first guess
const AddFirstGuessRoom = (room) => {
    const index = firstGuessRoomsList.findIndex( (temp_room) => temp_room === room);

    if(index === -1){
        firstGuessRoomsList.push(room);
        return true;
    }

    return false;
}


// Removes room with first guess
const removeFirstGuessRoom = (room) => {
    const index = firstGuessRoomsList.findIndex( (temp_room) => temp_room === room);

    if(index !== -1){
        return firstGuessRoomsList.splice(index,1)[0];
    }
}


// Updates points of user
const updateUserPoints = (id, room, currentList) => {
    const newUserList = getUsersInRoom(room, currentList);
    const index = newUserList.findIndex( (temp_user) => temp_user.id === id);

    if(index !== -1){
        newUserList[index].points += 5;
        newUserList[index].hasGuessed = true;
    }

    return newUserList;
}



// Returns points of user
const getUserPoints = (id, room, currentList) => {
    const newUserList = getUsersInRoom(room, currentList);
    const user = newUserList.find( (temp_user) => temp_user.id === id);

    return user.points;
}



// Reinitializes guesses for all users in room
const checkAllGuesses = (room, currentList) => {
    const UserList = getUsersInRoom(room, currentList);
    let count = 0;

    UserList.forEach( (user) => {
        if(user.hasGuessed === true){
            count++;
        }
    });

    if(count === UserList.length-1){
        return true;
    }

    return false;
}



// Returns random word to draw
const getRandomWord = () => {
    const wordToGuess = all_words[Math.floor(Math.random() * all_words.length)];
    return wordToGuess.toString();
}


module.exports = {
    addUser, 
    removeUser, 
    getUser, 
    getUsersInRoom, 
    updateUsersList, 
    getCurrentDrawer, 
    updateAvailableRooms, 
    removeUnavailableRooms,
    AddFirstGuessRoom,
    removeFirstGuessRoom,
    getRandomWord,
    updateUserPoints,
    checkAllGuesses,
    getUserPoints
};