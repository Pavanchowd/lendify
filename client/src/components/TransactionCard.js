const TransactionCard = ({ transaction }) => {
    return (
      <div className="transaction-card">
        <h3>💰 Transaction Details</h3>
        <p>Amount: ${transaction.amount}</p>
        <p>Interest Rate: {transaction.interestRate}%</p>
        <p>Duration: {transaction.duration}</p>
        <p>Status: <span className="status">{transaction.status}</span></p>
        <div className="parties">
          <p>Lender: {transaction.lender.name}</p>
          <p>Borrower: {transaction.borrower.name}</p>
        </div>
      </div>
    );
  };
  export default TransactionCard;