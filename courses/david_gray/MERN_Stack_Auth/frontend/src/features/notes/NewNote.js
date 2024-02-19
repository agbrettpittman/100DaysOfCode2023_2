import { useSelector } from "react-redux"
import { selectAllUsers } from "../users/usersApiSlice"
import NewNoteForm from "./NewNoteForm"
import { useGetUsersQuery } from "../users/usersApiSlice"
import PulseLoader from "react-spinners/PulseLoader"

const NewNote = () => {
    const { users } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
            users: data?.ids.map((id) => data?.entities[id]),
        }),
    })

    if (!users?.length) return <p>Not Currently Available</p>

    return <NewNoteForm users={users} />
}
export default NewNote
