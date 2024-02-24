import { useEffect, useState } from "react"
import axios from "axios"
import styled from "styled-components"

const StyledHeader = styled.h1`
    margin: 1em 0em;
`

const TestRow = styled.div`
    display: flex;
    align-items: center;
    padding: 1em;
    gap: 1em;

    h4 {
        margin: 0;
    }
`

const StyledButton = styled.button`
    padding: 0.25em 0.5em;
    background-color: ${({ color }) => (color ? color : "lightgray")};
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
`

export default function TestList() {
    const [Data, setData] = useState([])

    useEffect(() => {
        axios
            .get("http://localhost:8000/tests")
            .then((res) => {
                setData(res.data)
            })
            .catch((err) => console.log(err))
    }, [])

    return (
        <div>
            <StyledHeader>Tests</StyledHeader>
            {Data.map((test) => {
                return (
                    <TestRow key={test.id}>
                        <StyledButton color="#079aeb">
                            <i className="ri-pencil-fill"></i>
                        </StyledButton>
                        <StyledButton color="#ff6060">
                            <i className="ri-delete-bin-5-line"></i>
                        </StyledButton>
                        <h4>{test.name}</h4>
                    </TestRow>
                )
            })}
        </div>
    )
}
