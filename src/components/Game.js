import { useEffect, useState } from 'react'
import { collection, onSnapshot, setDoc, doc, getDoc, getDocs, query, updateDoc, deleteDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { Modal, Button, Container, Card, Row, Col } from 'react-bootstrap'

import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import '../css/fonts.css'
import '../css/style.css'

export default function Game() {
  const [gameExpired, setGameExpired] = useState(false)
  const [countDown, setCountDown] = useState(5)
  const [modalShow, setModalShow] = useState(false)
  const [acceptPosistion, setAcceptPosition] = useState(false)
  const { value: { currentUser } } = useAuth()
  const navigate = useNavigate()
  const player = currentUser.email.split("@")[0]
  const width = 6
  const boardRole = {
    "yourBoard": "yourBoard",
    "opponentBoard": "opponentBoard"
  }

  const shipArray = [
    {
      name: 'destroyer',
      directions: [
        [0],
        [0]
      ]
    },
    {
      name: 'submarine',
      directions: [
        [0, 1],
        [0, width]
      ]
    },
    {
      name: 'battleship',
      directions: [
        [0, 1, 2],
        [0, width, width * 2]
      ]
    },
  ]

  const generate = (ship) => {
    let randomDirection = Math.floor(Math.random() * ship.directions.length)
    let current = ship.directions[randomDirection]
    let direction = 1
    if (randomDirection === 0) direction = 1
    if (randomDirection === 1) direction = 5
    let randomStart = Math.abs(Math.floor(Math.random() * (width * width - 1) - (ship.directions[0].length * direction)))
    const isTaken = current.some(index => document.getElementById('y' + (randomStart + index)).classList.contains('taken'))
    const isAtRightEdge = current.some(index => (randomStart + index) % width === width - 1)
    const isAtLeftEdge = current.some(index => (randomStart + index) % width === 0)

    if (!isTaken && !isAtRightEdge && !isAtLeftEdge) {
      if (current.length > 1) {
        let directionLine = current[1] - current[0] === 1 ? 'horizontal' : 'vertical'
        current.forEach((value, index) => {
          const _direction = ship.directions[0]
          let directionClass
          if (index === 0) directionClass = 'start'
          if (index === _direction.length - 1) directionClass = 'end'
          return document.getElementById('y' + (randomStart + value)).setAttribute("class", `taken ${directionClass} ${directionLine} ${ship.name}`)
        })
      }
      else {
        return document.getElementById('y' + (randomStart)).setAttribute("class", `taken center ${ship.name}`)
      }
    }
    else generate(ship)
  }

  const resetBoard = () => {
    for (let i = 0; i < width * width; i++) {
      document.getElementById('y' + (i)).setAttribute("class", "")
    }
  }

  const randomPosition = () => {
    resetBoard()
    generate(shipArray[0])
    generate(shipArray[0])
    generate(shipArray[0])
    generate(shipArray[1])
    generate(shipArray[1])
    generate(shipArray[2])
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

  const boardGrid = {
    padding: '0',
    width: '300px',
    height: '300px',
    display: 'grid',
    backgroundColor: 'hsl(200, 100%, 50%)',
    gridTemplateRows: 'repeat(' + width + ', 1fr)',
    gridTemplateColumns: 'repeat(' + width + ', 1fr)'
  }

  const onClickSquare = (e) => {
    if (e.currentTarget.id.indexOf('o') !== -1) {
      console.log(e.currentTarget.id)
      document.getElementById(e.currentTarget.id).setAttribute("class", "boom")
    }
  }

  const Board = ({ role }) => {
    const _squares = []
    for (var i = 0; i < width * width; i++) {
      const _currentSquare = <div id={(role === boardRole.opponentBoard ? 'o' : 'y') + i} style={{ border: '1px solid hsla(0, 0%, 100%, .2)' }} onClick={onClickSquare} />
      _squares.push(_currentSquare)
    }
    return (
      <div className={role} style={boardGrid}>
        {_squares}
      </div>
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

  const acceptPosition = () => {
    console.log('accept')
    for (let i = 0; i < width * width; i++) {
      console.log(document.getElementById('y' + (i)).classList.value)
    }
    // setAcceptPosition(true)
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
                  <Board role={'yourBoard'} />
                </Row>
              </Col>
              <Col>
                <Row>
                  <p style={{ fontFamily: 'Bangers', fontSize: '25px' }}>Opponent Board</p>
                </Row>
                <Row className='d-flex justify-content-center'>
                  <Board role={'opponentBoard'} />
                </Row>
              </Col>
            </Row>
            <Row>
              {acceptPosistion &&
                <Container>
                  <Row className='mt-4 justify-content-center'>
                    {/* <Button style={buttonStyle} onClick={acceptNext}>a c c e p t</Button> */}
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
