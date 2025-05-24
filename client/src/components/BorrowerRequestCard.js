import React from 'react';
import styled from 'styled-components';

// Styled Components
const Card = styled.div`
  background: #f0f9ff;
  border: 1px solid #38bdf8;
  padding: 1.2rem;
  border-radius: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ProfilePic = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #0ea5e9;
`;

const InfoWrapper = styled.div`
  flex: 1;
`;

const Name = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #0c4a6e;
  margin-bottom: 0.3rem;
`;

const Phone = styled.p`
  color: #0369a1;
  font-size: 0.95rem;
  margin: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const AcceptButton = styled.button`
  background-color: #22c55e;
  color: white;
  padding: 0.4rem 1rem;
  border: none;
  border-radius: 0.4rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background-color: #16a34a;
  }
`;

const RejectButton = styled.button`
  background-color: #ef4444;
  color: white;
  padding: 0.4rem 1rem;
  border: none;
  border-radius: 0.4rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background-color: #dc2626;
  }
`;

// Component
const BorrowerRequestCard = ({ borrower, onAccept, onReject }) => {
  const userDetails =  borrower?.borrowerId?.userId || {};
  return (
    <Card>
      <ProfilePic src={  userDetails.profilePic || '/default-profile.jpg'} alt="Borrower" />
      <InfoWrapper>
        <Name>{  userDetails.name || 'Unnamed Borrower'}</Name>  
        <Phone>📞 { userDetails.phoneNumber || 'N/A'}</Phone>
      </InfoWrapper>
      <ButtonGroup>
        <AcceptButton onClick={() => onAccept(borrower._id)}>Accept</AcceptButton>
        <RejectButton onClick={() => onReject(borrower._id)}>
          Reject
        </RejectButton>
      </ButtonGroup>
    </Card>
  );
};

export default BorrowerRequestCard;
