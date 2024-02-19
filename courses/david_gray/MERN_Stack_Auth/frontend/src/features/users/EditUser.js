import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useGetUsersQuery } from "./usersApiSlice"
import PulseLoader from "react-spinners/PulseLoader"

const EditUser = () => {
    const { id } = useParams()

    const { user } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
            user: data?.entities[id],
        }),
    })

}
export default EditUser