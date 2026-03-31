# SmartFarm API Documentation

Complete API reference for the SmartFarm platform.

## Base URL
```
https://your-backend.onrender.com/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### Register
Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "farmer",
  "phone": "+1234567890",
  "address": "123 Farm Road"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "farmer",
      "created_at": "2024-01-01T00:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Login
Authenticate and receive JWT token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "farmer",
      "phone": "+1234567890",
      "address": "123 Farm Road",
      "profile_image": "url",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

## User Endpoints

### Get Profile
Get current user's profile.

**Endpoint:** `GET /users/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "farmer",
    "phone": "+1234567890",
    "address": "123 Farm Road",
    "profile_image": "url",
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### Update Profile
Update user profile information.

**Endpoint:** `PUT /users/profile`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "+0987654321",
  "address": "456 New Road"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "uuid",
    "name": "John Updated",
    "email": "john@example.com",
    "phone": "+0987654321",
    "address": "456 New Road",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### Upload Profile Image
Upload a profile picture.

**Endpoint:** `POST /users/profile/image`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
```
image: <file>
```

**Response:**
```json
{
  "success": true,
  "message": "Profile image uploaded successfully",
  "data": {
    "profile_image": "uploads/profiles/profile_uuid_timestamp.jpg"
  }
}
```

---

## Crop Endpoints

### List Crops
Get all crops with optional filters.

**Endpoint:** `GET /crops`

**Query Parameters:**
- `search` (string) - Search by name or description
- `category` (string) - Filter by category
- `farmer_id` (uuid) - Filter by farmer
- `status` (string) - Filter by status (available, sold, out_of_stock)
- `min_price` (number) - Minimum price
- `max_price` (number) - Maximum price
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "crops": [
      {
        "id": "uuid",
        "farmer_id": "uuid",
        "name": "Organic Tomatoes",
        "category": "Vegetables",
        "price": 5.99,
        "quantity": 100,
        "unit": "kg",
        "description": "Fresh organic tomatoes",
        "image": "url",
        "status": "available",
        "farmer_name": "John Doe",
        "farmer_phone": "+1234567890",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "total_pages": 5
    }
  }
}
```

### Get Crop Details
Get single crop by ID.

**Endpoint:** `GET /crops/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "farmer_id": "uuid",
    "name": "Organic Tomatoes",
    "category": "Vegetables",
    "price": 5.99,
    "quantity": 100,
    "unit": "kg",
    "description": "Fresh organic tomatoes",
    "image": "url",
    "status": "available",
    "farmer_name": "John Doe",
    "farmer_phone": "+1234567890",
    "farmer_email": "john@example.com",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### Create Crop
Create a new crop listing (Farmer only).

**Endpoint:** `POST /crops`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Organic Tomatoes",
  "category": "Vegetables",
  "price": 5.99,
  "quantity": 100,
  "unit": "kg",
  "description": "Fresh organic tomatoes from my farm",
  "image": "url"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Crop created successfully",
  "data": {
    "id": "uuid",
    "farmer_id": "uuid",
    "name": "Organic Tomatoes",
    "category": "Vegetables",
    "price": 5.99,
    "quantity": 100,
    "unit": "kg",
    "description": "Fresh organic tomatoes from my farm",
    "image": "url",
    "status": "available",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Update Crop
Update crop information.

**Endpoint:** `PUT /crops/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Premium Organic Tomatoes",
  "price": 6.99,
  "quantity": 80
}
```

**Response:**
```json
{
  "success": true,
  "message": "Crop updated successfully",
  "data": {
    "id": "uuid",
    "name": "Premium Organic Tomatoes",
    "price": 6.99,
    "quantity": 80,
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### Delete Crop
Delete a crop listing.

**Endpoint:** `DELETE /crops/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Crop deleted successfully",
  "data": null
}
```

---

## Order Endpoints

### List Orders
Get all orders for the current user.

**Endpoint:** `GET /orders`

**Query Parameters:**
- `status` (string) - Filter by status (pending, accepted, delivered, canceled)
- `page` (number) - Page number
- `limit` (number) - Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "uuid",
        "buyer_id": "uuid",
        "farmer_id": "uuid",
        "crop_id": "uuid",
        "quantity": 10,
        "total_price": 59.90,
        "status": "pending",
        "delivery_address": "123 Main St",
        "notes": "Please deliver in the morning",
        "crop_name": "Organic Tomatoes",
        "crop_image": "url",
        "unit": "kg",
        "buyer_name": "Jane Smith",
        "buyer_phone": "+0987654321",
        "farmer_name": "John Doe",
        "farmer_phone": "+1234567890",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "total_pages": 3
    }
  }
}
```

### Get Order Details
Get single order by ID.

**Endpoint:** `GET /orders/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "buyer_id": "uuid",
    "farmer_id": "uuid",
    "crop_id": "uuid",
    "quantity": 10,
    "total_price": 59.90,
    "status": "pending",
    "delivery_address": "123 Main St",
    "notes": "Please deliver in the morning",
    "crop_name": "Organic Tomatoes",
    "crop_image": "url",
    "unit": "kg",
    "buyer_name": "Jane Smith",
    "buyer_phone": "+0987654321",
    "buyer_email": "jane@example.com",
    "farmer_name": "John Doe",
    "farmer_phone": "+1234567890",
    "farmer_email": "john@example.com",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### Create Order
Place a new order (Buyer only).

**Endpoint:** `POST /orders`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "crop_id": "uuid",
  "quantity": 10,
  "delivery_address": "123 Main St, City, Country",
  "notes": "Please deliver in the morning"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "id": "uuid",
    "buyer_id": "uuid",
    "farmer_id": "uuid",
    "crop_id": "uuid",
    "quantity": 10,
    "total_price": 59.90,
    "status": "pending",
    "delivery_address": "123 Main St, City, Country",
    "notes": "Please deliver in the morning",
    "crop_name": "Organic Tomatoes",
    "crop_image": "url",
    "unit": "kg",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Update Order Status
Update order status (Farmer can accept/deliver, Buyer can cancel).

**Endpoint:** `PUT /orders/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "accepted"
}
```

**Valid Status Transitions:**
- `pending` → `accepted` (Farmer)
- `pending` → `canceled` (Buyer)
- `accepted` → `delivered` (Farmer)
- `accepted` → `canceled` (Buyer)

**Response:**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "id": "uuid",
    "status": "accepted",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

## Dashboard Endpoints

### Get Dashboard Stats
Get dashboard statistics for current user.

**Endpoint:** `GET /dashboard`

**Response (Farmer):**
```json
{
  "success": true,
  "data": {
    "total_crops": 10,
    "available_crops": 8,
    "total_orders": 25,
    "pending_orders": 5,
    "delivered_orders": 20,
    "total_earnings": 1500.00,
    "recent_orders": [
      {
        "id": "uuid",
        "crop_name": "Organic Tomatoes",
        "buyer_name": "Jane Smith",
        "total_price": 59.90,
        "status": "pending"
      }
    ]
  }
}
```

**Response (Buyer):**
```json
{
  "success": true,
  "data": {
    "total_orders": 15,
    "pending_orders": 3,
    "delivered_orders": 12,
    "total_spent": 850.00,
    "recent_orders": [
      {
        "id": "uuid",
        "crop_name": "Organic Tomatoes",
        "farmer_name": "John Doe",
        "total_price": 59.90,
        "status": "delivered"
      }
    ]
  }
}
```

### Get Farmer Stats
Get detailed farmer statistics.

**Endpoint:** `GET /dashboard/farmer`

**Response:**
```json
{
  "success": true,
  "data": {
    "monthly_earnings": [
      {
        "month": "2024-01-01T00:00:00Z",
        "order_count": 10,
        "earnings": 500.00
      }
    ],
    "crop_performance": [
      {
        "name": "Organic Tomatoes",
        "orders": 15,
        "quantity_sold": 150,
        "revenue": 898.50
      }
    ]
  }
}
```

### Get Buyer Stats
Get detailed buyer statistics.

**Endpoint:** `GET /dashboard/buyer`

**Response:**
```json
{
  "success": true,
  "data": {
    "category_spending": [
      {
        "category": "Vegetables",
        "orders": 10,
        "total_spent": 500.00
      }
    ],
    "top_farmers": [
      {
        "farmer_name": "John Doe",
        "orders": 5,
        "total_spent": 300.00
      }
    ]
  }
}
```

---

## Admin Endpoints

### List Users
Get all users (Admin only).

**Endpoint:** `GET /admin/users`

**Query Parameters:**
- `role` (string) - Filter by role
- `status` (string) - Filter by status
- `search` (string) - Search by name or email
- `page` (number) - Page number
- `limit` (number) - Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "farmer",
        "phone": "+1234567890",
        "status": "active",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "total_pages": 5
    }
  }
}
```

### Get User Details
Get detailed user information.

**Endpoint:** `GET /admin/users/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "farmer",
    "phone": "+1234567890",
    "address": "123 Farm Road",
    "profile_image": "url",
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z",
    "crops": [...],
    "stats": {
      "total_crops": 10,
      "total_orders": 25,
      "total_earnings": 1500.00
    },
    "recent_orders": [...]
  }
}
```

### Update User
Update user information.

**Endpoint:** `PUT /admin/users/:id`

**Request Body:**
```json
{
  "name": "John Updated",
  "email": "john.new@example.com",
  "role": "buyer",
  "status": "suspended"
}
```

### Delete User
Delete a user account.

**Endpoint:** `DELETE /admin/users/:id`

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": null
}
```

### Get Platform Statistics
Get platform-wide statistics.

**Endpoint:** `GET /admin/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_farmers": 50,
      "total_buyers": 150,
      "total_crops": 200,
      "total_orders": 500,
      "pending_orders": 50,
      "delivered_orders": 450,
      "total_revenue": 25000.00
    },
    "user_growth": [...],
    "order_trends": [...],
    "top_farmers": [...],
    "top_buyers": [...]
  }
}
```

### Get Revenue Statistics
Get revenue analytics.

**Endpoint:** `GET /admin/stats/revenue?period=monthly`

**Query Parameters:**
- `period` (string) - daily, monthly, yearly

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "month": "2024-01-01T00:00:00Z",
        "order_count": 50,
        "revenue": 2500.00
      }
    ],
    "total": 25000.00,
    "this_month": 2500.00
  }
}
```

### Get Crop Statistics
Get crop analytics.

**Endpoint:** `GET /admin/stats/crops`

**Response:**
```json
{
  "success": true,
  "data": {
    "by_category": [
      {
        "category": "Vegetables",
        "crop_count": 50,
        "total_quantity": 5000,
        "avg_price": 5.99
      }
    ],
    "popular_crops": [...],
    "availability": [
      {
        "status": "available",
        "count": 150
      }
    ]
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid request data",
  "data": null
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authorization token required",
  "data": null
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions",
  "data": null
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found",
  "data": null
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "data": null
}
```

---

## Status Codes

| Status | Description |
|--------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

---

## Data Types

### User Roles
- `farmer` - Can list crops and manage orders
- `buyer` - Can browse and order crops
- `admin` - Full platform access

### Order Status
- `pending` - Order placed, awaiting farmer acceptance
- `accepted` - Farmer accepted the order
- `delivered` - Order completed
- `canceled` - Order canceled

### Crop Status
- `available` - Available for purchase
- `sold` - Completely sold out
- `out_of_stock` - Temporarily unavailable
- `pending` - Awaiting approval

### User Status
- `active` - Account is active
- `suspended` - Account temporarily suspended
- `inactive` - Account deactivated
