
Conversations = new Mongo.Collection("conversations");

if (Meteor.isClient) {
  //This code runs on the Client
  Session.setDefault('counter', 0);

  Template.hello.helpers({
    conversations: function(){
      return Conversations.find({}, {sort:{createdAt:-1}});
    }
  });

  Template.hello.events({
    "submit .new-conversation": function(event){
      event.preventDefault();
        var message = event.target.text.value;
        console.log(message);
        Conversations.insert({
          message:message,
          createdAt: new Date()
        });
        event.target.text.value = "";
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
