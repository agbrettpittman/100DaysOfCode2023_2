import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route
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
import EditCharacter from "@routes/Edit";
import { action as destroyAction } from "@routes/Destroy";
import "./index.css";
import ErrorPage from "./error-page";
import Index from "@routes/Index";
import Login from "@routes/Login";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const router = createBrowserRouter( createRoutesFromElements(
    <Route element={<Login />}>
        <Route 
            path="/" element={<Root />} errorElement={<ErrorPage />} 
            loader={rootLoader} action={rootAction}
        >
            <Route errorElement={<ErrorPage />} >
                <Route index={true} element={<Index />} />
                <Route 
                    path="Characters/:characterId" element={<Character />} 
                    loader={characterLoader} action={characterAction} 
                />
                <Route 
                    path="Characters/:characterId/edit" element={<EditCharacter />} 
                    loader={characterLoader} 
                />
                <Route path="Characters/:characterId/destroy" action={destroyAction} />
            </Route>
        </Route>
    </Route>
));    

const RootElement = document.getElementById("root") as HTMLElement;

ReactDOM.createRoot(RootElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);