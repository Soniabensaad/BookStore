import React, { useState, useEffect } from 'react';
import { ChakraProvider, Center, VStack, Tab, Button,  Tabs, TabList, TabPanels, TabPanel, Heading } from "@chakra-ui/react";
import Discover from './conponents/Discover';
import Library from './conponents/Library';
import Login from './conponents/Login';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [books, setBooks] = useState([]);

  useEffect(() => {
    // Fetch books data when component mounts
    if (isLoggedIn) {
      fetchBooks();
    }
  }, [isLoggedIn]);

  const handleLogin = async () => {
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    setIsLoggedIn(false);
  };

  const fetchBooks = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/books");
      if (!response.ok) {
        throw new Error("Failed to fetch books");
      }
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  return (
    <ChakraProvider>
      <Center bg="#350929" color="white" padding={8}>
        <VStack spacing={7}>
          {isLoggedIn ? (
            <Tabs variant="soft-rounded" colorScheme="yellow">
              <Center>
                <TabList>
                  <Tab>
                    <Heading>Discover</Heading>
                  </Tab>
                  <Tab>
                    <Heading>Library</Heading>
                  </Tab>
                </TabList>
              </Center>
              <TabPanels>
                <TabPanel>
                  <Discover refreshData={fetchBooks} />
                </TabPanel>
                <TabPanel>
                  <Library allBooks={books} refreshData={fetchBooks} />
                </TabPanel>
              </TabPanels>
            </Tabs>
          ) : (
            <Login onLogin={handleLogin} />
          )}
          {isLoggedIn && (
            <Button onClick={handleLogout}>Logout</Button>
          )}
        </VStack>
      </Center>
    </ChakraProvider>
  );
}

export default App;
