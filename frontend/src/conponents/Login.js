import React, { useState } from 'react';
import { VStack, FormControl, FormLabel, Input, Button, Heading, Alert, AlertIcon } from "@chakra-ui/react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = ({ handleLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLoginClick = async () => {
    try {
      const response = await axios.post('http://localhost:8000/login', {
        username,
        password
      });
      setSuccess('Logged in successfully');
      setError('');
      handleLogin(); // Call parent login handler
      navigate('/'); // Redirect to Discover page
    } catch (err) {
      setError('Invalid username or password');
      setSuccess('');
    }
  };

  return (
    <VStack spacing={4}>
      <Heading size="lg">Login</Heading>
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
        <FormLabel>Password</FormLabel>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </FormControl>
      <Button colorScheme="blue" onClick={handleLoginClick}>Login</Button>
    </VStack>
  );
};

export default Login;
