# Import required modules
import socket
import threading
import pickle
import nltk
from nltk.corpus import stopwords
import string
from nltk.stem.porter import PorterStemmer
import os

# Initialize PorterStemmer
ps = PorterStemmer()

# Server configuration
HOST = '127.0.0.1'
PORT = 1234  # You can use any port between 0 to 65535
LISTENER_LIMIT = 5
active_clients = []  # List of all currently connected users

# Get absolute path of current folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load vectorizer and model
tfidf_path = os.path.join(BASE_DIR, "vectorizer.pkl")
model_path = os.path.join(BASE_DIR, "model.pkl")

with open(tfidf_path, 'rb') as f:
    tfidf = pickle.load(f)

with open(model_path, 'rb') as f:
    model = pickle.load(f)

# Cache stopwords for faster processing
STOPWORDS = set(stopwords.words('english'))

def transform_text(text):
    text = text.lower()
    text = nltk.word_tokenize(text)
    text = [word for word in text if word.isalnum()]
    text = [ps.stem(word) for word in text 
            if word not in STOPWORDS and word not in string.punctuation]
    return " ".join(text)

# Function to listen for upcoming messages from a client
def listen_for_messages(client, username):
    while True:
        try:
            message = client.recv(2048).decode('utf-8')
            if message:
                transformed_message = transform_text(message)
                vectorized_msg = tfidf.transform([transformed_message])
                pred = model.predict(vectorized_msg)[0]

                final_msg = f"{username}~{message}" 
                if pred != 0:
                    final_msg += " (This may be spam)~spam"
                else:
                    final_msg += "~ham"

                send_messages_to_all(final_msg)
            else:
                print(f"The message sent from client {username} is empty")
        except Exception as e:
            print(f"Error: {e}")
            active_clients.remove((username, client))
            client.close()
            break

# Function to send message to a single client
def send_message_to_client(client, message):
    client.sendall(message.encode())

# Function to send any new message to all the clients that are currently connected
def send_messages_to_all(message):
    for user in active_clients:
        send_message_to_client(user[1], message)

# Function to handle a connected client
def client_handler(client):
    while True:
        try:
            data = client.recv(2048).decode('utf-8')
            if data:
                username = data.strip()  # Expect only username now
                active_clients.append((username, client))
                prompt_message = f"SERVER~{username} added to the chat~server"
                send_messages_to_all(prompt_message)
                break
            else:
                print("Client username is empty")
        except Exception as e:
            print(f"Error: {e}")
            client.close()
            break

    threading.Thread(target=listen_for_messages, args=(client, username)).start()

# Main function
def main():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    try:
        server.bind((HOST, PORT))
        print(f"Running the server on {HOST}:{PORT}")
    except Exception as e:
        print(f"Unable to bind to host {HOST} and port {PORT}: {e}")
        return

    server.listen(LISTENER_LIMIT)

    while True:
        client, address = server.accept()
        print(f"Successfully connected to client {address[0]}:{address[1]}")
        threading.Thread(target=client_handler, args=(client,)).start()

if __name__ == '__main__':
    main()
