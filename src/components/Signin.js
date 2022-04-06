import { useEffect, useRef, useState } from 'react'
import { Button, Card, Form, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../contexts/AuthContext'

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

    return (
        <>
            <h1 className='text-center mb-4'>WARSHIP</h1>
            <Card className='bg-transparent'>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group id="name" className='text-center mb-4'>
                            <Form.Label>Name</Form.Label>
                            <Form.Control className="text-center" type="text" ref={nameRef} required />
                        </Form.Group>
                        <Form.Group id="password" className='text-center mb-4'>
                            <Form.Label>Password</Form.Label>
                            <Form.Control className="text-center" type="password" ref={passwordRef} required />
                        </Form.Group>
                        <Button disabled={loading} className='w-100' type='submit'>Log in</Button>
                    </Form>
                </Card.Body>
            </Card>
        </>
    )
}
