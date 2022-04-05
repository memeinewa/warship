import React, { useRef } from 'react'
import { Button, Card, Form } from 'react-bootstrap';

export default function Signin() {
    const nameRef = useRef()
    const passwordRef = useRef()

    return (
        <>
            <h1 className='text-center mb-4'>WARSHIP</h1>
            <Card>
                <Card.Body>
                    <Form>
                        <Form.Group id="name" className='text-center mb-4'>
                            <Form.Label>Name</Form.Label>
                            <Form.Control className="text-center" type="text" ref={nameRef} required />
                        </Form.Group>
                        <Form.Group id="password" className='text-center mb-4'>
                            <Form.Label>Password</Form.Label>
                            <Form.Control className="text-center" type="text" ref={passwordRef} required />
                        </Form.Group>
                        <Button className='w-100 ' type='submit'>Log in</Button>
                    </Form>
                </Card.Body>
            </Card>
        </>
    )
}
