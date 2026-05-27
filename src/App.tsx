import { useState } from 'react'
import './lib/supabase'
import './lib/groq'
import './App.css'
import { HomePage } from './pages/HomePage'
import { FridgePage } from './pages/FridgePage'

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'fridge'>('home')

  return (
    <>
      {currentPage === 'home' ? (
        <HomePage onNavigate={setCurrentPage} />
      ) : (
        <FridgePage onNavigate={setCurrentPage} />
      )}
    </>
  )
}

export default App
