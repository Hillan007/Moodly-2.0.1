import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { inject } from '@vercel/analytics'
import './index.css'

// Initialize Vercel Analytics
inject()

createRoot(document.getElementById("root")!).render(<App />);
