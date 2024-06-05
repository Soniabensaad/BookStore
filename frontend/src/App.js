import React, { useState, useEffect } from 'react';
import { ChakraProvider, Center, VStack, Tab, Button, Tabs, TabList, TabPanels, TabPanel, Heading, Select } from "@chakra-ui/react";
import Discover from './conponents/Discover';
import Library from './conponents/Library';
import SignUp from './conponents/Signup'
import Login from './conponents/Login';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [books, setBooks] = useState([]);
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('activeTab');
    return (savedTab === 'Discover' || savedTab === 'Library') ? savedTab : 'Discover';
  });

  useEffect(() => {
    const loggedInStatus = localStorage.getItem('isLoggedIn');
    if (loggedInStatus) {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchBooks();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setActiveTab('Discover');
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('activeTab', 'Discover');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
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

  const handleTabChange = (index) => {
    const newTab = index === 1 ? 'Library' : 'Discover';
    setActiveTab(newTab);
    if (newTab === 'Library') {
      fetchBooks();
    }
  };

  return (
    <ChakraProvider>
      <Center bg="#350929" color="white" padding={8}>
        <VStack spacing={7}>
          {isLoggedIn ? (
            <>
              <Button onClick={handleLogout} colorScheme="red">Logout</Button>
              <Tabs
                variant="soft-rounded"
                colorScheme="yellow"
                index={activeTab === 'Library' ? 1 : 0}
                onChange={handleTabChange}
              >
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
            </>
          ) : (
            <>
              {activeTab === 'SignUp' ? <SignUp /> : <Login handleLogin={handleLogin} />}
              <Button mt={4} onClick={() => setActiveTab(activeTab === 'SignUp' ? 'Login' : 'SignUp')}>
                {activeTab === 'SignUp' ? 'Switch to Login' : 'Switch to Sign Up'}
              </Button>
            </>
          )}
        </VStack>
      </Center>
    </ChakraProvider>
  );
}

export default App;
