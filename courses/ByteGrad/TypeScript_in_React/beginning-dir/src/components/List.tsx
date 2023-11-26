import React, { ReactNode } from "react"

type ListProps<T> = {
    items: T[],
    render: (item: T) => ReactNode,
    icon?: ReactNode
}

export default function List<T,>({items, render, icon = <span>☢️</span>}: ListProps<T>):ReactNode {
    return (
        <div>
            {
                items.map((item, index) => (
                    <div key={index}>
                        {icon}
                        {render(item)}
                    </div>
                ))
            }
        </div>
    )
}
