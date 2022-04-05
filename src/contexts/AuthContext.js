import { useContext, useEffect, useState, createContext } from 'react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'

export const AuthContext = createContext()

export const useAuth = () => {
    const authContext = useContext(AuthContext);
    return authContext;
}

export default function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState()

    function signup(username, password) {
        const email = username + "@gmail.com";
        return createUserWithEmailAndPassword(auth, email, password);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            console.log(user);
            setCurrentUser(user);
        })

        return unsubscribe
    }, [])

    function signin(username, password) {
        const email = username + "@gmail.com";
        return signInWithEmailAndPassword(auth, email, password)
    }

    const value = {
        currentUser,
        signup,
        signin
    }

    return (
        <AuthContext.Provider value={{ value }}>
            {children}
        </AuthContext.Provider>
    )
}
