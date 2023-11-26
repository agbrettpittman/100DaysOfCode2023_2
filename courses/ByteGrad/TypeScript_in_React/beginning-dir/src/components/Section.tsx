import { ReactNode } from "react"

type SectionProps = {
    title?: string
    children: ReactNode
}

export default function Section({title = "Sub Heading", children}: SectionProps) {
    return (
        <section>
            <h2>{title}</h2>
            {children}
        </section>
    )
}