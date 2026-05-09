# Smart Attendance System

An AI-powered smart attendance and exam monitoring system using Python, Flask, OpenCV, and facial recognition.

## Features
- **Student Registration**: Register students by capturing their faces via the webcam.
- **Attendance Verification**: Verify and mark attendance using facial recognition.
- **Exam Monitoring**: Detect if a student moves away, if multiple people are in the frame, or if the camera is blurred. Also logs if the user switches tabs.
- **Admin Dashboard**: View all attendance and monitoring logs in a premium Glassmorphism UI.

## Prerequisites
- Python 3.8+
- MySQL Server

## Setup Instructions

1. **Database Setup**
   Ensure MySQL is running and execute the following queries:
   ```sql
   CREATE DATABASE smart_attendance;
   USE smart_attendance;

   CREATE TABLE students (
       id INT AUTO_INCREMENT PRIMARY KEY,
       name VARCHAR(255) NOT NULL,
       face_embedding BLOB NOT NULL
   );

   CREATE TABLE logs (
       id INT AUTO_INCREMENT PRIMARY KEY,
       student_name VARCHAR(255) NOT NULL,
       event VARCHAR(255) NOT NULL,
       time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

2. **Configure Backend**
   Open `backend/app.py` and update the database connection password on line 15:
   ```python
   db = mysql.connector.connect(
       host="localhost",
       user="root",
       password="YOUR_PASSWORD", # Update this!
       database="smart_attendance"
   )
   ```

3. **Install Dependencies**
   It's recommended to use a virtual environment. From the project root, run:
   ```bash
   pip install -r requirements.txt
   ```
   *Note: `face_recognition` requires `cmake` to be installed on your system.*

4. **Run the Backend Server**
   ```bash
   cd backend
   python app.py
   ```
   The Flask API will start at `http://127.0.0.1:5000`.

5. **Run the Frontend**
   Simply open `frontend/index.html` in your web browser. No server is required for the frontend as it's static HTML/JS/CSS that communicates with the Flask backend.

## Project Structure
- `/backend`: Contains the Python Flask application and logic.
- `/frontend`: Contains the UI (HTML, CSS, JS) with a modern Glassmorphism design.
- `/requirements.txt`: Python package dependencies.
