import pickle
import numpy as np

try:
    # Load the model with error handling
    with open('model.pkl', 'rb') as file:
        model = pickle.load(file)
    
    print("✅ Model loaded successfully!")
    print("\n=== Model Information ===")
    print("Model type:", type(model))
    
    # Safe way to get model information
    if hasattr(model, 'classes_'):
        print("Classes:", model.classes_)
    
    if hasattr(model, 'n_features_in_'):
        print("Number of features:", model.n_features_in_)
    
    if hasattr(model, 'class_count_'):
        print("Class counts:", model.class_count_)
    
    # Try to get parameters safely
    try:
        params = {key: value for key, value in model.__dict__.items() 
                 if not key.startswith('_') and not callable(value)}
        print("Model parameters:", params)
    except:
        print("Could not retrieve all parameters due to version mismatch")
    
    print("\n=== Model Ready ===")
    print("The model is a Multinomial Naive Bayes classifier")
    print("Common uses: Text classification, spam detection, sentiment analysis")
    
    # Test if model can make predictions
    print("\nTo use this model:")
    print("1. Prepare your feature data (same format as training)")
    print("2. Use: predictions = model.predict(your_data)")
    print("3. Use: probabilities = model.predict_proba(your_data)")
    
except FileNotFoundError:
    print("❌ Error: model.pkl file not found")
    print("Make sure model.pkl is in the same directory")
except Exception as e:
    print(f"❌ Error: {e}")
    print("This is likely due to scikit-learn version compatibility")