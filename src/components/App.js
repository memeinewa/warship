import { Container } from "react-bootstrap"
import { Route, Routes } from "react-router-dom"

import AuthProvider from "../contexts/AuthContext"
import PrivateRoute from "./PrivateRoute"
import Signin from "./Signin"
import Home from "./Home"
import Play from "./Play"
import Howto from "./Howto"
import Setting from "./Setting"

function App() {
  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div className="w-100" style={{ maxWidth: '420px' }}>
        <AuthProvider>
          <Routes>
            <Route exact path='/' element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            } />
            <Route exact path='/play' element={
              <PrivateRoute>
                <Play />
              </PrivateRoute>
            } />
            <Route exact path='/howto' element={
              <PrivateRoute>
                <Howto />
              </PrivateRoute>
            } />
            <Route exact path='/setting' element={
              <PrivateRoute>
                <Setting />
              </PrivateRoute>
            } />
            <Route path='/signIn' element={<Signin />} />
          </Routes>
        </AuthProvider>
      </div>
    </Container>
  )
}

export default App
