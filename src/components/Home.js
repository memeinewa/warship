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

    async function handleRanking() {
        navigate('/ranking')
    }

    const buttonStyle = {
        backgroundColor: 'orange',
        borderRadius: '50px',
        fontWeight: 'bold',
        fontSize: '20px',
        fontStyle: 'italic',
        fontFamily: 'Bangers',
        boxShadow: '5px 10px #cc7512'
    }

    const logoutButtonStyle = {
        position: 'fixed', 
        bottom: '30px', 
        right: '30px', 
        backgroundColor: 'orange',
        borderRadius: '50px', 
        fontFamily: 'Bangers', 
        fontStyle: 'italic', 
        fontWeight: 'bold', 
        fontSize: '20px'
    }

    return (
        <>
            <h1 className='text-center mb-4'>WARSHIP</h1>
            <Card className='text-center bg-transparent border-0'>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Row>
                        <Col><Button onClick={handlePlay} className='w-50 mb-4' style={buttonStyle}>P l a y</Button></Col>
                    </Row>
                    <Row>
                        <Col><Button onClick={handleHowto} className='w-50 mb-4' style={buttonStyle}>H o w  t o ?</Button></Col>
                    </Row>
                    <Row>
                        <Col><Button onClick={handleRanking} className='w-50' style={buttonStyle}>R a n k i n g</Button></Col>
                    </Row>
                </Card.Body>
            </Card>
            <Button onClick={handleSignOut} style={logoutButtonStyle} >L o g o u t</Button>
        </>
    )
}
