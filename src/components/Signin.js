import { useEffect, useRef, useState } from 'react'
import { Button, Card, Form, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../contexts/AuthContext'
import '../css/fonts.css'

export default function Signin() {
    const nameRef = useRef()
    const passwordRef = useRef()
    const { value: { signUp, signIn, currentUser } } = useAuth()
    const navigate = useNavigate()

    const [error, setError] = useState()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (currentUser) navigate('/')
    }, [])

    async function handleSubmit(e) {
        e.preventDefault()

        if (nameRef?.current?.value && !nameRef?.current?.value.match(/^[a-zA-Z0-9]+$/)) {
            return setError("กรุณาเฉพาะตัวอักษรหรือตัวเลข")
        }
        else if (nameRef?.current?.value && nameRef?.current?.value.length < 6) {
            return setError("กรุณาใส่ชื่อยาวกว่า 6 ตัวอักษร")
        }

        if (passwordRef?.current?.value && passwordRef?.current?.value.length < 6) {
            return setError("กรุณาใส่รหัสยาวกว่า 6 ตัวอักษร")
        }

        try {
            setError("")
            setLoading(true)
            await signIn(nameRef?.current?.value, passwordRef?.current?.value)
            navigate('/')
        }
        catch {
            try {
                await signUp(nameRef?.current?.value, passwordRef?.current?.value)
                navigate('/')
            }
            catch {
                setError("ชื่อนี้ถูกใช้แล้ว หรือ รหัสผ่านผิด")
            }
        }

        setLoading(false)
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

    const textInputStyle = {
        borderRadius: '50px'
    }

    const fontLabelStyle = {
        fontWeight: 'bold',
        fontSize: '20px',
        fontStyle: 'italic',
        fontFamily: 'Bangers',
        color: 'white'
    }

    return (
        <>
            <h1 className='text-center mb-4'>WARSHIP</h1>
            <Card className='bg-transparent border-0'>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group id="name" className='text-center mb-4'>
                            <Form.Label style={fontLabelStyle}>N a m e</Form.Label>
                            <Form.Control className="text-center" type="text" ref={nameRef} style={textInputStyle} required />
                        </Form.Group>
                        <Form.Group id="password" className='text-center mb-4'>
                            <Form.Label style={fontLabelStyle}>P a s s w o r d</Form.Label>
                            <Form.Control className="text-center" type="password" ref={passwordRef} style={textInputStyle} required />
                        </Form.Group>
                        <Form.Group className='text-center mb-4'>
                            <Button disabled={loading} className='w-50' type='submit' style={buttonStyle}>L o g  i n</Button>
                        </Form.Group>
                    </Form>
                </Card.Body>
            </Card>
        </>
    )
}
