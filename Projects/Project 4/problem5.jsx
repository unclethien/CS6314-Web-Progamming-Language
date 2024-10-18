import React from "react";
import { HashRouter, Route, Link } from "react-router-dom";
import { createRoot } from "react-dom";
import Example from "./components/Example";
import States from "./components/States";
import Header from "./components/Header";

const root = createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Header />
    <HashRouter>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <Link
          to="/states"
          style={{
            marginRight: "20px",
            textDecoration: "none",
            color: "white",
            backgroundColor: "black",
            borderRadius: "5px",
            padding: "5px 10px",
          }}
        >
          States
        </Link>
        <Link
          to="/example"
          style={{
            textDecoration: "none",
            color: "white",
            backgroundColor: "black",
            borderRadius: "5px",
            padding: "5px 10px",
          }}
        >
          Example
        </Link>
      </div>
      <Route path="/states" component={States} />
      <Route path="/example" component={Example} />
    </HashRouter>
  </React.StrictMode>
);
