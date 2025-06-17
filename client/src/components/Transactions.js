 import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import axios from "axios";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  max-width: 720px;
  margin: 50px auto 70px;
  padding: 40px 30px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  
  /* Your requested blue gradient background */
  background: linear-gradient(45deg, #2196f3 30%, #1976d2 90%);
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(25, 118, 210, 0.4);
  color: white;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 50px;
  font-weight: 700;
  font-size: 2.8rem;
  color: #e3f2fd;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
`;

const TransactionCard = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 20px 25px;
  margin-bottom: 22px;
  color: #0d47a1; /* dark blue text */
  font-weight: 600;
  
  /* Your requested subtle blue shadow */
  box-shadow: 0 3px 5px 2px rgba(33, 150, 243, 0.2);
  
  animation: ${fadeIn} 0.4s ease forwards;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 8px 15px 4px rgba(33, 150, 243, 0.4);
  }
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const Label = styled.span`
  font-weight: 700;
`;

const Value = styled.span`
  font-weight: 500;
`;

const NoData = styled.p`
  text-align: center;
  color: #bbdefb;
  font-size: 1.5rem;
  margin-top: 120px;
  font-style: italic;
`;

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("/api/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTransactions(data);
      } catch (error) {
        console.error("Failed to fetch transactions", error);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <Container>
      <Title>Transactions</Title>

      {transactions.length === 0 ? (
        <NoData>No transactions yet.</NoData>
      ) : (
        transactions.map((tx) => (
          <TransactionCard key={tx._id}>
            <Row>
              <Label>Lender:</Label>
              <Value>{tx.lenderId?.name || "N/A"}</Value>
            </Row>
            <Row>
              <Label>Borrower:</Label>
              <Value>{tx.borrowerId?.name || "N/A"}</Value>
            </Row>
            <Row>
              <Label>Amount:</Label>
              <Value>₹ {tx.amount}</Value>
            </Row>
            <Row>
              <Label>Interest:</Label>
              <Value>{tx.interest}%</Value>
            </Row>
            <Row>
              <Label>Phone:</Label>
              <Value>{tx.borrowerId?.phoneNumber || "N/A"}</Value>
            </Row>
            <Row>
              <Label>Duration:</Label>
              <Value>{tx.duration}</Value>
            </Row>
          </TransactionCard>
        ))
      )}
        
    </Container>
  );
};

export default Transactions;

