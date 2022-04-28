import { useEffect, useState } from 'react'
import { collection, onSnapshot, setDoc, doc, getDoc, getDocs, query, updateDoc, deleteDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { Modal, Button, Container, Card, Row, Col } from 'react-bootstrap'

import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import '../css/fonts.css'
import '../css/style.css'

export default function Game() {
  const [isFoundHost, setIsFoundHost] = useState(false);
  const [isInitBoardGame, setIsBoardGame] = useState(true);
  const [ourBoard, setOurboard] = useState(Array(36).fill(null));
  const [otherBoard, setOtherboard] = useState(Array(36).fill(null));
  const [currentData, setCurrentData] = useState({});
  const [hostname, setHostname] = useState("");
  const { value: { currentUser } } = useAuth();
  const navigate = useNavigate();
  const player = currentUser.email.split("@")[0];
  const width = 6;

  useEffect(() => {
    if (!isFoundHost) {
      findingHost()
    }
    else {
      if (!isInitBoardGame) {
        console.log('do init')
        initBoardGame();
      }
    }
  }, [isFoundHost])

  const findingHost = async () => {
    const q = query(collection(db, 'playing'));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.docs.length) {
      setIsFoundHost(true);
      const gameDataOnce = querySnapshot.docs.find(v => {
        return v.data().host === player || v.data().guest === player
      });
      setHostname(gameDataOnce.data().host);
      if (!gameDataOnce.data().gameInit) {
        setIsBoardGame(false);
      }
    }
    else {
      setIsFoundHost(false);
    }
  }

  const initBoardGame = async () => {
    const docRef = doc(db, 'playing', hostname);
    const payload = {
      gameInfo: {
        gamePlay: {
          host: {},
          guest: {},
        },
        gameSet: {
          host: {},
          guest: {},
        },
        turn: hostname
      },
      gameInit: true
    };
    for (let i = 0; i < width * width; i++) {
      payload.gameInfo.gamePlay.host[i] = '';
      payload.gameInfo.gamePlay.guest[i] = '';
      payload.gameInfo.gameSet.host[i] = '';
      payload.gameInfo.gameSet.guest[i] = '';
    }
    await updateDoc(docRef, payload);
  }

  useEffect(() => {
    if (hostname) {
      playingGame();
    }
  }, [hostname])

  const playingGame = () => {
    const docRef = doc(db, 'playing', hostname);
    onSnapshot(docRef, async (snapshot) => {
      const snapData = snapshot.data();
      setCurrentData(snapData);
      gameEvent(snapData);
    })
  }

  const gameEvent = (snapData) => {
    const yourRole = player === hostname ? "host" : "guest";
    if (snapData?.gameInfo?.gamePlay && snapData?.gameInfo?.gameSet) {
      const otherPlay = yourRole === "host" ? snapData?.gameInfo?.gamePlay?.guest : snapData?.gameInfo?.gamePlay?.host;
      const ourPlay = snapData?.gameInfo?.gamePlay[yourRole];
      const myBoard = snapData?.gameInfo?.gameSet[yourRole];
      const otherBoard = yourRole === "host" ? snapData?.gameInfo?.gameSet?.guest : snapData?.gameInfo?.gameSet?.host;
      for (const i in otherPlay) {
        if (otherPlay[i] === "x" && myBoard[i].indexOf("taken") >= 0) {
          if (myBoard[i].indexOf("boom") === -1) {
            myBoard[i] = myBoard[i].concat(" ", "boom");
          }
        }
        else if (otherPlay[i] === "x") {
          if (myBoard[i].indexOf("miss") === -1) {
            myBoard[i] = myBoard[i].concat(" ", "miss");
          }
        }
      }
      for (const i in ourPlay) {
        if (ourPlay[i] === "x" && otherBoard[i].indexOf("taken") >= 0) {
          if (otherBoard[i].indexOf("boom") === -1) {
            otherBoard[i] = "boom";
          }
        }
        else if (ourPlay[i] === "x") {
          if (otherBoard[i].indexOf("miss") === -1) {
            otherBoard[i] = "miss";
          }
        }
      }
      setOurboard(myBoard);
      setOtherboard(otherBoard);
    }
  }

  const onFire = async (e) => {
    if (e.currentTarget.id.indexOf('o') !== -1 && hostname) {
      const id = e.currentTarget.id.split("o")[1];
      const docRef = doc(db, 'playing', hostname);
      const newCurrentData = currentData;
      if (player === hostname) {
        newCurrentData.gameInfo.gamePlay.host[id] = 'x';
      }
      else {
        newCurrentData.gameInfo.gamePlay.guest[id] = 'x';
      }
      await updateDoc(docRef, newCurrentData);
    }
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

  const YourBoard = ({ }) => {
    const _squares = []
    for (var i = 0; i < width * width; i++) {
      const id = 'y' + i
      const _currentSquare = <div id={id} className={ourBoard[i]} style={{ border: '1px solid hsla(0, 0%, 100%, .2)' }} onClick={onFire} />
      _squares.push(_currentSquare)
    }
    return (
      <div style={boardGrid}>
        {_squares}
      </div>
    )
  }

  const OpponentBoard = ({ }) => {
    const _squares = []
    for (var i = 0; i < width * width; i++) {
      const id = 'o' + i
      const _currentSquare = <div id={id} className={otherBoard[i]} style={{ border: '1px solid hsla(0, 0%, 100%, .2)' }} onClick={onFire} />
      _squares.push(_currentSquare)
    }
    return (
      <div style={boardGrid}>
        {_squares}
      </div>
    )
  }

  return (
    <>
      <Container>
        <h1 className='text-center mb-4'>WARSHIP</h1>
        <Card className='text-center bg-transparent border-0'>
          <Card.Body>
            <Row className='d-flex justify-content-center'>
              <Col>
                <Row>
                  <p style={{ fontFamily: 'Bangers', fontSize: '25px' }}>Your Board</p>
                </Row>
                <Row className='d-flex justify-content-center'>
                  <YourBoard />
                </Row>
              </Col>
              <Col>
                <Row>
                  <p style={{ fontFamily: 'Bangers', fontSize: '25px' }}>Opponent Board</p>
                </Row>
                <Row className='d-flex justify-content-center'>
                  <OpponentBoard />
                </Row>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </>
  )
}
