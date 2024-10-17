import React, { useState, useEffect } from "react";
import "./styles.css";

/**
 * Define States, a React component of Project 4, Problem 2. The model
 * data for this view (the state names) is available at
 * window.models.statesModel().
 */
function States() {
  // Load the state names from the model data.
  const allStates = window.models.states; // Assuming this returns an array of state names.

  // State for the filter substring and filtered list of states.
  const [substring, setSubstring] = useState("");
  const [filteredStates, setFilteredStates] = useState(allStates);

  // Function to handle the change in the input field.
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSubstring(value);

    // Filter states based on the input value, ignoring case.
    const filtered = allStates.filter((state) =>
      state.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredStates(filtered);
  };

  useEffect(() => {
    // When the substring is empty, all states are shown.
    if (substring === "") {
      setFilteredStates(allStates);
    }
  }, [substring, allStates]);

  return (
    <div className="states-view">
      <input
        type="text"
        value={substring}
        onChange={handleInputChange}
        placeholder="Enter a substring to filter states"
        className="states-input"
      />
      <div className="states-substring">
        {substring && <p>Filtering by: "{substring}"</p>}
      </div>
      <ul className="states-list">
        {filteredStates.length > 0 ? (
          filteredStates
            .sort()
            .map((state, index) => <li key={index}>{state}</li>)
        ) : (
          <p className="states-no-match">No matching states found.</p>
        )}
      </ul>
    </div>
  );
}

export default States;
