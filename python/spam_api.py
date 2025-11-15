from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import nltk
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer
import string
import os
import joblib

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Ensure NLTK data is downloaded
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')

# Initialize components
ps = PorterStemmer()
tfidf = None
model = None
STOPWORDS = set(stopwords.words('english'))

def load_models():
    global tfidf, model
    try:
        # ✅ Always load relative to this file, not terminal location
        base_path = os.path.dirname(os.path.abspath(__file__))
        vectorizer_path = os.path.join(base_path, "vectorizer.pkl")
        model_path = os.path.join(base_path, "model.pkl")

        with open(vectorizer_path, "rb") as f:
            tfidf = pickle.load(f)

        with open(model_path, "rb") as f:
            model = pickle.load(f)

        print("✓ Models loaded successfully")
        return True
    except Exception as e:
        print(f"Error loading models: {str(e)}")
        return False

def transform_text(text):
    text = text.lower()
    text = nltk.word_tokenize(text)
    text = [word for word in text if word.isalnum()]
    text = [ps.stem(word) for word in text 
           if word not in STOPWORDS and word not in string.punctuation]
    return " ".join(text)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        message = data.get('message')

        if not message:
            return jsonify({'error': 'No message provided'}), 400

        # Transform and predict
        transformed = transform_text(message)
        vector = tfidf.transform([transformed])
        prediction = model.predict(vector)[0]

        return jsonify({
            'spam': bool(prediction),
            'confidence': float(model.predict_proba(vector)[0][prediction])
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    if load_models():
        print("🔮 Spam API running on http://localhost:5001")
        app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 5001)))

    else:
        print("❌ Failed to start - check model files")
