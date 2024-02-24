import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import styled from "styled-components"

export default function SingleSystem() {
    const { id } = useParams()
    const [Data, setData] = useState([])

    useEffect(() => {
        if (!id || Number.isNaN(Number(id))) {
            setData([])
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

    console.log(Data)

    return (
        <div>
            <h1>{Data.name}</h1>
            <p>
                <strong>Make: </strong>
                {Data.hardwareMake}
            </p>
            <p>
                <strong>Model: </strong>
                {Data.hardwareModel}
            </p>
            <p>
                <strong>Software: </strong>
                {Data.softwareName}
            </p>
            <p>
                <strong>Version: </strong>
                {Data.softwareVersion}
            </p>
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
