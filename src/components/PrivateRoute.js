import { Navigate } from "react-router-dom"

import { useAuth } from "../contexts/AuthContext"

export default function PrivateRoute({ children }) {
  const { value: { currentUser } } = useAuth()

  return currentUser ? children : <Navigate to="/signIn" />
}