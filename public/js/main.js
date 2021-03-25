const chatForm = document.getElementById("chat-form");
const clearChatBtn = document.getElementById("clear-chat-btn");
const chatMessageInput = document.getElementById("msg");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userListNode = document.getElementById("users");

let privateUser = null;
let userList = null;

// Get username and room from url
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Join chatroom
socket.emit("joinRoom", { username, room });

// Get Room and Users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
  userList = users;
});

// Message from server
socket.on("message", (message) => {
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get message text
  const msg = e.target.elements.msg.value;

  // Emiting a message to server
  if (privateUser !== null) {
    socket.emit("privateChatMessage", {
      receiverId: privateUser,
      msg,
      type: "private",
      sender: socket.id,
    });
  } else {
    socket.emit("chatMessage", { receiverId: "", msg, type: "public" });
  }

  // Clear Input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement("div");
  const messageStyleClass =
    message.type === "public" ? "public-message" : "private-message";
  const userNamePrivateStyling =
    message.type === "private" ? "chat-message-user-name" : "";
  div.classList.add(messageStyleClass);
  div.innerHTML = `
                    <p class="meta">${personalMessagingSign(message)}
												<span class="${userNamePrivateStyling}">${showUserNameInMessage(message)}</span>
                        <span>${message.time}</span>
                    </p>
                    <p class="text">${message.text}</p>
    `;
  document.querySelector(".chat-messages").appendChild(div);
}

function personalMessagingSign(messageObj) {
  const alternativeMessageSigning = messageObj.type === "private" ? "Personaly From: " : " ";
  const privateMessageSigning = `From ${messageObj.username} to: ${messageObj.receiverName}`;
  return messageObj.sender ? privateMessageSigning : alternativeMessageSigning
}

function showUserNameInMessage(messageObj) {
  return messageObj.sender ? "" : `${messageObj.username}`;
}

// Add roomname to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userListNode.innerHTML = `
        ${users
          .filter((user) => {
            return user.username !== username; // To hide self from user list
          })
          .map((user) => `<li class="user-list-item">${user.username}</li>`)
          .join("")}`;
  setClickHandler();
}

// Seting handler for user list private mode
function setClickHandler() {
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("user-list-item")) {
      if (!e.target.classList.contains("private-mode")) {
        e.stopPropagation();
        const pickedName = e.target.innerHTML;
        privateUser = userList.filter((user) => pickedName === user.username)[0]
          .id;
        removePrivateMode();
        e.target.classList.add("private-mode");
        chatMessageInput.focus();
      } else {
        e.stopPropagation();
        removePrivateMode();
        privateUser = null;
        chatMessageInput.value = "";
        chatMessageInput.focus();
      }
    }
    return;
  });
}

// Remove private private mode
function removePrivateMode() {
  document.querySelectorAll(".user-list-item").forEach((listItem) => {
    listItem.classList.remove("private-mode");
  });
}

// Clear Chat Window 
clearChatBtn.addEventListener('click', e => {
  e.preventDefault();
  let clearingConfirm = confirm('Вы действительно хотите очистить окно чата??');
  if(clearingConfirm) chatMessages.innerHTML = ''
})