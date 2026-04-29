import { useState } from 'react'
import './App.css'
import LoginPage from './LoginPage'
import UsersPage from './UsersPage'
import UserDetailPage from './UserDetailPage'

function App() {
  const [page, setPage] = useState("login")
  const [userId, setUserId] = useState(null)

  return (
    <div>
      {page == "login" && <LoginPage onLogin={() => setPage("users")}/>}
      {page == "users" && <UsersPage 
        onUser={(id) => {setUserId(id); setPage("user-detail")}}
        onLogout = {() => {localStorage.removeItem('token'); setPage("login")}}
      />}
      {page == "user-detail" && <UserDetailPage userId = {userId} onBack={() => setPage("users")}/>}
    </div>  
  )
}

export default App
