# AI/ML Integration Guide
## Urban Planning AI for NASA Hackathon

This guide explains how to integrate the Urban Planning AI system with your main React application and deploy it to Vercel.

## 🚀 **Quick Start**

### **1. AI Service Setup**
The AI service runs on a separate server. You have two deployment options:

#### **Option A: Local Development (Recommended for Hackathon)**
```bash
# In the seattle-data-prep repository
python3 api.py
# AI service will be available at http://localhost:8000
```

#### **Option B: Cloud Deployment (Production)**
Deploy the AI service to Railway, Heroku, or similar:
```bash
# Deploy AI service to cloud
# Update API_BASE_URL in your React app
```

### **2. React Integration**

#### **Install Dependencies**
```bash
npm install axios
# or use built-in fetch API
```

#### **Environment Variables**
Create `.env.local` in your React project:
```env
# For local development
REACT_APP_AI_API_URL=http://localhost:8000

# For production (update with your deployed AI service URL)
# REACT_APP_AI_API_URL=https://your-ai-service.railway.app
```

## 🤖 **AI Chatbot Component**

### **Basic Chatbot Component**
```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UrbanPlanningChatbot = ({ className = '', style = {} }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_AI_API_URL || 'http://localhost:8000';

  // Check AI service connection
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      setIsConnected(response.data.status === 'healthy');
    } catch (error) {
      setIsConnected(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        message: inputMessage
      });

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: response.data.response,
        intent: response.data.intent,
        confidence: response.data.confidence,
        recommendations: response.data.recommendations || [],
        timestamp: response.data.timestamp
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`urban-planning-chatbot ${className}`} style={style}>
      {/* Connection Status */}
      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected ? '🟢 AI Connected' : '🔴 AI Disconnected'}
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-content">
              <p>{message.text}</p>
              {message.recommendations && message.recommendations.length > 0 && (
                <div className="recommendations">
                  <h4>Recommendations:</h4>
                  {message.recommendations.map((rec, index) => (
                    <div key={index} className="recommendation-item">
                      <strong>Neighborhood {rec.neighborhood_id}</strong>
                      <p>Score: {rec.score}/5 | Density: {rec.density?.toFixed(0)} people/km²</p>
                      <p>{rec.development_advice}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="message-meta">
              <span className="timestamp">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
              {message.confidence && (
                <span className="confidence">
                  Confidence: {(message.confidence * 100).toFixed(0)}%
                </span>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message ai">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="input-container">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about urban planning... (e.g., 'Where should I develop 200 houses?')"
          disabled={!isConnected || isLoading}
        />
        <button 
          onClick={sendMessage} 
          disabled={!isConnected || isLoading || !inputMessage.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default UrbanPlanningChatbot;
```

### **CSS Styles (Add to your CSS file)**
```css
.urban-planning-chatbot {
  display: flex;
  flex-direction: column;
  height: 500px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.connection-status {
  padding: 8px 16px;
  font-size: 12px;
  font-weight: bold;
  text-align: center;
}

.connection-status.connected {
  background: #d4edda;
  color: #155724;
}

.connection-status.disconnected {
  background: #f8d7da;
  color: #721c24;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  display: flex;
  flex-direction: column;
  max-width: 80%;
}

.message.user {
  align-self: flex-end;
}

.message.ai {
  align-self: flex-start;
}

.message.error {
  align-self: center;
}

.message-content {
  padding: 12px 16px;
  border-radius: 18px;
  word-wrap: break-word;
}

.message.user .message-content {
  background: #007bff;
  color: white;
}

.message.ai .message-content {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #e9ecef;
}

.message.error .message-content {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.recommendations {
  margin-top: 12px;
  padding: 12px;
  background: #e3f2fd;
  border-radius: 8px;
  border-left: 4px solid #2196f3;
}

.recommendations h4 {
  margin: 0 0 8px 0;
  color: #1976d2;
  font-size: 14px;
}

.recommendation-item {
  margin: 8px 0;
  padding: 8px;
  background: white;
  border-radius: 4px;
  font-size: 13px;
}

.message-meta {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #666;
  margin-top: 4px;
  padding: 0 4px;
}

.input-container {
  display: flex;
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  gap: 8px;
}

.input-container input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
}

.input-container input:focus {
  border-color: #007bff;
}

.input-container button {
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
}

.input-container button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.typing-indicator {
  display: flex;
  gap: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #999;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}
```

## 🎯 **Usage Examples**

### **Basic Integration**
```jsx
import UrbanPlanningChatbot from './components/UrbanPlanningChatbot';

function App() {
  return (
    <div className="App">
      <h1>Urban Planning Dashboard</h1>
      <UrbanPlanningChatbot />
    </div>
  );
}
```

### **Flexible Integration with Custom Styling**
```jsx
<UrbanPlanningChatbot 
  className="my-custom-chatbot"
  style={{ height: '600px', width: '100%' }}
/>
```

### **Sidebar Integration**
```jsx
<div className="dashboard-layout">
  <div className="main-content">
    {/* Your main app content */}
  </div>
  <div className="sidebar">
    <UrbanPlanningChatbot 
      className="sidebar-chatbot"
      style={{ height: 'calc(100vh - 60px)' }}
    />
  </div>
</div>
```

## 📡 **API Integration**

### **Direct API Calls**
```javascript
// Get AI recommendations
const getRecommendations = async (scenario) => {
  const response = await fetch(`${process.env.REACT_APP_AI_API_URL}/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario, top_n: 10 })
  });
  return await response.json();
};

// Chat with AI
const chatWithAI = async (message) => {
  const response = await fetch(`${process.env.REACT_APP_AI_API_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  return await response.json();
};
```

## 🚀 **Vercel Deployment**

### **1. Environment Variables**
In your Vercel dashboard, add:
```
REACT_APP_AI_API_URL=https://your-ai-service.railway.app
```

### **2. Deploy AI Service**
Deploy the AI service to Railway, Heroku, or similar:

```bash
# Example for Railway
railway login
railway init
railway up
```

### **3. Update API URL**
Update your environment variables in Vercel with the deployed AI service URL.

### **4. Deploy Main App**
```bash
vercel --prod
```

## 🔧 **Configuration Options**

### **Customizable Props**
```jsx
<UrbanPlanningChatbot 
  // Styling
  className="custom-class"
  style={{ height: '500px' }}
  
  // Behavior
  placeholder="Custom placeholder text"
  maxMessages={50}
  autoScroll={true}
  
  // API
  apiUrl="https://custom-ai-service.com"
  timeout={30000}
/>
```

### **Advanced Configuration**
```javascript
// Custom API client
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_AI_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request/response interceptors
apiClient.interceptors.request.use(config => {
  console.log('Sending request:', config);
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);
```

## 🧪 **Testing**

### **Unit Tests**
```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UrbanPlanningChatbot from './UrbanPlanningChatbot';

test('chatbot sends message and receives response', async () => {
  render(<UrbanPlanningChatbot />);
  
  const input = screen.getByPlaceholderText(/ask about urban planning/i);
  const button = screen.getByText('Send');
  
  fireEvent.change(input, { target: { value: 'Where should I develop 200 houses?' } });
  fireEvent.click(button);
  
  await waitFor(() => {
    expect(screen.getByText(/neighborhood/i)).toBeInTheDocument();
  });
});
```

## 🚨 **Troubleshooting**

### **Common Issues**

1. **AI Service Not Connected**
   - Check if AI service is running
   - Verify API URL in environment variables
   - Check network connectivity

2. **CORS Errors**
   - AI service includes CORS middleware
   - Check if API URL is correct

3. **Deployment Issues**
   - Ensure AI service is deployed and accessible
   - Update environment variables in Vercel
   - Check API service logs

### **Debug Mode**
```javascript
// Enable debug logging
localStorage.setItem('debug', 'true');

// Check connection status
const checkAI = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_AI_API_URL}/health`);
    console.log('AI Status:', await response.json());
  } catch (error) {
    console.error('AI Connection Error:', error);
  }
};
```

## 📊 **Available AI Features**

### **Chatbot Capabilities**
- **Development Recommendations**: "Where should I develop 200 houses?"
- **Density Analysis**: "Show me the highest density areas"
- **Location Insights**: "What are the best locations for development?"
- **Comparisons**: "Compare neighborhoods by density"
- **General Planning**: "What can you help me with?"

### **API Endpoints**
- `POST /chat` - Chat with AI
- `GET /health` - Check AI status
- `POST /recommendations` - Get planning recommendations
- `GET /scenarios` - Get available scenarios
- `GET /neighborhoods` - Get neighborhood data

## 🎯 **Demo Script**

*"Our AI chatbot helps urban planners make data-driven decisions through natural conversation. You can ask questions like 'Where should I develop 200 houses?' and the AI will analyze real population density data to provide specific neighborhood recommendations with scores and rationale. The system is explainable - planners can see exactly why each recommendation was made."*

---

**Ready to integrate? The AI is fully functional and ready for your NASA hackathon demo! 🚀**
