import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import styled from "styled-components"

const EditButton = styled.button.attrs((props) => {
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

export default function SingleSystem() {
    const { id } = useParams()
    const [Data, setData] = useState({})
    const [Editing, setEditing] = useState(null)
    const [EditValues, setEditValues] = useState({
        hardwareMake: "",
        hardwareModel: "",
        softwareName: "",
        softwareVersion: "",
    })

    useEffect(() => {
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
    }, [id])

    function handleEditingChange() {
        setEditing(!Editing)
        setEditValues(Data)
    }

    function handleFieldChange(e) {
        setEditValues({ ...EditValues, [e.target.name]: e.target.value })
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
                        <EditButton className="primary outline" onClick={handleEditingChange}>
                            Edit
                        </EditButton>
                    ) : (
                        <>
                            <EditButton className="primary" onClick={saveEdit}>
                                Save
                            </EditButton>
                            <EditButton className="contrast" onClick={handleEditingChange}>
                                Cancel
                            </EditButton>
                        </>
                    )}
                </ButtonBar>
            </MainSectionWrapper>
            <h2>Tests</h2>
            <table className="striped">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Signature</th>
                        <th>Signed Date</th>
                    </tr>
                </thead>
                <tbody>
                    {Data.tests &&
                        Data.tests.map((test) => {
                            return (
                                <tr key={test.id}>
                                    <td>{test.name}</td>
                                    <td>{test.signature}</td>
                                    <td>{test.signedOn}</td>
                                </tr>
                            )
                        })}
                </tbody>
            </table>
        </div>
    )
}
