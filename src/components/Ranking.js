import { useEffect, useState } from 'react'
import { Button, Card, Table } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, query } from 'firebase/firestore'

import { db } from '../firebase'

export default function Ranking() {
  const [tableRankingData, setTableRankingData] = useState([]);
  const navigate = useNavigate()

  useEffect(() => {
    if (!tableRankingData.length) {
      getRanking()
    }
  }, [tableRankingData])

  async function handleBack() {
    navigate('/')
  }

  const getRanking = async () => {
    const q = query(collection(db, 'ranking'))
    const querySnapshot = await getDocs(q)
    if (querySnapshot.docs.length) {
      const x = querySnapshot.docs.map(v => ({ username: v.id, point: v.data().point }))
      setTableRankingData(x)
    }
  }

  return (
    <>
      <h1 className='text-center mb-4'>WARSHIP</h1>
      <Card className='text-center bg-transparent border-0'>
        <Card.Header className='d-flex flex-row-reverse border-0 bg-transparent'>
          <Button onClick={handleBack} className='btn btn-danger btn-sm'>X</Button>
        </Card.Header>
        <Card.Body>
          <Card.Title className='text-center mb-4'><h2>Ranking</h2></Card.Title>
          <Table>
            <thead>
              <tr>
                <th>#</th>
                <th>USERNAME</th>
                <th>WIN</th>
              </tr>
            </thead>
            <tbody>
              {tableRankingData.length && tableRankingData.map((v, i) => {
                return <tr>
                  <td>{i+1}</td>
                  <td>{v.username}</td>
                  <td>{v.point}</td>
                </tr>
              })}
              <tr></tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </>
  )
}
