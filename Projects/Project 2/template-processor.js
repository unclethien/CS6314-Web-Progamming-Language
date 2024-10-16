"use strict";

function TemplateProcessor(template) {
  // Store the template string
  this.template = template;
}

TemplateProcessor.prototype.fillIn = function (dictionary) {
  // Use a regular expression to find {{property}} in the template string
  return this.template.replace(/\{\{(\w+)\}\}/g, function (match, property) {
    // replace with the dictionary value or empty string if not found
    return property in dictionary ? dictionary[property] : "";
  });
};
