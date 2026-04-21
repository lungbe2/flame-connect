import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import AdminPortalApp from './AdminPortalApp'
import './App.css'

const isAdminRoute = window.location.pathname.toLowerCase().startsWith('/admin')

ReactDOM.createRoot(document.getElementById('root')!).render(
  isAdminRoute ? <AdminPortalApp /> : <App />
)
