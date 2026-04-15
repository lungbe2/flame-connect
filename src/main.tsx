import ReactDOM from 'react-dom/client'
import App from './App'

console.log("Root element:", document.getElementById('root'))
console.log("App component:", App)

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
