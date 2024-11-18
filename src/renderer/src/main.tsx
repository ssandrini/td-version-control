import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import "@fontsource/montserrat"
import "@fontsource/montserrat/700.css"
import log from 'electron-log/renderer.js';
import {Toaster} from "./components/ui/toaster";

ReactDOM.createRoot(document.getElementById('root')!).render(<>
    <Toaster/>
    <App/>
</>)

// Use contextBridge
// @ts-ignore
window.ipcRenderer.on('main-process-message', (_event, message) => {
    log.info(message)
})
