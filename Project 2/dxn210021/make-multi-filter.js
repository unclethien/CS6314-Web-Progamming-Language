"use strict";

function MakeMultiFilter(originalArray) {
  //create current array set to be identical to originalArray
  let currentArray = originalArray.slice();
  // return arrayFilterer function
  return function arrayFilterer(filterCriteria, callback) {
    if (typeof filterCriteria !== "function") {
      return currentArray;
    }

    // Apply the filterCriteria to the currentArray
    currentArray = currentArray.filter(filterCriteria);

    // If a callback function is provided, apply the callback to the currentArray
    if (typeof callback === "function") {
      callback.call(originalArray, currentArray);
    }

    return arrayFilterer;
  };
}
