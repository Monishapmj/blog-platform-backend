COMPANY : CODTECH IT SOLUTIONS 
NAME : MONISHA J 
INTERN ID : CT04DL69
DOMAIN : BACK END DEVELOPMENT 
DURATION : 4 WEEKS 
MENTOR : NEELA SANTHOSH KUMAR

# blog-platform-backend

## 🚀 Features

- 🧑 User Registration & Login with hashed passwords
- ✍️ Create, update, and delete blog posts
- 📚 Categorize and retrieve posts
- 🔐 JWT-based authentication and protected routes
- 📁 MySQL integration using `mysql2`
- ⚙️ Modular and RESTful route structure

## 📦 Requirements

- Node.js (v16+)
- MySQL server
- Postman or browser for API testing
  

## 🗂️ Folder Structure

## 💾 MySQL Setup

1. Start your MySQL server
2. Create a database:
CREATE DATABASE blogdb;
SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:<password>@localhost/blogdb'

## Install Dependencies

npm install

## Set Up .env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=blogdb
JWT_SECRET=your_jwt_secret

##  Initialize MySQL
Run this SQL in your MySQL CLI:

CREATE DATABASE blogdb;
You can also import a prewritten SQL schema if available.

## ▶️ Run the App

npm start
The server will run at:
http://localhost:5000
## 🔗 API Endpoints
🧑 Register

POST /api/auth/register
{
  "username": "monisha",
  "email": "moni@example.com",
  "password": "secret123"
}

🔐 Login

POST /api/auth/login
{
  "email": "moni@example.com",
  "password": "secret123"
}
📝 Create Post

POST /api/posts
Headers: Authorization: Bearer <token>
{
  "title": "My First Blog",
  "content": "This is the content...",
  "category": "Tech"
}
🔄 Update Post

PUT /api/posts/:id
Headers: Authorization: Bearer <token>

❌ Delete Post

DELETE /api/posts/:id
Headers: Authorization: Bearer <token>

📚 Get All Posts

GET /api/posts
## 📷 Sample Output

{
  "message": "Post created successfully",
  "post": {
    "id": 1,
    "title": "My First Blog",
    "category": "Tech",
    "author": "monisha"
  }
}
## 📌 Future Enhancements
🖼️ Image upload for blog posts

💬 Add comment and like functionality

🌍 Build a React or HTML frontend

🧠 Add search and tags

🐳 Dockerize for deployment

## 📃 License
This project is open-source and free to use for educational and prototyping purposes.

## 🙋‍♀️ Author
Monisha J.
Designed and developed as part of backend internship at CodTech IT Solutions.


