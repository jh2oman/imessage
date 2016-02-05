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
      if (Session.get("searchFilter")) return Messages.find({ message: { $regex: new RegExp(Session.get("searchFilter"), "i") } }, { sort: { createdAt: -1 } });else return Messages.find({}, { sort: { createdAt: -1 } });
    },                                                                 //
    usersList: function () {                                           // 19
      if (Session.get("userFilter")) return Meteor.users.find({ username: { $regex: new RegExp(Session.get("userFilter"), "i") } }, { sort: { username: -1 } });else return Meteor.users.find({}, { sort: { createdAt: -1 } });
    },                                                                 //
    formatTime: function (time) {                                      // 25
      var hours = time.getHours().toString();                          // 26
      var minutes = time.getMinutes().toString();                      // 27
                                                                       //
      if (hours.length < 2) hours = "0" + hours;                       // 29
      if (minutes.length < 2) minutes = "0" + minutes;                 // 31
      return hours + ":" + minutes;                                    // 33
    }                                                                  //
  });                                                                  //
                                                                       //
  Template.body.events({                                               // 37
    "submit .new-message": function (event) {                          // 38
      event.preventDefault();                                          // 39
      var message = event.target.text.value;                           // 40
      var userName = $('#userSearch').val();                           // 41
      console.log(userName);                                           // 42
      Meteor.call("addMessage", message, userName);                    // 43
      event.target.text.value = "";                                    // 44
    },                                                                 //
    "click .delete": function (event) {                                // 46
      Meteor.call("deleteMessage", this._id);                          // 47
    },                                                                 //
    "click .read": function (event) {                                  // 49
      Meteor.call("readMessage", this._id);                            // 50
    },                                                                 //
    "keyup .search": function (event) {                                // 52
      Session.set("searchFilter", $('.search').val());                 // 53
    },                                                                 //
    "keyup #userSearch": function (event) {                            // 55
      Session.set("userFilter", $('#userSearch').val());               // 56
    }                                                                  //
  });                                                                  //
}                                                                      //
                                                                       //
Meteor.methods({                                                       // 61
  addMessage: function (message, userName) {                           // 62
    if (!Meteor.userId()) throw new Meteor.Error("not-authorized");    // 63
    var reciever = Meteor.users.findOne({ username: userName });       // 65
    console.log(reciever);                                             // 66
    if (!reciever) throw new Meteor.Error("recipient-not-found.");     // 67
    Messages.insert({                                                  // 69
      message: message,                                                // 70
      createdAt: new Date(),                                           // 71
      owner: Meteor.userId(),                                          // 72
      ownerName: Meteor.user().username,                               // 73
      contactName: userName                                            // 74
    });                                                                //
    Messages.insert({                                                  // 76
      message: message,                                                // 77
      createdAt: new Date(),                                           // 78
      owner: reciever._id,                                             // 79
      ownerName: userName,                                             // 80
      contactName: Meteor.user().username                              // 81
    });                                                                //
  },                                                                   //
  deleteMessage: function (id) {                                       // 84
    var message = Messages.findOne(id);                                // 85
    if (message.owner !== Meteor.userId()) throw new Meteor.Error("not authorized");
    Messages.remove(id);                                               // 88
  },                                                                   //
  readMessage: function (id) {                                         // 90
    var message = Messages.findOne(id);                                // 91
    if (message.owner !== Meteor.userId()) throw new Meteor.Error("not authorized");
    Messages.update(id, {                                              // 94
      $set: { isRead: true }                                           // 95
    });                                                                //
  }                                                                    //
});                                                                    //
                                                                       //
if (Meteor.isServer) {                                                 // 100
  Meteor.publish("messages", function () {                             // 101
    return Messages.find({                                             // 102
      $or: [{ owner: this.userId }]                                    // 103
    });                                                                //
  });                                                                  //
                                                                       //
  Meteor.publish("usersList", function () {                            // 109
    return Meteor.users.find({}, { fields: { username: 1 } });         // 110
  });                                                                  //
}                                                                      //
/////////////////////////////////////////////////////////////////////////

}).call(this);
