import { useEffect, useState } from 'react'
import { collection, onSnapshot, setDoc, doc, getDoc, getDocs, query, updateDoc, deleteDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { Modal, Button, Container, Card, Row, Col } from 'react-bootstrap'

import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import '../css/fonts.css'

export default function Game() {
  const [history, setHistory] = useState([Array(25).fill(null)])
  const [yourSquars, setYourSquars] = useState([])
  const [opponentSquars, setOpponentSquars] = useState([])
  const [turnBase, setTurnBase] = useState("")
  const [stepNumber, setStepNumber] = useState(0)
  const [gameExpired, setGameExpired] = useState(false)
  const [countDown, setCountDown] = useState(5)
  const [modalShow, setModalShow] = useState(false)
  const [acceptPosistion, setAcceptPosition] = useState(false)
  const { value: { currentUser } } = useAuth()
  const navigate = useNavigate()
  const player = currentUser.email.split("@")[0]
  const width = 5
  const boardRole = {
    "yourBoard": "yourBoard",
    "opponentBoard": "opponentBoard"
  }

  useEffect(() => {
    setTimeout(() => {
      // isGameExpired()
    }, 1000)
  }, [])

  useEffect(() => {
    // const interval = setInterval(() => {
    //   if (countDown < 0) {
    //     isGameExpired()
    //   }
    //   else {
    //     setCountDown(countDown - 1)
    //   }
    // }, 1000)
    // return () => clearInterval(interval)
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
    return display
  }

  const handleClose = () => {
    navigate('/')
  }

  const boardStyle = {
    width: '350px',
    height: '350px',
    display: 'grid',
    gridTemplate: 'repeat(' + width + ', 1fr) / repeat(' + width + ', 1fr)',
  }

  const boardGrid = {

  }

  const Board = ({ squares, onClick = () => { }, role }) => {
    const _squares = []
    for (var i = 0; i < width * width; i++) {
      const _currentSquare = <div id={i} style={{ border: '1px solid hsla(0, 0%, 100%, .2)' }} />
      _squares.push(_currentSquare)
      // if (role === boardRole.yourBoard) {
      //   setYourSquars(yourSquars => [...yourSquars, _currentSquare])
      // }
      // else if (role === boardRole.opponentBoard) {
      //   setOpponentSquars(opponentSquars => [...opponentSquars, _currentSquare])
      // }
    }
    return (
      <div className={role} style={{ padding: '0', width: '300px', height: '300px', display: 'grid', backgroundColor: 'hsl(200, 100%, 50%)', gridTemplateRows: 'repeat(' + width + ', 1fr)', gridTemplateColumns: 'repeat(' + width + ', 1fr)' }}>
        {_squares}
      </div>
    )
    // return (
    //   <div style={boardStyle}>
    //     {squares.map((square, i) => {
    //       return (
    //         <Square key={i} value={square} onClick={() => onClick(i)} />
    //       )
    //     })}
    //   </div>
    // )
  }

  const Square = ({ value, onClick }) => {
    const style = value ? `squares ${value}` : `squares`
    return (
      <button className={style} onClick={onClick}>
        {value}
      </button>
    )
  }

  const buttonStyle = {
    backgroundColor: 'orange',
    borderRadius: '50px',
    fontWeight: 'bold',
    fontSize: '20px',
    fontStyle: 'italic',
    fontFamily: 'Bangers',
    boxShadow: '5px 10px #cc7512',
    width: '200px'
  }

  const randomPosition = () => {
    console.log('random')
  }

  const acceptPosition = () => {
    setAcceptPosition(true)
  }

  const acceptNext = () => {
    console.log('accept next')
  }

  const handleClick = (i) => {
    const historyPoint = history.slice(0, stepNumber + 1)
    const current = historyPoint[stepNumber]
    const squares = [...current]
    squares[i] = 'X'
    setHistory([...historyPoint, squares])
    setStepNumber(historyPoint.length)
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
          <Card.Header>
            <div className='d-flex justify-content-between'>
              <p style={{ fontFamily: 'Bangers', fontSize: '25px', marginBottom: '0px' }}>Time {getCownDownValues(countDown)}</p>
              <p style={{ fontFamily: 'Bangers', fontSize: '25px', marginBottom: '0px' }}>Your Time 00:30</p>
            </div>
          </Card.Header>
          <Card.Body>
            <Row className='mb-3'>
              {/* <p style={{ fontFamily: 'Bangers', fontSize: '25px' }}>prepare your board</p> */}
              {/* <p style={{ fontFamily: 'Bangers', fontSize: '25px' }}>your turn</p> */}
              <p style={{ fontFamily: 'Bangers', fontSize: '25px' }}>choose space to fire your opponent</p>
            </Row>
            <Row className='d-flex justify-content-center'>
              <Col>
                <Row>
                  <p style={{ fontFamily: 'Bangers', fontSize: '25px' }}>Your Board</p>
                </Row>
                <Row className='d-flex justify-content-center'>
                  <Board squares={yourSquars} role={'yourBoard'} />
                </Row>
              </Col>
              <Col>
                <Row>
                  <p style={{ fontFamily: 'Bangers', fontSize: '25px' }}>Opponent Board</p>
                </Row>
                <Row className='d-flex justify-content-center'>
                  <Board squares={opponentSquars} role={'opponentBoard'} />
                </Row>
              </Col>
            </Row>
            <Row>
              {acceptPosistion &&
                <Container>
                  <Row className='mt-4 justify-content-center'>
                    <Button style={buttonStyle} onClick={acceptNext}>a c c e p t</Button>
                  </Row>
                </Container>}
              {!acceptPosistion &&
                <Container>
                  <Row className='mt-4 mb-4 justify-content-center'>
                    <Button style={buttonStyle} onClick={randomPosition}>r a n d o m</Button>
                  </Row>
                  <Row className='justify-content-center'>
                    <Button style={buttonStyle} onClick={acceptPosition}>a c c e p t</Button>
                  </Row>
                </Container>}
            </Row>
          </Card.Body>
        </Card>
      </Container>}
    </>
  )
}
