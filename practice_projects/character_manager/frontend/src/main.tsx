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
import { 
    loader as characterLoader,
    action as characterAction
} from "@routes/Character";
import Character from "@routes/Character";
import EditCharacter, { action as editAction} from "@routes/Edit";
import { action as destroyAction } from "@routes/Destroy";
import "./index.css";
import ErrorPage from "./error-page";
import Index from "@routes/Index";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    loader: rootLoader,
    action: rootAction,
    children: [
        { index: true, element: <Index /> },
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
        {
            path: "Characters/:characterId/destroy",
            action: destroyAction,
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