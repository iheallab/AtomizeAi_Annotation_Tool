# Medical Annotation Tool

## Description

The **Medical Annotation Tool** is designed to assist annotators in validating clinical contexts and questions. Annotators can check if the provided clinical context and questions are valid, and respond to additional questions as required. This tool streamlines the annotation process for medical datasets, ensuring high-quality and accurate data for downstream applications.

## Features

- Validate clinical context and questions
- Respond to additional annotation prompts
- User-friendly interface for efficient annotation

## Tech Stack

- **Backend:** Go
- **Frontend:** React (using [stepwise](https://github.com/stepwise/stepwise))

## Installation

### Prerequisites

- [Go](https://golang.org/) installed for the backend
- [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) for the frontend

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies and run the server:
   ```bash
   go mod tidy
   go run app.go
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend-stepwise
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Start both the backend and frontend servers as described above.
2. Open your browser and navigate to the frontend URL (usually `http://localhost:3000`).
3. Log in or register as an annotator.
4. Begin annotating by validating clinical contexts and answering questions as prompted.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

[MIT License](LICENSE)

## Contact

For questions or support, please contact [your-email@example.com].
