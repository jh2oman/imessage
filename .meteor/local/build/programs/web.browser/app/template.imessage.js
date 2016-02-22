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
  }, "Messages(", Blaze.View("lookup:messages.length", function() {
    return Spacebars.mustache(Spacebars.dot(view.lookup("messages"), "length"));
  }), ")"), "\n        ", HTML.Raw('<span id="new"><i class="fa fa-pencil-square-o"></i></span>'), "\n      "), "\n      ", Blaze.If(function() {
    return Spacebars.call(view.lookup("currentUser"));
  }, function() {
    return [ "\n      ", HTML.Comment(' <div class="search-wrapper">\n      <input type="text" class="search" placeholder="type to search"/>\n    </div> '), "\n      \n      \n      ", Blaze.Each(function() {
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
  }, "\n  ", HTML.DIV({
    "class": "header"
  }, "\n    ", HTML.SPAN({
    "class": "header-title"
  }, Blaze.View("lookup:contact", function() {
    return Spacebars.mustache(view.lookup("contact"));
  })), "\n  "), "\n  ", Blaze.If(function() {
    return Spacebars.call(view.lookup("newMessage"));
  }, function() {
    return [ "\n  ", HTML.INPUT({
      type: "text",
      id: "userSearch",
      name: "recipient",
      placeholder: "To:"
    }), "\n  ", Blaze.If(function() {
      return Spacebars.call(view.lookup("correctUser"));
    }, function() {
      return "\n  ";
    }, function() {
      return [ "\n            ", Blaze.Each(function() {
        return Spacebars.call(view.lookup("usersList"));
      }, function() {
        return [ "\n            ", HTML.DIV("\n            ", Blaze.View("lookup:username", function() {
          return Spacebars.mustache(view.lookup("username"));
        }), "\n            "), "\n            " ];
      }), "\n\n  " ];
    }), "\n  ", HTML.FORM({
      "class": "new-message"
    }, "\n            \n            ", HTML.INPUT({
      type: "text",
      name: "text",
      placeholder: "iMessage"
    }), "\n  "), "\n      \n  " ];
  }, function() {
    return [ "\n  ", Blaze.Each(function() {
      return Spacebars.dataMustache(view.lookup("texts"), view.lookup("contact"));
    }, function() {
      return [ "\n  ", HTML.DIV({
        "class": function() {
          return [ "text-wrapper ", Spacebars.mustache(view.lookup("sentOrRecieved")) ];
        }
      }, "\n  ", HTML.SPAN({
        "class": "text "
      }, "\n    ", Blaze.View("lookup:message", function() {
        return Spacebars.mustache(view.lookup("message"));
      }), "\n  "), "\n"), "\n  " ];
    }), "\n  ", HTML.FORM({
      "class": "new-text"
    }, "\n            \n            ", HTML.INPUT({
      type: "text",
      name: "text",
      placeholder: "iMessage"
    }), "\n  "), "\n\n  " ];
  }), "\n"), "\n");
}));
Meteor.startup(Template.body.renderToDocument);

Template.__checkName("details");
Template["details"] = new Template("Template.details", (function() {
  var view = this;
  return "";
}));

}).call(this);
