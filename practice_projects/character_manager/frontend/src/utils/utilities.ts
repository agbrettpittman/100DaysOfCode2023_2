import { getFile } from "@/apiCalls"

export function parseAccessToken(){
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken){
        const payload = JSON.parse(atob(accessToken.split('.')[1]))
        return payload
    }
    return null
}

export async function getProtectedFileProps(fileId="", alt=""): Promise<{src: string, alt: string}>{
    try {
        const Response = await getFile(fileId)
        return { 
            src: URL.createObjectURL(Response.data), 
            alt 
        }
    } catch {
        return {
            src: "",
            alt: "Failed To Load Image"
        }
    }
}