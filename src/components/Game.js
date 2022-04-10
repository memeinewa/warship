import { useEffect, useState } from 'react'
import { collection, onSnapshot, setDoc, doc, getDoc, getDocs, query, updateDoc, deleteDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { Modal, Button, Container, Card } from 'react-bootstrap'

import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import '../css/fonts.css'

export default function Game() {
  const [gameExpired, setGameExpired] = useState(false)
  const [countDown, setCountDown] = useState(5)
  const [modalShow, setModalShow] = useState(false)
  const { value: { currentUser } } = useAuth()
  const navigate = useNavigate()
  const player = currentUser.email.split("@")[0]

  useEffect(() => {
    setTimeout(() => {
      isGameExpired()
    }, 1000)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (countDown < 0) {
        goExpire()
      }
      else {
        setCountDown(countDown - 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [countDown])

  const goExpire = () => {
    setGameExpired(true)
    setModalShow(true)
  }

  const isGameExpired = async () => {
    const q = query(collection(db, 'playing'))
    const querySnapshot = await getDocs(q)
    if (querySnapshot.docs.length) {
      const isPlayingGame = querySnapshot.docs.find(v => {
        return v.data().host === player || v.data().guess === player
      })
      if (isPlayingGame) {
        if (isPlayingGame.data().expireDate.seconds < Math.floor(Date.now() / 1000)) {
          goExpire()
          const docRef = doc(db, 'playing', isPlayingGame.data().host)
          await deleteDoc(docRef)
        }
        else {
          setCountDown(isPlayingGame.data().expireDate.seconds - Math.floor(Date.now() / 1000))
        }
      }
      else {
        goExpire()
      }
    }
    else {
      goExpire()
    }
  }

  const getCownDownValues = (countDown) => {
    const minutes = Math.floor(countDown / 60)
    const seconds = Math.floor(countDown % 60)
    let display = minutes < 10 ? `0${minutes}` : `${minutes}`
    display = seconds < 10 ? `${display}:0${seconds}` : `${display}:${seconds}`
    if (minutes < 0 || seconds < 0) {
      display = '00:00'
    }
    return display;
  };

  const handleClose = () => {
    navigate('/')
  }

  return (
    <>
      {gameExpired &&
        <Modal show={modalShow} >
          <Modal.Header closeButton>
            <Modal.Title>เกมจบแล้ว</Modal.Title>
          </Modal.Header>
          <Modal.Footer>
            <Button onClick={handleClose}>Close</Button>
          </Modal.Footer>
        </Modal>
      }
      {!gameExpired && <Container>
        <h1 className='text-center mb-4'>WARSHIP</h1>
        <Card className='text-center bg-transparent border-0'>
          <Card.Header>Time {getCownDownValues(countDown)}</Card.Header>
          <Card.Body>
            <div>TABLE 2</div>
            <div>TABLE 1</div>
            <Button>Random</Button>
            <Button>Accept</Button>
          </Card.Body>
        </Card>
      </Container>}
    </>
  )
}
