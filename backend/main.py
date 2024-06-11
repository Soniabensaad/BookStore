from fastapi import FastAPI, HTTPException, Depends, status, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import List, Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
import psycopg2
import bcrypt
import json
import os
from fastapi_jwt_auth import AuthJWT
from fastapi_jwt_auth.exceptions import AuthJWTException


# Models for authentication
class Settings(BaseModel):
    authjwt_secret_key: str = '5a1b76cabf9fd659b62f0c72787909c987e7e5b1cabcf15cdc4dd7aeb77132f1'


@AuthJWT.load_config
def get_config():
    return Settings()


class User(BaseModel):
    username: str
    email: str
    password: str


    class Config:
        schema_extra = {
            "example": {
                "username": "john doe",
                "email": "johndoe@gmail.com",
                "password": "password"
            }
        }


class UserLogin(BaseModel):
    username: str
    password: str

    class Config:
        schema_extra = {
            "example": {
                "username": "jonathan",
                "password": "password"
            }
        }


users = []

# FastAPI instance
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Security constants
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Database connection configuration
def get_connection():
    return psycopg2.connect(
        database="library", user="postgres", password="Little2023", host="0.0.0.0"
    )

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Books models
class Book(BaseModel):
    id: int = None
    user_id: int
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


@app.post('/signup', status_code=201)
def create_user(user: User):
    new_user = {
        "username": user.username,
        "email": user.email,
        "password": user.password
    }

    users.append(new_user)

    return new_user


# Getting all users
@app.get('/users', response_model=List[User])
def get_users():
    return users


@app.post('/login')
def login(user: UserLogin, Authorize: AuthJWT = Depends()):
    for u in users:
        if (u["username"] == user.username) and (u["password"] == user.password):
            access_token = Authorize.create_access_token(subject=user.username)
            refresh_token = Authorize.create_refresh_token(subject=user.username)
            return {"access_token": access_token, "refresh_token": refresh_token, "redirect_to": "/discover"}

    raise HTTPException(status_code=401, detail="Invalid username or password")


# Books routes
@app.get("/books", response_model=List[Book], status_code=status.HTTP_200_OK)
async def get_books():
    conn = get_connection()
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
    conn = get_connection()
    cur = conn.cursor()

    # Check if the record with the same volume_id already exists
    cur.execute("SELECT volume_id FROM books WHERE volume_id = %s", (book.volume_id,))
    existing_record = cur.fetchone()
    if existing_record:
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
async def update_rating(update_rating_request: UpdateRating):
    conn = get_connection()
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
    conn = get_connection()
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
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        f"DELETE FROM books WHERE volume_id='{deleted.volume_id}'"
    )
    cur.close()
    conn.commit()
    conn.close()
    return None


# Run the FastAPI app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
