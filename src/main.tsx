import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import ProviderControl from "./providers/ProviderControl.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ProviderControl>
      <App />
    </ProviderControl>
  </React.StrictMode>
);
