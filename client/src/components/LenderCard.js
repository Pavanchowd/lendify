import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const Card = styled.div`
  position: relative;
  background: #e0f2fe;
  border: 1px solid #60a5fa;
  padding: 1rem;
  border-radius: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: #6b7280;
  padding: 0.25rem;

  &:hover {
    color: #ef4444;
  }
`;

const ProfilePic = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #3b82f6;
`;

const InfoWrapper = styled.div`
  flex: 1;
`;

const Title = styled.h3`
  margin-bottom: 0.3rem;
  font-size: 1.2rem;
  color: #1e3a8a;
`;

const Info = styled.p`
  margin: 0.2rem 0;
  color: #1e40af;
`;

const RequestButton = styled.button`
  margin-top: 0.6rem;
  background-color: ${props => props.requested ? '#10b981' : '#3b82f6'};
  color: white;
  padding: 0.5rem 1rem;
  font-size: 0.95rem;
  border: none;
  border-radius: 0.4rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  &:hover {
    background-color: ${props => props.requested ? '#059669' : '#2563eb'};
  }
`;

const LenderCard = ({ lender,borrower, onRequest, onDelete }) => {
  const [isRequested, setIsRequested] = useState(false);
    const [lenders, setLenders] = useState([]);

  const removeLender = (lenderId) => {
  setLenders((prev) => prev.filter((lender) => lender._id !== lenderId));
};

const handleRemove = async (lenderId) => {
  try {
    await axios.delete(`http://localhost:5000/api/lenders/${lenderId}`);
       setLenders((prevLenders) =>
      prevLenders.filter((lender) => lender._id !== lenderId)
    ); // Remove from UI
  } catch (error) {
    console.error("Failed to delete lender:", error);
  }
};

  
  const handleRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to send a request!');
        return;
      }
       
      const {   amount, interest, duration } = borrower|| {};
      if (!borrower) {
        console.error("Borrower data is not available");
        return ; 
      }
       
       // Assume `borrower` object has these fields

      const res = await fetch('http://localhost:5000/api/send-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lenderId: lender.userId._id,
          amount:lender.amount,
          interest:lender.interest,
          duration:lender.duration
        }),
      });


      console.log("Borrower fetched data:", res.data);

      const data = await res.json();
      if (res.ok) {
        console.log('Response sent:', data.message);
        alert('Request sent to the lender!');
        setIsRequested(true);
  
        // Call the onRequest callback if provided
        if (onRequest) {
          onRequest();
        }
      } else {
        console.error('Failed to send response:', data.message);
        alert('Error sending request: ' + data.message);
      }
      
    } catch (err) {
      console.error(err);
      alert('Error sending request');
    }
  };
  return (
    <Card>
      {onDelete && (
        <CloseButton onClick={() =>  handleRemove(lender._id)} aria-label="Close">
          X
        </CloseButton>
      )}

      <ProfilePic src={lender.userId?.profilePic || '/default-profile.jpg'} alt="Lender" />
      <InfoWrapper>
        <Title>{lender.userId?.name || 'Unnamed Lender'}</Title>
        <Info>💰 Amount: ₹{lender.amount}</Info>
        <Info>📈 Interest: {lender.interest}%</Info>
        <Info>⏳ Duration: {lender.duration}</Info>
      </InfoWrapper>

      <RequestButton
        onClick={handleRequest}
        disabled= {isRequested }
        requested={isRequested}
        onRequest={() => {
          console.log("A request was sent to a lender!");
          // Optional: trigger UI update or toast
        }}
      >
        {isRequested ? 'Request Sent ✓' : 'Request'}
      </RequestButton>
    </Card>
  );
};

export default LenderCard;