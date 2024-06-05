import React, { useState, useEffect } from 'react';
import { VStack, Button, Image, Text, Center, Heading, useToast } from "@chakra-ui/react";
import ReactStars from "react-rating-stars-component";

export default function LibraryBook({ book, fetchData }) {
  const [rating, setRating] = useState(() => {
    const savedRating = localStorage.getItem(`book-rating-${book.id}`);
    return savedRating ? parseInt(savedRating, 10) : book.rating || 0;
  });
  const bookMoveToast = useToast();

  useEffect(() => {
    localStorage.setItem(`book-rating-${book.id}`, rating);
  }, [rating, book.id]);

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const moveBook = (book, newSection) => {
    const body = JSON.stringify({
      volume_id: book.volume_id,
      new_state: newSection
    });

    fetch("http://127.0.0.1:8000/books/update_book_state", {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: body,
    })
      .then(response => response.json())
      .then(data => {
        bookMoveToast({
          title: "Moved",
          description: "Book moved to a different section",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchData();
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  return (
    <VStack
      maxW="sm"
      borderWidth="1px"
      borderRadius="lg"
      overflow={8}
      key={book.id}
      padding={4}
    >
      <Image src={book.thumbnail} width={40} height={60} paddingTop={2}/>
      <Center>
        <Heading size="sm">{book.title}</Heading>
      </Center>
      {book.state === 0 && !rating && (
        <Text fontSize="sm">Rate Book ?</Text>
      )}
      {book.state === 0 && (
        <ReactStars
          count={5}
          onChange={handleRatingChange}
          size={24}
          activeColor="#ffd700"
          value={rating}
        />
      )}
      {book.state === 1 && (
        <Button
          variant="outline"
          colorScheme="red"
          size="sm"
          onClick={() => moveBook(book, 0)}
        >
          Completed Book ?
        </Button>
      )}
      {book.state === 2 && (
        <Button
          variant="outline"
          colorScheme="red"
          size="sm"
          onClick={() => moveBook(book, 1)}
        >
          Purchased Book ?
        </Button>
      )}
    </VStack>
  );
}
