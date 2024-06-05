import React, { useState } from 'react';
import { VStack, FormControl, FormLabel, Input, Button, Heading, Alert, AlertIcon } from "@chakra-ui/react";
import axios from 'axios';

const SignUp = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    try {
      const response = await axios.post('http://localhost:8000/signup', {
        username,
        email,
        password
      });
      setSuccess('Account created successfully');
      setError('');
    } catch (err) {
      setError('Failed to create account');
      setSuccess('');
    }
  };

  return (
    <VStack spacing={4}>
      <Heading size="lg">Sign Up</Heading>
      {success && (
        <Alert status="success">
          <AlertIcon />
          {success}
        </Alert>
      )}
      {error && (
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      )}
      <FormControl>
        <FormLabel>Username</FormLabel>
        <Input value={username} onChange={(e) => setUsername(e.target.value)} />
      </FormControl>
      <FormControl>
        <FormLabel>Email</FormLabel>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
      </FormControl>
      <FormControl>
        <FormLabel>Password</FormLabel>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </FormControl>
      <Button colorScheme="blue" onClick={handleSignUp}>Sign Up</Button>
    </VStack>
  );
};

export default SignUp;
