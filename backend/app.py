from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import cv2
import face_recognition
import numpy as np

app = Flask(__name__)
CORS(app)

# MySQL connection
db = mysql.connector.connect(
host="localhost",
user="root",
password="YOUR_PASSWORD",
database="smart_attendance"
)

cursor = db.cursor()



def get_embedding(image):

    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    encodings = face_recognition.face_encodings(rgb)

    if len(encodings) > 0:
        return encodings[0]

    return None



@app.route("/register", methods=["POST"])
def register():

    name = request.form["name"]

    file = request.files["image"]

    img = cv2.imdecode(
        np.frombuffer(file.read(), np.uint8),
        cv2.IMREAD_COLOR
    )

    embedding = get_embedding(img)

    if embedding is None:
        return "Face not detected"

    cursor.execute(
    "INSERT INTO students(name, face_embedding) VALUES (%s,%s)",
    (name, embedding.tobytes())
    )

    db.commit()

    return "Student Registered"



@app.route("/verify", methods=["POST"])
def verify():

    file = request.files["image"]

    img = cv2.imdecode(
        np.frombuffer(file.read(), np.uint8),
        cv2.IMREAD_COLOR
    )

    embedding = get_embedding(img)

    if embedding is None:
        return "No face detected"

    cursor.execute("SELECT * FROM students")

    students = cursor.fetchall()

    for student in students:

        stored_embedding = np.frombuffer(student[2], dtype=np.float64)

        match = face_recognition.compare_faces(
            [stored_embedding],
            embedding
        )

        if match[0]:

            cursor.execute(
            "INSERT INTO logs(student_name,event) VALUES(%s,%s)",
            (student[1], "Attendance marked")
            )

            db.commit()

            return student[1]

    return "Unknown"




@app.route("/detect", methods=["POST"])
def detect():

    file = request.files["image"]

    img = cv2.imdecode(
        np.frombuffer(file.read(), np.uint8),
        cv2.IMREAD_COLOR
    )

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    blur_score = cv2.Laplacian(
        gray,
        cv2.CV_64F
    ).var()

    faces = face_recognition.face_locations(img)

    event = None

    if len(faces) > 1:
        event = "Multiple faces detected"

    elif blur_score < 50:
        event = "Camera blurred"

    if event:

        cursor.execute(
        "INSERT INTO logs(student_name,event) VALUES(%s,%s)",
        ("Unknown", event)
        )

        db.commit()

        return event

    return "Normal"


############################
# TAB SWITCH LOG
############################

@app.route("/log_tab", methods=["POST"])
def log_tab():

    cursor.execute(
    "INSERT INTO logs(student_name,event) VALUES(%s,%s)",
    ("Unknown", "Tab switched")
    )

    db.commit()

    return "logged"



# GET LOGS (ADMIN)


@app.route("/logs")
def logs():

    cursor.execute("SELECT * FROM logs ORDER BY time DESC")

    data = cursor.fetchall()

    return jsonify(data)




if __name__ == "__main__":
    app.run(debug=True)