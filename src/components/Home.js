import { useState } from 'react'
import { Button, Card, Row, Col, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../contexts/AuthContext'

export default function Home() {
    const [error, setError] = useState("")
    const navigate = useNavigate()
    const { value: { signOut } } = useAuth()

    async function handleSignOut() {
        setError("")

        try {
            await signOut()
            navigate('/')
        }
        catch {
            setError("ไม่สามารถออกจากระบบได้")
        }
    }

    async function handlePlay() {
        navigate('/play')
    }

    async function handleHowto() {
        navigate('/howto')
    }

    async function handleSetting() {
        navigate('/setting')
    }

    return (
        <>
            <h1 className='text-center mb-4'>WARSHIP</h1>
            <Card className='text-center'>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Row>
                        <Col><Button onClick={handlePlay} className='w-50 mb-4'>Play</Button></Col>
                    </Row>
                    <Row>
                        <Col><Button onClick={handleHowto} className='w-50 mb-4'>How to?</Button></Col>
                    </Row>
                    <Row>
                        <Col><Button onClick={handleSetting} className='w-50'>Setting</Button></Col>
                    </Row>
                </Card.Body>
            </Card>
            <Button onClick={handleSignOut} style={{ position: 'fixed', bottom: '30px', right: '30px' }}>Logout</Button>
        </>
    )
}
