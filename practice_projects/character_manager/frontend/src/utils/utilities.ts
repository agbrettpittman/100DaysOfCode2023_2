export function parseAccessToken(){
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken){
        const payload = JSON.parse(atob(accessToken.split('.')[1]))
        return payload
    }
    return null
}