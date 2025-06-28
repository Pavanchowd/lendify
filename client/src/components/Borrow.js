import React, { useState } from 'react';
import styled from 'styled-components';
import LenderCard from './LenderCard'; // ✅ Import your reusable LenderCard component
import axios from 'axios';
import PropTypes from 'prop-types';
import { useEffect } from 'react';

LenderCard.propTypes = {
  lender: PropTypes.object.isRequired,
  onRequest: PropTypes.func.isRequired
};
// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem;
  color: #1e3a8a;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
`;

const SelectWrapper = styled.div`
  margin-bottom: 1.5rem;
`;

const Dropdown = styled.select`
  padding: 0.6rem 1.2rem;
  border: 2px solid #3b82f6;
  border-radius: 0.5rem;
  background: white;
  color: #1e3a8a;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    border-color: #2563eb;
  }
`;

const Button = styled.button`
  background-color: #3b82f6;
  color: white;
  padding: 0.6rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  margin-bottom: 2rem;

  &:hover {
    background-color: #2563eb;
  }
`;

const LenderList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 1rem;
  width: 100%;
  max-width: 500px;
`;

const NoData = styled.p`
  margin-top: 1rem;
  color: #64748b;
  text-align: center;
`;

// Borrower Component
const Borrower = () => {
  const [borrower, setBorrower] = useState(null);
  const [range, setRange] = useState('');
  const [location, setLocation] = useState(null);
  const [lenders, setLenders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const removeLender = (lenderId) => {
    setLenders((prevLenders) => prevLenders.filter(lender => lender._id !== lenderId));
  };
  useEffect(() => {
    const fetchBorrowerData = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log(token)
        // Fetch borrower data
        const response = await axios.get("https://my-server-api-eq9v.onrender.com/api/borrower/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        // Assuming the response contains the borrower data
        setBorrower(response.data);  // Set borrower data
      } catch (error) {
        console.error("Error fetching borrower data:", error);
      }
    };
  
    fetchBorrowerData();
  }, []);

  const distanceOptions = [
    { label: '< 500 meters', value: '<500m' },
    { label: '1 km', value: '1km' },
    { label: '2 km', value: '2km' },
    { label: '3 km', value: '3km' },
    { label: '4 km', value: '4km' },
    { label: '> 4 km', value: '>4km' },
  ];

  const handleBorrowClick = async () => {
    if (!range) {
      alert("Please select a distance range first.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      // Consider redirect to login
      return;
    }

    setLoading(true);
    setError('');

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      setLocation({ latitude, longitude });

      const res = await axios.get(`https://my-server-api-eq9v.onrender.com/api/borrower/offers`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { latitude, longitude, range }
      });
const requestedLenderIds = res.data.map(r => r.lenderId);

const filteredLenders = res.data.filter(
  lender => !requestedLenderIds.includes(lender.userId._id)
);

setLenders(filteredLenders);
       
      
    } catch (err) {
      console.error("Error:", err.response || err);
      setError(err.response?.data?.message || err.message);
      
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        // Redirect to login
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container>
      <Title>Select Distance Range</Title>
      
      <SelectWrapper>
        <Dropdown 
          value={range} 
          onChange={(e) => setRange(e.target.value)}
          disabled={loading}
        >
          <option value="">-- Choose distance --</option>
          {distanceOptions.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Dropdown>
      </SelectWrapper>

      <Button onClick={handleBorrowClick} disabled={loading}>
        {loading ? 'Searching...' : 'Borrow'}
      </Button>

       

      <LenderList>
        {lenders.length > 0 ? (
          lenders.map((lender) => (
            <LenderCard key={lender._id} lender={lender} borrower={borrower}  onRequest={() => {
              console.log(lender)
              console.log("A request was sent to a lender!");
              
              // Optional: trigger UI update or toast
            }}
             onDelete={removeLender}
              disabled={!borrower || !borrower.amount}/>
          ))
        ) : (
          <NoData>No lenders found in your area</NoData>
        )}
      </LenderList>
      
    </Container>
  );
};
export default Borrower;
