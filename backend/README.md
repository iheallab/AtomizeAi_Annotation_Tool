# Go Backend Service with MongoDB

This is a backend service written in **Go (Golang)** designed to handle user authentication, file handling, and data querying over a MongoDB database. It's structured for modularity, testability, and cloud deployment (e.g., Google Cloud App Engine).

---

## 📁 Project Structure

```
backend/
├── app.go                   # Entry point for the application
├── app.yaml                 # Configuration for Google App Engine deployment
├── go.mod / go.sum          # Go modules and dependency management
├── start_mongodb.sh         # Script to start a MongoDB instance locally
├── db/                      # MongoDB connection logic
│   └── db.go
├── models/                  # Data models
│   ├── userModel.go
│   └── dataModel.go
├── controllers/             # Business logic & request handlers
│   ├── assignmentController.go
│   ├── dataUpload.go
│   ├── fileUploadController.go
│   └── queryController.go
├── utils/                   # Utility functions (JWT, file handling, etc.)
│   ├── fileHandler.go
│   ├── jwt-Handler.go
│   ├── counterHandler.go
│   └── passwordHandler.go
├── tests/                   # Sample I/O for testing
│   ├── sample-input.json
│   └── sample-output.json
└── README.md                # Documentation
```

---

## ⚙️ Features

- User registration and password handling (hashing/verification)
- JWT-based authentication
- File upload support
- Data insertion and querying
- Google Cloud App Engine-ready deployment
- Local MongoDB support with startup script

---

## 🚀 Getting Started

### 1. **Prerequisites**

- Go 1.16+
- MongoDB (local or cloud instance)
- (Optional) Google Cloud SDK

### 2. **Installation**

```bash
git clone <your-repo-url>
cd backend
go mod tidy
```

### 3. **Running MongoDB Locally**

```bash
chmod +x start_mongodb.sh
./start_mongodb.sh
```

This will start a MongoDB server and output logs to `mongodb.log`.

### 4. **Run the Application**

```bash
go run app.go
```

## 📡 API Endpoints

The following endpoints are available in the backend. All endpoints assume the server is running on `http://localhost:8080` unless deployed.

> Authentication via JWT may be required for some routes.

### 🔐 Authentication & Users

#### `POST /register`
- Registers a new user.
- **Body**:
```json
{
  "username": "example",
  "password": "securepassword"
}
```

#### `POST /login`
- Authenticates a user and returns a JWT token.
- **Body**: same as `/register`

#### `GET /profile`
- Returns user details. Requires Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

---

### 📁 File Uploads

#### `POST /upload/file`
- Uploads a file to the server.
- **FormData**:
  - `file`: the file to upload
  - JWT token in Authorization header

---

### 📊 Data Upload & Queries

#### `POST /data/upload`
- Uploads structured JSON data to MongoDB.
- **Body**: varies depending on the schema in `dataModel.go`

#### `GET /query?param=value`
- Performs a data query. Logic is handled in `queryController.go`
- Supports filters, pagination, etc. (customize as needed)

---

## 🧰 Utility Modules

The `utils/` directory includes reusable components:

- `jwt-Handler.go`: Create and validate JWT tokens.
- `fileHandler.go`: Sanitize file names, check formats, etc.
- `counterHandler.go`: MongoDB counter (e.g. for IDs).
- `passwordHandler.go`: Password hashing (bcrypt) and verification.

---

## 🧪 Testing

Basic testing can be performed by sending `sample-input.json` to endpoints and comparing responses with `sample-output.json`.

You can use tools like:

- [Postman](https://www.postman.com/)
- [cURL](https://curl.se/)
- `httpie`

Example:

```bash
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d @tests/sample-input.json
```

---

## ☁️ Deployment (Google Cloud App Engine)

### 1. **Pre-requisites**

- Google Cloud SDK installed and authenticated
- A Google Cloud Project set up
- Enable App Engine & MongoDB (Atlas recommended)

### 2. **Setup**

- Modify `app.yaml` with environment config if needed.
- Ensure `main` file is named `app.go`.

### 3. **Deploy**

```bash
gcloud app deploy
```

Access via:

```bash
gcloud app browse
```

---

## 🧭 Contributing

1. Fork the repo
2. Create a branch (`git checkout -b feature/foo`)
3. Commit changes (`git commit -am 'Add feature foo'`)
4. Push to the branch (`git push origin feature/foo`)
5. Create a Pull Request
