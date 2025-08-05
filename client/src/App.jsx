
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AuthPage from './pages/Authpage/Authpage'
import DashboardPage from './pages/Dashboard/Dashboard'
import ProtectedLayout from './layout/ProtectedLayout'
import BoardPage from './pages/Board/Board'
import UserSettings from './pages/UserSettings/UserSettings'
import UserBoards from './pages/User/UserBoards'
import UserLists from './pages/User/UserLists'
import UserCards from './pages/User/UserCards'
import ListPage from './pages/List/List'



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />

        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/settings" element={<UserSettings />} />
          <Route path="/boards" element={<UserBoards />} />
          <Route path="/lists" element={<UserLists />} />
          <Route path="/cards" element={<UserCards />} />
          <Route path="/board/:id" element={<BoardPage />} />
          <Route path="/list/:id" element={<ListPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
