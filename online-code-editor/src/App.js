import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import LandingPage from './components/LandingPage';
import { AuthProvider } from './context/AuthContext';
import AuthForms from './components/AuthForms';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Editor from './components/CodeEditor/CodeEditor'; 

function App() {
  return (
      <Router>
    <AuthProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="login" element={<AuthForms type="login" />} />
            <Route path="signup" element={<AuthForms type="signup" />} />
            <Route 
              path="dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
         <Route path="editor">
       <Route path="new" element={<Editor />} />
      <Route path=":projectId" element={<Editor />} />
</Route>
          </Route>
        </Routes>
    </AuthProvider>
      </Router>

  );
}
export default App;
// import React from "react";
// import ProjectDashboard from "./components/ProjectDashboard";
// function App(){
//   <>
//   <ProjectDashboard/>
//   </>
// }
// export default App;
