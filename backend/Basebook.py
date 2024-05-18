from fastapi import FastAPI, HTTPException, Depends, status, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import List, Optional
import psycopg2
import bcrypt
from jose import JWTError, jwt
from passlib.context import CryptContext

# Models
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

# Security constants
SECRET_KEY = "your_secret_key"  # Change this to a secure value
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Sample user database
db = {
    "Sara": {
        "username": "Sara",
        "full_name": "SaraBS",
        "email": "Bs@gmail.com",
        "hashed_password": "",  
        "disabled": False
    }
}

# Models for authentication
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str or None = None

class User(BaseModel):
    username: str
    email: str or None = None
    full_name: str or None = None
    disabled: bool or None = None

class UserInDB(User):
    hashed_password: str

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme for token handling
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Function to verify password
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Function to get user from the database
def get_user(db, username: str):
    if username in db:
        user_data = db[username]
        return UserInDB(**user_data)

# Function to authenticate user
def authenticate_user(db, username: str, password: str):
    user = get_user(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False

    return user

# Function to create access token
def create_access_token(data: dict, expires_delta: timedelta or None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Dependency to get current user from token
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credential_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"}
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credential_exception

        token_data = TokenData(username=username)
    except JWTError:
        raise credential_exception

    user = get_user(db, username=token_data.username)
    if user is None:
        raise credential_exception

    return user

# Dependency to get current active user
async def get_current_active_user(current_user: UserInDB = Depends(get_current_user)):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")

    return current_user

# Login endpoint to issue access tokens
@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Example of a protected route
@app.get("/users/me/", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

# Your existing routes...

# Database connection configuration
def get_connection():
    return psycopg2.connect(
        database="library", user="postgres", password="Little2023", host="0.0.0.0"
    )

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
