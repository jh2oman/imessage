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
if (Meteor.isClient) {                                                 // 4
  //This code runs on the Client                                       //
  Meteor.subscribe("messages");                                        // 6
  Meteor.subscribe("usersList");                                       // 7
  Accounts.ui.config({                                                 // 8
    passwordSignupFields: "USERNAME_ONLY"                              // 9
  });                                                                  //
                                                                       //
  Template.body.helpers({                                              // 12
    messages: function () {                                            // 13
      var messages = [];                                               // 14
      var users = Meteor.users.find({}, { sort: { createdAt: -1 } });  // 15
      users.forEach(function (user) {                                  // 16
        //if(Session.get("searchFilter"))                              //
        //messages.push(Messages.findOne({message:{$regex: new RegExp(Session.get("searchFilter"),"i")}, contactName: :{$regex: new RegExp(user,"i")} }, {sort:{createdAt:-1}}));
        //else                                                         //
        var single = Messages.findOne({ contactName: user.username }, { sort: { createdAt: -1 } });
        if (single) messages.push(single);                             // 21
      });                                                              //
      return messages;                                                 // 24
      //console.log(messages);                                         //
    },                                                                 //
    texts: function (contact) {                                        // 27
      return Messages.find({ contactName: contact }, { sort: { createdAt: 1 } });
    },                                                                 //
    usersList: function () {                                           // 30
      if (Session.get("userFilter")) return Meteor.users.find({ username: { $regex: new RegExp(Session.get("userFilter"), "i") } }, { sort: { username: -1 } });else return Meteor.users.find({}, { sort: { createdAt: -1 } });
    },                                                                 //
    formatTime: function (time) {                                      // 36
      var hours = time.getHours().toString();                          // 37
      var minutes = time.getMinutes().toString();                      // 38
                                                                       //
      if (hours.length < 2) hours = "0" + hours;                       // 40
      if (minutes.length < 2) minutes = "0" + minutes;                 // 42
      return hours + ":" + minutes;                                    // 44
    },                                                                 //
    contact: function () {                                             // 46
      return Session.get("contact");                                   // 48
    },                                                                 //
    newMessage: function () {                                          // 50
      return Session.get("newMessage");                                // 51
    },                                                                 //
    sentOrRecieved: function () {                                      // 53
      if (this.sent) return "sent";else return "recieved";             // 54
    },                                                                 //
    correctUser: function () {                                         // 59
      if (Meteor.users.findOne({ username: Session.get("userFilter") })) return true;
      return false;                                                    // 62
    }                                                                  //
                                                                       //
  });                                                                  //
                                                                       //
  Template.body.events({                                               // 67
    "submit .new-message": function (event) {                          // 68
      event.preventDefault();                                          // 69
      var message = event.target.text.value;                           // 70
      var userName = $('#userSearch').val();                           // 71
      console.log(userName);                                           // 72
      Meteor.call("addMessage", message, userName);                    // 73
      event.target.text.value = "";                                    // 74
      Session.set("newMessage", false);                                // 75
      Session.set("contact", userName);                                // 76
    },                                                                 //
    "submit .new-text": function (event) {                             // 79
      event.preventDefault();                                          // 80
      var message = event.target.text.value;                           // 81
      var userName = Session.get("contact");                           // 82
      console.log(userName);                                           // 83
      Meteor.call("addMessage", message, userName);                    // 84
      event.target.text.value = "";                                    // 85
    },                                                                 //
    "click .delete": function (event) {                                // 88
      Meteor.call("deleteMessage", this._id);                          // 89
    },                                                                 //
    "click .read": function (event) {                                  // 91
      Meteor.call("readMessage", this._id);                            // 92
    },                                                                 //
    "keyup .search": function (event) {                                // 94
      Session.set("searchFilter", $('.search').val());                 // 95
    },                                                                 //
    "keyup #userSearch": function (event) {                            // 97
      Session.set("userFilter", $('#userSearch').val());               // 98
    },                                                                 //
    "click .message-box": function (event) {                           // 100
      Session.set("newMessage", false);                                // 101
      Session.set("contact", this.contactName);                        // 102
      console.log(this.contactName);                                   // 103
      $(this).addClass("selected");                                    // 104
    },                                                                 //
    "click #new": function (event) {                                   // 106
      Session.set("newMessage", true);                                 // 107
    }                                                                  //
  });                                                                  //
}                                                                      //
                                                                       //
Meteor.methods({                                                       // 112
  addMessage: function (message, userName) {                           // 113
    if (!Meteor.userId()) throw new Meteor.Error("not-authorized");    // 114
    var reciever = Meteor.users.findOne({ username: userName });       // 116
    console.log(reciever);                                             // 117
    if (!reciever) throw new Meteor.Error("recipient-not-found.");     // 118
                                                                       //
    Messages.insert({                                                  // 121
      message: message,                                                // 122
      createdAt: new Date(),                                           // 123
      owner: Meteor.userId(),                                          // 124
      ownerName: Meteor.user().username,                               // 125
      contactName: userName,                                           // 126
      sent: true                                                       // 127
    });                                                                //
    if (username !== Meteor.user().username) {                         // 129
      Messages.insert({                                                // 131
        message: message,                                              // 132
        createdAt: new Date(),                                         // 133
        owner: reciever._id,                                           // 134
        ownerName: userName,                                           // 135
        contactName: Meteor.user().username,                           // 136
        sent: false                                                    // 137
      });                                                              //
    }                                                                  //
  },                                                                   //
  deleteMessage: function (id) {                                       // 142
    var message = Messages.findOne(id);                                // 143
    if (message.owner !== Meteor.userId()) throw new Meteor.Error("not authorized");
    Messages.remove(id);                                               // 146
  },                                                                   //
  readMessage: function (id) {                                         // 148
    var message = Messages.findOne(id);                                // 149
    if (message.owner !== Meteor.userId()) throw new Meteor.Error("not authorized");
    Messages.update(id, {                                              // 152
      $set: { isRead: true }                                           // 153
    });                                                                //
  }                                                                    //
});                                                                    //
                                                                       //
if (Meteor.isServer) {                                                 // 158
  Meteor.publish("messages", function () {                             // 159
    return Messages.find({                                             // 160
      $or: [{ owner: this.userId }]                                    // 161
    });                                                                //
  });                                                                  //
                                                                       //
  Meteor.publish("usersList", function () {                            // 167
    return Meteor.users.find({}, { fields: { username: 1 } });         // 168
  });                                                                  //
}                                                                      //
/////////////////////////////////////////////////////////////////////////

}).call(this);

//# sourceMappingURL=imessage.js.map
