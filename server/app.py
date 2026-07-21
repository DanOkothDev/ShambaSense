from flask import Flask, jsonify
from datetime import datetime, timedelta
import random

app = Flask(__name__)

# ==========================================
# 1. CORE LOGIC
# ==========================================
def get_recommendation(rainfall_pct, humidity_pct, temp_c):
    """
    Rule-based engine to determine farming action.
    """
    # Added harvest logic to fulfill your 4-action contract
    if temp_c > 26 and humidity_pct < 35 and rainfall_pct == 0:
        return "harvest", "Dry, warm, and rain-free — ideal conditions to harvest"
        
    if rainfall_pct > 60:
        return "wait", "High rainfall expected — delay planting to avoid waterlog"
        
    elif humidity_pct < 40 and rainfall_pct < 20:
        return "irrigate", "Low humidity and no rain forecast — irrigate today"
        
    elif rainfall_pct < 20 and humidity_pct > 60:
        return "plant", "Good soil moisture, low rain risk — safe to plant"
        
    else:
        return "wait", "Conditions unclear — monitor before acting"

# ==========================================
# 2. MOCK DATA GENERATOR
# ==========================================
def generate_mock_weather(date_obj):
    """
    Generates consistent mock weather data for a specific date.
    Using the date as a random seed ensures the mock data doesn't 
    change if the frontend refreshes the page.
    """
    random.seed(date_obj.toordinal()) 
    return {
        "temp_c": random.randint(18, 32),
        "rainfall_pct": random.randint(0, 95),
        "humidity_pct": random.randint(25, 85)
    }

# ==========================================
# 3. ENDPOINTS
# ==========================================

@app.route('/api/current', methods=['GET'])
def get_current():
    """Returns today's reading + recommendation"""
    today = datetime.now().date()
    weather = generate_mock_weather(today)
    
    action, reason = get_recommendation(**weather)
    
    response = {
        "date": today.isoformat(),
        "action": action,
        "reason": reason,
        "temp_c": weather["temp_c"],
        "rainfall_pct": weather["rainfall_pct"],
        "humidity_pct": weather["humidity_pct"]
    }
    
    return jsonify(response)

@app.route('/api/forecast', methods=['GET'])
def get_forecast():
    """Returns a 7-day forecast list"""
    today = datetime.now().date()
    forecast_data = []
    
    for i in range(7):
        day = today + timedelta(days=i)
        weather = generate_mock_weather(day)
        
        action, reason = get_recommendation(**weather)
        
        day_obj = {
            "date": day.isoformat(),
            "action": action,
            "reason": reason,
            "temp_c": weather["temp_c"],
            "rainfall_pct": weather["rainfall_pct"],
            "humidity_pct": weather["humidity_pct"]
        }
        forecast_data.append(day_obj)
        
    return jsonify(forecast_data)

# ==========================================
# RUN APP
# ==========================================
if __name__ == '__main__':
    # Run on port 5000, enable debug mode for development
    app.run(debug=True, port=5000)