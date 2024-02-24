import { useParams } from "react-router-dom"

export default function SingleSystem() {
    const { id } = useParams()
    return <div>Information for System with id: {id}</div>
}
