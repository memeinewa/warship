import { useEffect, useState } from 'react'
import { collection, onSnapshot, setDoc, doc, getDoc, getDocs, query, updateDoc, deleteDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { Spinner, Modal, Button, Container, Card, Row, Col } from 'react-bootstrap'

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
  const [gameState, setGameState] = useState("init");
  const [isRandom, setIsRandom] = useState(false);
  const [isRandoming, setIsRandoming] = useState(false);
  const [myRole, setMyRole] = useState("");
  const [hostname, setHostname] = useState("");
  const [winner, setWinner] = useState("");
  const [alertErrorState, setAlertErrorState] = useState(false);
  const [modalShowErrorState, setModalShowErrorState] = useState(false);
  const [alertWinnerState, setAlertWinnerState] = useState(false);
  const [modalShowWinnerState, setModalShowWinnerState] = useState(false);
  const [alertFireState, setAlertFireState] = useState(false);
  const [modalShowFireState, setModalShowFireState] = useState(false);
  const [whoseTurn, setWhoseTurn] = useState("");
  const [gamePhase, setGamePhase] = useState(0);
  const { value: { currentUser } } = useAuth();
  const navigate = useNavigate();
  const player = currentUser.email.split("@")[0];
  const width = 6;

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
  ];

  useEffect(() => {
    if (!isFoundHost) {
      setTimeout(() => {
        findingHost();
      }, 500);
    }
    else {
      if (!isInitBoardGame) {
        initBoardGame();
      }
    }
  }, [isFoundHost])

  const findingHost = async () => {
    const q = query(collection(db, 'playing'));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.docs.length) {
      const gameDataOnce = querySnapshot.docs.find(v => {
        return v.data().host === player || v.data().guest === player
      });
      setHostname(gameDataOnce.data().host);
      setIsFoundHost(true);
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
      gameInit: true,
      gameState: {
        host: 'init',
        guest: 'init',
      },
      gamePhase: {
        host: 0,
        guest: 0
      }
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

  useEffect(() => {
    if (gameState === "playing" || gameState === "ready") {
      gameEvent(currentData);
    }
  }, [currentData, gameState])

  useEffect(() => {
    if (winner) {
      setAlertWinnerState(true);
      setModalShowWinnerState(true);
    }
  }, [winner]);

  const playingGame = () => {
    const docRef = doc(db, 'playing', hostname);
    onSnapshot(docRef, async (snapshot) => {
      const snapData = snapshot.data();
      findWinner(snapData);
      setCurrentData(snapData);
      gameEventState(snapData);
      setupGamePhase(snapData);
    })
  }

  const gameEventState = async (snapData) => {
    const yourRole = player === hostname ? "host" : "guest";
    setMyRole(yourRole);
    if (snapData?.gameState?.guest === "ready" && snapData?.gameState?.host === "ready") {
      setGameState("playing");
      const docRef = doc(db, 'playing', hostname);
      const newCurrentData = snapData;
      newCurrentData.gameState.guest = 'playing';
      newCurrentData.gameState.host = 'playing';
      await updateDoc(docRef, newCurrentData);
    }
    else {
      setGameState(snapData.gameState[yourRole]);
    }
  }

  const findWinner = (snapData) => {
    if (snapData?.gameInfo?.gameSet) {
      const { host, guest } = snapData?.gameInfo?.gameSet;
      let guestWinner = 0, hostWinner = 0, winnerPoint = 10;
      for (const i in guest) {
        if (guest[i].indexOf('boom') !== -1) guestWinner++;
      }
      for (const i in host) {
        if (host[i].indexOf('boom') !== -1) hostWinner++;
      }
      if (hostWinner === winnerPoint) {
        setWinner(snapData["guest"]);
      }
      else if (guestWinner === winnerPoint) {
        setWinner(snapData["host"]);
      }
    }
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
      setWhoseTurn(snapData.gameInfo.turn);
      setOurboard(myBoard);
      setOtherboard(otherBoard);
    }
  }

  useEffect(() => {
    if (whoseTurn) {
      if (whoseTurn === player) {
        updateGamePhase();
      }
    }
  }, [whoseTurn])

  const updateGamePhase = async () => {
    const otherRole = myRole !== "host" ? "host" : "guest";
    const docRef = doc(db, 'playing', hostname);
    const newCurrentData = currentData;
    newCurrentData.gamePhase[myRole] = 1;
    newCurrentData.gamePhase[otherRole] = 0;
    await updateDoc(docRef, newCurrentData);
  }

  const setupGamePhase = async (snapData) => {
    setGamePhase(snapData.gamePhase[myRole]);
  }

  const onFire = async (e) => {
    if (gameState === "playing") {
      if (e.currentTarget.id.indexOf('o') !== -1 && hostname && whoseTurn === player) {
        const id = e.currentTarget.id.split("o")[1];
        const docRef = doc(db, 'playing', hostname);
        const newCurrentData = currentData;
        let fireSuccess = false;
        if (player === hostname) {
          if (newCurrentData.gameInfo.gamePlay.host[id]) {
            setAlertFireState(true);
            setModalShowFireState(true);
          }
          else {
            newCurrentData.gameInfo.gamePlay.host[id] = 'x';
            fireSuccess = true;
          }
        }
        else {
          if (newCurrentData.gameInfo.gamePlay.guest[id]) {
            setAlertFireState(true);
            setModalShowFireState(true);
          }
          else {
            newCurrentData.gameInfo.gamePlay.guest[id] = 'x';
            fireSuccess = true;
          }
        }
        if (fireSuccess) {
          newCurrentData.gameInfo.turn = newCurrentData.guest === player ? newCurrentData.host : newCurrentData.guest;
          await updateDoc(docRef, newCurrentData);
        }
      }
    }
  }

  const onAcceptPosition = async () => {
    if (isRandom) {
      const docRef = doc(db, 'playing', hostname);
      const newCurrentData = currentData;
      newCurrentData.gameState[myRole] = 'ready';
      for (let i = 0; i < ourBoard.length; i++) {
        newCurrentData.gameInfo.gameSet[myRole][i] = ourBoard[i] ? ourBoard[i] : "";
      }
      await updateDoc(docRef, newCurrentData);
    }
    else {
      setAlertErrorState(true);
      setModalShowErrorState(true);
    }
  }

  const generate = (ship) => {
    let randomDirection = Math.floor(Math.random() * ship.directions.length);
    let current = ship.directions[randomDirection];
    let direction = 1;
    if (randomDirection === 0) direction = 1;
    if (randomDirection === 1) direction = 5;
    let randomStart = Math.abs(Math.floor(Math.random() * (width * width - 1) - (ship.directions[0].length * direction)));
    const isTaken = current.some(index => ourBoard[randomStart + index]?.indexOf('taken'));
    const isAtRightEdge = current.some(index => (randomStart + index) % width === width - 1);
    const isAtLeftEdge = current.some(index => (randomStart + index) % width === 0);

    if (!isTaken && !isAtRightEdge && !isAtLeftEdge) {
      if (current.length > 1) {
        let directionLine = current[1] - current[0] === 1 ? 'horizontal' : 'vertical'
        current.forEach((value, index) => {
          const _direction = ship.directions[0];
          let directionClass;
          if (index === 0) directionClass = 'start';
          if (index === _direction.length - 1) directionClass = 'end';
          ourBoard[randomStart + value] = `taken ${directionClass} ${directionLine} ${ship.name}`;
          setOurboard(ourBoard);
        });
      }
      else {
        ourBoard[randomStart] = `taken center ${ship.name}`;
        setOurboard(ourBoard);
      }
    }
    else generate(ship);
  }

  const onRandomPosition = () => {
    if (gameState === 'init') {
      setOurboard(Array(36).fill(null));
      setIsRandoming(true);
    }
  }

  useEffect(() => {
    if (isRandoming && ourBoard.every(e => e === null)) {
      generate(shipArray[0]);
      generate(shipArray[0]);
      generate(shipArray[0]);
      generate(shipArray[1]);
      generate(shipArray[1]);
      generate(shipArray[2]);
    }
    if (isRandoming) {
      if (ourBoard.filter(e => e === null).length === 26) {
        setIsRandom(true);
        setIsRandoming(false);
      }
      else {
        setOurboard(Array(36).fill(null));
      }
    }
  }, [ourBoard, isRandoming])

  const closeAlertErrorState = () => {
    setAlertErrorState(false);
    setModalShowErrorState(false);
  }

  const closeAlertFireState = () => {
    setAlertFireState(false);
    setModalShowFireState(false);
  }

  const closeAlertWinnerState = () => {
    navigate('/');
  }

  const boardGrid = {
    padding: '0',
    width: '300px',
    height: '300px',
    display: 'grid',
    backgroundColor: 'hsl(200, 100%, 50%)',
    gridTemplateRows: 'repeat(' + width + ', 1fr)',
    gridTemplateColumns: 'repeat(' + width + ', 1fr)'
  };

  const buttonStyle = {
    backgroundColor: 'orange',
    borderRadius: '50px',
    fontWeight: 'bold',
    fontSize: '20px',
    fontStyle: 'italic',
    fontFamily: 'Bangers',
    boxShadow: '5px 10px #cc7512',
    width: '200px'
  };

  const YourBoard = ({ }) => {
    const _squares = []
    for (var i = 0; i < width * width; i++) {
      const id = 'y' + i;
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
      const id = 'o' + i;
      otherBoard[i] = otherBoard[i] ? otherBoard[i] : "";
      const _currentSquare = <div id={id} className={otherBoard[i].replace('taken', '')} style={{ border: '1px solid hsla(0, 0%, 100%, .2)' }} onClick={onFire} />;
      _squares.push(_currentSquare);
    }
    return (
      <div style={boardGrid}>
        {_squares}
      </div>
    );
  }

  return (
    <>
      <Container>
        {
          alertErrorState && <Modal show={modalShowErrorState} >
            <Modal.Header closeButton>
              <Modal.Title>กรุณากด Random ก่อน</Modal.Title>
            </Modal.Header>
            <Modal.Footer>
              <Button onClick={closeAlertErrorState}>Close</Button>
            </Modal.Footer>
          </Modal>
        }
        {
          alertWinnerState && <Modal show={modalShowWinnerState} >
            <Modal.Header closeButton>
              <Modal.Title>เกมจบแล้ว ผู้ชนะคือ {winner}</Modal.Title>
            </Modal.Header>
            <Modal.Footer>
              <Button onClick={closeAlertWinnerState}>Close</Button>
            </Modal.Footer>
          </Modal>
        }
        {
          alertFireState && <Modal show={modalShowFireState} >
            <Modal.Header closeButton>
              <Modal.Title>กรุณาเลือกตำแหน่งใหม่</Modal.Title>
            </Modal.Header>
            <Modal.Footer>
              <Button onClick={closeAlertFireState}>Close</Button>
            </Modal.Footer>
          </Modal>
        }
        <h1 className='text-center mb-4'>WARSHIP</h1>
        <Card className='text-center bg-transparent border-5'>
          <Card.Header>
            <div className='d-flex justify-content-center'>
              {gameState === "init" && <p style={{ fontFamily: 'Bangers', fontSize: '25px' }}>prepare your board</p>}
              {gameState === "ready" && <p style={{ fontFamily: 'Bangers', fontSize: '25px' }}><Spinner
                as="span"
                animation="grow"
                size="lm"
                role="status"
                aria-hidden="true"
              />&nbsp;&nbsp;waiting for opponent player</p>}
              {gameState === 'playing' && <p style={{ fontFamily: 'Bangers', fontSize: '40px' }}>{whoseTurn === player ? "your turn" : "opponent turn"}</p>}
            </div>
          </Card.Header>
          <Card.Body>
            <Row className='mb-3'>
              {gamePhase === 1 && <p style={{ fontFamily: 'Bangers', fontSize: '25px' }}>phase 1: select to fire</p>}
              {gamePhase === 2 && <p style={{ fontFamily: 'Bangers', fontSize: '25px' }}>phase 2: select to defend</p>}
            </Row>
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
            <Row>
              {gameState === "init" &&
                <Container>
                  <Row className='mt-4 mb-4 justify-content-center'>
                    <Button style={buttonStyle} onClick={onRandomPosition} >r a n d o m</Button>
                  </Row>
                  <Row className='justify-content-center'>
                    <Button style={buttonStyle} onClick={onAcceptPosition}>a c c e p t</Button>
                  </Row>
                </Container>}
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </>
  )
}
