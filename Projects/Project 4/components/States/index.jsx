import React, { useState, useEffect } from "react";
import "./styles.css";

/**
 * Define States, a React component of Project 4, Problem 2. The model
 * data for this view (the state names) is available at
 * window.models.statesModel().
 */
const States = () => {
  const [substring, setSubstring] = useState("");
  const [filteredStates, setFilteredStates] = useState([]);

  useEffect(() => {
    console.log("window.models.statesModel()", window.models.statesModel());

    const states = window.models.states;
    if (substring === "") {
      setFilteredStates(states);
    } else {
      const filtered = states
        .filter((state) =>
          state.name.toLowerCase().includes(substring.toLowerCase())
        )
        .sort((a, b) => a.name.localeCompare(b.name));
      setFilteredStates(filtered);
    }
  }, [substring]);

  const handleInputChange = (event) => {
    setSubstring(event.target.value);
  };

  return (
    <div className="states-container">
      <h1>States Filter</h1>
      <input
        type="text"
        value={substring}
        onChange={handleInputChange}
        placeholder="Enter substring"
        className="substring-input"
      />
      <p className="substring-display">Substring used: {substring}</p>
      {filteredStates.length > 0 ? (
        <ul className="states-list">
          {filteredStates.map((state, index) => (
            <li key={index}>{state.name}</li>
          ))}
        </ul>
      ) : (
        <p className="no-match-message">No matching states found.</p>
      )}
    </div>
  );
};

export default States;
