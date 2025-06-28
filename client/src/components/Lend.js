import React, { useState } from 'react';
import { useEffect } from 'react';
import BorrowerRequestCard from './BorrowerRequestCard';
 import axios from 'axios';
// Inline CSS styles for a blue-themed UI
 const styles = {
  copyright: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: '0.9rem',
    marginTop: '30px',
    opacity: 0.8,
    fontFamily: "'Inter', sans-serif",
    position: 'absolute',
    bottom: '20px',
    width: '100%',
  },
  lendContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '40px',
    fontFamily: '"Inter", sans-serif',
    backgroundColor: '#f8fafc',
  },
  lendCard: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '40px 50px',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.08)',
    width: '100%',
    maxWidth: '720px',
    textAlign: 'center',
    transition: 'all 0.3s ease',
  },
  tabs: {
    display: 'flex',
    marginBottom: '25px',
    borderBottom: '2px solid #e2e8f0',
  },
  tab: {
    flex: 1,
    padding: '15px 0',
    fontSize: '18px',
    fontWeight: 600,
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: '#334155',
    borderBottom: '3px solid transparent',
    transition: 'all 0.3s ease',
  },
  activeTab: {
    color: '#2563eb', // Tailwind Blue-600
    borderBottom: '3px solid #2563eb',
    backgroundColor: '#f0f7ff',
    transform: 'scale(1.02)',
  },
  tabContent: {
    display: 'none',
  },
  activeTabContent: {
    display: 'block',
  },
  inputField: {
    width: '100%',
    padding: '14px 16px',
    marginBottom: '25px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.3s, box-shadow 0.3s',
    backgroundColor: '#f9fafb',
  },
  inputFocus: {
    borderColor: '#2563eb',
    boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.2)',
  },
  selectField: {
    width: '100%',
    padding: '14px 16px',
    marginBottom: '25px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    fontSize: '16px',
    backgroundColor: '#f9fafb',
    transition: 'border-color 0.3s, box-shadow 0.3s',
  },
  selectFocus: {
    borderColor: '#2563eb',
    boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.2)',
  },
  button: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#2563eb',
    color: 'white',
    borderRadius: '10px',
    border: 'none',
    fontSize: '17px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)',
  },
  buttonHover: {
    backgroundColor: '#1d4ed8',
    boxShadow: '0 10px 20px rgba(37, 99, 235, 0.25)',
  },
  placeholderText: {
    color: '#94a3b8',
    fontStyle: 'italic',
    fontSize: '15px',
  },
  successMessage: {
    color: '#16a34a',
    fontSize: '17px',
    fontWeight: 600,
    marginBottom: '20px',
  },
  errorMessage: {
    color: '#dc2626',
    fontSize: '15px',
    fontWeight: 500,
    marginBottom: '12px',
  },
};


const Lend = () => {
  const [activeTab, setActiveTab] = useState('lend');
  const [amount, setAmount] = useState('');
  const [interest, setInterest] = useState('');
  const [duration, setDuration] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [responses, setResponses] = useState([]);
  const [location, setLocation] = useState({ latitude: null, longitude: null });
   
  const fetchResponses = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get('/response', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResponses(response.data);
    } catch (error) {
      console.error("Failed to fetch responses:", error);
    }
  };

   const handleAccept = async (requestId) => {
  try {
    const token = localStorage.getItem("token");
     await axios.post(`/api/requests/${requestId}/accept`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Optionally update state to remove accepted request immediately
     setResponses((prev) => prev.filter((response) => response._id !== requestId));

    // Optionally show a success message or redirect to transactions page
    alert("Request accepted and transaction recorded!");

  } catch (error) {
    console.error("Accept failed:", error);
  }
};

  // Update handleReject to filter out the rejected request
const handleReject = async (requestId) => {
  try {
    const token = localStorage.getItem("token");
    await axios.delete(`/api/requests/${requestId}/reject`, 
      
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    // Remove the rejected request from state immediately
    setResponses(prev => prev.filter(response => response._id !== requestId));
    
  } catch (error) {
    console.error("Reject failed:", error);
  }
};
  useEffect(() => {
    // Fetch user location on component mount
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ latitude, longitude });
  
        // Send location to backend to update in DB
        try {
          const token = localStorage.getItem("token");
          await fetch("https://my-server-api-eq9v.onrender.com/api/update-location", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ latitude, longitude }),
          });
        } catch (err) {
          console.error("Failed to update location:", err);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError('Unable to fetch location');
      }
    );
  }, []);

  useEffect(() => {
    if (activeTab === 'responses') {
      fetchResponses();
    }
  }, [activeTab]);

   

  const handleTabChange = (tab) => setActiveTab(tab);

  const handleInputFocus = (e) => e.target.style.borderColor = styles.inputFocus.borderColor;
  const handleInputBlur = (e) => e.target.style.borderColor = '#ddd';
  const handleSelectFocus = (e) => e.target.style.borderColor = styles.selectFocus.borderColor;
  const handleSelectBlur = (e) => e.target.style.borderColor = '#ddd';

  const handleLendMoney = async () => {
    if (
      location.latitude == null ||
      location.longitude == null
    ) {
      setError('Waiting for your location… please allow location access.');
      return;
    }

    if (!amount || !interest || !duration) {
      setError('Please fill out all fields before lending.');
      return;
    }
    if (isNaN(amount) || isNaN(interest)) {
      setError('Amount and Interest must be valid numbers.');
      return;
    }
  
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("https://my-server-api-eq9v.onrender.com/api/lenders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount,
          interest,
          duration,
          location: {
            type: "Point",
            coordinates: [location.longitude, location.latitude], // Lender's coordinates
          },
          userId: token,  // Use the token here if you want to identify the user, or you can remove this if user ID is not needed
        }),
      });
  
      if (response.ok) {
        setIsSubmitted(true);
        setError('');
      } else {
        const resData = await response.json();
        setError(resData.message || 'Failed to lend money');
      }
    } catch (err) {
      console.error("Error:", err);
      setError('Server error while lending money.');
    }
  };
  

  const handleLendOneMore = () => {
    setIsSubmitted(false);
    setAmount('');
    setInterest('');
    setDuration('');
  };

  return (
    <div style={styles.lendContainer}>
      <div style={styles.lendCard}>
        {/* Tabs */}
        <div style={styles.tabs}>
          <div
            style={{ ...styles.tab, ...(activeTab === 'lend' ? styles.activeTab : {}) }}
            onClick={() => handleTabChange('lend')}
          >
            Lend
          </div>
          <div
            style={{ ...styles.tab, ...(activeTab === 'responses' ? styles.activeTab : {}) }}
            onClick={() => handleTabChange('responses')}
          >
            Responses
          </div>
        </div>
  
        {/* Lend Tab Content */}
        <div style={{ ...styles.tabContent, ...(activeTab === 'lend' ? styles.activeTabContent : {}) }}>
          {isSubmitted ? (
            <div style={styles.successMessage}>
              Successfully you lent your money. Let's see if any borrower will request.
              <br />
              <button
                style={styles.button}
                onMouseOver={(e) => e.target.style.backgroundColor = styles.buttonHover.backgroundColor}
                onMouseOut={(e) => e.target.style.backgroundColor = styles.button.backgroundColor}
                onClick={handleLendOneMore}
              >
                Lend One More
              </button>
            </div>
          ) : (
            <>
              <h2 style={{ marginBottom: '20px', color: '#4A90E2', fontSize: '24px' }}>Lend Money</h2>
              {error && <p style={styles.errorMessage}>{error}</p>}
  
              <input
                type="number"
                placeholder="Enter Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                style={styles.inputField}
              />
  
              <input
                type="number"
                placeholder="Interest Rate (%)"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                style={styles.inputField}
              />
  
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                onFocus={handleSelectFocus}
                onBlur={handleSelectBlur}
                style={styles.selectField}
              >
                <option value="">Select Duration</option>
                <option value="1day">1 Day</option>
                <option value="1week">1 Week</option>
                <option value="1month">1 Month</option>
                <option value="6months">6 Months</option>
                <option value="1year">1 Year</option>
              </select>
  
              <button
                style={styles.button}
                onMouseOver={(e) => e.target.style.backgroundColor = styles.buttonHover.backgroundColor}
                onMouseOut={(e) => e.target.style.backgroundColor = styles.button.backgroundColor}
                onClick={handleLendMoney}
              >
                Lend Money
              </button>
            </>
          )}
        </div>
  
        {/* Responses Tab Content */}
        <div style={{ ...styles.tabContent, ...(activeTab === 'responses' ? styles.activeTabContent : {}) }}>
          <h2 style={{ marginBottom: '20px', color: '#4A90E2', fontSize: '24px' }}>Responses</h2>
          
          {responses.length === 0 ? (
            <p style={styles.placeholderText}>No responses yet. When a borrower requests, you'll see them here.</p>
          ) : (
            responses.map((response, index) => (
              <BorrowerRequestCard
               key={response._id}
                borrower={response}
                onAccept={() => handleAccept(response._id)}  // handleAccept function
                onReject={() => handleReject(response._id)} // handleReject function
              />
            ))
            
          )}
        </div>
      </div>
      
    </div>
    
  );
}
export default Lend;
