import Head from "next/head";
import styles from "../styles/Home.module.css";
import MapC from "../components/map.js";
import UrbanPlanningChatbot from "../components/UrbanPlanningChatbox.jsx";
import { useState } from "react";
import Drawer from '@mui/material/Drawer';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

export default function Home() {
  const [focusedPointOfInterest, setFocusedPointOfInterest] = useState(null); //Now tracking focused poi by Center to push to map
  const [focusobj, setFocusObj] = useState(null)
  const [activeTab, setActiveTab] = useState("none"); // New state for tab management
  const [filters, setFilters] = useState([0, 0]);
  const [draweropen, setDrawer] = useState(false);
  
  // Hover popup state
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  
  // Chat state management - moved to parent to persist across tab switches
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatConnected, setChatConnected] = useState(false);
  const [pointsOfInterest, setPointsOfInterest] = useState([
  ]);

  function setFocus(id){
    let newfocus = pointsOfInterest.find(pointsOfInterest => pointsOfInterest.id === id);
    setFocusedPointOfInterest(newfocus.center);
    setFocusObj(newfocus);
    setDrawer(true);
  }

  // Handle hover events for popup
  const handlePointHover = (point, event) => {
    if (point.isAIRecommendation) {
      setHoveredPoint(point);
      setPopupPosition({
        x: event.clientX || event.pageX,
        y: event.clientY || event.pageY
      });
    }
  };

  const handlePointLeave = () => {
    setHoveredPoint(null);
  };
  function setTab(tab){
    if(tab == activeTab){setActiveTab("none")}else{setActiveTab(tab)}
    console.log(filters)
  }
  function toggleFilters(filter, value){
    if(filter == 1){
      if(value){setFilters(prev => prev.map((valuech, index) => index === 0 ? 1 : valuech));}
      if(!value){setFilters(prev => prev.map((valuech, index) => index === 0 ? 0 : valuech));}
    }
    if(filter == 2){
      if(value){setFilters(prev => prev.map((valuech, index) => index === 1 ? 1 : valuech));}
      if(!value){setFilters(prev => prev.map((valuech, index) => index === 1 ? 0 : valuech));}
    }
  }

  // Function to convert AI recommendations to points of interest
  const updatePointsOfInterestFromAI = (recommendations) => {
    if (!recommendations || !Array.isArray(recommendations)) return;
    
    const aiPointsOfInterest = recommendations.map((rec, index) => ({
      id: `ai-${rec.neighborhood_id || index}`,
      center: getNeighborhoodCoordinates(rec.neighborhood_id), // We'll need to implement this
      title: `Neighborhood ${rec.neighborhood_id}`,
      description: rec.development_advice || 'AI Recommended Area',
      score: rec.score,
      density: rec.density,
      reasons: rec.reasons || [],
      isAIRecommendation: true
    }));
    
    // Replace existing points with AI recommendations
    setPointsOfInterest(aiPointsOfInterest);
  };

  // Function to get coordinates for a neighborhood ID
  // This would need to be implemented based on your neighborhood data structure
  const getNeighborhoodCoordinates = (neighborhoodId) => {
    // Placeholder coordinates - you'll need to map this to actual neighborhood coordinates
    // This should match the coordinate system used in your neighborhood data
    const neighborhoodCoordinates = {
      '1': [47.6, -122.3321],
      '2': [47.637, -122.3134],
      '3': [47.64, -122.37],
      '4': [47.62, -122.35],
      '5': [47.65, -122.32],
      '6': [47.58, -122.38],
      '7': [47.67, -122.29],
      '8': [47.61, -122.33],
      '9': [47.63, -122.36],
      '10': [47.59, -122.31],
      '11': [47.66, -122.34],
      '12': [47.57, -122.35],
      '13': [47.64, -122.28],
      '14': [47.62, -122.37],
      '15': [47.68, -122.31],
      '16': [47.58, -122.32],
      '17': [47.65, -122.36],
      '18': [47.61, -122.29],
      '19': [47.63, -122.33],
      '20': [47.59, -122.36]
    };
    
    return neighborhoodCoordinates[neighborhoodId] || [47.6, -122.3321]; // Default to Seattle center
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Urban Intellect</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {focusobj && <Drawer open={draweropen} onClose={() => {setDrawer(false)}}>
          <div className={styles.drawercontainer}> 
            <h1>{focusobj.title}</h1>
            <p>{focusobj.description}</p>
            {focusobj.isAIRecommendation && (
              <div className={styles.aiRecommendationDetails}>
                <h3>AI Analysis</h3>
                <p><strong>Score:</strong> {focusobj.score}/5</p>
                {focusobj.density && <p><strong>Population Density:</strong> {focusobj.density.toFixed(0)} people/km²</p>}
                {focusobj.reasons && focusobj.reasons.length > 0 && (
                  <div>
                    <h4>Reasons for Recommendation:</h4>
                    <ul>
                      {focusobj.reasons.map((reason, index) => (
                        <li key={index}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </Drawer>}
        <div className={styles.mapcontainer}>
          <MapC
            pointsOfInterest={pointsOfInterest}
            filters={filters}
            focusedPointOfInterest={focusedPointOfInterest}
            setFocus={setFocus}
            onPointHover={handlePointHover}
            onPointLeave={handlePointLeave}
          />
        </div>
        <div className={styles.focuscontainer}>
          <div className={styles.focusheading}>
            <button 
              className={`${styles.focusheadingtext} ${activeTab === "filters" ? styles.activeTab : ""}`}
              onClick={() => setTab("filters")}
            >
              Filters
            </button>
            <button 
              className={`${styles.focusheadingtext} ${activeTab === "menu" ? styles.activeTab : ""}`}
              onClick={() => setTab("menu")}
            >
              Menu
            </button>
            <button 
              className={`${styles.focusheadingtext} ${activeTab === "ai" ? styles.activeTab : ""}`}
              onClick={() => setTab("ai")}
            >
              AI
            </button>
          </div>
          <div className={styles.focuscontent}>
            {activeTab === "none" && (
              <>
                {pointsOfInterest.map((p) => (
                  <div
                    key={p.id}
                    className={`${styles.poiitem} ${
                      p.center === focusedPointOfInterest ? styles.focusedPoiitem : ""
                    }`}
                    onClick={() => {setFocus(p.id)}} 
                  >
                    <p>{p.title}</p>
                    <p>{p.description}</p>
                  </div>
                ))}
              </>
            )}

            {activeTab === "filters" && (
              <div className={styles.menuContent}>
                <h3>Filter Options</h3>
                  <FormGroup>
                    <FormControlLabel control={<Checkbox checked={filters[0]} onChange={(event) => {toggleFilters(1 , event.target.checked)}} />} label="Population Density" />
                    <FormControlLabel control={<Checkbox checked={filters[1]} onChange={(event) => {toggleFilters(2 , event.target.checked)}} />} label="AOD " />
  
                  </FormGroup>
              </div>
            )}

            {activeTab === "menu" && (
              <div className={styles.menuContent}>
                <h3>Menu Options</h3>
                <p>Menu content will go here</p>
              </div>
            )}
            {activeTab === "ai" && (
              <div className={styles.aiContent}>
                <UrbanPlanningChatbot 
                  style={{ height: '100%', width: '100%' }}
                  className={styles.aiChatbot}
                  messages={chatMessages}
                  setMessages={setChatMessages}
                  inputMessage={chatInput}
                  setInputMessage={setChatInput}
                  isLoading={chatLoading}
                  setIsLoading={setChatLoading}
                  isConnected={chatConnected}
                  setIsConnected={setChatConnected}
                  onRecommendationsReceived={updatePointsOfInterestFromAI}
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Hover Popup for AI Recommendations */}
        {hoveredPoint && (
          <div 
            className={styles.hoverPopup}
            style={{
              position: 'fixed',
              left: popupPosition.x + 10,
              top: popupPosition.y - 10,
              zIndex: 1000
            }}
          >
            <div className={styles.popupContent}>
              <h3>{hoveredPoint.title}</h3>
              <p className={styles.popupDescription}>{hoveredPoint.description}</p>
              <div className={styles.popupDetails}>
                <p><strong>AI Score:</strong> {hoveredPoint.score}/5</p>
                {hoveredPoint.density && (
                  <p><strong>Population Density:</strong> {hoveredPoint.density.toFixed(0)} people/km²</p>
                )}
                {hoveredPoint.reasons && hoveredPoint.reasons.length > 0 && (
                  <div className={styles.popupReasons}>
                    <strong>Why Recommended:</strong>
                    <ul>
                      {hoveredPoint.reasons.slice(0, 3).map((reason, index) => (
                        <li key={index}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
