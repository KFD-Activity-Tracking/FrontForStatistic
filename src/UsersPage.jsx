import { useEffect, useState } from "react"

function UserPage({onUser}){
    const [users, setUsers] = useState([])

    useEffect(() => {
        async function loadUsers(){
            const token = localStorage.getItem('token')
            const response = await fetch('/api/users/all',{
                headers: {'Authorization': 'Bearer ' + token}
            })
            const data = await response.json()
            setUsers(data)
        }
        loadUsers()
    },[])
    
    return(
        <div>
            {users.map(user =>(
                <button key = {user.id} onClick={() => onUser(user.id)}>
                    {user.username}
                </button>
            ))}
        </div>
    )
}

export default UserPage