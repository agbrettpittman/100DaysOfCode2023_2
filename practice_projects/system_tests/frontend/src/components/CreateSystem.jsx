import axios from "axios"
import { useState } from "react"

export default function CreateSystem({ onSuccess }) {
    const [Values, setValues] = useState({
        hardwareMake: "",
        hardwareModel: "",
        softwareName: "",
        softwareVersion: "",
    })

    function handleChange(e) {
        setValues((prev) => {
            return {
                ...prev,
                [e.target.name]: e.target.value,
            }
        })
    }

    function handleSubmit(e) {
        e.preventDefault()
        axios
            .post("http://localhost:8000/systems", Values)
            .then((res) => {
                console.log(res)
                onSuccess()
            })
            .catch((err) => console.log(err))
    }

    return (
        <details>
            <summary role="button" class="outline">
                Add New System
            </summary>
            <div className="grid">
                <input
                    type="text"
                    placeholder="Make"
                    name="hardwareMake"
                    value={Values.hardwareMake}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    placeholder="Model"
                    name="hardwareModel"
                    value={Values.hardwareModel}
                    onChange={handleChange}
                />
            </div>
            <div className="grid">
                <input
                    type="text"
                    placeholder="Software"
                    name="softwareName"
                    value={Values.softwareName}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    placeholder="Version"
                    name="softwareVersion"
                    value={Values.softwareVersion}
                    onChange={handleChange}
                />
            </div>
            <button onClick={handleSubmit}>Add System</button>
        </details>
    )
}
