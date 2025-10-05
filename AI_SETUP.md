# AI Integration Setup

## Environment Variables

Create a `.env.local` file in the root directory with the following content:

```env
# AI Service Configuration
# For local development (when AI service is running locally)
REACT_APP_AI_API_URL=http://localhost:8000

# For production (update with your deployed AI service URL)
# REACT_APP_AI_API_URL=https://your-ai-service.railway.app
```

## Installation

Install the required dependencies:

```bash
npm install
```

## Running the Application

1. Start the AI service (if running locally):
   ```bash
   # In the seattle-data-prep repository
   python3 api.py
   ```

2. Start the React application:
   ```bash
   npm run dev
   ```

3. Navigate to the AI tab in the application to test the chatbot functionality.

## Features Implemented

✅ **AI Tab**: Added "AI" tab next to "Filters" and "Menu"  
✅ **Chatbot Component**: Integrated UrbanPlanningChatbot component  
✅ **Dark Theme**: Styled to match the existing app design  
✅ **Tab Navigation**: State management for switching between tabs  
✅ **API Integration**: Ready for AI service communication  
✅ **Responsive Design**: Works on desktop and mobile  

## Usage

1. Click on the "AI" tab in the right panel
2. The chatbot will attempt to connect to the AI service
3. If connected (green status), you can ask questions like:
   - "Where should I develop 200 houses?"
   - "Show me the highest density areas"
   - "What are the best locations for development?"
   - "Compare neighborhoods by density"

## Troubleshooting

- **Red "Disconnected" status**: Make sure the AI service is running and the API URL is correct
- **Connection issues**: Check the console for error messages
- **Styling issues**: The component uses global CSS classes that should work with the existing theme
