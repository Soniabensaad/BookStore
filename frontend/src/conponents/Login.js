import React, { useState } from 'react';
import { Box, Button, Input, FormControl, FormLabel } from "@chakra-ui/react";
import axios from 'axios';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
  
      const response = await axios.post('http://127.0.0.1:8000/token', formData);
      onLogin(response.data.access_token);
    } catch (error) {
      setError('Invalid username or password');
    }
  };
  

  return (
    <Box>
      <FormControl>
        <FormLabel>Username</FormLabel>
        <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
      </FormControl>
      <FormControl mt={4}>
        <FormLabel>Password</FormLabel>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </FormControl>
      <Button mt={4} colorScheme="teal" onClick={handleLogin}>Login</Button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </Box>
  );
}

export default Login;
