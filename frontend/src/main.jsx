import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { RouterProvider } from "react-router-dom";
import createAppRouter from "./routers/router.jsx";

function getStoredUser() {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored): null;
  } catch (error) {
    console.error("Invaid user data in localstorage: ", error);
    return null;
  }
}

function RootApp() {
  const [user, setUser] = useState(getStoredUser());

  const router = createAppRouter(user, setUser);

  return <RouterProvider router={router} />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RootApp />
  </StrictMode>
);
