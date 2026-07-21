# Shamba Sense - Backend API

The backend for **Shamba Sense**, a Flask-based REST API that processes weather readings and returns actionable farming recommendations. 

This service provides a simple, rule-based engine to help farmers decide whether to plant, wait, irrigate, or harvest based on temperature, rainfall probability, and humidity.

## 🛠 Tech Stack

- **Language:** Python 3
- **Framework:** Flask
- **CORS:** Flask-CORS (enabled for frontend integration)

## 🚀 Getting Started

### Prerequisites
- Python 3.8 or higher installed on your machine.

### Installation

1. **Navigate to your project directory:**
   ```bash
   cd shamba-sense-backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate

   # Windows
   python -m venv venv
   venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the server:**
   ```bash
   python app.py
   ```
   The API will be available at `http://127.0.0.1:5000`.

---

## 📡 API Endpoints

### 1. Get Current Day Recommendation
Returns today's weather reading and the recommended farming action.

- **Endpoint:** `/api/current`
- **Method:** `GET`
- **Example Response:**
  ```json
  {
    "date": "2026-07-22",
    "action": "irrigate",
    "reason": "Low humidity and no rain forecast — irrigate today",
    "temp_c": 24,
    "rainfall_pct": 12,
    "humidity_pct": 38
  }
  ```

### 2. Get 7-Day Forecast
Returns a list of 7 days of weather readings and recommendations, starting from today. Ideal for building a calendar view.

- **Endpoint:** `/api/forecast`
- **Method:** `GET`
- **Example Response:**
  ```json
  [
    {
      "date": "2026-07-22",
      "action": "plant",
      "reason": "Good soil moisture, low rain risk — safe to plant",
      "temp_c": 22,
      "rainfall_pct": 10,
      "humidity_pct": 65
    },
    {
      "date": "2026-07-23",
      "action": "wait",
      "reason": "High rainfall expected — delay planting to avoid waterlog",
      "temp_c": 20,
      "rainfall_pct": 80,
      "humidity_pct": 75
    }
  ]
  ```

### 📝 Data Contract
Every day object in the response strictly follows this schema:

| Field | Type | Description |
| :--- | :--- | :--- |
| `date` | String | ISO 8601 date format (`YYYY-MM-DD`). |
| `action` | String | The recommendation. Must be one of: `"plant"`, `"wait"`, `"irrigate"`, `"harvest"`. |
| `reason` | String | A human-readable explanation for the action. |
| `temp_c` | Integer | Temperature in Celsius. |
| `rainfall_pct` | Integer | Probability of rainfall (0-100). |
| `humidity_pct` | Integer | Humidity percentage (0-100). |

---

## 🧠 Core Logic (Rule-Based Engine)

The recommendation engine currently uses a simple rule-based approach (no Machine Learning required for the prototype):

1. **Harvest:** Temp > 26°C, Humidity < 35%, Rainfall = 0% *(Dry, warm, rain-free)*
2. **Wait:** Rainfall > 60% *(High risk of waterlogging)*
3. **Irrigate:** Humidity < 40% AND Rainfall < 20% *(Too dry, no rain coming)*
4. **Plant:** Rainfall < 20% AND Humidity > 60% *(Good soil moisture, safe to plant)*
5. **Wait (Default):** Conditions unclear, monitor before acting.

---

## 🔄 Future Roadmap

- [ ] **Real Weather Integration:** Replace the mock data generator with a live API call (e.g., OpenWeatherMap, Tomorrow.io, or a local African weather provider).
- [ ] **Database Integration:** Add PostgreSQL/SQLite to store historical weather data and user-specific farm locations.
- [ ] **Location-Based Routing:** Update endpoints to accept `latitude` and `longitude` query parameters to fetch localized weather data.