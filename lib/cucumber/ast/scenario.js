var Scenario = function(keyword, name, description, uri, line) {
  var Cucumber = require('../../cucumber');
  var background;
  var steps = Cucumber.Type.Collection();
  var tags  = [];

  var self = {
    setBackground: function setBackground(newBackground) {
      background = newBackground;
    },

    getKeyword: function getKeyword() {
      return keyword;
    },

    getName: function getName() {
      return name;
    },

    getDescription: function getDescription() {
      return description;
    },

    getUri: function getUri() {
      return uri;
    },

    getLine: function getLine() {
      return line;
    },

    getBackground: function getBackground() {
      return background;
    },

    addStep: function addStep(step) {
      var lastStep = self.getLastStep();
      step.setPreviousStep(lastStep);
      steps.add(step);
    },

    getLastStep: function getLastStep() {
      return steps.getLast();
    },

    addTags: function setTags(newTags) {
      tags = tags.concat(newTags);
    },

    getTags: function getTags() {
      return tags;
    },

	  acceptVisitor: function acceptVisitor(visitor, callback) {
			self.instructVisitorToVisitBackgroundSteps(visitor, function() {
				self.instructVisitorToVisitScenarioSteps(visitor, callback);
			});		
    },

    instructVisitorToVisitBackgroundSteps: function instructVisitorToVisitBackgroundSteps(visitor, callback) {
      var background = self.getBackground();
      if (typeof(background) != 'undefined') {
        var steps = background.getSteps();
        self.instructVisitorToVisitSteps(visitor, steps, callback);
      } else {
        callback();
      }
    },

    instructVisitorToVisitScenarioSteps: function instructVisitorToVisitScenarioSteps(visitor, callback) {
      self.instructVisitorToVisitSteps(visitor, steps, callback);
    },

    instructVisitorToVisitSteps: function instructVisitorToVisitSteps(visitor, steps, callback) {
      steps.forEach(function(step, iterate) {
        visitor.visitStep(step, iterate);
      }, callback);
    }
  };


  // Check to see if describeStart function has been defined in the global scope.
  var describeStart = describeStart;
  if (describeStart != undefined)
  {
    // Wrap the original acceptVisitor function with external hooks.
    var originalAcceptVisitor = self.acceptVisitor;
    self.acceptVisitor = function acceptVisitor(visitor, visitorCallback) {
      function describeFn(describeCallback){
        originalAcceptVisitor(visitor, function(){
          // When background and scenarios have completed, close the describe block
          describeCallback();
          // Tell cucumber we've finished with the feature - we'll let angular deal with any errors.
          visitorCallback();
        });
      }

      var title = self.getKeyword() + ': ' + self.getName();
      var description = self.getDescription();
      describeStart(title, describeFn, description);
    };
  }

  return self;
};
module.exports = Scenario;
