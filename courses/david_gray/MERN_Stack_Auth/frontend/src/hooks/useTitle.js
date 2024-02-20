import { useEffect } from "react"
import { useLocation } from "react-router-dom"

export default function useTitle() {
    const Location = useLocation()
    useEffect(() => {
        const ValidModifiers = ["new", "edit"]
        const [rootLoc, subLoc, modifier] = Location.pathname.split("/").filter((loc) => loc)
        let newTitle = "Dan D. Repairs"
        if (modifier && ValidModifiers.includes(modifier)) {
            newTitle = `DDR | ${subLoc} - ${modifier}`
        } else if (subLoc) {
            newTitle = `DDR | ${subLoc}`
        } else if (rootLoc) {
            newTitle = `DDR | ${rootLoc}`
        }

        const prevTitle = document.title
        document.title = newTitle

        return () => {
            document.title = prevTitle
        }
    }, [Location])
}
