import TransactionCard from "./TransactionCard";
import { useEffect
 } from "react";
 import { useState } from "react";
 import axios from "axios";
const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
  
    useEffect(() => {
      const fetchTransactions = async () => {
        try {
          const token = localStorage.getItem("token");
          const { data } = await axios.get('http://localhost:5000/api/transactions', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setTransactions(data);
        } catch (error) {
          console.error("Fetch failed:", error);
        }
      };
      fetchTransactions();
    }, []);
  
    return (
      <div>
        {transactions.map(transaction => (
          <TransactionCard key={transaction._id} transaction={transaction} />
        ))}
      </div>
    );
  };
  export default Transactions;