import { useEffect, useState } from "react"
import axios from "axios"
import styled from "styled-components"

const StyledHeader = styled.h1`
    margin: 1em 0em;
`

const ScrollableDiv = styled.div`
    max-height: 40vh;
    overflow-y: auto;
    margin-bottom: 1em;
`

const TestRow = styled.div`
    display: flex;
    align-items: center;
    padding: 1em;
    gap: 1em;

    h4,
    input {
        margin: 0;
    }
`

const StyledButton = styled.button`
    background-color: ${({ color }) => (color ? color : "lightgray")};
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    height: 2em;
    width: 2em;
    display: flex;
    align-items: center;
    justify-content: center;
`

const AddTestWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 1em;
    padding: 1em;

    input {
        margin: 0;
    }
`

export default function TestList() {
    const [Data, setData] = useState([])
    const [NewTest, setNewTest] = useState("")
    const [Editing, setEditing] = useState(null)
    const [EditValue, setEditValue] = useState("")

    useEffect(() => {
        getData()
    }, [])

    function getData() {
        axios
            .get("http://localhost:8000/tests")
            .then((res) => {
                setData(res.data)
            })
            .catch((err) => console.log(err))
    }

    function addTest() {
        if (!NewTest) return
        axios
            .post("http://localhost:8000/tests", { name: NewTest })
            .then((res) => {
                console.log(res)
                getData()
            })
            .catch((err) => console.log(err))
    }

    function deleteTest(id) {
        axios
            .delete(`http://localhost:8000/tests/${id}`)
            .then((res) => {
                console.log(res)
                getData()
            })
            .catch((err) => console.log(err))
    }

    function updateTest(id) {
        axios
            .put(`http://localhost:8000/tests/${id}`, { name: EditValue })
            .then((res) => {
                console.log(res)
                setEditing(null)
                getData()
            })
            .catch((err) => console.log(err))
    }

    function setTestToEdit(test) {
        setEditing(test.id)
        setEditValue(test.name)
    }

    return (
        <div>
            <StyledHeader>Tests</StyledHeader>
            <ScrollableDiv>
                {Data.map((test) => {
                    return (
                        <TestRow key={test.id}>
                            {Editing === test.id ? (
                                <>
                                    <StyledButton color="#4caf50" onClick={() => updateTest(test.id)}>
                                        <i class="ri-check-line"></i>
                                    </StyledButton>
                                    <StyledButton color="#ff6060" onClick={() => setEditing(null)}>
                                        <i class="ri-close-line"></i>
                                    </StyledButton>
                                    <input
                                        type="text"
                                        value={EditValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                    />
                                </>
                            ) : (
                                <>
                                    <StyledButton color="#079aeb" onClick={() => setTestToEdit(test)}>
                                        <i className="ri-pencil-fill"></i>
                                    </StyledButton>
                                    <StyledButton color="#ff6060" onClick={() => deleteTest(test.id)}>
                                        <i className="ri-delete-bin-5-line"></i>
                                    </StyledButton>
                                    <h4>{test.name}</h4>
                                </>
                            )}
                        </TestRow>
                    )
                })}
            </ScrollableDiv>
            <AddTestWrapper>
                <StyledButton color="#4caf50" onClick={addTest}>
                    <i class="ri-add-line"></i>
                </StyledButton>
                <input
                    type="text"
                    placeholder="Add New Test"
                    value={NewTest}
                    onChange={(e) => setNewTest(e.target.value)}
                />
            </AddTestWrapper>
        </div>
    )
}
