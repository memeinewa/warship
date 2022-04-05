import { useRef, useState } from 'react'
import { Button, Card, Form, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

export default function Signin() {
    const nameRef = useRef()
    const passwordRef = useRef()
    const { value } = useAuth();

    const [error, setError] = useState()
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()

        if (passwordRef.current.value.length < 6) {
            return setError("กรุณาใส่รหัสยาวกว่า 6 ตัวอักษร")
        }

        try {
            setError("")
            setLoading(true)
            await value.signup(nameRef.current.value, passwordRef.current.value)
        }
        catch {
            setError("ชื่อนี้ถูกใช้แล้ว หรือ รหัสผ่านผิด")
        }

        setLoading(false)
    }

    return (
        <>
            <h1 className='text-center mb-4'>WARSHIP</h1>
            <Card>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group id="name" className='text-center mb-4'>
                            <Form.Label>Name</Form.Label>
                            <Form.Control className="text-center" type="text" ref={nameRef} required />
                        </Form.Group>
                        <Form.Group id="password" className='text-center mb-4'>
                            <Form.Label>Password</Form.Label>
                            <Form.Control className="text-center" type="text" ref={passwordRef} required />
                        </Form.Group>
                        <Button disabled={loading} className='w-100 ' type='submit'>Log in</Button>
                    </Form>
                </Card.Body>
            </Card>
        </>
    )
}
