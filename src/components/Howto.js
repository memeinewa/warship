import { Button, Card, Carousel } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

import howto1 from '../images/Howto1.png'
import howto2 from '../images/Howto2.png'

export default function Howto() {
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
                <Card.Body className='border-0 padding-0' style={{ maxHeight: '400px', display: 'block' }}>
                    <Carousel>
                        <Carousel.Item>
                            <Card.Img style={{ position: 'relative', height: 'auto' }} src={howto1} alt={howto1} />
                        </Carousel.Item>
                        <Carousel.Item>
                            <Card.Img style={{ position: 'relative', height: 'auto' }} src={howto2} alt={howto2} />
                        </Carousel.Item>
                    </Carousel>
                </Card.Body>
            </Card>
        </>
    )
}
