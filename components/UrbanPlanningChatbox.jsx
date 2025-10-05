import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UrbanPlanningChatbot = ({ 
  className = '', 
  style = {},
  placeholder = "Ask about urban planning... (e.g., 'Where should I develop 200 houses?')",
  maxMessages = 50,
  autoScroll = true,
  showConfidence = true,
  apiUrl = null,
  // Props for persistent state
  messages = null,
  setMessages = null,
  inputMessage = null,
  setInputMessage = null,
  isLoading = null,
  setIsLoading = null,
  isConnected = null,
  setIsConnected = null,
  // Callback for when recommendations are received
  onRecommendationsReceived = null
}) => {
  // Use props if provided, otherwise fall back to internal state
  const [internalMessages, setInternalMessages] = useState([]);
  const [internalInputMessage, setInternalInputMessage] = useState('');
  const [internalIsLoading, setInternalIsLoading] = useState(false);
  const [internalIsConnected, setInternalIsConnected] = useState(false);
  
  // Use external state if provided, otherwise use internal state
  const chatMessages = messages !== null ? messages : internalMessages;
  const setChatMessages = setMessages !== null ? setMessages : setInternalMessages;
  const chatInput = inputMessage !== null ? inputMessage : internalInputMessage;
  const setChatInput = setInputMessage !== null ? setInputMessage : setInternalInputMessage;
  const chatLoading = isLoading !== null ? isLoading : internalIsLoading;
  const setChatLoading = setIsLoading !== null ? setIsLoading : setInternalIsLoading;
  const chatConnected = isConnected !== null ? isConnected : internalIsConnected;
  const setChatConnected = setIsConnected !== null ? setIsConnected : setInternalIsConnected;

  const API_BASE_URL = apiUrl || process.env.REACT_APP_AI_API_URL || 'http://localhost:8000';
  
  // Check if we're in production and AI service is not available
  const isProduction = process.env.NODE_ENV === 'production';
  const isLocalhost = API_BASE_URL.includes('localhost');

  // Check AI service connection
  useEffect(() => {
    checkConnection();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll) {
      const messagesContainer = document.querySelector('.messages-container');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }
  }, [chatMessages, autoScroll]);

  // Limit messages to maxMessages
  useEffect(() => {
    if (chatMessages.length > maxMessages) {
      setChatMessages(prev => prev.slice(-maxMessages));
    }
  }, [chatMessages, maxMessages, setChatMessages]);

  const checkConnection = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
      setChatConnected(response.data.status === 'healthy');
    } catch (error) {
      console.log('AI service not available:', error.message);
      setChatConnected(false);
    }
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: chatInput,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    const currentMessage = chatInput;
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        message: currentMessage
      }, { timeout: 30000 });

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: response.data.response,
        intent: response.data.intent,
        confidence: response.data.confidence,
        recommendations: response.data.recommendations || [],
        timestamp: response.data.timestamp
      };

      setChatMessages(prev => [...prev, aiMessage]);
      
      // If there are recommendations, update the map
      if (aiMessage.recommendations && aiMessage.recommendations.length > 0 && onRecommendationsReceived) {
        onRecommendationsReceived(aiMessage.recommendations);
      }
    } catch (error) {
      console.error('Chat error:', error);
      let errorText = 'Sorry, I encountered an error. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 503) {
          errorText = 'AI service is temporarily unavailable (503). Please check if the AI service is running properly.';
        } else if (error.response.status === 500) {
          errorText = 'AI service internal error (500). Please try again later.';
        } else {
          errorText = `Server error (${error.response.status}). Please try again.`;
        }
      } else if (error.request) {
        // Network error
        errorText = 'Cannot connect to AI service. Please check if it\'s running on localhost:8000';
      }
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        text: errorText,
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };


  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearHistory = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/chat/history`);
      setChatMessages([]);
    } catch (error) {
      console.error('Clear history error:', error);
    }
  };

  const retryConnection = () => {
    checkConnection();
  };

  // Enhanced markdown parser for AI responses
  const parseMarkdown = (text) => {
    if (!text) return text;
    
    // Split by double newlines to create sections
    const sections = text.split('\n\n').filter(section => section.trim());
    
    return sections.map((section, index) => {
      let formattedText = section.trim();
      
      // Handle bold text **text**
      formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Handle bullet points - item (including nested bullets)
      if (formattedText.includes('\n- ') || formattedText.startsWith('- ')) {
        const lines = formattedText.split('\n');
        const items = [];
        let currentItem = '';
        
        lines.forEach(line => {
          if (line.startsWith('- ')) {
            if (currentItem) {
              items.push(currentItem.replace(/^- /, '').trim());
            }
            currentItem = line;
          } else if (line.trim() && currentItem) {
            currentItem += ' ' + line.trim();
          }
        });
        
        if (currentItem) {
          items.push(currentItem.replace(/^- /, '').trim());
        }
        
        return (
          <ul key={index} className="ai-bullet-list">
            {items.map((item, itemIndex) => (
              <li key={itemIndex} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
        );
      }
      
      // Handle numbered lists
      if (/^\d+\./.test(formattedText)) {
        const lines = formattedText.split('\n');
        const items = [];
        let currentItem = '';
        
        lines.forEach(line => {
          if (/^\d+\./.test(line)) {
            if (currentItem) {
              items.push(currentItem.replace(/^\d+\./, '').trim());
            }
            currentItem = line;
          } else if (line.trim() && currentItem) {
            currentItem += ' ' + line.trim();
          }
        });
        
        if (currentItem) {
          items.push(currentItem.replace(/^\d+\./, '').trim());
        }
        
        return (
          <ol key={index} className="ai-numbered-list">
            {items.map((item, itemIndex) => (
              <li key={itemIndex} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ol>
        );
      }
      
      // Regular paragraph with proper spacing
      return (
        <div key={index} className="ai-paragraph">
          <p dangerouslySetInnerHTML={{ __html: formattedText }} />
        </div>
      );
    });
  };

  return (
    <div className={`urban-planning-chatbot ${className}`} style={style}>
      {/* Header */}
      <div className="chatbot-header">
        <div className="chatbot-title">
          <h3>🏙️ Urban Planning AI</h3>
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </div>
        </div>
        <div className="chatbot-actions">
          <button 
            onClick={retryConnection}
            className="retry-button"
            title="Retry Connection"
          >
            🔄
          </button>
          <button 
            onClick={clearHistory}
            className="clear-button"
            title="Clear History"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {chatMessages.length === 0 && (
          <div className="welcome-message">
            <h4>Welcome to Urban Planning AI! 🎯</h4>
            {!chatConnected ? (
              <div>
                {isProduction && isLocalhost ? (
                  <div>
                    <p>⚠️ AI service configuration issue</p>
                    <p>This deployed app is trying to connect to localhost, which won't work in production.</p>
                    <p>To fix this:</p>
                    <ul>
                      <li>Deploy your AI service to Railway/Heroku</li>
                      <li>Update Vercel environment variables</li>
                      <li>Set REACT_APP_AI_API_URL to your deployed AI service URL</li>
                    </ul>
                    <p>For now, run the app locally with <code>npm run dev</code> to test the AI features.</p>
                  </div>
                ) : (
                  <div>
                    <p>⚠️ AI service is not currently running</p>
                    <p>To use the AI features, you need to start the AI service:</p>
                    <ul>
                      <li>Navigate to the AI service directory</li>
                      <li>Run: <code>python3 api.py</code></li>
                      <li>The service will be available at http://localhost:8000</li>
                    </ul>
                    <p>Once the service is running, click the 🔄 button to retry connection.</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p>✅ Connected to AI service at {API_BASE_URL}</p>
                <p>I can help you with:</p>
                <ul>
                  <li>Development recommendations</li>
                  <li>Population density analysis</li>
                  <li>Location insights</li>
                  <li>Neighborhood comparisons</li>
                </ul>
                <p>Try asking: "Where should I develop 200 houses?"</p>
              </div>
            )}
          </div>
        )}
        
        {chatMessages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-content">
              {message.type === 'ai' ? parseMarkdown(message.text) : <p>{message.text}</p>}
              {message.recommendations && message.recommendations.length > 0 && (
                <div className="recommendations">
                  <h4>📋 Recommendations:</h4>
                  {message.recommendations.map((rec, index) => (
                    <div key={index} className="recommendation-item">
                      <div className="recommendation-header">
                        <strong>Neighborhood {rec.neighborhood_id}</strong>
                        <span className="score">Score: {rec.score}/5</span>
                      </div>
                      {rec.density && (
                        <p className="density">Density: {rec.density.toFixed(0)} people/km²</p>
                      )}
                      <p className="advice">{rec.development_advice}</p>
                      {rec.reasons && rec.reasons.length > 0 && (
                        <div className="reasons">
                          <strong>Reasons:</strong>
                          <ul>
                            {rec.reasons.map((reason, i) => (
                              <li key={i}>{reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="message-meta">
              <span className="timestamp">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
              {showConfidence && message.confidence && (
                <span className="confidence">
                  Confidence: {(message.confidence * 100).toFixed(0)}%
                </span>
              )}
            </div>
          </div>
        ))}
        
        {chatLoading && (
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
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={!chatConnected || chatLoading}
        />
        <button 
          onClick={sendMessage} 
          disabled={!chatConnected || chatLoading || !chatInput.trim()}
          className="send-button"
        >
          {chatLoading ? '⏳' : '📤'}
        </button>
      </div>
    </div>
  );
};

export default UrbanPlanningChatbot;