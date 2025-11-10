from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from cryptography.fernet import Fernet
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import bcrypt
import nltk
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta


# --------------------------------
# Load environment variables
# --------------------------------
load_dotenv()

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")

# --------------------------------
# MongoDB Connection
# --------------------------------
client = MongoClient(os.getenv("MONGO_URI"))
db = client['MINDLINKDB']
patients_col = db['Patient']
doctors_col = db['Doctor']
journals_col = db['Journals']
doctor_patients_col = db['DoctorPatients']  

# --------------------------------
# Encryption Setup
# --------------------------------
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
fernet = Fernet(ENCRYPTION_KEY.encode())

# --------------------------------
# Sentiment Analyzer Setup
# --------------------------------
custom_words = {
    "raged": -5.0, "angry": -4.0, "furious": -4.5, "mad": -3.5,
    "annoyed": -3.0, "irritated": -3.0, "hate": -3.8, "upset": -3.0,
    "depressed": -3.5, "heartbroken": -3.5, "hopeless": -3.0,
    "lonely": -2.8, "sad": -2.5,
    "happy": 3.0, "joyful": 3.2, "cheerful": 2.8, "excited": 2.5,
    "relaxed": 2.0, "content": 2.0, "grateful": 2.5
}
nltk.download('vader_lexicon')
sentiment_analyzer = SentimentIntensityAnalyzer()
sentiment_analyzer.lexicon.update(custom_words)

def analyze_mood(text):
    """Analyze mood using VADER sentiment scores."""
    scores = sentiment_analyzer.polarity_scores(text)
    compound = scores['compound']

    if compound >= 0.5:
        mood = "Happy"
    elif 0.1 <= compound < 0.5:
        mood = "Calm"
    elif -0.4 <= compound < 0.1:
        mood = "Neutral"
    elif -0.7 <= compound < -0.4:
        mood = "Sad"
    else:
        mood = "Angry"

    return {"compound": compound, "mood": mood}

# --------------------------------
# Helper functions
# --------------------------------
def encrypt_text(text):
    return fernet.encrypt(text.encode()).decode()

def decrypt_text(cipher_text):
    return fernet.decrypt(cipher_text.encode()).decode()

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

def check_password(password, hashed):
    return bcrypt.checkpw(password.encode('utf-8'), hashed)

# --------------------------------
# PATIENT REGISTRATION
# --------------------------------
@app.route('/register/patient', methods=['POST'])
def register_patient():
    data = request.get_json()
    email = data.get('email')

    if patients_col.find_one({"email": email}):
        return jsonify({"error": "Patient already exists"}), 400

    hashed_pw = hash_password(data['password'])
    patient = {
        "name": data.get('name'),
        "email": email,
        "password": hashed_pw,
        "gender": data.get('gender'),
        "age": data.get('age'),
        "profession": data.get('profession'),
        "diagnosed": data.get('diagnosed'),
        "assigned_doctor_id": None  # ✅ initially no doctor assigned
    }

    patients_col.insert_one(patient)
    return jsonify({"message": "Patient registered successfully. Please log in."}), 201

# --------------------------------
# PATIENT LOGIN
# --------------------------------
@app.route('/login/patient', methods=['POST'])
def login_patient():
    data = request.get_json()
    email, password = data.get('email'), data.get('password')

    patient = patients_col.find_one({"email": email})
    if not patient or not check_password(password, patient['password']):
        return jsonify({"error": "Invalid email or password"}), 401

    return jsonify({
        "message": "Login successful",
        "user": {
            "id": str(patient["_id"]),
            "name": patient["name"],
            "email": patient["email"],
            "gender": patient.get("gender", ""),
            "age": patient.get("age", ""),
            "profession": patient.get("profession", ""),
            "diagnosed": patient.get("diagnosed", ""),
            "assigned_doctor_id": str(patient.get("assigned_doctor_id")) if patient.get("assigned_doctor_id") else None
        }
    }), 200

# --------------------------------
# ✅ ASSIGN PATIENT TO DOCTOR
# --------------------------------
@app.route('/assign_patient', methods=['POST'])
def assign_patient_to_doctor():
    data = request.get_json()
    patient_id = data.get('patient_id')
    doctor_id = data.get('doctor_id')

    if not patient_id or not doctor_id:
        return jsonify({"error": "Missing patient_id or doctor_id"}), 400

    # ✅ Ensure both exist
    doctor = doctors_col.find_one({"_id": ObjectId(doctor_id)})
    patient = patients_col.find_one({"_id": ObjectId(patient_id)})
    if not doctor or not patient:
        return jsonify({"error": "Invalid doctor or patient ID"}), 404

    # ✅ Update patient's assigned doctor
    patients_col.update_one(
        {"_id": ObjectId(patient_id)},
        {"$set": {"assigned_doctor_id": ObjectId(doctor_id)}}
    )

    # ✅ Add to DoctorPatients cluster
    existing = doctor_patients_col.find_one({"doctor_id": ObjectId(doctor_id)})
    if existing:
        doctor_patients_col.update_one(
            {"doctor_id": ObjectId(doctor_id)},
            {"$addToSet": {"patients": ObjectId(patient_id)}}
        )
    else:
        doctor_patients_col.insert_one({
            "doctor_id": ObjectId(doctor_id),
            "patients": [ObjectId(patient_id)]
        })

    return jsonify({"message": "Patient assigned to doctor successfully!"}), 200

# --------------------------------
# ✅ GET SINGLE DOCTOR DETAILS (for assigned doctor)
# --------------------------------
@app.route('/doctor/<doctor_id>', methods=['GET'])
def get_doctor_details(doctor_id):
    doctor = doctors_col.find_one({"_id": ObjectId(doctor_id)}, {"password": 0})
    if not doctor:
        return jsonify({"error": "Doctor not found"}), 404

    # You can later expand this to include "connected_since" if you store it
    result = {
        "id": str(doctor["_id"]),
        "name": doctor.get("name", ""),
        "email": doctor.get("email", ""),
        "specialization": doctor.get("specialization", ""),
        "experience": doctor.get("experience", ""),
        "clinic_name": doctor.get("clinic_name", "")
    }
    return jsonify(result), 200


# --------------------------------
# ✅ REMOVE DOCTOR ASSIGNED TO PATIENT
# --------------------------------
@app.route('/patient/remove_doctor/<patient_id>', methods=['PATCH'])
def remove_assigned_doctor(patient_id):
    patient = patients_col.find_one({"_id": ObjectId(patient_id)})
    if not patient:
        return jsonify({"error": "Patient not found"}), 404

    doctor_id = patient.get("assigned_doctor_id")
    if not doctor_id:
        return jsonify({"error": "No doctor assigned"}), 400

    # Remove patient from doctor's list
    doctor_patients_col.update_one(
        {"doctor_id": ObjectId(doctor_id)},
        {"$pull": {"patients": ObjectId(patient_id)}}
    )

    # Unassign doctor from patient
    patients_col.update_one(
        {"_id": ObjectId(patient_id)},
        {"$set": {"assigned_doctor_id": None}}
    )

    return jsonify({"message": "Doctor removed successfully."}), 200


# --------------------------------
# ✅ VIEW ALL PATIENTS ASSIGNED TO A DOCTOR
# --------------------------------
@app.route('/doctor/<doctor_id>/patients', methods=['GET'])
def get_patients_for_doctor(doctor_id):
    record = doctor_patients_col.find_one({"doctor_id": ObjectId(doctor_id)})
    if not record:
        return jsonify({"message": "No patients assigned yet."}), 200

    patient_ids = record.get("patients", [])
    patients = list(patients_col.find({"_id": {"$in": patient_ids}}))
    result = [
        {
            "id": str(p["_id"]),
            "name": p["name"],
            "email": p["email"],
            "age": p.get("age", ""),
            "gender": p.get("gender", ""),
            "profession": p.get("profession", ""),
            "diagnosed": p.get("diagnosed", "")
        }
        for p in patients
    ]

    return jsonify(result), 200

# --------------------------------
# DOCTOR REGISTRATION
# --------------------------------
@app.route('/register/doctor', methods=['POST'])
def register_doctor():
    data = request.get_json()
    email = data.get('email')

    if doctors_col.find_one({"email": email}):
        return jsonify({"error": "Doctor already exists"}), 400

    hashed_pw = hash_password(data['password'])
    doctor = {
        "name": data.get('name'),
        "email": email,
        "password": hashed_pw,
        "specialization": data.get('specialization', ""),
        "license_number": data.get('license_number', ""),
        "experience": data.get('experience', ""),
        "clinic_name": data.get('clinic_name', ""),
        "created_at": datetime.utcnow()
    }

    doctors_col.insert_one(doctor)
    return jsonify({"message": "Doctor registered successfully. Please log in."}), 201

# --------------------------------
# DOCTOR LOGIN
# --------------------------------
@app.route('/login/doctor', methods=['POST'])
def login_doctor():
    data = request.get_json()
    email, password = data.get('email'), data.get('password')

    doctor = doctors_col.find_one({"email": email})
    if not doctor or not check_password(password, doctor['password']):
        return jsonify({"error": "Invalid email or password"}), 401

    return jsonify({
        "message": "Login successful",
        "user": {
            "id": str(doctor["_id"]),
            "name": doctor["name"],
            "email": doctor["email"],
            "specialization": doctor.get("specialization", ""),
            "license_number": doctor.get("license_number", ""),
            "experience": doctor.get("experience", ""),
            "clinic_name": doctor.get("clinic_name", "")
        }
    }), 200


# --------------------------------
# ✅ UPDATE PATIENT PROFILE (PATCH)
# --------------------------------
@app.route('/update/patient/<patient_id>', methods=['PATCH'])
def update_patient(patient_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    try:
        patient = patients_col.find_one({"_id": ObjectId(patient_id)})
        if not patient:
            return jsonify({"error": "Patient not found"}), 404

        # 🧠 Exclude fields not allowed to be changed
        restricted_fields = ["_id", "assigned_doctor_id", "password", "email"]
        update_data = {
            k: v for k, v in data.items()
            if k not in restricted_fields and v is not None
        }

        # ✅ Update MongoDB document
        result = patients_col.update_one(
            {"_id": ObjectId(patient_id)},
            {"$set": update_data}
        )

        if result.modified_count == 0:
            return jsonify({"message": "No changes made."}), 200

        # ✅ Get updated patient and clean non-serializable fields
        updated_patient = patients_col.find_one({"_id": ObjectId(patient_id)})

        # Remove non-serializable fields
        if "password" in updated_patient:
            del updated_patient["password"]

        # Convert ObjectId to str
        updated_patient["_id"] = str(updated_patient["_id"])
        if "assigned_doctor_id" in updated_patient and updated_patient["assigned_doctor_id"]:
            updated_patient["assigned_doctor_id"] = str(updated_patient["assigned_doctor_id"])

        return jsonify({
            "message": "Profile updated successfully.",
            "user": updated_patient
        }), 200

    except Exception as e:
        print("Error updating patient:", e)
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500



# --------------------------------
# ✅ UPDATE DOCTOR DETAILS (PATCH)
# --------------------------------
@app.route('/update/doctor/<doctor_id>', methods=['PATCH'])
def update_doctor(doctor_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided for update"}), 400

    try:
        doctor = doctors_col.find_one({"_id": ObjectId(doctor_id)})
        if not doctor:
            return jsonify({"error": "Doctor not found"}), 404

        # Restrict sensitive fields from being modified
        restricted_fields = {"_id", "email", "password"}
        update_data = {
            k: v for k, v in data.items()
            if k not in restricted_fields and v is not None
        }

        # ✅ Apply update
        result = doctors_col.update_one(
            {"_id": ObjectId(doctor_id)},
            {"$set": update_data}
        )

        if result.modified_count == 0:
            return jsonify({"message": "No changes made."}), 200

        # ✅ Fetch updated record
        updated_doctor = doctors_col.find_one({"_id": ObjectId(doctor_id)})

        # ✅ Remove non-serializable fields
        if "password" in updated_doctor:
            del updated_doctor["password"]

        # Convert ObjectId → str
        updated_doctor["_id"] = str(updated_doctor["_id"])

        return jsonify({
            "message": "Doctor details updated successfully!",
            "user": updated_doctor
        }), 200

    except Exception as e:
        print("Error updating doctor:", e)
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500
    

# --------------------------------
# ✅ ADD OR REPLACE JOURNAL ENTRY (1 per day, replaces if exists)
# --------------------------------
@app.route('/journal/add', methods=['POST'])
def add_or_replace_journal_entry():
    data = request.get_json()
    patient_id = data.get("patient_id")
    entry_text = data.get("entry")

    if not patient_id or not entry_text:
        return jsonify({"error": "Missing patient_id or entry"}), 400

    # Verify patient
    patient = patients_col.find_one({"_id": ObjectId(patient_id)})
    if not patient:
        return jsonify({"error": "Invalid patient ID"}), 404

    # Prepare today's date
    today_str = datetime.utcnow().strftime("%Y-%m-%d")

    # Analyze mood
    mood_data = analyze_mood(entry_text)
    encrypted_entry = encrypt_text(entry_text)

    # ✅ If journal exists today, replace it (update)
    existing_entry = journals_col.find_one({
        "patient_id": patient_id,
        "date": today_str
    })

    if existing_entry:
        journals_col.update_one(
            {"_id": existing_entry["_id"]},
            {
                "$set": {
                    "entry": encrypted_entry,
                    "mood": mood_data["mood"],
                    "sentiment_score": mood_data["compound"],
                    "updated_at": datetime.utcnow()
                }
            }
        )
        action = "updated"
    else:
        # ✅ Insert new journal
        journals_col.insert_one({
            "patient_id": patient_id,
            "entry": encrypted_entry,
            "date": today_str,
            "mood": mood_data["mood"],
            "sentiment_score": mood_data["compound"],
            "created_at": datetime.utcnow()
        })
        action = "added"

    # ✅ Delete entries older than 7 days
    seven_days_ago = (datetime.utcnow() - timedelta(days=7)).strftime("%Y-%m-%d")
    journals_col.delete_many({
        "patient_id": patient_id,
        "date": {"$lt": seven_days_ago}
    })

    return jsonify({
        "message": f"Journal for today successfully {action} 🌿"
    }), 200



# --------------------------------
# ✅ GET ALL JOURNAL ENTRIES FOR A PATIENT (DECRYPTED)
# --------------------------------
@app.route('/journal/<patient_id>', methods=['GET'])
def get_journals(patient_id):
    try:
        entries = list(journals_col.find({"patient_id": patient_id}))
        if not entries:
            return jsonify([]), 200

        # Decrypt entries and prepare response
        result = []
        for e in entries:
            try:
                decrypted_entry = decrypt_text(e["entry"])
            except Exception:
                decrypted_entry = "(Error decrypting entry)"

            result.append({
                "_id": str(e["_id"]),
                "date": e.get("date", ""),
                "entry": decrypted_entry,
                "mood": e.get("mood", ""),
                "sentiment_score": e.get("sentiment_score", 0),
            })

        return jsonify(result), 200

    except Exception as e:
        print("Error fetching journals:", e)
        return jsonify({"error": str(e)}), 500

    
# --------------------------------
# ✅ GET ALL DOCTORS (For Patients to View)
# --------------------------------
@app.route('/doctors', methods=['GET'])
def get_all_doctors():
    doctors = list(doctors_col.find({}, {"password": 0}))  # exclude passwords
    result = [
        {
            "id": str(doc["_id"]),
            "name": doc.get("name", ""),
            "email": doc.get("email", ""),
            "specialization": doc.get("specialization", ""),
            "experience": doc.get("experience", ""),
            "clinic_name": doc.get("clinic_name", "")
        }
        for doc in doctors
    ]
    return jsonify(result), 200


# --------------------------------
# ✅ PATIENT SEND REQUEST TO DOCTOR
# --------------------------------
@app.route('/request/doctor', methods=['POST'])
def send_request_to_doctor():
    data = request.get_json()
    patient_id = data.get("patient_id")
    doctor_id = data.get("doctor_id")

    if not patient_id or not doctor_id:
        return jsonify({"error": "Missing patient_id or doctor_id"}), 400

    # Check if both exist
    patient = patients_col.find_one({"_id": ObjectId(patient_id)})
    doctor = doctors_col.find_one({"_id": ObjectId(doctor_id)})

    if not patient or not doctor:
        return jsonify({"error": "Invalid patient or doctor ID"}), 404

    # Create or update request collection
    requests_col = db["Requests"]
    existing_request = requests_col.find_one({
        "patient_id": ObjectId(patient_id),
        "doctor_id": ObjectId(doctor_id)
    })

    if existing_request:
        return jsonify({"message": "Request already sent."}), 200

    requests_col.insert_one({
        "patient_id": ObjectId(patient_id),
        "doctor_id": ObjectId(doctor_id),
        "status": "pending",
        "created_at": datetime.now()
    })
    return jsonify({"message": "Request sent successfully!"}), 201


# --------------------------------
# ✅ DOCTOR VIEW ALL PENDING REQUESTS
# --------------------------------
@app.route('/doctor/<doctor_id>/requests', methods=['GET'])
def get_doctor_requests(doctor_id):
    requests_col = db["Requests"]
    pending_requests = list(requests_col.find({
        "doctor_id": ObjectId(doctor_id),
        "status": "pending"
    }))

    result = []
    for req in pending_requests:
        patient = patients_col.find_one({"_id": req["patient_id"]})
        if patient:
            result.append({
                "request_id": str(req["_id"]),
                "patient_id": str(patient["_id"]),
                "name": patient.get("name"),
                "email": patient.get("email"),
                "age": patient.get("age"),
                "gender": patient.get("gender"),
                "profession": patient.get("profession"),
                "diagnosed": patient.get("diagnosed"),
            })

    return jsonify(result), 200


# --------------------------------
# ✅ DOCTOR APPROVE REQUEST
# --------------------------------
@app.route('/doctor/approve_request/<request_id>', methods=['POST'])
def approve_request(request_id):
    requests_col = db["Requests"]
    request_doc = requests_col.find_one({"_id": ObjectId(request_id)})

    if not request_doc:
        return jsonify({"error": "Request not found"}), 404

    patient_id = request_doc["patient_id"]
    doctor_id = request_doc["doctor_id"]

    # ✅ Assign patient to doctor cluster
    patients_col.update_one(
        {"_id": ObjectId(patient_id)},
        {"$set": {"assigned_doctor_id": ObjectId(doctor_id)}}
    )

    doctor_patients_col.update_one(
        {"doctor_id": ObjectId(doctor_id)},
        {"$addToSet": {"patients": ObjectId(patient_id)}},
        upsert=True
    )

    # ✅ Update request status
    requests_col.update_one(
        {"_id": ObjectId(request_id)},
        {"$set": {"status": "approved"}}
    )

    return jsonify({"message": "Request approved and patient assigned."}), 200


# --------------------------------
# ❌ DOCTOR REJECT REQUEST
# --------------------------------
@app.route('/doctor/reject_request/<request_id>', methods=['POST'])
def reject_request(request_id):
    requests_col = db["Requests"]
    request_doc = requests_col.find_one({"_id": ObjectId(request_id)})

    if not request_doc:
        return jsonify({"error": "Request not found"}), 404

    requests_col.update_one(
        {"_id": ObjectId(request_id)},
        {"$set": {"status": "rejected"}}
    )

    return jsonify({"message": "Request rejected."}), 200


# --------------------------------
# ✅ GET WEEKLY MOOD DATA FOR DOCTOR'S PATIENT
# --------------------------------
@app.route('/doctor/<doctor_id>/patient/<patient_id>/mood', methods=['GET'])
def get_patient_mood_data(doctor_id, patient_id):
    """Fetch last 7 days of mood/sentiment for one patient (for graph visualization)."""
    try:
        # Verify doctor-patient connection
        doctor_record = doctor_patients_col.find_one({"doctor_id": ObjectId(doctor_id)})
        if not doctor_record or ObjectId(patient_id) not in doctor_record.get("patients", []):
            return jsonify({"error": "Unauthorized access or patient not assigned"}), 403

        # Get last 7 journal entries for that patient (sorted by date)
        recent_entries = list(journals_col.find(
            {"patient_id": patient_id}
        ).sort("date", -1).limit(7))

        if not recent_entries:
            return jsonify([]), 200

        # Prepare mood trend data
        result = []
        for e in reversed(recent_entries):  # oldest first for left-to-right graph
            result.append({
                "date": e.get("date", ""),
                "mood": e.get("mood", "Neutral"),
                "sentiment_score": e.get("sentiment_score", 0)
            })

        return jsonify(result), 200

    except Exception as e:
        print("Error fetching mood data:", e)
        return jsonify({"error": str(e)}), 500



# --------------------------------
# ✅ SEND MESSAGE (Patient ↔ Doctor)
# --------------------------------
@app.route('/chat/send', methods=['POST'])
def send_message():
    data = request.get_json()
    sender_id = data.get("sender_id")
    receiver_id = data.get("receiver_id")
    sender_role = data.get("sender_role")
    message = data.get("message")

    if not all([sender_id, receiver_id, sender_role, message]):
        return jsonify({"error": "Missing fields"}), 400

    db["Messages"].insert_one({
        "sender_id": ObjectId(sender_id),
        "receiver_id": ObjectId(receiver_id),
        "sender_role": sender_role,
        "message": message,
        "timestamp": datetime.utcnow()
    })

    return jsonify({"message": "Message sent successfully!"}), 201


# --------------------------------
# ✅ FETCH CHAT (Patient ↔ Doctor)
# --------------------------------
@app.route('/chat/<patient_id>/<doctor_id>', methods=['GET'])
def get_chat(patient_id, doctor_id):
    messages = list(db["Messages"].find({
        "$or": [
            {"sender_id": ObjectId(patient_id), "receiver_id": ObjectId(doctor_id)},
            {"sender_id": ObjectId(doctor_id), "receiver_id": ObjectId(patient_id)}
        ]
    }).sort("timestamp", 1))  # oldest → newest

    result = [
        {
            "_id": str(m["_id"]),
            "sender_id": str(m["sender_id"]),
            "receiver_id": str(m["receiver_id"]),
            "sender_role": m["sender_role"],
            "message": m["message"],
            "timestamp": m["timestamp"].strftime("%Y-%m-%d %H:%M:%S")
        }
        for m in messages
    ]
    return jsonify(result), 200

# --------------------------------
# ✅ GET WEEKLY MOOD DATA FOR DOCTOR'S PATIENT
# --------------------------------
@app.route('/doctor/<doctor_id>/patient/<patient_id>/mood', methods=['GET'])
def get_patient_mood_data(doctor_id, patient_id):
    """Fetch last 7 days of mood/sentiment for one patient (for graph visualization)."""
    try:
        # Verify doctor-patient connection
        doctor_record = doctor_patients_col.find_one({"doctor_id": ObjectId(doctor_id)})
        if not doctor_record or ObjectId(patient_id) not in doctor_record.get("patients", []):
            return jsonify({"error": "Unauthorized access or patient not assigned"}), 403

        # Get last 7 journal entries for that patient (sorted by date)
        recent_entries = list(journals_col.find(
            {"patient_id": patient_id}
        ).sort("date", -1).limit(7))

        if not recent_entries:
            return jsonify([]), 200

        # Prepare mood trend data
        result = []
        for e in reversed(recent_entries):  # oldest first for left-to-right graph
            result.append({
                "date": e.get("date", ""),
                "mood": e.get("mood", "Neutral"),
                "sentiment_score": e.get("sentiment_score", 0)
            })

        return jsonify(result), 200

    except Exception as e:
        print("Error fetching mood data:", e)
        return jsonify({"error": str(e)}), 500




# --------------------------------
# RUN SERVER
# --------------------------------
if __name__ == '__main__':
    print("✅ Connected to:", db.name)
    print("📂 Collections:", db.list_collection_names())
    app.run(debug=True)
