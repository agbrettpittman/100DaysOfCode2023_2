import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Root, { 
    loader as rootLoader,
    action as rootAction
} from "@routes/Root";
import { loader as characterLoader } from "@routes/Character";
import Character from "@routes/Character";
import EditCharacter, { action as editAction} from "@routes/Edit";
import "./index.css";
import ErrorPage from "./error-page";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    loader: rootLoader,
    action: rootAction,
    children: [
        {
            path: "Characters/:characterId",
            element: <Character />,
            loader: characterLoader,
        },
        {
            path: "Characters/:characterId/edit",
            element: <EditCharacter />,
            loader: characterLoader,
            action: editAction,
        },
    ],
  },
  
]);

const RootElement = document.getElementById("root") as HTMLElement;

ReactDOM.createRoot(RootElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);