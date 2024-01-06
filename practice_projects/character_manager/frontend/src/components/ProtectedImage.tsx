import React, { useState, useEffect } from "react"
import { getFile } from "@/apiCalls"

export default function ProtectedImage({ fileId="", alt="", ...props }) {

    const [ImageData, setImageData] = useState({ src: "", alt: "" })

    useEffect(() => {
        getFile(fileId).then( async (res) => {
            setImageData({ src: URL.createObjectURL(res.data), alt })
        }).catch((err) => {
            console.log(err)
            setImageData({ src: "", alt: "Failed To Load Image" })
        })
    }, [fileId, alt])

    return <img src={ImageData.src} alt={ImageData.alt} {...props} />
}
