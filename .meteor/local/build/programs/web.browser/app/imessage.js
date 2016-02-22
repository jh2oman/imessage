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
      // users.forEach(function(user){                                 //
      //   if(user.username ===Meteor.user().username)                 //
      //     users.splice(index,1);                                    //
      // })                                                            //
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
      if (!userName) throw new Meteor.Error("no user specified");      // 88
      console.log(userName);                                           // 90
      Meteor.call("addMessage", message, userName);                    // 91
      event.target.text.value = "";                                    // 92
      Session.set("newMessage", false);                                // 93
      Session.set("contact", userName);                                // 94
    },                                                                 //
    //Submit new text to a user                                        //
    "submit .new-text": function (event) {                             // 98
      event.preventDefault();                                          // 99
      var message = event.target.text.value;                           // 100
      var userName = Session.get("contact");                           // 101
      console.log(userName);                                           // 102
      Meteor.call("addMessage", message, userName);                    // 103
      event.target.text.value = "";                                    // 104
    },                                                                 //
    //Delete Message                                                   //
    "click .delete": function (event) {                                // 108
      Meteor.call("deleteMessage", this._id);                          // 109
    },                                                                 //
    //Read Message                                                     //
    "click .read": function (event) {                                  // 112
      Meteor.call("readMessage", this._id);                            // 113
    },                                                                 //
    //Update search Filter                                             //
    "keyup .search": function (event) {                                // 116
      Session.set("searchFilter", $('.search').val());                 // 117
    },                                                                 //
    //Update userSearch filter                                         //
    "keyup #userSearch": function (event) {                            // 120
      Session.set("userFilter", $('#userSearch').val());               // 121
    },                                                                 //
    //View different conversations                                     //
    "click .message-box": function (event) {                           // 124
      Session.set("newMessage", false);                                // 125
      Session.set("contact", this.contactName);                        // 126
      console.log(this.contactName);                                   // 127
      $(this).addClass("selected");                                    // 128
    },                                                                 //
    //Start new Message                                                //
    "click #new": function (event) {                                   // 131
      Session.set("newMessage", true);                                 // 132
    }                                                                  //
  });                                                                  //
}                                                                      //
                                                                       //
//Methods that make calls to the server                                //
Meteor.methods({                                                       // 138
  //Add new Message                                                    //
  addMessage: function (message, userName) {                           // 140
    if (!Meteor.userId()) throw new Meteor.Error("not-authorized");    // 141
    var reciever = Meteor.users.findOne({ username: userName });       // 143
    console.log(reciever);                                             // 144
    if (!reciever) throw new Meteor.Error("recipient-not-found.");     // 145
                                                                       //
    Messages.insert({                                                  // 148
      message: message,                                                // 149
      createdAt: new Date(),                                           // 150
      owner: Meteor.userId(),                                          // 151
      ownerName: Meteor.user().username,                               // 152
      contactName: userName,                                           // 153
      sent: true                                                       // 154
    });                                                                //
    if (userName !== Meteor.user().username) {                         // 156
      Messages.insert({                                                // 158
        message: message,                                              // 159
        createdAt: new Date(),                                         // 160
        owner: reciever._id,                                           // 161
        ownerName: userName,                                           // 162
        contactName: Meteor.user().username,                           // 163
        sent: false                                                    // 164
      });                                                              //
    }                                                                  //
  },                                                                   //
  //Delete Message                                                     //
  deleteMessage: function (id) {                                       // 170
    var message = Messages.findOne(id);                                // 171
    if (message.owner !== Meteor.userId()) throw new Meteor.Error("not authorized");
    Messages.remove(id);                                               // 174
  },                                                                   //
  //Read Message                                                       //
  readMessage: function (id) {                                         // 177
    var message = Messages.findOne(id);                                // 178
    if (message.owner !== Meteor.userId()) throw new Meteor.Error("not authorized");
    Messages.update(id, {                                              // 181
      $set: { isRead: true }                                           // 182
    });                                                                //
  }                                                                    //
});                                                                    //
                                                                       //
//This code runs on the Server                                         //
if (Meteor.isServer) {                                                 // 188
  //Only send messages where the current user is the owner             //
  Meteor.publish("messages", function () {                             // 190
    return Messages.find({                                             // 191
      $or: [{ owner: this.userId }]                                    // 192
    });                                                                //
  });                                                                  //
  //Only send users with a valid username                              //
  Meteor.publish("usersList", function () {                            // 198
    return Meteor.users.find({}, { fields: { username: 1 } });         // 199
  });                                                                  //
}                                                                      //
/////////////////////////////////////////////////////////////////////////

}).call(this);
