import {useEffect, useState} from "react"

function UserDetailPage({userId, onBack}){
    const[actions, setActions] = useState([])
    const[statistics, setStatistics] = useState([])
    const[tab, setTab] = useState('statistics')
     
    useEffect(() => {
        async function loadActions() {
            const token = localStorage.getItem('token')
            const response = await fetch(`/api/actions/from/${userId}`, {
                headers:{'Authorization': 'Bearer ' + token}
            })
            const data = await response.json()
            setActions(data)
        }
        
        async function loadStatistics() {
            const token = localStorage.getItem('token')
            const response = await fetch(`/api/statistics/from/${userId}`,{
                headers:{'Authorization': 'Bearer ' + token}
            })
            const data = await response.json()
            setStatistics(data)
        }

        loadActions()
        loadStatistics()
    },[userId])

    return(
        <div>
            <button onClick={() => setTab('statistics')}>Статистика</button>
            <button onClick={() => setTab('actions')}>Действия</button>

            {tab == 'statistics' && (
                <div>
                    {statistics.map (stat => (
                        <div key = {stat.id}>{stat.date}</div>
                    ))}
                </div>
            )}

            {tab =='actions' && (
                <div>
                    {actions.map (action => (
                        <div key = {action.id}>{action.type}</div>
                    ))}
                </div>
            )}
            <button onClick={onBack}>Назад</button>
        </div>
    )
}

export default UserDetailPage