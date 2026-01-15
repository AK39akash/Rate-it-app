# API Documentation – Store Rating System

**Base URL:** `https://rate-it-app.onrender.com/api`

---

## 🔐 Authentication

### Register

**POST** `/auth/register`

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "address": "New York"
}
```

### Login

**POST** `/auth/login`

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "token": "JWT_TOKEN",
  "user": { "id": 1, "name": "John Doe", "role": "USER" }
}
```

### Get Current User

**GET** `/auth/me`
_Headers: `Authorization: Bearer TOKEN`_

### Update Password (User)

**PUT** `/auth/user/update-password`
_Headers: `Authorization: Bearer TOKEN`_

```json
{ "password": "newpassword123" }
```

---

## 🛍️ Stores (Public)

### Get All Stores

**GET** `/stores`

- **Query Params:**
  - `q`: Search term (name or address)
  - `sort`: `name`, `rating`
  - `order`: `ASC`, `DESC`
  - `page`: Page number (default 1)
  - `limit`: Items per page (default 20)

### Get Store Details

**GET** `/stores/:id`
_Returns store details, average rating, and current user's rating (if logged in)._

---

## ⭐ Ratings

### Create / Update Rating

**POST** `/ratings`
_Headers: `Authorization: Bearer TOKEN`_

```json
{
  "storeId": 5,
  "value": 4
}
```

---

## 🏪 Store Owner

### Get My Stores

**GET** `/stores/my-stores`
_Headers: `Authorization: Bearer TOKEN`_

### Get Store Raters

**GET** `/ratings/store/:storeId/raters`
_Headers: `Authorization: Bearer TOKEN` (Owner only)_

- **Query Params:** `sort` (value, name, email), `order` (ASC, DESC)

### Update Password (Owner)

**PUT** `/owner/update-password`
_Headers: `Authorization: Bearer TOKEN`_

```json
{ "password": "newpassword123" }
```

---

## 🛡️ Admin

### Get Stats

**GET** `/admin/stats`
_Headers: `Authorization: Bearer TOKEN` (Admin only)_

### Manage Users

- **GET** `/admin/users`: List all users
- **POST** `/admin/users`: Create user
- **PUT** `/admin/users/:id`: Update user
- **DELETE** `/admin/users/:id`: Delete user

### Manage Stores

- **GET** `/admin/stores`: List all stores
- **POST** `/admin/stores`: Create store
- **PUT** `/admin/stores/:id`: Update store
- **DELETE** `/admin/stores/:id`: Delete store
