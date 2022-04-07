import { Card, Spinner, Button } from 'react-bootstrap'
import { collection, onSnapshot, setDoc, doc, getDoc, getDocs, query, updateDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'

import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'

export default function Play() {
    const [snapStatus, setSnapStatus] = useState(false)
    const [playStatus, setPlayStatus] = useState(false)
    const [isWaiting, setIsWaiting] = useState(true)
    const { value: { currentUser } } = useAuth()
    const player = currentUser.email.split("@")[0]
    let isPlayStatus = false

    useEffect(() => {
        if (snapStatus) {
            const docRef = doc(db, 'waiting', player)
            onSnapshot(docRef, async (snapshot) => {
                const hostData = snapshot.data()
                if (hostData.guess) {
                    setPlayStatus(true)
                    setIsWaiting(false)
                }
            })
        }
        else {
            if (!playStatus) {
                room()
            }
        }
    }, [snapStatus])

    useEffect(() => {
        if (playStatus) {
            console.log('do play')
        }
    }, [playStatus])

    const room = async () => {
        const q = query(collection(db, 'waiting'))
        const querySnapshot = await getDocs(q)
        if (querySnapshot.docs.length) {
            const isHost = querySnapshot.docs.find(v => {
                return v.data().host === player
            })
            if (isHost) {
                setSnapStatus(true)
            }
            else {
                joiningRoom(querySnapshot.docs)
            }
        }
        else {
            await createRoom()
            setSnapStatus(true)
        }
    }

    const createRoom = async () => {
        const docRef = doc(db, 'waiting', player)
        const docSnap = await getDoc(docRef)
        if (!docSnap.exists()) {
            const payload = { host: player }
            await setDoc(docRef, payload)
        }
    }

    const joiningRoom = async (docs) => {
        if (!isPlayStatus) {
            const randomRoom = Math.floor(Math.random() * docs.length)
            const roomName = docs[randomRoom].id
            const docRef = doc(db, 'waiting', roomName)
            await updateDoc(docRef, { guess: player })
            isPlayStatus = true
            setPlayStatus(true)
            setIsWaiting(false)
        }
    }

    return (
        <>
            <h1 className='text-center mb-4'>WARSHIP</h1>
            <Card className='text-center bg-transparent border-0'>
                <Card.Body>
                    {isWaiting && <Button variant="primary" disabled><Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                    />&nbsp;&nbsp;Waiting...</Button>}
                </Card.Body>
            </Card>
        </>
    )
}
