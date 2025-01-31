import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import necessary routing components
import { ToastContainer } from 'react-toastify'; // Import ToastContainer
import Home from './Components/Home';

function App() {
  return (
    <Router>
      <div>
        <ToastContainer />
        <Routes>
          
          <Route path="/" element={<Home />} />
          {/* <Route path="/signIn" element={<SignIn />} />
          <Route path="/addPost" element={<Post />} />
          <Route path="/addBook" element={<Book />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
