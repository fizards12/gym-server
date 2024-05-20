# Gym Application Backend Server

This is the backend server for a gym application built using Express.js. The server provides APIs to handle user data, user registration, authentication, authorization, and notifications.

- Server deployed on Render
    - URL: [Gym server](https://gym-server-qdnf.onrender.com)

## Features

### User Data Management
***
- **Endpoints:**
  - `GET /users/all`: Retrieve a list of all users. **(admin scope required)**
    - **Headers:**
        - `authorization` : `Bearer ${token}`
    - **response:**
        - `status` : `200`
        - `data: array[users]`: array of users *- User Schema-based; **password excluded** -*
  - `GET /users/:id`: Retrieve detailed information of a specific user. **(admin, or user scope required)**
    - **response:**
        - `status` : `200`
        - `data`: user information - **User Schema-based; *password excluded*** -
    - **Headers:**
        - `authorization` : `Bearer ${token}`
  - `DELETE /users/:id`: Delete a specific user. **(admin, or user scope required)**
    - **response:**
        - `status` : `204`
    - **Headers:**
        - `authorization` : `Bearer ${token}`
  <!-- - `PUT /users/:id`: Update information of a specific user. -->
- **Data Handling:**
  - Stores user information.
  - Utilizes MongoDB for scalable and flexible data storage.

### User Registration
***
- **Endpoints:**
  - `POST /auth/register`: Register a new user.
    - **Body:** 
        - `name`
        - `username`
        - `email`
        - `password`
        - `role`
    - **Headers:**
        - `authorization` : `Bearer ${token}`
    - **Response:**
        - `status` : `201`
        - `data`: `type`
            - `type`: type of sucess message
                - `"Registered-SendingMailFailure"` : registeration succeed but failed to send activation mail to the mail provided.
                - `"Registerd-SendingMailSuccess"`: registeration succeed and actiavation mail sent to the user email.
- **Functionality:**
  - Validates user input (e.g., email, password).
  - Hashes passwords using bcrypt for secure storage.
  - Stores user details in the database.

### Authentication
***
- **Endpoints:**
  - `POST /auth/login`: Authenticate a user and provide a JWE token.
    - **Body:** 
        - `email`
        - `password`
    - **Headers:**
        - `authorization` : `Bearer ${token}`
    - **Response:**
        - `status` : `200`
        - `data`: `token`
  
  - `POST /auth/logout/:id`: logging out a user and block the refresh and access tokens from future use.
    - **Headers:**
        - `authorization` : `Bearer ${token}`
    - **Response:**
        - `status` : `204`

- **Functionality:**
  - Verifies user credentials.
  - Generates JWT tokens for session management.
  - Implements session expiry and refresh tokens for continued access.

### Auto Authentication Endpoint
***
- `GET /auth/auto`: generate new access token.
    - **Response:**
        - `status` : `200`
        - `data` : `token`

### Scope Authorization
***
- **Middleware:**
  - `authMiddleware`: Checks for a valid JWT token in request headers 
  and Ensures the user has the appropriate role for accessing certain endpoints (e.g., admin vs. member).

### Notification System
***
- **Using Socket.io:**
  - Real-time notifications using WebSockets.
- **Events:**
  - `send-notification`: Triggered when a new notification is sent to users.
  - `receive-notification`: Triggered when the client receives a notification.
  - `read-notification`: Triggered when the client reads a notification.
  - `read-reaction`: Triggered when the client receives the reaction of reading notification.

- **Functionality:**
  - Utilizes services like NodeMailer for email.

## Technical Stack
- **Node.js**: JavaScript runtime environment.
- **Express.js**: Web framework for Node.js.
- **MongoDB**: NoSQL database for storing user data and notifications.
- **JWT (JsonWebToken)**: For secure token-based authentication.
- **Node-Jose**: For encrypting JWT token generated by *JsonWebToken* library.
- **bcrypt**: For hashing user passwords.
- **NodeMailer**: For sending email notifications.
- **Socket.io**: For real-time communication.
- **Redis**: For caching refresh tokens.

## Security Measures
- **Password Hashing**: Uses bcrypt to securely hash user passwords.
- **JWE Tokens (Json Web Encryption)**: Ensures secure user authentication and session management.
- **Input Validation**: Validates all input data to prevent XSS attacks.
- **HTTPS**: Enforces HTTPS to secure data transmission.

## Scalability Considerations
- **Caching**: Utilizes Redis for caching frequently accessed data and reducing database load.
- **Microservices Architecture**: Modular design for scaling individual services independently.

## Schemas:
### User:
- `name : string`
- `username : string`
- `email : string`
- `password : string` **encrypted by Bcrypt**
- `activated: boolean`
- `role: string`
- `notifications: array[]`
    - each array element is an object: 
        - `read: boolean`
        - `notification: ObjectId` 
            - **refers to notification document on notifications collection**
- `member_id: number`

### Notification:
- `message: string` 
    - **( It's set to be unique )**
- `sender: ObjectId`
 - **refers to the *user* document who sent the message on *users* collection** 

### Token:
- `token: string`
- `status: string`
    - used to differ between **blocked** tokens and **activation** tokens.


## Validation Schema:
### User fields:
- name: 
    - only alphabet characters
    - minimum length **6 characters**
    - maximum length **50 characters**
- username: 
    - always starts with alphabet character
    - minimum length **6 characters**
    - maximum length **20 characters**
- email: 
    - has email format
- password: 
    - at least one small letter
    - at least one capital letter
    - at least one of this special characters: `@, #, %`
    - minimum length **12 characters**
    - maximum length **30 characters**
- role:
    - values: `"admin" | "co-admin" | "user"`

***Note:*** if you entered `member_id`, `notifications`, or `activated`, the validation will fail and will response error `"ValidationError"`.

## Error Types ,and its status code:
- VALIDATION_ERROR : 
    - value: `"ValidationError"`
    - status-code: `400`
    - response: `data : object`
        - `error: array[]`: contain array of errors
- CREDENTIALS_ERROR : 
    - value: `"CredentialsError"`
    - status-code: `400`
    - response: `data : object`
        - `error: array[] | ["CredentialsError"]`: contain array of errors
- INVALID_AUTH_HEADER : 
    - value: `"InvalidAuthorizationHeader"`
    - status-code: `403`
    - response: `data:object`
        - `error` = `"InvalidAuthorizationHeader"`
        - `type` = `"access"` 
- TOKEN_NOT_FOUND_ERROR : 
    - value: `"TokenNotFoundError"`
    - status-code: `401`
    - response: `data:object`
        - `error` = `"TokenNotFoundError"`
        - `type` = `"access" | "refresh" | "activate"`
- TOKEN_EXPIRATION_ERROR : 
    - value: `"TokenExpiredError"`
    - status-code: `401`
    - response: `data:object`
        - `error` = `"TokenExpiredError"`
        - `type` = `"access" | "refresh" | "activate"`
- TOKEN_TYPE_ERROR : 
    - value: `"TokenTypeError"`
    - status-code: `500`
    - response: `data:object`
        - `error` = `"TokenTypeError"`
        - `type` = `"access" | "refresh" | "activate"`
- INVALID_TOKEN_CREDENTIALS_ERROR : 
    - value: `"InvalidTokenCredentialsError"`
    - status-code: `401`
    - response: `data:object`
        - `error` = `"InvalidTokenCredentialsError"`
        - `type` = `"access" | "refresh" | "activate"`
- TOKEN_ERROR : 
    - value: `"JsonWebTokenError"`
    - status-code: `401`
    - response: `data:object`
        - `error` = `"JsonWebTokenError"`
        - `type` = `"access" | "refresh" | "activate"`
- SCOPE_ERROR : 
    - value: `"InvalidScopeError"`
    - status-code: `403`
    - response: `data:object`
        - `error` = `"InvalidScopeError"`
- MAIL_FAILURE_ERROR : 
    - value: `"SendingMailError"`
    - status-code: `403`
    - response: `data:object`
        - `error` = `"SendingMailError"`
        - `type` = `"access" | "refresh" | "activate"`
- ACC_ACTIVATION_ERROR : 
    - value: `"AccountActivationError"`
    - status-code: `403`
    - response: `data:object`
        - `error` = `"AccountActivationError"`

## Getting Started

### Prerequisites
- Node.js
- MongoDB
- Redis

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/fizards12/gym-server.git
   cd gym-server
   npm install
#### Set up environment variables:
- PORT
- SALTS_ROUNDS
- ACTIVATION_TOKEN_SECRET
- JWE_KEY_ACTIVATION
- JWE_KEY
- REDIS_USER
- REDIS_PASSWORD
- REDIS_URI
- REFRESH_TOKEN_SECRET
- ACCESS_TOKEN_SECRET
- MONGODB_URI
- SENDER_EMAIL_ADDRESS
- SENDER_PASSWORD
- ENV

#### Runing Server (Development environment):

```bash
npm run dev
```
The server will start on **http://localhost:1000** if **PORT** variable not provided.