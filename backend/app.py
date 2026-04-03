from flask import Flask, request, jsonify
import mysql.connector

app = Flask(__name__)

db = mysql.connector.connect(
host="localhost",
user="root",
password="your_password",
database="smart_attendance"
)

cursor = db.cursor()

import cv2
import face_recognition
import numpy as np


def get_embedding(image):

    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    faces = face_recognition.face_encodings(rgb)

    if len(faces)>0:
        return faces[0]

    return None
    @app.route("/register", methods=["POST"])
def register():

    name = request.form["name"]

    file = request.files["image"]

    image = cv2.imdecode(
        np.frombuffer(file.read(), np.uint8),
        cv2.IMREAD_COLOR
    )

    embedding = get_embedding(image)

    cursor.execute(
    "INSERT INTO students(name, face_embedding) VALUES (%s,%s)",
    (name, embedding.tobytes())
    )

    db.commit()

    return "Registered"