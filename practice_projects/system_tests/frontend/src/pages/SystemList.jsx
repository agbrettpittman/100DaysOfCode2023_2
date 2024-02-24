import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"
import CreateSystem from "../components/CreateSystem"

const StyledRow = styled.tr`
    cursor: pointer;
    &:hover {
        background-color: #0080ff61;
    }
`

const TableWrapper = styled.div`
    max-height: 40vh;
    overflow-y: auto;
    margin-bottom: 1em;

    th {
        position: sticky;
        top: 0;
    }
`

function SystemList() {
    const [Data, setData] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        getData()
    }, [])

    function getData() {
        axios
            .get("http://localhost:8000/systems")
            .then((res) => {
                setData(res.data)
            })
            .catch((err) => console.log(err))
    }

    return (
        <div>
            <h2>Systems</h2>
            <TableWrapper>
                <table className="striped">
                    <thead>
                        <tr>
                            <th>Make</th>
                            <th>Model</th>
                            <th>Software</th>
                            <th>Version</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Data.map((system) => {
                            return (
                                <StyledRow key={system.id} onClick={() => navigate(`/systems/${system.id}`)}>
                                    <td>{system.hardwareMake}</td>
                                    <td>{system.hardwareModel}</td>
                                    <td>{system.softwareName}</td>
                                    <td>{system.softwareVersion}</td>
                                </StyledRow>
                            )
                        })}
                    </tbody>
                </table>
            </TableWrapper>
            <CreateSystem onSuccess={getData} />
        </div>
    )
}
export default SystemList
