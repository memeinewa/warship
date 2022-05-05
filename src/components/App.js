import { Container } from "react-bootstrap"
import { Route, Routes } from "react-router-dom"

import AuthProvider from "../contexts/AuthContext"
import PrivateRoute from "./PrivateRoute"
import bg from "../images/bg.png"
import Signin from "./Signin"
import Home from "./Home"
import Play from "./Play"
import Howto from "./Howto"
import Ranking from "./Ranking"
import Game from "./Game"

function App() {
  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundImage: `url(${bg})`, maxWidth: '100%' }}>
      <AuthProvider>
        <Routes>
          <Route exact path='/' element={
            <PrivateRoute>
              <div className="w-100" style={{ maxWidth: '420px' }}>
                <Home />
              </div>
            </PrivateRoute>
          } />
          <Route exact path='/play' element={
            <PrivateRoute>
              <div className="w-100" style={{ maxWidth: '420px' }}>
                <Play />
              </div>
            </PrivateRoute>
          } />
          <Route exact path='/game' element={
            <PrivateRoute>
              <div className="w-100" style={{ maxWidth: '800px' }}>
                <Game />
              </div>
            </PrivateRoute>
          } />
          <Route exact path='/howto' element={
            <PrivateRoute>
              <div className="w-100" style={{ maxWidth: '800px' }}>
                <Howto />
              </div>
            </PrivateRoute>
          } />
          <Route exact path='/ranking' element={
            <PrivateRoute>
              <div className="w-100" style={{ maxWidth: '420px' }}>
                <Ranking />
              </div>
            </PrivateRoute>
          } />
          <Route path='/signIn' element={
            <div className="w-100" style={{ maxWidth: '420px' }}>
              <Signin />
            </div>
          } />
        </Routes>
      </AuthProvider>
    </Container >
  )
}

export default App
