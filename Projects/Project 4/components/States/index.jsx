import React from "react";
import "./styles.css";

/**
 * Define States, a React component of Project 4, Problem 2. The model
 * data for this view (the state names) is available at
 * window.models.statesModel().
 */
function States() {
  console.log("window.models.states()", window.models.statesModel());

  const [substring, setSubstring] = useState("");

  // Filter the states based on the substring entered by the user
  const filteredStates = window.models.states
    .filter((state) =>
      state.name.toLowerCase().includes(substring.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="states-container">
      <input
        type="text"
        value={substring}
        onChange={(e) => setSubstring(e.target.value)}
        placeholder="Enter substring..."
        className="states-input"
      />
      <div className="states-substring-display">
        Filtering by: {substring ? substring : "All states"}
      </div>
      <ul className="states-list">
        {filteredStates.length > 0 ? (
          filteredStates.map((state) => (
            <li key={state.name} className="states-list-item">
              {state.name}
            </li>
          ))
        ) : (
          <li className="states-no-match">No matching states found.</li>
        )}
      </ul>
    </div>
  );
}

export default States;
