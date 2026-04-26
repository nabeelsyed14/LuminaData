# LuminaData 🌌

**LuminaData** is a professional-grade, privacy-first AI Data Intelligence platform. It allows you to upload datasets (CSV/JSON), explore them through a premium dashboard, and chat with your data using either local models (via Ollama) or cloud-powered intelligence (via Google Gemini).

![Lumina Preview](client/public/logo.png)

## ✨ Features

- 👤 **Secure Multi-User System**: Full JWT authentication with persistent user profiles.
- 📂 **Smart Dataset Management**: Upload and track multiple datasets. Switch contexts instantly.
- 🧠 **Global Assistant**: A cross-dataset intelligence engine that understands all your data schemas simultaneously.
- 📊 **Automated Visualizations**: High-quality charts generated on-the-fly by AI using Matplotlib and Seaborn.
- 🛡️ **Bulletproof Execution**: A sanitized Python sandbox that protects against AI code hallucinations.
- 🔌 **Provider Switcher**: Seamlessly toggle between local Ollama (Llama3) and Google Gemini.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS (requested), Framer Motion, Lucide Icons, Zustand.
- **Backend**: FastAPI (Python), SQLAlchemy, SQLite, JWT (Jose), Bcrypt.
- **AI Integration**: Ollama (Local), Google Generative AI (Cloud).
- **Data Engine**: Pandas, Numpy, Matplotlib, Seaborn.

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- [Ollama](https://ollama.com/) (Optional, for local AI)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/lumina-data.git
   cd lumina-data
   ```

2. **Setup Backend**:
   ```bash
   cd server
   pip install -r requirements.txt
   ```

3. **Setup Frontend**:
   ```bash
   cd ../client
   npm install
   ```

4. **Configuration**:
   Create a `.env` file in the root directory:
   ```env
   JWT_SECRET=your_secret_here
   ```

### Running the App
From the root directory, simply run:
```bash
python run.py
```
This will launch both the FastAPI backend (Port 8000) and the Vite frontend (Port 5173).

## 📄 License
MIT License. Free for all to use and modify.
