(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// imessage.js                                                         //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
                                                                       //
Messages = new Mongo.Collection("messages");                           // 2
                                                                       //
//This code runs on the client                                         //
if (Meteor.isClient) {                                                 // 5
  //This code runs on the Client                                       //
  Meteor.subscribe("messages");                                        // 7
  Meteor.subscribe("usersList");                                       // 8
  Accounts.ui.config({                                                 // 9
    passwordSignupFields: "USERNAME_ONLY"                              // 10
  });                                                                  //
                                                                       //
  //Helper functions can be accessed via {{ }} in html                 //
  Template.body.helpers({                                              // 14
    //Get latest message from each contact                             //
    messages: function () {                                            // 16
      var messages = [];                                               // 17
      var users = Meteor.users.find({}, { sort: { createdAt: -1 } });  // 18
      users.forEach(function (user) {                                  // 19
        var single = Messages.findOne({ contactName: user.username }, { sort: { createdAt: -1 } });
        if (single) messages.push(single);                             // 21
      });                                                              //
      messages.sort(function (a, b) {                                  // 24
        return b.createdAt - a.createdAt;                              // 24
      });                                                              //
      return messages;                                                 // 25
      //console.log(messages);                                         //
    },                                                                 //
    //Get all texts associated with the specified contact              //
    texts: function (contact) {                                        // 29
      return Messages.find({ contactName: contact }, { sort: { createdAt: 1 } });
    },                                                                 //
    //Get list of users that are available to text and satisfy the search query
    usersList: function () {                                           // 33
      var users = [];                                                  // 34
      if (Session.get("userFilter")) users = Meteor.users.find({ username: { $regex: new RegExp(Session.get("userFilter"), "i") } }, { sort: { username: -1 } });else users = Meteor.users.find({}, { sort: { createdAt: -1 } });
      users.forEach(function (user) {                                  // 39
        if (user.username === Meteor.user().username) users.splice(index, 1);
      });                                                              //
      return users;                                                    // 43
    },                                                                 //
    //Reformats time for display                                       //
    formatTime: function (time) {                                      // 46
      var hours = time.getHours().toString();                          // 47
      var minutes = time.getMinutes().toString();                      // 48
                                                                       //
      if (hours.length < 2) hours = "0" + hours;                       // 50
      if (minutes.length < 2) minutes = "0" + minutes;                 // 52
      return hours + ":" + minutes;                                    // 54
    },                                                                 //
    //Retrieve the current state of "contact"                          //
    contact: function () {                                             // 57
      return Session.get("contact");                                   // 59
    },                                                                 //
    //Retrieve the current state of "newMessage"                       //
    newMessage: function () {                                          // 62
      return Session.get("newMessage");                                // 63
    },                                                                 //
    //Check if the current text was sent or recieved                   //
    sentOrRecieved: function () {                                      // 66
      if (this.sent) return "sent";else return "recieved";             // 67
    },                                                                 //
    //Check if the search is a match for a valid username              //
    correctUser: function () {                                         // 73
      if (Meteor.users.findOne({ username: Session.get("userFilter") })) return true;
      return false;                                                    // 76
    }                                                                  //
                                                                       //
  });                                                                  //
                                                                       //
  //Event Handlers                                                     //
  Template.body.events({                                               // 82
    //Submit new message to a user                                     //
    "submit .new-message": function (event) {                          // 84
      event.preventDefault();                                          // 85
      var message = event.target.text.value;                           // 86
      var userName = $('#userSearch').val();                           // 87
      console.log(userName);                                           // 88
      Meteor.call("addMessage", message, userName);                    // 89
      event.target.text.value = "";                                    // 90
      Session.set("newMessage", false);                                // 91
      Session.set("contact", userName);                                // 92
    },                                                                 //
    //Submit new text to a user                                        //
    "submit .new-text": function (event) {                             // 96
      event.preventDefault();                                          // 97
      var message = event.target.text.value;                           // 98
      var userName = Session.get("contact");                           // 99
      console.log(userName);                                           // 100
      Meteor.call("addMessage", message, userName);                    // 101
      event.target.text.value = "";                                    // 102
    },                                                                 //
    //Delete Message                                                   //
    "click .delete": function (event) {                                // 106
      Meteor.call("deleteMessage", this._id);                          // 107
    },                                                                 //
    //Read Message                                                     //
    "click .read": function (event) {                                  // 110
      Meteor.call("readMessage", this._id);                            // 111
    },                                                                 //
    //Update search Filter                                             //
    "keyup .search": function (event) {                                // 114
      Session.set("searchFilter", $('.search').val());                 // 115
    },                                                                 //
    //Update userSearch filter                                         //
    "keyup #userSearch": function (event) {                            // 118
      Session.set("userFilter", $('#userSearch').val());               // 119
    },                                                                 //
    //View different conversations                                     //
    "click .message-box": function (event) {                           // 122
      Session.set("newMessage", false);                                // 123
      Session.set("contact", this.contactName);                        // 124
      console.log(this.contactName);                                   // 125
      $(this).addClass("selected");                                    // 126
    },                                                                 //
    //Start new Message                                                //
    "click #new": function (event) {                                   // 129
      Session.set("newMessage", true);                                 // 130
    }                                                                  //
  });                                                                  //
}                                                                      //
                                                                       //
//Methods that make calls to the server                                //
Meteor.methods({                                                       // 136
  //Add new Message                                                    //
  addMessage: function (message, userName) {                           // 138
    if (!Meteor.userId()) throw new Meteor.Error("not-authorized");    // 139
    var reciever = Meteor.users.findOne({ username: userName });       // 141
    console.log(reciever);                                             // 142
    if (!reciever) throw new Meteor.Error("recipient-not-found.");     // 143
                                                                       //
    Messages.insert({                                                  // 146
      message: message,                                                // 147
      createdAt: new Date(),                                           // 148
      owner: Meteor.userId(),                                          // 149
      ownerName: Meteor.user().username,                               // 150
      contactName: userName,                                           // 151
      sent: true                                                       // 152
    });                                                                //
    if (username !== Meteor.user().username) {                         // 154
      Messages.insert({                                                // 156
        message: message,                                              // 157
        createdAt: new Date(),                                         // 158
        owner: reciever._id,                                           // 159
        ownerName: userName,                                           // 160
        contactName: Meteor.user().username,                           // 161
        sent: false                                                    // 162
      });                                                              //
    }                                                                  //
  },                                                                   //
  //Delete Message                                                     //
  deleteMessage: function (id) {                                       // 168
    var message = Messages.findOne(id);                                // 169
    if (message.owner !== Meteor.userId()) throw new Meteor.Error("not authorized");
    Messages.remove(id);                                               // 172
  },                                                                   //
  //Read Message                                                       //
  readMessage: function (id) {                                         // 175
    var message = Messages.findOne(id);                                // 176
    if (message.owner !== Meteor.userId()) throw new Meteor.Error("not authorized");
    Messages.update(id, {                                              // 179
      $set: { isRead: true }                                           // 180
    });                                                                //
  }                                                                    //
});                                                                    //
                                                                       //
//This code runs on the Server                                         //
if (Meteor.isServer) {                                                 // 186
  //Only send messages where the current user is the owner             //
  Meteor.publish("messages", function () {                             // 188
    return Messages.find({                                             // 189
      $or: [{ owner: this.userId }]                                    // 190
    });                                                                //
  });                                                                  //
  //Only send users with a valid username                              //
  Meteor.publish("usersList", function () {                            // 196
    return Meteor.users.find({}, { fields: { username: 1 } });         // 197
  });                                                                  //
}                                                                      //
/////////////////////////////////////////////////////////////////////////

}).call(this);
