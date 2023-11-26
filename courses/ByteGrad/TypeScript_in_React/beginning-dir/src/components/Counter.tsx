import React, {ReactNode} from 'react'

type CounterProps = {
    setCount: React.Dispatch<React.SetStateAction<number>>,
    children: ReactNode
}

export default function Counter({setCount, children}: CounterProps) {
    

    return (
        <>
            <h3>{children}</h3>
            <button onClick={() => setCount((prevCount) => prevCount + 1)}>Increment</button>
            <button onClick={() => setCount((prevCount) => prevCount - 1)}>Decriment</button>
        </>
    )
}