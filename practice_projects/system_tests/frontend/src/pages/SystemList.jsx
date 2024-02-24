import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

const StyledRow = styled.tr`
    cursor: pointer;
    &:hover {
        background-color: #0080ff61;
    }
`

function SystemList() {
    const [Data, setData] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        axios
            .get("http://localhost:8000/systems")
            .then((res) => {
                setData(res.data)
            })
            .catch((err) => console.log(err))
    }, [])

    return (
        <div>
            <h2>Systems</h2>
            <table className="striped">
                <thead>
                    <tr>
                        <th>Make</th>
                        <th>Model</th>
                        <th>Software</th>
                        <th>Version</th>
                    </tr>
                </thead>
                {Data.map((system) => {
                    return (
                        <tbody key={system.id}>
                            <StyledRow onClick={() => navigate(`/systems/${system.id}`)}>
                                <td>{system.hardwareMake}</td>
                                <td>{system.hardwareModel}</td>
                                <td>{system.softwareName}</td>
                                <td>{system.softwareVersion}</td>
                            </StyledRow>
                        </tbody>
                    )
                })}
            </table>
        </div>
    )
}
export default SystemList
