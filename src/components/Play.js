import { Button, Card } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

export default function Play() {
    const navigate = useNavigate()

    async function handleBack() {
        navigate('/')
    }

    return (
        <>
            <h1 className='text-center mb-4'>WARSHIP</h1>
            <Card className='text-center'>
                <Card.Header className='d-flex flex-row-reverse' style={{ backgroundColor: 'white', borderBottom: '0' }}>
                    <Button onClick={handleBack} className='btn btn-danger btn-sm'>X</Button>
                </Card.Header>
                <Card.Body>

                </Card.Body>
            </Card>
        </>
    )
}
