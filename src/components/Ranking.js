import { Button, Card } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

export default function Ranking() {
  const navigate = useNavigate()

  async function handleBack() {
    navigate('/')
  }

  return (
    <>
      <h1 className='text-center mb-4'>WARSHIP</h1>
      <Card className='text-center bg-transparent border-0'>
        <Card.Header className='d-flex flex-row-reverse border-0 bg-transparent'>
          <Button onClick={handleBack} className='btn btn-danger btn-sm'>X</Button>
        </Card.Header>
        <Card.Body>

        </Card.Body>
      </Card>
    </>
  )
}
