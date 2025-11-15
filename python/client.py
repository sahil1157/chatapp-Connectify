import socket
import threading
import tkinter as tk
from tkinter import scrolledtext, messagebox
import pickle
import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_curve, auc

# Constants
HOST = '127.0.0.1'
PORT = 1234
DARK_GREY = '#121212'
MEDIUM_GREY = '#1F1B24'
OCEAN_BLUE = '#464EB8'
WHITE = "white"
FONT = ("Helvetica", 17)
BUTTON_FONT = ("Helvetica", 15)
SMALL_FONT = ("Helvetica", 13)

# Initialize socket
client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# Load models and vectorizer
try:
    tfidf = pickle.load(open('vectorizer.pkl', 'rb'))
    model_lr = pickle.load(open('model_lrc.pkl', 'rb'))
    model_nb = pickle.load(open('model_mnb.pkl', 'rb'))
except Exception as e:
    messagebox.showerror("Error", f"Failed to load models: {e}")
    exit()

# Global variables
total_messages = 0
spam_messages = 0

def add_message(message: str, tag: str):
    global total_messages, spam_messages
    message_box.config(state=tk.NORMAL)
    message_box.insert(tk.END, message + '\n', tag)
    message_box.config(state=tk.DISABLED)
    total_messages += 1
    if "This may be spam" in message:
        spam_messages += 1
    update_dashboard()

def update_dashboard():
    total_messages_label.config(text=f"Total Messages: {total_messages}")
    spam_messages_label.config(text=f"Spam Messages: {spam_messages}")

def connect():
    try:
        client.connect((HOST, PORT))
        add_message("[SERVER] Successfully connected to the server", "server")
    except Exception as e:
        messagebox.showerror("Unable to connect to server", f"Unable to connect to server {HOST} {PORT}: {e}")
        return

    username = username_textbox.get()
    selected_algorithm = algorithm_var.get()
    if username:
        client.sendall(f"{username}~{selected_algorithm}".encode())
    else:
        messagebox.showerror("Invalid username", "Username cannot be empty")

    threading.Thread(target=listen_for_messages_from_server, args=(client,)).start()

    username_textbox.config(state=tk.DISABLED)
    username_button.config(state=tk.DISABLED)
    algorithm_menu.config(state=tk.DISABLED)

def send_message():
    message = message_textbox.get()
    if message:
        client.sendall(message.encode())
        message_textbox.delete(0, len(message))
    else:
        messagebox.showerror("Empty message", "Message cannot be empty")

def show_stats():
    selected_algorithm = algorithm_var.get()
    try:
        data = pd.read_csv('spam.csv', encoding='latin1')
    except Exception as e:
        messagebox.showerror("Error", f"Failed to read CSV file: {e}")
        return

    new_window = tk.Toplevel(root)
    new_window.geometry("900x700")
    new_window.title(f"Stats - {selected_algorithm.upper()}")
    new_window.configure(bg=DARK_GREY)
    new_window.resizable(True, True)

    new_window.grid_rowconfigure(0, weight=1)
    new_window.grid_columnconfigure(0, weight=1)

    scroll_container = tk.Frame(new_window, bg=DARK_GREY)
    scroll_container.grid(row=0, column=0, sticky="nsew")

    scroll_canvas = tk.Canvas(scroll_container, bg=DARK_GREY, highlightthickness=0)
    scroll_canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

    scrollbar = tk.Scrollbar(scroll_container, command=scroll_canvas.yview)
    scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

    scroll_canvas.configure(yscrollcommand=scrollbar.set)

    content_frame = tk.Frame(scroll_canvas, bg=MEDIUM_GREY)
    content_frame.bind("<Configure>", lambda e: scroll_canvas.configure(scrollregion=scroll_canvas.bbox("all")))
    scroll_canvas.create_window((0, 0), window=content_frame, anchor='nw')

    scroll_canvas.bind("<Configure>", lambda e: scroll_canvas.itemconfig("all", width=e.width))

    if selected_algorithm == 'LR':
        display_confusion_matrix_and_heatmap(content_frame, model_lr, data, "Logistic Regression (LR)")
    else:
        display_confusion_matrix_and_heatmap(content_frame, model_nb, data, "Naive Bayes (NB)")

def display_confusion_matrix_and_heatmap(parent_frame, model, data, title):
    X = tfidf.transform(data['v2'])
    y_true = data['v1']
    y_pred_raw = model.predict(X)
    y_pred_prob = model.predict_proba(X)[:, 1]

    if np.issubdtype(y_pred_raw.dtype, np.integer):
        y_pred = np.where(y_pred_raw == 1, 'spam', 'ham')
    else:
        y_pred = y_pred_raw

    confusion_matrix = pd.crosstab(y_true, y_pred, rownames=['Actual'], colnames=['Predicted'], margins=True)

    accuracy = accuracy_score(y_true, y_pred)
    precision = precision_score(y_true, y_pred, pos_label='spam')
    recall = recall_score(y_true, y_pred, pos_label='spam')
    f1 = f1_score(y_true, y_pred, pos_label='spam')

    fpr, tpr, _ = roc_curve(y_true.map({'ham': 0, 'spam': 1}), y_pred_prob)
    roc_auc = auc(fpr, tpr)

    fig, axes = plt.subplots(2, 2, figsize=(12, 12))
    fig.suptitle(title)

    sns.heatmap(confusion_matrix, annot=True, fmt="d", ax=axes[0, 0], cmap="YlGnBu", cbar=False)
    axes[0, 0].set_title('Confusion Matrix')
    axes[0, 0].annotate('TP', xy=(1, 1), xytext=(1.5, 1.5), textcoords='axes fraction', fontsize=12, color='red')
    axes[0, 0].annotate('FP', xy=(2, 1), xytext=(2.5, 1.5), textcoords='axes fraction', fontsize=12, color='red')
    axes[0, 0].annotate('FN', xy=(1, 2), xytext=(1.5, 2.5), textcoords='axes fraction', fontsize=12, color='red')
    axes[0, 0].annotate('TN', xy=(2, 2), xytext=(2.5, 2.5), textcoords='axes fraction', fontsize=12, color='red')

    total = confusion_matrix.iloc[-1, -1]
    normalized = confusion_matrix / total
    sns.heatmap(normalized, annot=True, fmt=".2%", ax=axes[0, 1], cmap="YlGnBu", cbar=False)
    axes[0, 1].set_title('Heatmap (Normalized)')
    axes[0, 1].annotate('TP', xy=(1, 1), xytext=(1.5, 1.5), textcoords='axes fraction', fontsize=12, color='red')
    axes[0, 1].annotate('FP', xy=(2, 1), xytext=(2.5, 1.5), textcoords='axes fraction', fontsize=12, color='red')
    axes[0, 1].annotate('FN', xy=(1, 2), xytext=(1.5, 2.5), textcoords='axes fraction', fontsize=12, color='red')
    axes[0, 1].annotate('TN', xy=(2, 2), xytext=(2.5, 2.5), textcoords='axes fraction', fontsize=12, color='red')

    metrics_text = (
        f"Accuracy: {accuracy:.2f}\n"
        f"Precision (spam): {precision:.2f}\n"
        f"Recall (spam): {recall:.2f}\n"
        f"F1-Score (spam): {f1:.2f}"
    )
    axes[1, 0].text(0.5, 0.5, metrics_text, fontsize=12, ha='center', va='center')
    axes[1, 0].set_title('Metrics')
    axes[1, 0].axis('off')

    axes[1, 1].plot(fpr, tpr, color='blue', lw=2, label=f'ROC curve (area = {roc_auc:.2f})')
    axes[1, 1].plot([0, 1], [0, 1], color='red', lw=2, linestyle='--')
    axes[1, 1].set_xlim([0.0, 1.0])
    axes[1, 1].set_ylim([0.0, 1.05])
    axes[1, 1].set_xlabel('False Positive Rate')
    axes[1, 1].set_ylabel('True Positive Rate')
    axes[1, 1].set_title('Receiver Operating Characteristic (ROC) Curve')
    axes[1, 1].legend(loc="lower right")

    canvas_mpl = FigureCanvasTkAgg(fig, master=parent_frame)
    canvas_mpl.draw()
    canvas_mpl.get_tk_widget().pack(fill=tk.BOTH, expand=True, pady=10)

def listen_for_messages_from_server(client_socket):
    while True:
        try:
            message = client_socket.recv(2048).decode('utf-8')
            if message:
                username, content, msg_type = message.split("~")
                if msg_type == "spam":
                    add_message(f"[{username}] {content} ", "spam")
                else:
                    add_message(f"[{username}] {content}", "ham")
            else:
                messagebox.showerror("Error", "Message received from client is empty")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to receive message: {e}")
            break

def main():
    root.mainloop()

# GUI setup
root = tk.Tk()
root.geometry("800x600")
root.title("Messenger Client with Dashboard")
root.config(bg=DARK_GREY)
root.resizable(True, True)

root.grid_rowconfigure(0, weight=1)
root.grid_rowconfigure(1, weight=4)
root.grid_rowconfigure(2, weight=1)
root.grid_rowconfigure(3, weight=1)
root.grid_columnconfigure(0, weight=1)

top_frame = tk.Frame(root, bg=DARK_GREY)
top_frame.grid(row=0, column=0, sticky=tk.NSEW)
top_frame.grid_columnconfigure(1, weight=1)

middle_frame = tk.Frame(root, bg=MEDIUM_GREY)
middle_frame.grid(row=1, column=0, sticky=tk.NSEW)
middle_frame.grid_rowconfigure(0, weight=1)
middle_frame.grid_columnconfigure(0, weight=1)

bottom_frame = tk.Frame(root, bg=DARK_GREY)
bottom_frame.grid(row=2, column=0, sticky=tk.NSEW)
bottom_frame.grid_columnconfigure(0, weight=1)
bottom_frame.grid_columnconfigure(1, weight=0)

dashboard_frame = tk.Frame(root, bg=MEDIUM_GREY)
dashboard_frame.grid(row=3, column=0, sticky=tk.NSEW)
dashboard_frame.grid_columnconfigure(1, weight=1)

username_label = tk.Label(top_frame, text="Enter username:", font=FONT, bg=DARK_GREY, fg=WHITE)
username_label.grid(row=0, column=0, padx=10, pady=10, sticky=tk.W)

username_textbox = tk.Entry(top_frame, font=FONT, bg=MEDIUM_GREY, fg=WHITE)
username_textbox.grid(row=0, column=1, padx=10, pady=10, sticky=tk.EW)

username_button = tk.Button(top_frame, text="Join", font=BUTTON_FONT, bg=OCEAN_BLUE, fg=WHITE, command=connect)
username_button.grid(row=0, column=3, padx=10, pady=10, sticky=tk.E)

algorithm_var = tk.StringVar(value="LR")
algorithm_menu = tk.OptionMenu(top_frame, algorithm_var, "LR", "LR")
algorithm_menu.grid(row=0, column=2, padx=10, pady=10, sticky=tk.EW)

message_textbox = tk.Entry(bottom_frame, font=FONT, bg=MEDIUM_GREY, fg=WHITE)
message_textbox.grid(row=0, column=0, padx=10, pady=10, sticky=tk.EW)

message_button = tk.Button(bottom_frame, text="Send", font=BUTTON_FONT, bg=OCEAN_BLUE, fg=WHITE, command=send_message)
message_button.grid(row=0, column=1, padx=10, pady=10, sticky=tk.E)

message_box = scrolledtext.ScrolledText(middle_frame, font=SMALL_FONT, bg=MEDIUM_GREY, fg=WHITE)
message_box.config(state=tk.DISABLED)
message_box.grid(row=0, column=0, padx=10, pady=10, sticky=tk.NSEW)

total_messages_label = tk.Label(dashboard_frame, text="Total Messages: 0", font=FONT, bg=MEDIUM_GREY, fg=WHITE)
total_messages_label.grid(row=0, column=0, padx=10, pady=10, sticky=tk.W)

spam_messages_label = tk.Label(dashboard_frame, text="Spam Messages: 0", font=FONT, bg=MEDIUM_GREY, fg=WHITE)
spam_messages_label.grid(row=0, column=1, padx=10, pady=10, sticky=tk.W)

graphs_button = tk.Button(dashboard_frame, text="Show Stats", font=BUTTON_FONT, bg=OCEAN_BLUE, fg=WHITE, command=show_stats)
graphs_button.grid(row=0, column=2, padx=10, pady=10, sticky=tk.E)

# Adding tags for message colors
message_box.tag_configure("ham", foreground="green")
message_box.tag_configure("spam", foreground="red")
message_box.tag_configure("server", foreground="blue")

if __name__ == '__main__':
    main()