import React from "react";
import { createRoot } from "react-dom/client";

import States from "./components/States/index.jsx";
import Header from "./components/Header";

const root = createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Header />
    <States />
  </React.StrictMode>
);
