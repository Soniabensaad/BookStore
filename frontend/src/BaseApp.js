//import React, { useEffect, useState } from 'react';
//import { VStack, Center, Tabs, Tab, TabList, TabPanels, TabPanel, Heading, ChakraProvider } from "@chakra-ui/react";
//import Discover from './conponents/Discover'; // Check if the path is correct
//import Library from './conponents/Library'; // Check if the path is correct


//function App() {
  //const [allBooks, setAllBooks] = useState([]);
  //const [refreshData, setRefreshData] = useState(false);

  //const fetchData = () => {
   // setRefreshData(!refreshData);
 // };

  //useEffect(() => {
   // fetch("http://127.0.0.1:8000/books")
    //  .then((response) => response.json())
    //  .then((data) => setAllBooks(data));
 // }, [refreshData]);

 // return (
  //  <ChakraProvider>
    //  <Center bg="#350929" color="white" padding={8}>
     //   <VStack spacing={7}>
      //    <Tabs variant="soft-rounded" colorScheme="yellow">
        //    <Center>
            //  <TabList>
             //   <Tab>
                 // <Heading>Discover</Heading>
                //</Tab>
               // <Tab>
            //      <Heading>Library</Heading>
            //    </Tab>
           //   </TabList>
         //   </Center>
           // <TabPanels>
          //    <TabPanel>
          //      <Discover refreshData={fetchData} />
           //   </TabPanel>
          //    <TabPanel>
          //      {/* Ensure that the import path is correct */}
           //     <Library allBooks={allBooks} refreshData={fetchData} />
           //   </TabPanel>
         //   </TabPanels>
         // </Tabs>
       // </VStack>
     // </Center>
 //   //</ChakraProvider>
 // );
//}

//export default App;
