import { useState } from 'react'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import QuizApp from './components/QuizApp'

function App() {


  return (
   <>
   <BrowserRouter>
   <Routes>
    <Route path="/" element={<QuizApp/>}  />
   </Routes>
   </BrowserRouter>

   </>
  )
}

export default App
