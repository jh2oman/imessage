(function(){
Template.body.addContent((function() {
  var view = this;
  return HTML.DIV({
    "class": "row"
  }, "\n    ", HTML.DIV({
    "class": "messages"
  }, "\n      ", HTML.DIV({
    "class": "header"
  }, "\n        ", HTML.DIV({
    "class": "login-wrapper"
  }, "\n        ", Spacebars.include(view.lookupTemplate("loginButtons")), "\n      "), "\n        ", HTML.SPAN({
    "class": "header-title"
  }, "Messages(", Blaze.View("lookup:messages.count", function() {
    return Spacebars.mustache(Spacebars.dot(view.lookup("messages"), "count"));
  }), ")"), "\n      "), "\n      ", Blaze.If(function() {
    return Spacebars.call(view.lookup("currentUser"));
  }, function() {
    return [ "\n      ", HTML.DIV({
      "class": "search-wrapper"
    }, "\n      ", HTML.INPUT({
      type: "text",
      "class": "search",
      placeholder: "type to search"
    }), "\n    "), "\n      \n      \n      ", Blaze.Each(function() {
      return Spacebars.call(view.lookup("messages"));
    }, function() {
      return [ "\n      ", HTML.DIV({
        "class": "message-box"
      }, "\n        ", HTML.DIV({
        "class": "left"
      }, "\n          ", HTML.IMG({
        "class": "avatar",
        src: "/user.png"
      }), "\n        "), "\n        ", HTML.DIV({
        "class": "right"
      }, "\n          ", HTML.SPAN({
        "class": "name"
      }, Blaze.View("lookup:contactName", function() {
        return Spacebars.mustache(view.lookup("contactName"));
      }), HTML.SPAN({
        "class": "time"
      }, Blaze.View("lookup:formatTime", function() {
        return Spacebars.mustache(view.lookup("formatTime"), view.lookup("createdAt"));
      }))), "\n          ", HTML.SPAN({
        "class": "preview"
      }, Blaze.View("lookup:message", function() {
        return Spacebars.mustache(view.lookup("message"));
      })), "\n        "), "\n        ", HTML.Comment(' <button class="delete">&times;</button>\n        <button class="read">Read</button> '), "\n        ", Blaze.If(function() {
        return Spacebars.call(view.lookup("isRead"));
      }, function() {
        return [ "\n        ", HTML.CharRef({
          html: "&#10003;",
          str: "✓"
        }), "\n        " ];
      }), "\n      "), "\n      " ];
    }), "\n      \n      " ];
  }), "\n"), "\n", HTML.DIV({
    "class": "details"
  }, "\n  ", HTML.Raw('<div class="header"></div>'), "\n  ", HTML.Raw('<input type="text" id="userSearch" name="recipient" placeholder="To:">'), "\n            ", Blaze.Each(function() {
    return Spacebars.call(view.lookup("usersList"));
  }, function() {
    return [ "\n            ", Blaze.View("lookup:username", function() {
      return Spacebars.mustache(view.lookup("username"));
    }), "\n            " ];
  }), "\n      ", HTML.Raw('<form class="new-message">\n            \n            <input type="text" name="text" placeholder="Type to add new message">\n      </form>'), "\n"), "\n");
}));
Meteor.startup(Template.body.renderToDocument);

Template.__checkName("message");
Template["message"] = new Template("Template.message", (function() {
  var view = this;
  return "";
}));

}).call(this);
