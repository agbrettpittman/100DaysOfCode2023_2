import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Root from "@routes/root";
import "./index.css";
import ErrorPage from "./error-page";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
  },
]);

const RootElement = document.getElementById("root") as HTMLElement;

ReactDOM.createRoot(RootElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);