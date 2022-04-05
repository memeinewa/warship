import { Button, Card, Row, Col } from 'react-bootstrap'

export default function Home() {
    return (
        <>
            <h1 className='text-center mb-4'>WARSHIP</h1>
            <Card className='text-center'>
                <Card.Body>
                    <Row>
                        <Col><Button className='w-50 mb-4'>Play</Button></Col>
                    </Row>
                    <Row>
                        <Col><Button className='w-50 mb-4'>How to?</Button></Col>
                    </Row>
                    <Row>
                        <Col><Button className='w-50'>Settings</Button></Col>
                    </Row>
                </Card.Body>
            </Card>
        </>
    )
}
