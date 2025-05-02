import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DocumentListPage from './pages/DocumentListPage';
import Editor from './pages/Editor';
import { ToastContainer } from 'react-toastify';
import useApiHealth from './hooks/useApiHealth';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  // Check API health on startup
  useApiHealth();

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<DocumentListPage />} />
          <Route path="/doc/:id" element={<Editor />} />
        </Routes>
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;
