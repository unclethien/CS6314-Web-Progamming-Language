import React, { useState } from "react";
import { createRoot } from "react-dom";
import Example from "./components/Example";
import States from "./components/States";
import Header from "./components/Header";

function App() {
  const [showExample, setShowExample] = useState(true);

  return (
    <div>
      <button onClick={() => setShowExample(!showExample)}>
        {showExample ? "Switch to States" : "Switch to Example"}
      </button>
      {showExample ? <Example /> : <States />}
    </div>
  );
}

const root = createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Header />
    <App />
  </React.StrictMode>
);
