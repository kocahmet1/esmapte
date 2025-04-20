# PTE Practice App

## Overview

The PTE Practice App is an interactive web application designed to help students prepare for the Pearson Test of English Academic (PTE Academic) exam. This application provides practice exercises for the Reading and Writing sections of the exam, with future plans to include Speaking and Listening sections.

## Features

### Reading Section
- Multiple Choice, Single Answer
- Multiple Choice, Multiple Answers
- Reorder Paragraphs
- Fill in the Blanks (Drag and Drop)
- Fill in the Blanks (Dropdown)

### Writing Section
- Summarize Written Text
- Write Essay

## Technology Stack

- **Frontend**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router
- **UI Components**: Custom components with React Select for dropdowns
- **Drag & Drop**: @hello-pangea/dnd (fork of react-beautiful-dnd)
- **Notifications**: React Toastify

## Getting Started

### Prerequisites

- Node.js (v14 or later recommended)
- npm or yarn package manager

### Installation

1. Clone the repository or download the source code
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

### Development

To start the development server:

```bash
npm run dev
```

This will start the development server at http://localhost:5173 (or another port if 5173 is already in use)

### Build for Production

To build the application for production:

```bash
npm run build
```

The build files will be generated in the `dist` directory.

### Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

## Data Storage

The application uses browser's localStorage to store:

- User progress and scores
- Writing exercise responses

No server-side database is required for this MVP version.

## Future Enhancements

- Add Speaking section exercises
- Add Listening section exercises
- Implement user authentication
- Add AI-based scoring for writing and speaking exercises
- Add more sample questions for each exercise type
- Support for mobile devices

## License

This project is intended for educational purposes only. The PTE Academic exam is a registered trademark of Pearson Education Ltd.

