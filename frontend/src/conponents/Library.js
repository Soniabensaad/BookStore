import React from 'react';
import { VStack, Heading, SimpleGrid } from "@chakra-ui/react";
import LibraryBook from './LibraryBook';

export default function Library({ allBooks, refreshData }) {
  return (
    <VStack spacing={7}>
      <Heading size="md">Completed</Heading>
      <SimpleGrid columns={6} spacing={8}>
        {allBooks && allBooks.length !== 0 &&
           allBooks.map((book) => {
            if (book.state === 0) {
              return <LibraryBook key={book.id} book={book} fetchData={refreshData} />;
            }
            return null;
           })
        }
      </SimpleGrid>

      <Heading size="md">Unfinished</Heading>
      <SimpleGrid columns={6} spacing={8}>
        {allBooks && allBooks.length !== 1 &&
           allBooks.map((book) => {
            if (book.state === 1) {
              return <LibraryBook key={book.id} book={book} fetchData={refreshData} />;
            }
            return null;
           })
        }
      </SimpleGrid>

      <Heading size="md">Wishlist</Heading>
      <SimpleGrid columns={6} spacing={8}>
        {allBooks && allBooks.length !== 0 &&
           allBooks.map((book) => {
            if (book.state === 2) {
              return <LibraryBook key={book.id} book={book} fetchData={refreshData} />;
            }
            return null;
           })
        }
      </SimpleGrid>
    </VStack>
  );
}
