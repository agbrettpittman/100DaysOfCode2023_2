import { useParams } from "react-router-dom"
import EditNoteForm from "./EditNoteForm"
import { useGetNotesQuery } from "./notesApiSlice"
import { useGetUsersQuery } from "../users/usersApiSlice"
import useAuth from "../../hooks/useAuth"

const EditNote = () => {
    const { id } = useParams()

    const { username, isManager, isAdmin } = useAuth()

    const { note } = useGetNotesQuery("notesList", {
        selectFromResult: ({ data }) => ({
            note: data?.entities[id],
        }),
    })

    const { users } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
            users: data?.ids.map((id) => data?.entities[id]),
        }),
    })
    if (!isManager && !isAdmin && note.username !== username) return <p className="errmsg">No Access</p>

    return <EditNoteForm note={note} users={users} />
}
export default EditNote
