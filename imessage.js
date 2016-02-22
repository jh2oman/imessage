
Messages = new Mongo.Collection("messages");

//This code runs on the client
if (Meteor.isClient) {
  //This code runs on the Client
  Meteor.subscribe("messages");
  Meteor.subscribe("usersList")
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

  //Helper functions can be accessed via {{ }} in html
  Template.body.helpers({
    //Get latest message from each contact
    messages: function(){
      var messages = [];
      var users = Meteor.users.find({}, {sort:{createdAt:-1}});
      users.forEach(function(user){
        var single = Messages.findOne({contactName :user.username}, {sort:{createdAt:-1}});
        if(single)
          messages.push(single);
      });
      messages.sort(function(a,b){return b.createdAt - a.createdAt});
      return messages;
      //console.log(messages);
    },
    //Get all texts associated with the specified contact
    texts:function(contact){
      return Messages.find({contactName: contact}, {sort:{createdAt:1}});
    },
    //Get list of users that are available to text and satisfy the search query
    usersList: function(){
      var users = [];
      if(Session.get("userFilter"))
        users= Meteor.users.find({username:{$regex: new RegExp(Session.get("userFilter"),"i")}}, {sort:{username:-1}});
      else
        users = Meteor.users.find({}, {sort:{createdAt:-1}});
      // users.forEach(function(user){
      //   if(user.username ===Meteor.user().username)
      //     users.splice(index,1);
      // })
      return users;
    },
    //Reformats time for display
    formatTime: function(time){
      var hours = time.getHours().toString();
      var minutes = time.getMinutes().toString();

      if(hours.length<2)
        hours = "0"+ hours;
      if(minutes.length<2)
        minutes = "0"+ minutes;
      return hours + ":" + minutes;
    },
    //Retrieve the current state of "contact"
    contact: function()
    {
      return Session.get("contact");
    },
    //Retrieve the current state of "newMessage"
    newMessage: function(){
      return Session.get("newMessage");
    },
    //Check if the current text was sent or recieved
    sentOrRecieved:function(){
      if(this.sent)
        return "sent";
      else
        return "recieved";
    },
    //Check if the search is a match for a valid username
    correctUser:function(){
      if(Meteor.users.findOne({username:  Session.get("userFilter")}))
        return true;
      return false;
    }

  });

  //Event Handlers
  Template.body.events({
    //Submit new message to a user
    "submit .new-message": function(event){
      event.preventDefault();
        var message = event.target.text.value;
        var userName = $('#userSearch').val();
        if(!userName)
          throw new Meteor.Error("no user specified");
        console.log(userName);
        Meteor.call("addMessage",message, userName);
        event.target.text.value = "";
        Session.set("newMessage", false);
        Session.set("contact", userName);

    },
    //Submit new text to a user
    "submit .new-text": function(event){
      event.preventDefault();
        var message = event.target.text.value;
        var userName = Session.get("contact");
        console.log(userName);
        Meteor.call("addMessage",message, userName);
        event.target.text.value = "";
        
    },
    //Delete Message
    "click .delete": function(event){
      Meteor.call("deleteMessage",this._id);
    },
    //Read Message
    "click .read": function(event){
      Meteor.call("readMessage",this._id);
    },
    //Update search Filter
    "keyup .search": function(event){
      Session.set("searchFilter", $('.search').val());
    },
    //Update userSearch filter
    "keyup #userSearch": function(event){
      Session.set("userFilter", $('#userSearch').val());
    },
    //View different conversations
    "click .message-box": function(event){
      Session.set("newMessage", false);
      Session.set("contact", this.contactName);
      console.log(this.contactName);
      $(this).addClass("selected");
    },
    //Start new Message
    "click #new": function(event){
      Session.set("newMessage", true);
    }
  });
}

//Methods that make calls to the server
Meteor.methods({
    //Add new Message
    addMessage: function(message, userName){
      if(!Meteor.userId())
        throw new Meteor.Error("not-authorized");
      var reciever = Meteor.users.findOne({username:  userName});
      console.log(reciever);
      if(!reciever)
        throw new Meteor.Error("recipient-not-found.");

      Messages.insert({
        message:message,
          createdAt: new Date(),
          owner: Meteor.userId(),
          ownerName: Meteor.user().username,
          contactName:userName,
          sent: true
      });
      if(userName !==Meteor.user().username)
      {
        Messages.insert({
        message:message,
          createdAt: new Date(),
          owner: reciever._id,
          ownerName: userName,
          contactName: Meteor.user().username,
          sent:false
      });
      }
      
    },
    //Delete Message
    deleteMessage: function(id){
      var message = Messages.findOne(id);
      if(message.owner !==Meteor.userId())
        throw new Meteor.Error("not authorized");
      Messages.remove(id);
    },
    //Read Message
    readMessage: function(id){
      var message = Messages.findOne(id);
      if(message.owner !==Meteor.userId())
        throw new Meteor.Error("not authorized");
      Messages.update(id, {
        $set:{isRead: true}
      });
    }
  });

//This code runs on the Server
if (Meteor.isServer) {
  //Only send messages where the current user is the owner
  Meteor.publish("messages", function(){
    return Messages.find({
      $or: [
        {owner:this.userId}
      ]
    });
  });
  //Only send users with a valid username
  Meteor.publish("usersList", function(){
    return Meteor.users.find({}, {fields:{username:1}});
  });
}
