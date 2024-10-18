import React from "react";
import { createRoot } from "react-dom/client";

import States from "./components/States/index.jsx";

const root = createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <States />
  </React.StrictMode>
);
