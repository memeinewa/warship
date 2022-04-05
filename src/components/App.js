import { Container } from "react-bootstrap";
import { Route, Routes } from "react-router-dom";
import AuthProvider from "../contexts/AuthContext";

import Signin from "./Signin";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path='/' element={
          <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <div className="w-100" style={{ maxWidth: '420px' }}>
              <Signin />
            </div>
          </Container>
        } />
      </Routes>
    </AuthProvider>
  )
}

export default App;
