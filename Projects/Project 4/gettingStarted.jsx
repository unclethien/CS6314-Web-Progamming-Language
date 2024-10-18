import React from "react";
import { createRoot } from "react-dom/client";
import "./styles/main.css";
import Example from "./components/Example";
import Header from "./components/Header";

const root = createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Header />
    <Example />
  </React.StrictMode>
);
