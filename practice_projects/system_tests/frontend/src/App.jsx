import { useState } from "react"
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom"
import styled from "styled-components"
import NotFound from "./pages/NotFound"
import SystemList from "./pages/SystemList"
import TestList from "./pages/TestList"
import Home from "./pages/Home"
import SingleSystem from "./pages/SingleSystem"
import "remixicon/fonts/remixicon.css"

const MainContent = styled.div`
    min-height: 78vh;
`

function App() {
    return (
        <BrowserRouter>
            <main className="container">
                <nav>
                    <ul>
                        <li>
                            <Link to="/" className="contrast">
                                <strong>System Test Tracker</strong>
                            </Link>
                        </li>
                    </ul>
                    <ul>
                        <li>
                            <Link to="/systems">Systems</Link>
                        </li>
                        <li>
                            <Link to="/tests">Tests</Link>
                        </li>
                    </ul>
                </nav>
                <hr />
                <MainContent>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/404" element={<NotFound />} />
                        <Route path="/tests" element={<TestList />} />
                        <Route path="/systems" element={<SystemList />} />
                        <Route path="/systems/:id" element={<SingleSystem />} />
                        <Route path="*" element={<Navigate replace to="/404" />} />
                    </Routes>
                </MainContent>
                <footer>
                    <p>Created by Brett Pittman 2024</p>
                </footer>
            </main>
        </BrowserRouter>
    )
}

export default App
