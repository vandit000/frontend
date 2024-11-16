const FriendDetailsDialog = ({ isOpen, onClose, transactions }) => {
 
  console.log("isOpen:", isOpen);
  console.log("transactions:", transactions);

  if (!isOpen) return null;


  const reversedTransactions = transactions ? [...transactions].reverse() : [];

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
      <div className="bg-gray-800 text-white rounded-3xl shadow-2xl p-8 w-96 max-w-full">
   
        <div className="flex justify-between items-center mb-6">
         
          <h2 className="text-2xl font-semibold text-gray-300">Transaction Details</h2>

          <button
            onClick={onClose}
            className="text-blue-400 hover:text-gray-200 text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {reversedTransactions.length > 0 ? (
            reversedTransactions.map((transaction, index) => (
              <div
                key={index}
                className={`p-6 rounded-lg shadow-lg flex justify-between items-center transition-all duration-300 ease-in-out ${
                  transaction.amount < 0 ? "bg-red-500" : "bg-green-500"
                }`}
              >
                <div className="flex-1">
                  <span className="text-lg font-medium">{transaction.description}</span>
                </div>
                <div className="ml-4">
                  <span className="text-lg font-semibold">
                    ${Math.abs(transaction.amount).toFixed(1)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center">No transactions available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendDetailsDialog;
