import React, { useState } from 'react';
import { Box, Button } from "@chakra-ui/react";

function Logout({ onLogout }) {
  const handleLogout = async () => {
    await onLogout();
  };

  return (
    <Box>
      <Button colorScheme="red" onClick={handleLogout}>Logout</Button>
    </Box>
  );
}

export default Logout;
