import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route
} from "react-router-dom";
import Character from "@routes/Character";
import EditCharacter from "@routes/CharacterEdit";
import SignUp from "@routes/SignUp";
import SearchResults from "@routes/SearchResults";
import "./index.css";
import ErrorPage from "./error-page";
import Index from "@routes/Index";
import Login from "@routes/Login";
import Root from "@routes/Root";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import ThemeWrapper from "./components/ThemeWrapper";
import CharacterCreate from "@routes/CharacterCreate";

const router = createBrowserRouter( createRoutesFromElements(
    <Route path="/" errorElement={<ErrorPage />}>
        <Route element={<ThemeWrapper />}>
            <Route element={<Login />}>
                <Route element={<Root />} errorElement={<ErrorPage />} >
                    <Route errorElement={<ErrorPage />} >
                        <Route index={true} element={<Index />} />
                        <Route path="Characters/create" element={<CharacterCreate />} />
                        <Route path="Characters/:characterId" element={<Character />} />
                        <Route path="Characters/:characterId/edit" element={<EditCharacter />} />
                        <Route path="SearchResults" element={<SearchResults />} />
                    </Route>
                </Route>
            </Route>
            <Route path="Signup" element={<SignUp />} />
        </Route>
    </Route>
));    

const RootElement = document.getElementById("root") as HTMLElement;

ReactDOM.createRoot(RootElement).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);