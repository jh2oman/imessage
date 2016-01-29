(function(){
Template.body.addContent((function() {
  var view = this;
  return [ HTML.Raw("<h1>Welcome to Meteor!</h1>\n\n  "), Spacebars.include(view.lookupTemplate("hello")) ];
}));
Meteor.startup(Template.body.renderToDocument);

Template.__checkName("hello");
Template["hello"] = new Template("Template.hello", (function() {
  var view = this;
  return [ HTML.Raw('<button>Click Me</button>\n  <form class="new-conversation">\n        <input type="text" name="text" placeholder="Type to add new conversation">\n  </form>\n  <h2>Conversations</h2>\n  '), HTML.UL("\n  	", Blaze.Each(function() {
    return Spacebars.call(view.lookup("conversations"));
  }, function() {
    return [ "\n  	", HTML.LI(Blaze.View("lookup:message", function() {
      return Spacebars.mustache(view.lookup("message"));
    })), "\n  	" ];
  }), "\n  ") ];
}));

}).call(this);
