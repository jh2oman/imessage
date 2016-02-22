
Messages = new Mongo.Collection("messages");

if (Meteor.isClient) {
  //This code runs on the Client
  Meteor.subscribe("messages");
  Meteor.subscribe("usersList")
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

  Template.body.helpers({
    messages: function(){
      var messages = [];
      var users = Meteor.users.find({}, {sort:{createdAt:-1}});
      users.forEach(function(user){
        //if(Session.get("searchFilter"))
        //messages.push(Messages.findOne({message:{$regex: new RegExp(Session.get("searchFilter"),"i")}, contactName: :{$regex: new RegExp(user,"i")} }, {sort:{createdAt:-1}}));
        //else
        var single = Messages.findOne({contactName :user.username}, {sort:{createdAt:-1}});
        if(single)
          messages.push(single);
      })
      return messages
      //console.log(messages);
    },
    texts:function(contact){
      return Messages.find({contactName: contact}, {sort:{createdAt:1}});
    },
    usersList: function(){
      if(Session.get("userFilter"))
        return Meteor.users.find({username:{$regex: new RegExp(Session.get("userFilter"),"i")}}, {sort:{username:-1}});
      else
        return Meteor.users.find({}, {sort:{createdAt:-1}});
    },
    formatTime: function(time){
      var hours = time.getHours().toString();
      var minutes = time.getMinutes().toString();

      if(hours.length<2)
        hours = "0"+ hours;
      if(minutes.length<2)
        minutes = "0"+ minutes;
      return hours + ":" + minutes;
    },
    contact: function()
    {
      return Session.get("contact");
    },
    newMessage: function(){
      return Session.get("newMessage");
    },
    sentOrRecieved:function(){
      if(this.sent)
        return "sent";
      else
        return "recieved";
    },
    correctUser:function(){
      if(Meteor.users.findOne({username:  Session.get("userFilter")}))
        return true;
      return false;
    }

  });

  Template.body.events({
    "submit .new-message": function(event){
      event.preventDefault();
        var message = event.target.text.value;
        var userName = $('#userSearch').val();
        console.log(userName);
        Meteor.call("addMessage",message, userName);
        event.target.text.value = "";
        Session.set("newMessage", false);
        Session.set("contact", userName);

    },
    "submit .new-text": function(event){
      event.preventDefault();
        var message = event.target.text.value;
        var userName = Session.get("contact");
        console.log(userName);
        Meteor.call("addMessage",message, userName);
        event.target.text.value = "";
        
    },
    "click .delete": function(event){
      Meteor.call("deleteMessage",this._id);
    },
    "click .read": function(event){
      Meteor.call("readMessage",this._id);
    },
    "keyup .search": function(event){
      Session.set("searchFilter", $('.search').val());
    },
    "keyup #userSearch": function(event){
      Session.set("userFilter", $('#userSearch').val());
    },
    "click .message-box": function(event){
      Session.set("newMessage", false);
      Session.set("contact", this.contactName);
      console.log(this.contactName);
      $(this).addClass("selected");
    },
    "click #new": function(event){
      Session.set("newMessage", true);
    }
  });
}

Meteor.methods({
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
      if(username !==Meteor.user().username)
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
    deleteMessage: function(id){
      var message = Messages.findOne(id);
      if(message.owner !==Meteor.userId())
        throw new Meteor.Error("not authorized");
      Messages.remove(id);
    },
    readMessage: function(id){
      var message = Messages.findOne(id);
      if(message.owner !==Meteor.userId())
        throw new Meteor.Error("not authorized");
      Messages.update(id, {
        $set:{isRead: true}
      });
    }
  });

if (Meteor.isServer) {
  Meteor.publish("messages", function(){
    return Messages.find({
      $or: [
        {owner:this.userId}
      ]
    });
  });

  Meteor.publish("usersList", function(){
    return Meteor.users.find({}, {fields:{username:1}});
  });
}
