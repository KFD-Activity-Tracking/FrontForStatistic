import { useState } from "react"

function LoginPage({onLogin}){

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    
    async function handleLogin(){
        const response = await fetch("/auth/login", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password})
        })
        const data = await response.json()
        localStorage.setItem('token', data.token)
        onLogin()
    }

    return(
        <div>
            <input
                placeholder="Введите login" value={username} onChange={(e) => setUsername(e.target.value)}
            />
            <input
                placeholder="Введите password" type='password' value={password} onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Войти</button>
        </div>
    )
}

export default LoginPage