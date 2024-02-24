import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";

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
            <Routes>
                {/*<Route path="/" element={<Home />} />*/}
                {/*<Route path="/404" element={<NotFound />} />*/}
                {/*<Route path="/tests" element={<TestList />} />*/}
                {/*<Route path="/systems" element={<SystemList />} />*/}
                {/*<Route path="*" element={<Navigate replace to="/404" />} />*/}
            </Routes>
        </main>
    </BrowserRouter>
  )
}

export default App
