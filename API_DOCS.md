# API Documentation – Store Rating System

Base URL:
http://localhost:4002/api

---

## Authentication

### Register
POST /auth/register

Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "address": "Delhi"
}

---

### Login
POST /auth/login

Body:
{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "token": "JWT_TOKEN",
  "user": {
    "id": 1,
    "name": "John Doe",
    "role": "USER"
  }
}

---

## User

### Get Profile
GET /auth/profile  
Authorization: Bearer TOKEN

---

### Update Password
PUT /auth/user/update-password  
Authorization: Bearer TOKEN

Body:
{
  "password": "newpassword123"
}

---

## Stores

### Get All Stores
GET /stores?q=&sort=name&order=ASC  
Authorization: Bearer TOKEN

---

### Get Owner Stores
GET /stores/my-stores  
Authorization: Bearer TOKEN

---

## Ratings

### Create / Update Rating
POST /ratings  
Authorization: Bearer TOKEN

Body:
{
  "storeId": 5,
  "value": 4
}

---

### Get Store Raters (Owner)
GET /ratings/store/:storeId/raters  
Authorization: Bearer TOKEN

Query Params:
- sort = value | name | email
- order = ASC | DESC

---

## Admin

### Create User
POST /admin/users  
Authorization: Bearer TOKEN

---

### Create Store
POST /admin/stores  
Authorization: Bearer TOKEN
