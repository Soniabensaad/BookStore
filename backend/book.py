from fastapi import FastAPI, HTTPException, Depends, status, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import List, Optional
import psycopg2
import bcrypt

class Book(BaseModel):
    id: int = None
    volume_id: str
    title: str
    authors: Optional[str] = None  
    thumbnail: Optional[str] = None
    state: int
    rating: Optional[int] = None

class Book_id(BaseModel):
    id: int = None
    title: str
    authors: str = None

class UpdateRating(BaseModel):
    volume_id: str
    new_rating: int

class DeleteBook(BaseModel):
    volume_id: str

class UpdateState(BaseModel):
    volume_id: str
    new_state: int


# FastAPI instance
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update this with your frontend URL
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)


# Books routes
@app.get("/books", response_model=List[Book], status_code=status.HTTP_200_OK)
async def get_books():
    conn = psycopg2.connect(
        database="library", user="postgres", password="Little2023", host="0.0.0.0"
    )
    cur = conn.cursor()
    cur.execute("SELECT * FROM books ORDER BY book_id DESC")
    rows = cur.fetchall()
    formatted_books = []
    for row in rows:
        formatted_books.append(
            Book(
                id=row[0],
                volume_id=row[1],
                title=row[2],
                authors=row[3],
                thumbnail=row[4],
                state=row[5],
                rating=row[6]
            )
        )
    cur.close()
    conn.close()
    return formatted_books

@app.post("/books", status_code=status.HTTP_201_CREATED)
async def new_book(book: Book):
    conn = psycopg2.connect(
        database="library", user="postgres", password="Little2023", host="0.0.0.0"
    )
    cur = conn.cursor()

    # Check if the record with the same volume_id already exists
    cur.execute("SELECT volume_id FROM books WHERE volume_id = %s", (book.volume_id,))
    existing_record = cur.fetchone()
    if existing_record:
        # Record already exists, handle it accordingly
        # For example, you can update the existing record instead of inserting a new one
        pass
    else:
        # Insert the new record
        cur.execute(
            "INSERT INTO books (volume_id, title, authors, thumbnail, state) VALUES (%s, %s, %s, %s, %s)",
            (book.volume_id, book.title, book.authors, book.thumbnail, book.state),
        )
        conn.commit()

    cur.close()
    conn.close()
    return


@app.put("/books/update_rating", status_code=status.HTTP_200_OK)
async def update_rating(update_rating_request:UpdateRating):
    conn = psycopg2.connect(
        database="library", user="postgres", password="Little2023", host="0.0.0.0"
    )
    cur = conn.cursor()
    cur.execute(
        f"UPDATE books SET rating={update_rating_request.new_rating} WHERE volume_id='{update_rating_request.volume_id}'"
    )
    cur.close()
    conn.commit()
    conn.close()
    return

@app.put("/books/update_book_state", status_code=status.HTTP_200_OK)
async def update_state(update_state_book: UpdateState):
    conn = psycopg2.connect(
        database="library", user="postgres", password="Little2023", host="0.0.0.0"
    )
    cur = conn.cursor()
    cur.execute(
        f"UPDATE books SET state='{update_state_book.new_state}' WHERE volume_id='{update_state_book.volume_id}'"
    )
    cur.close()
    conn.commit()
    conn.close()
    return

@app.delete("/books/delete_book", status_code=status.HTTP_204_NO_CONTENT)
async def delete_book(deleted: DeleteBook):
    conn = psycopg2.connect(
        database="library", user="postgres", password="Little2023", host="0.0.0.0"
    )
    cur = conn.cursor()
    cur.execute(
        f"DELETE FROM books WHERE volume_id='{deleted.volume_id}'"
    )
    cur.close()
    conn.commit()
    conn.close()
    return None  

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
