import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import necessary routing components
import { ToastContainer } from 'react-toastify'; // Import ToastContainer
import Home from './Components/Home';
import Login from './Components/Login';
import SignIn from './Components/SignIn';
import Dashboard from './User/Dashboard';

function App() {
  return (
    <Router>
      <div>
        <ToastContainer />
        <Routes>
          
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signIn" element={<SignIn />} />
          <Route path="/dashboard" element={<Dashboard />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
