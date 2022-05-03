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
  const [defendFill, setDefendFill] = useState(-1);
  const [messageDefend, setMessageDefend] = useState("");
  const [alertErrorState, setAlertErrorState] = useState(false);
  const [modalShowErrorState, setModalShowErrorState] = useState(false);
  const [alertWinnerState, setAlertWinnerState] = useState(false);
  const [modalShowWinnerState, setModalShowWinnerState] = useState(false);
  const [alertFireState, setAlertFireState] = useState(false);
  const [modalShowFireState, setModalShowFireState] = useState(false);
  const [alertDefendState, setAlertDefendState] = useState(false);
  const [modalShowDefendState, setModalShowDefendState] = useState(false);
  const [whoseTurn, setWhoseTurn] = useState("");
  const [gamePhase, setGamePhase] = useState(0);
  const [yourRanking, setYourRanking] = useState(0);
  const [otherRanking, setOtherRanking] = useState(0);
  const [alertExpireState, setAlertExpireState] = useState(false);
  const [modalShowExpireState, setModalShowExpireState] = useState(false);
  const [retryFindingHost, setRetryFindingHost] = useState(0);
  const [numberOfOwnShip1, setNumberOfOwnShip1] = useState(3);
  const [numberOfOwnShip2, setNumberOfOwnShip2] = useState(4);
  const [numberOfOwnShip3, setNumberOfOwnShip3] = useState(3);
  const [numberOfOtherShip1, setNumberOfOtherShip1] = useState(3);
  const [numberOfOtherShip2, setNumberOfOtherShip2] = useState(4);
  const [numberOfOtherShip3, setNumberOfOtherShip3] = useState(3);
  const { value: { currentUser } } = useAuth();
  const navigate = useNavigate();
  const player = currentUser.email.split("@")[0];
  const width = 6;
  const maxShip1 = 3, maxShip2 = 4, maxShip3 = 3;

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
    if (!isFoundHost && retryFindingHost) {
      setAlertExpireState(true);
      setModalShowExpireState(true);
    }
  }, [isFoundHost, retryFindingHost])

  const checkExpire = async (data) => {
    if (data.expireDate.seconds < Math.floor(Date.now() / 1000)) {
      const docPlayingRef = doc(db, 'playing', hostname);
      await deleteDoc(docPlayingRef);
      setAlertExpireState(true);
      setModalShowExpireState(true);
    }
  }

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

  const setAllRanking = async (player1, player2) => {
    const player1Ref = doc(db, 'ranking', player1);
    const player2Ref = doc(db, 'ranking', player2);
    const player1Snap = await getDoc(player1Ref);
    const player2Snap = await getDoc(player2Ref);
    if (player1Snap.exists()) {
      if (player1 === player) setYourRanking(player1Snap.data().point);
      else setOtherRanking(player1Snap.data().point);
    }
    else {
      if (player1 === player) setYourRanking(0);
      else setOtherRanking(0);
    }
    if (player2Snap.exists()) {
      if (player2 === player) setYourRanking(player2Snap.data().point);
      else setOtherRanking(player2Snap.data().point);
    }
    else {
      if (player2 === player) setYourRanking(0);
      else setOtherRanking(0);
    }
  }

  const updateNumberOfShip = (snapData) => {
    const hostSet = snapData?.gameInfo?.gameSet.host;
    const guestSet = snapData?.gameInfo?.gameSet.guest;
    const hostPlay = snapData?.gameInfo?.gamePlay.host;
    const guestPlay = snapData?.gameInfo?.gamePlay.guest;
    let hostShip1 = 0, hostShip2 = 0, hostShip3 = 0;
    let guestShip1 = 0, guestShip2 = 0, guestShip3 = 0;

    for (const i in hostSet) {
      if (guestPlay[i] === 'x' && hostSet[i].indexOf("destroyer") >= 0) hostShip1++;
      if (guestPlay[i] === 'x' && hostSet[i].indexOf("submarine") >= 0) hostShip2++;
      if (guestPlay[i] === 'x' && hostSet[i].indexOf("battleship") >= 0) hostShip3++;
    }

    for (const i in guestSet) {
      if (hostPlay[i] === 'x' && guestSet[i].indexOf("destroyer") >= 0) guestShip1++;
      if (hostPlay[i] === 'x' && guestSet[i].indexOf("submarine") >= 0) guestShip2++;
      if (hostPlay[i] === 'x' && guestSet[i].indexOf("battleship") >= 0) guestShip3++;
    }

    if (hostname === player) {
      setNumberOfOwnShip1(maxShip1 - hostShip1);
      setNumberOfOwnShip3(maxShip2 - hostShip2);
      setNumberOfOwnShip3(maxShip3 - hostShip3);
      setNumberOfOtherShip1(maxShip1 - guestShip1);
      setNumberOfOtherShip2(maxShip2 - guestShip2);
      setNumberOfOtherShip3(maxShip3 - guestShip3);
    }
    else {
      setNumberOfOwnShip1(maxShip1 - guestShip1);
      setNumberOfOwnShip3(maxShip2 - guestShip2);
      setNumberOfOwnShip3(maxShip3 - guestShip3);
      setNumberOfOtherShip1(maxShip1 - hostShip1);
      setNumberOfOtherShip2(maxShip2 - hostShip2);
      setNumberOfOtherShip3(maxShip3 - hostShip3);
    }
  }

  const findingHost = async () => {
    const q = query(collection(db, 'playing'));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.docs.length) {
      const gameDataOnce = querySnapshot.docs.find(v => {
        return v.data().host === player || v.data().guest === player
      });
      setHostname(gameDataOnce.data().host);
      setAllRanking(gameDataOnce.data().host, gameDataOnce.data().guest);
      setIsFoundHost(true);
      if (!gameDataOnce.data().gameInit) {
        setIsBoardGame(false);
      }
    }
    else {
      setRetryFindingHost(retryFindingHost + 1);
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
        host: 1,
        guest: 0
      },
      gameDefend: {
        host: -1,
        guest: -1
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
      endGame();
    }
  }, [winner]);

  const endGame = async () => {
    if (winner === player) {
      const docRankingRef = doc(db, 'ranking', winner);
      const docRankingSnap = await getDoc(docRankingRef);
      if (!docRankingSnap.exists()) {
        const payload = { 'point': 1 };
        await setDoc(docRankingRef, payload);
      }
      else {
        let rankingData = docRankingSnap.data();
        rankingData.point = rankingData.point + 1;
        await setDoc(docRankingRef, rankingData);
      }
    }
    const docPlayingRef = doc(db, 'playing', hostname);
    await deleteDoc(docPlayingRef);
    setAlertWinnerState(true);
    setModalShowWinnerState(true);
  }

  const playingGame = () => {
    const docRef = doc(db, 'playing', hostname);
    onSnapshot(docRef, async (snapshot) => {
      const snapData = snapshot.data();
      checkExpire(snapData);
      findWinner(snapData);
      setCurrentData(snapData);
      gameEventState(snapData);
      updateNumberOfShip(snapData);
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
      const hostSet = snapData?.gameInfo?.gameSet.host;
      const guestSet = snapData?.gameInfo?.gameSet.guest;
      const hostPlay = snapData?.gameInfo?.gamePlay.host;
      const guestPlay = snapData?.gameInfo?.gamePlay.guest;
      let guestWinner = 0, hostWinner = 0, winnerPoint = 10;
      for (const i in hostSet) {
        if (guestPlay[i] === 'x' && hostSet[i].indexOf("taken") >= 0) {
          guestWinner++;
        }
      }
      for (const i in guestSet) {
        if (hostPlay[i] === 'x' && guestSet[i].indexOf("taken") >= 0) {
          hostWinner++;
        }
      }
      if (hostWinner === winnerPoint) {
        setWinner(snapData["host"]);
      }
      else if (guestWinner === winnerPoint) {
        setWinner(snapData["guest"]);
      }
    }
  }

  const gameEvent = async (snapData) => {
    const docNewRef = doc(db, 'playing', hostname);
    const docSnap = await getDoc(docNewRef);
    snapData = docSnap.data();
    const yourRole = player === hostname ? "host" : "guest";
    if (snapData?.gameInfo?.gamePlay && snapData?.gameInfo?.gameSet) {
      const hostSet = snapData?.gameInfo?.gameSet.host;
      const guestSet = snapData?.gameInfo?.gameSet.guest;
      const hostPlay = snapData?.gameInfo?.gamePlay.host;
      const guestPlay = snapData?.gameInfo?.gamePlay.guest;
      for (const i in hostSet) {
        if (guestPlay[i] === 'x' && hostSet[i].indexOf("taken") >= 0) {
          hostSet[i] = hostSet[i].concat(" ", "boom");
        }
        else if (guestPlay[i] === 'x') {
          hostSet[i] = hostSet[i].concat(" ", "miss");
        }
      }
      for (const i in guestSet) {
        if (hostPlay[i] === 'x' && guestSet[i].indexOf("taken") >= 0) {
          guestSet[i] = guestSet[i].concat(" ", "boom");
        }
        else if (hostPlay[i] === 'x') {
          guestSet[i] = guestSet[i].concat(" ", "miss");
        }
      }
      if (snapData?.gameDefend?.host !== -1) {
        if (player === hostname) {
          hostSet[snapData?.gameDefend?.host] = hostSet[snapData?.gameDefend?.host].concat(" ", "defend");
        }
      }
      if (snapData?.gameDefend?.guest !== -1) { 
        if (player !== hostname) {
          guestSet[snapData?.gameDefend?.guest] = guestSet[snapData?.gameDefend?.guest].concat(" ", "defend");
        }
      }
      if (hostname === player) {
        setOurboard(hostSet);
        setOtherboard(guestSet);
      }
      else {
        setOurboard(guestSet);
        setOtherboard(hostSet);
      }
      setDefendFill(snapData?.gameDefend[yourRole]);
      if (defendFill !== snapData?.gameDefend[yourRole]) {
        setMessageDefend(`You are blocking position ${snapData?.gameDefend[yourRole] + 1}`);
      }
      setWhoseTurn(snapData.gameInfo.turn);
    }
  }

  useEffect(() => {
    if (myRole) {
      setupGamePhase(currentData);
    }
  }, [currentData, myRole])

  const setupGamePhase = async (snapData) => {
    setGamePhase(snapData.gamePhase[myRole]);
  }

  const onFire = async (e) => {
    if (gameState === "playing") {
      const yourRole = player === hostname ? "host" : "guest";
      const otherRole = myRole !== "host" ? "host" : "guest";
      if (e.currentTarget.id.indexOf('o') !== -1 && hostname && whoseTurn === player && currentData?.gamePhase[myRole] === 1) {
        const id = e.currentTarget.id.split("o")[1];
        const docRef = doc(db, 'playing', hostname);
        const newCurrentData = currentData;
        let fireSuccess = false;
        if (Number(id) === currentData.gameDefend[otherRole]) {
          fireSuccess = true;
          setMessageDefend('You hit the block');
        }
        else {
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
        }
        if (fireSuccess) {
          let boomCounting = 0;

          const doc2Ref = doc(db, 'playing', hostname);
          const doc2Snap = await getDoc(doc2Ref);
          const lastestData = doc2Snap.data();
          const gamePlay = lastestData.gameInfo.gamePlay[otherRole];
          const gameSet = lastestData.gameInfo.gameSet[yourRole];

          for (const i in gamePlay) {
            if (gamePlay[i] === 'x' && (gameSet[i].indexOf("submarine") >= 0 || gameSet[i].indexOf("battleship") >= 0)) {
              boomCounting++;
            }
          }

          if (boomCounting >= 6) {
            newCurrentData.gameDefend[myRole] = -1;
            newCurrentData.gameInfo.turn = newCurrentData.guest === player ? newCurrentData.host : newCurrentData.guest;
            newCurrentData.gamePhase[myRole] = 0;
            newCurrentData.gamePhase[otherRole] = 1;
          }
          else {
            newCurrentData.gamePhase[myRole] = 2;
          }
          await updateDoc(docRef, newCurrentData);
        }
      }
      else if (e.currentTarget.id.indexOf('y') !== -1 && hostname && whoseTurn === player && currentData?.gamePhase[myRole] === 2) {
        const id = e.currentTarget.id.split("y")[1];
        const docRef = doc(db, 'playing', hostname);
        const docSnap = await getDoc(docRef);
        const newCurrentData = docSnap.data();
        let defendSuccess = false;
        if (Number(id) === defendFill) {
          setAlertDefendState(true);
          setModalShowDefendState(true);
        }
        else {
          if (player === hostname) {
            if (newCurrentData.gameInfo.gameSet.host[id].indexOf('submarine') !== -1 || newCurrentData.gameInfo.gameSet.host[id].indexOf('battleship') !== -1) {
              newCurrentData.gameDefend[yourRole] = Number(id);
              defendSuccess = true;
            }
            else {
              setAlertDefendState(true);
              setModalShowDefendState(true);
            }
          }
          else {
            if (newCurrentData.gameInfo.gameSet.guest[id].indexOf('submarine') !== -1 || newCurrentData.gameInfo.gameSet.guest[id].indexOf('battleship') !== -1) {
              newCurrentData.gameDefend[yourRole] = Number(id);
              defendSuccess = true;
            }
            else {
              setAlertDefendState(true);
              setModalShowDefendState(true);
            }
          }
        }
        if (defendSuccess) {
          newCurrentData.gameInfo.turn = newCurrentData.guest === player ? newCurrentData.host : newCurrentData.guest;
          newCurrentData.gamePhase[myRole] = 0;
          newCurrentData.gamePhase[otherRole] = 1;
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

  const closeAlertDefendState = () => {
    setAlertDefendState(false);
    setModalShowDefendState(false);
  }

  const closeAlertWinnerState = () => {
    navigate('/');
  }

  const closeAlertExpireState = () => {
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
            <Modal.Header>
              <Modal.Title>กรุณากด Random ก่อน</Modal.Title>
            </Modal.Header>
            <Modal.Footer>
              <Button onClick={closeAlertErrorState}>Close</Button>
            </Modal.Footer>
          </Modal>
        }
        {
          alertWinnerState && <Modal show={modalShowWinnerState} >
            <Modal.Header>
              <Modal.Title>เกมจบแล้ว ผู้ชนะคือ {winner}</Modal.Title>
            </Modal.Header>
            <Modal.Footer>
              <Button onClick={closeAlertWinnerState}>Close</Button>
            </Modal.Footer>
          </Modal>
        }
        {
          alertFireState && <Modal show={modalShowFireState} >
            <Modal.Header>
              <Modal.Title>กรุณาเลือกตำแหน่งใหม่</Modal.Title>
            </Modal.Header>
            <Modal.Footer>
              <Button onClick={closeAlertFireState}>Close</Button>
            </Modal.Footer>
          </Modal>
        }
        {
          alertDefendState && <Modal show={modalShowDefendState} >
            <Modal.Header>
              <Modal.Title>กรุณาเลือกตำแหน่ง Ship2 หรือ Ship3 ที่ต้องการป้องกัน และไม่ใช่ตำแหน่งเดิม</Modal.Title>
            </Modal.Header>
            <Modal.Footer>
              <Button onClick={closeAlertDefendState}>Close</Button>
            </Modal.Footer>
          </Modal>
        }
        {
          alertExpireState && <Modal show={modalShowExpireState} >
            <Modal.Header>
              <Modal.Title>เกมหมดเวลาเล่นแล้ว</Modal.Title>
            </Modal.Header>
            <Modal.Footer>
              <Button onClick={closeAlertExpireState}>Close</Button>
            </Modal.Footer>
          </Modal>
        }
        <h1 className='text-center mb-4'>WARSHIP</h1>
        <Card className='text-center bg-transparent border-5'>
          <Card.Header>
            <div className='d-flex justify-content-center'>
              {gameState === "init" && <p style={{ fontFamily: 'Bangers', fontSize: '40px' }}>prepare your board</p>}
              {gameState === "ready" && <p style={{ fontFamily: 'Bangers', fontSize: '40px' }}><Spinner
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
              {gamePhase === 1 && whoseTurn === player && <p style={{ fontFamily: 'Bangers', fontSize: '25px' }}>phase 1: select to fire</p>}
              {gamePhase === 2 && whoseTurn === player && <p style={{ fontFamily: 'Bangers', fontSize: '25px' }}>phase 2: select to defend</p>}
            </Row>
            <Row className='d-flex justify-content-center'>
              <Col>
                <Row>
                  <p style={{ fontFamily: 'Bangers', fontSize: '25px' }}>Your Board ({`Win ${yourRanking} Games`})</p>
                </Row>
                <Row className='d-flex justify-content-center mb-3'>
                  <YourBoard />
                </Row>
                <Row>
                  <p style={{ fontFamily: 'Bangers', fontSize: '25px' }}>{defendFill === -1 ? "" : messageDefend}</p>
                </Row>
              </Col>
              <Col>
                <Row>
                  <p style={{ fontFamily: 'Bangers', fontSize: '25px' }}>Opponent Board ({`Win ${otherRanking} Games`})</p>
                </Row>
                <Row className='d-flex justify-content-center mb-3'>
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
          <Card.Footer>
            {
              gameState === "playing" &&
              <Row>
                <Col>
                  <Row><p style={{ fontFamily: 'Bangers', fontSize: '25px' }}>ship 1&nbsp;&nbsp;x&nbsp;&nbsp;{numberOfOwnShip1}</p></Row>
                  <Row><p style={{ fontFamily: 'Bangers', fontSize: '25px' }}>ship 2&nbsp;&nbsp;x&nbsp;&nbsp;{numberOfOwnShip2}</p></Row>
                  <Row><p style={{ fontFamily: 'Bangers', fontSize: '25px' }}>ship 3&nbsp;&nbsp;x&nbsp;&nbsp;{numberOfOwnShip3}</p></Row>
                </Col>
                <Col>
                  <Row><p style={{ fontFamily: 'Bangers', fontSize: '25px' }}>ship 1&nbsp;&nbsp;x&nbsp;&nbsp;{numberOfOtherShip1}</p></Row>
                  <Row><p style={{ fontFamily: 'Bangers', fontSize: '25px' }}>ship 2&nbsp;&nbsp;x&nbsp;&nbsp;{numberOfOtherShip2}</p></Row>
                  <Row><p style={{ fontFamily: 'Bangers', fontSize: '25px' }}>ship 3&nbsp;&nbsp;x&nbsp;&nbsp;{numberOfOtherShip3}</p></Row>
                </Col>
              </Row>
            }
          </Card.Footer>
        </Card>
      </Container>
    </>
  )
}
