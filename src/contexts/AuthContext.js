import { useContext, useEffect, useState, createContext } from 'react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'

export const AuthContext = createContext()

export const useAuth = () => {
    const authContext = useContext(AuthContext)
    return authContext
}

export default function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState()
    const [loading, setLoading] = useState(true)

    function signup(username, password) {
        const email = username + "@gmail.com"
        return createUserWithEmailAndPassword(auth, email, password)
    }

    function signin(username, password) {
        const email = username + "@gmail.com"
        return signInWithEmailAndPassword(auth, email, password)
    }

    function signout() {
        return auth.signOut()
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user)
            setLoading(false)
        })

        return unsubscribe
    }, [])

    const value = {
        currentUser,
        signup,
        signin,
        signout
    }

    return (
        <AuthContext.Provider value={{ value }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}
