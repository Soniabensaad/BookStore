import React, { useState } from "react";
import { VStack, Heading, Text, HStack, Input, Button, Center, SimpleGrid, Image, Badge } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useToast } from "@chakra-ui/react";

const API_KEY = "AIzaSyB10HRTNtktto40Jrnm5Ktmctnv1HeW6jA";

export default function Discover({ refreshData }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const toast = useToast();

  const handleSearch = async () => {
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${searchQuery}&key=${API_KEY}&maxResults=40`);
      if (!response.ok) {
        throw new Error("Failed to fetch data from the server");
      }
      const data = await response.json();
      setSearchResults(data.items || []);
    } catch (error) {
      console.error("Error fetching books:", error);
      toast({
        title: "Error",
        description: "Failed to fetch books",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const extractTextFromHTML = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const addBook = async (book) => {
    const body = JSON.stringify ({
      volume_id: book.id,
      title: book.volumeInfo.title,
      authors: book.volumeInfo.authors?.join(", "),
      thumbnail: book.volumeInfo.imageLinks?.thumbnail,
      state: 2,
    });

    try {
      const response = await fetch("http://127.0.0.1:8000/books", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: body,
      });
      const data = await response.json();
      refreshData();
      toast({
        title: "Added",
        description: "Book Added to wishlist",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error adding book:", error);
      toast({
        title: "Error",
        description: "Failed to add book to wishlist",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <VStack spacing={7} paddingTop={5}>
      <Heading size="lg">Search</Heading>
      <Text>Add new book</Text>
      <HStack spacing={12}>
        <Input width="600px" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
        <Button colorScheme="blue" size="lg" onClick={handleSearch}>
          Search a book here
        </Button>
      </HStack>
      {searchResults.length === 0 && (
        <Center>
          <Heading> Search to see results</Heading>
        </Center>
      )}
      <SimpleGrid columns={4} spacing={8}>
        {searchResults.map((book) => (
          <VStack key={book.id} maxW="sm" borderWidth="1px" borderRadius="lg" overflow="hidden" spacing={8}>
            <Image src={book.volumeInfo.imageLinks?.thumbnail} width={40} height={60} paddingTop={2} />
            <Badge borderRadius="full" px="2" colorScheme="#EFBE93">
              {book.volumeInfo.categories?.join(", ")}
            </Badge>
            <VStack>
              <Badge colorScheme="yellow">
                Google Rating:{" "}
                {book.volumeInfo.averageRating ? book.volumeInfo.averageRating : "N/A"}
              </Badge>
              <Text textAlign="center">
                Author: {book.volumeInfo.authors?.join(", ")}
              </Text>
            </VStack>
            <VStack>
              <Heading size="md"> {book.volumeInfo.title}</Heading>
              <Text padding={3} color="gray">
                {extractTextFromHTML(
                  book.searchInfo?.textSnippet ||
                    book.volumeInfo.subtitle ||
                    "No description available"
                )}
              </Text>
              <Center paddingBottom={2}>
                <Button variant="outline" onClick={() => addBook(book)}>
                  <HStack>
                    <AddIcon w={4} h={4} color="#EFBE93"></AddIcon>
                    <Text> Add Book </Text>
                  </HStack>
                </Button>
              </Center>
            </VStack>
          </VStack>
        ))}
      </SimpleGrid>
    </VStack>
  );
}
