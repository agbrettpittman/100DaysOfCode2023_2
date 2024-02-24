import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import styled from 'styled-components'

const MainContent = styled.div`
    min-height: 80vh;
`

function App() {

  return (
    <BrowserRouter>
        <main className='container'>
            <nav>
                <ul>
                    <li><Link to="/" className="contrast"><strong>System Test Tracker</strong></Link></li>
                </ul>
                <ul>
                    <li><Link to="/systems">Systems</Link></li>
                    <li><Link to="/tests">Tests</Link></li>
                </ul>
            </nav>
            <MainContent>
                <Routes>
                    {/*<Route path="/" element={<Home />} />*/}
                    {/*<Route path="/404" element={<NotFound />} />*/}
                    {/*<Route path="/tests" element={<TestList />} />*/}
                    {/*<Route path="/systems" element={<SystemList />} />*/}
                    {/*<Route path="*" element={<Navigate replace to="/404" />} />*/}
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
