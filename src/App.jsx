import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserList from './pages/UserList';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  return (
      <Router>
          <Routes>
              <Route path="/" element={<UserList />} />
              <Route path="*" element={<NotFound />} />
          </Routes>
      </Router>
  )
}

export default App
