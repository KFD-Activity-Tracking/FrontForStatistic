import { useState } from "react"

function LoginPage({ onLogin }) {

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    
    async function handleLogin(){
        const response = await fetch("/auth/login", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password})
        })
        const data = await response.json()
        if (!response.ok || !data.token){
            setError("Неверный логин/пароль")
            return 
        }
        localStorage.setItem('token', data.token)
        onLogin()
    }

    return(
        <div className="login-wrapper">
            <div className="login-card">
                <h2>Вход</h2>
                <input
                    placeholder="Логин" value={username} onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    placeholder="Пароль" type='password' value={password} onChange={(e) => setPassword(e.target.value)}
                />
                <button onClick={handleLogin}>Войти</button>
                {error && <div className="error-msg">{error}</div>}
            </div>
        </div>
    )
}

export default LoginPage