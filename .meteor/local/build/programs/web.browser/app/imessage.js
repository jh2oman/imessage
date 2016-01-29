(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// imessage.js                                                         //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
                                                                       //
Conversations = new Mongo.Collection("conversations");                 // 2
                                                                       //
if (Meteor.isClient) {                                                 // 4
  //This code runs on the Client                                       //
  Session.setDefault('counter', 0);                                    // 6
                                                                       //
  Template.hello.helpers({                                             // 8
    conversations: function () {                                       // 9
      return Conversations.find({}, { sort: { createdAt: -1 } });      // 10
    }                                                                  //
  });                                                                  //
                                                                       //
  Template.hello.events({                                              // 14
    "submit .new-conversation": function (event) {                     // 15
      event.preventDefault();                                          // 16
      var message = event.target.text.value;                           // 17
      console.log(message);                                            // 18
      Conversations.insert({                                           // 19
        message: message,                                              // 20
        createdAt: new Date()                                          // 21
      });                                                              //
      event.target.text.value = "";                                    // 23
    }                                                                  //
  });                                                                  //
}                                                                      //
                                                                       //
if (Meteor.isServer) {                                                 // 28
  Meteor.startup(function () {                                         // 29
    // code to run on server at startup                                //
  });                                                                  //
}                                                                      //
/////////////////////////////////////////////////////////////////////////

}).call(this);
