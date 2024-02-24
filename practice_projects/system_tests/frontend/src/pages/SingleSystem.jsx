import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import styled from "styled-components"
import moment from "moment"

const StyledButton = styled.button.attrs((props) => {
    return {
        className: props.className,
    }
})`
    && {
        width: fit-content;
        height: fit-content;
        padding: 0.25em 0.5em;
        justify-self: end;
    }
`

const DeleteButton = styled(StyledButton)`
    border-color: #ff6060;
    color: #ff6060;
`

const MainSectionWrapper = styled.div`
    margin-bottom: 1em;
    max-width: 40em;
`

const DetailItem = styled.div`
    display: flex;
    gap: 1em;
    margin-bottom: 1em;
    align-items: center;

    input {
        margin: 0;
    }
`

const ButtonBar = styled.div`
    display: flex;
    gap: 1em;
`

const TableWrapper = styled.div`
    max-height: 30vh;
    overflow-y: auto;
    margin-bottom: 1em;

    th {
        position: sticky;
        top: 0;
    }

    input {
        padding: 0.5em;
        height: fit-content;
        margin: 0;
    }
`

const IconButton = styled.button`
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

const TableButtonBar = styled.div`
    display: flex;
    gap: 0.5em;
`

export default function SingleSystem() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [Data, setData] = useState({})
    const [TestOptions, setTestOptions] = useState([{}])
    const [Editing, setEditing] = useState(false)
    const [AddingTest, setAddingTest] = useState(false)
    const [SigningTest, setSigningTest] = useState(null)
    const [TestToAdd, setTestToAdd] = useState("")
    const [SigningValues, setSigningValues] = useState({
        signature: "",
        signedOn: "",
    })
    const [EditValues, setEditValues] = useState({
        hardwareMake: "",
        hardwareModel: "",
        softwareName: "",
        softwareVersion: "",
    })

    useEffect(() => {
        getData()
    }, [id])

    useEffect(() => {
        if (!AddingTest) return
        axios
            .get("http://localhost:8000/tests")
            .then((res) => {
                setTestOptions(filterTestOptions(Data, res.data))
            })
            .catch((err) => console.log(err))
    }, [AddingTest])

    // filter the test options to remove any tests that are already associated with the system
    useEffect(() => {
        if (TestOptions.length === 0) return
        setTestOptions(filterTestOptions(Data, TestOptions))
    }, [Data])

    useEffect(() => {
        if (!SigningTest) {
            setSigningValues({ signature: "", signedOn: "" })
        } else {
            const CurrentValues = Data.tests.find((test) => test.tests_id === SigningTest)
            setSigningValues({
                signature: CurrentValues.signature,
                signedOn: CurrentValues.signedOn
                    ? moment(CurrentValues.signedOn).format("MM/DD/YYYY hh:mm a")
                    : moment().format("MM/DD/YYYY hh:mm a"),
            })
        }
    }, [SigningTest])

    function getData() {
        if (!id || Number.isNaN(Number(id))) {
            setData({})
            return
        }
        axios
            .get(`http://localhost:8000/systems/${id}`)
            .then((res) => {
                console.log(res)
                setData(res.data)
            })
            .catch((err) => console.log(err))
    }

    function deleteSystem() {
        axios
            .delete(`http://localhost:8000/systems/${id}`)
            .then((res) => {
                console.log(res)
                navigate("/systems")
            })
            .catch((err) => console.log(err))
    }

    function handleEditingChange() {
        setEditing(!Editing)
        setEditValues(Data)
    }

    function handleFieldChange(e) {
        setEditValues({ ...EditValues, [e.target.name]: e.target.value })
    }

    function filterTestOptions(data, options) {
        if (!data.tests) return options
        let currentTestIds = data.tests.map((test) => test.tests_id)
        let newTestOptions = options.filter((test) => !currentTestIds.includes(test.id))
        return newTestOptions
    }

    function saveEdit() {
        axios
            .put(`http://localhost:8000/systems/${id}`, EditValues)
            .then((res) => {
                console.log(res)
                setEditing(false)
                let newData = { ...res.data }
                delete newData.id
                setData(newData)
            })
            .catch((err) => console.log(err))
    }

    function addTest() {
        axios
            .post(`http://localhost:8000/systems/${id}/tests`, { tests_id: TestToAdd })
            .then((res) => {
                console.log(res)
                getData()
                setTestToAdd("")
            })
            .catch((err) => console.log(err))
    }

    function deleteTest(testId) {
        axios
            .delete(`http://localhost:8000/systems/${id}/tests/${testId}`)
            .then((res) => {
                console.log(res)
                getData()
            })
            .catch((err) => console.log(err))
    }

    function SignTest() {
        let ValuesToSend = {
            signature: SigningValues.signature,
            signedOn: moment(SigningValues.signedOn).format("YYYY-MM-DDTHH:mm:ss"),
        }
        axios
            .put(`http://localhost:8000/systems/${id}/tests/${SigningTest}`, ValuesToSend)
            .then((res) => {
                console.log(res)
                getData()
                setSigningTest(null)
            })
            .catch((err) => console.log(err))
    }

    return (
        <div>
            <MainSectionWrapper>
                <div>
                    <DetailItem>
                        <strong>Make: </strong>
                        {Editing ? (
                            <input
                                type="text"
                                value={EditValues.hardwareMake}
                                name="hardwareMake"
                                onChange={handleFieldChange}
                            />
                        ) : (
                            Data.hardwareMake
                        )}
                    </DetailItem>
                    <DetailItem>
                        <strong>Model: </strong>
                        {Editing ? (
                            <input
                                type="text"
                                value={EditValues.hardwareModel}
                                name="hardwareModel"
                                onChange={handleFieldChange}
                            />
                        ) : (
                            Data.hardwareModel
                        )}
                    </DetailItem>
                    <DetailItem>
                        <strong>Software: </strong>
                        {Editing ? (
                            <input
                                type="text"
                                value={EditValues.softwareName}
                                name="softwareName"
                                onChange={handleFieldChange}
                            />
                        ) : (
                            Data.softwareName
                        )}
                    </DetailItem>
                    <DetailItem>
                        <strong>Version: </strong>
                        {Editing ? (
                            <input
                                type="text"
                                value={EditValues.softwareVersion}
                                name="softwareVersion"
                                onChange={handleFieldChange}
                            />
                        ) : (
                            Data.softwareVersion
                        )}
                    </DetailItem>
                </div>
                <ButtonBar>
                    {!Editing ? (
                        <>
                            <StyledButton className="primary outline" onClick={handleEditingChange}>
                                Edit
                            </StyledButton>
                            <DeleteButton className="outline" onClick={deleteSystem}>
                                Delete System
                            </DeleteButton>
                        </>
                    ) : (
                        <>
                            <StyledButton className="primary" onClick={saveEdit}>
                                Save
                            </StyledButton>
                            <StyledButton className="contrast" onClick={handleEditingChange}>
                                Cancel
                            </StyledButton>
                        </>
                    )}
                </ButtonBar>
            </MainSectionWrapper>
            <h2>Tests</h2>
            <TableWrapper>
                <table className="striped">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Signature</th>
                            <th>Signed Date</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {Data.tests &&
                            Data.tests.map((test) => {
                                return (
                                    <tr key={test.id}>
                                        <td>{test.name}</td>
                                        {SigningTest !== test.tests_id ? (
                                            <>
                                                <td>{test.signature}</td>
                                                <td>
                                                    {(test.signedOn &&
                                                        moment(test.signedOn).format("MM/DD/YYYY hh:mm a")) ||
                                                        ""}
                                                </td>
                                                <td>
                                                    <TableButtonBar>
                                                        <IconButton
                                                            color="#079aeb"
                                                            onClick={() => setSigningTest(test.tests_id)}
                                                        >
                                                            <i className="ri-pencil-fill"></i>
                                                        </IconButton>
                                                        <IconButton
                                                            color="#ff6060"
                                                            onClick={() => deleteTest(test.tests_id)}
                                                        >
                                                            <i className="ri-delete-bin-line"></i>
                                                        </IconButton>
                                                    </TableButtonBar>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td>
                                                    <input
                                                        type="text"
                                                        value={SigningValues.signature}
                                                        onChange={(e) =>
                                                            setSigningValues({
                                                                ...SigningValues,
                                                                signature: e.target.value,
                                                            })
                                                        }
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        value={SigningValues.signedOn}
                                                        onChange={(e) =>
                                                            setSigningValues({
                                                                ...SigningValues,
                                                                signedOn: e.target.value,
                                                            })
                                                        }
                                                    />
                                                </td>
                                                <td>
                                                    <TableButtonBar>
                                                        <IconButton color="#4caf50" onClick={SignTest}>
                                                            <i className="ri-check-line"></i>
                                                        </IconButton>
                                                        <IconButton
                                                            color="#ff6060"
                                                            onClick={() => setSigningTest(null)}
                                                        >
                                                            <i className="ri-close-line"></i>
                                                        </IconButton>
                                                    </TableButtonBar>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                )
                            })}
                    </tbody>
                </table>
            </TableWrapper>
            {!AddingTest ? (
                <StyledButton className="outline primary" onClick={() => setAddingTest(true)}>
                    Add Test
                </StyledButton>
            ) : (
                <div>
                    <select onChange={(e) => setTestToAdd(e.target.value)} value={TestToAdd}>
                        <option value="">Select Test</option>
                        {TestOptions.map((test) => {
                            return (
                                <option key={test.id} value={test.id}>
                                    {test.name}
                                </option>
                            )
                        })}
                    </select>
                    <ButtonBar>
                        <StyledButton className="primary" onClick={addTest}>
                            Add
                        </StyledButton>
                        <StyledButton className="contrast" onClick={() => setAddingTest(false)}>
                            Cancel
                        </StyledButton>
                    </ButtonBar>
                </div>
            )}
        </div>
    )
}
