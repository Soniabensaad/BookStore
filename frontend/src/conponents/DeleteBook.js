import React from 'react';
import { Button, useToast } from "@chakra-ui/react";

export default function DeleteBook({ book, refreshData }) {
  const toast = useToast();

  const handleDelete = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/books/delete_book", {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ volume_id: book.volume_id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete book");
      }

      refreshData();
      toast({
        title: "Deleted",
        description: "Book removed ",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting book:", error);
      toast({
        title: "Error",
        description: "Failed to delete book",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Button colorScheme="red" onClick={handleDelete}>
      Delete
    </Button>
  );
}
