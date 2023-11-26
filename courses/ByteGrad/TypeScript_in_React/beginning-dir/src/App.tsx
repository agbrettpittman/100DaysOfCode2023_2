import Counter from "./components/Counter"
import Heading from "./components/Heading"
import List from "./components/List"
import Section from "./components/Section"
import { useState } from "react"

function App() {

    const [count, setCount] = useState<number>(0)

    return (
        <>
            <Heading title="Hello World"/>
            <Section title="Counter Section">
                <Counter setCount={setCount}>Count is {count}</Counter>
            </Section>
            <Section title="List Component Below">
                <List 
                    items={["Item 1", "Item 2", "Item 3"]}
                    render={(item) => <span className="bold gold">{item}</span>}
                    icon={<span>🚀</span>}
                />
            </Section>
        </>
    )
}

export default App
