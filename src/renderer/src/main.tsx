import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import "@fontsource/montserrat"
import "@fontsource/montserrat/700.css"
import {Toaster} from "./components/ui/toaster";

ReactDOM.createRoot(document.getElementById('root')!).render(<>
    <Toaster/>
    <App/>
</>)
