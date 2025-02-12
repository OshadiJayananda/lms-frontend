import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import necessary routing components
import { ToastContainer } from 'react-toastify'; // Import ToastContainer
import Home from './Components/Home';
import Login from './Components/Login';
import SignIn from './Components/SignIn';
import Dashboard from './User/Dashboard';
import SideBar from './Components/SideBar';
import Categories from './Admin/Categories';
import AdminDashboard from './Admin/AdminDashboard';

function App() {
  return (
    <Router>
      <div>
        <ToastContainer />
        <Routes>
          
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signIn" element={<SignIn />} />
          <Route path="/sideBar" element={<SideBar />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/adminDashboard" element={<AdminDashboard/>} />
          <Route path="/categories" element={<Categories />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
