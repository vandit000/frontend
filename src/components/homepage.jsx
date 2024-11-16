import React, { useState, useEffect } from "react";
import { PlusCircle, ArrowRight, ArrowLeft } from "lucide-react";
import ExpenseDialog from "./dialog/expenseDialog";
import FriendDetailsDialog from "./dialog/friendsDetailDialog";
import axios from "axios";
import Header from "./header";

const HomePage = () => {
  const [userName, setUserName] = useState("");
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friendDetails, setFriendDetails] = useState([]);
  const [isFriendDialogOpen, setIsFriendDialogOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const fullName = user?.name;

  const fetchFriends = async () => {
    try {
      const userId = user._id;
      const response = await axios.get(
        `http://localhost:5000/api/expense/get?userId=${userId}`
      );
      if (response.data && response.data.expenses) {
        const expenses = response.data.expenses;
        const friendBalances = expenses.reduce((acc, expense) => {
          const { paidBy, owedBy, amount } = expense;
          const isUserPayer = String(paidBy.id) === String(userId);
          const friendId = isUserPayer ? owedBy.id : paidBy.id;
          const friendName = isUserPayer ? owedBy.name : paidBy.name;
          const balanceChange = isUserPayer ? amount : -amount;

          const existingFriend = acc.find((f) => f.id === friendId);
          if (existingFriend) {
            existingFriend.balance += balanceChange;
          } else {
            acc.push({
              id: friendId,
              name: friendName,
              balance: balanceChange,
            });
          }

          return acc;
        }, []);

        setFriends(friendBalances);
      } else {
        console.warn("Unexpected API response", response);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  useEffect(() => {
    fetchFriends();
    if (typewriterIndex < fullName?.length) {
      const timer = setTimeout(() => {
        setUserName((prevName) => prevName + fullName[typewriterIndex]);
        setTypewriterIndex((prevIndex) => prevIndex + 1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [typewriterIndex]);

  useEffect(()=>{
    fetchFriends()
  },[isDialogOpen])

  const handleAddExpense = () => {
    setIsDialogOpen(true);
  };

  const fetchFriendDetails = async (friendId) => {
    try {
      const userId = user._id; 
      const response = await axios.get(
        `http://localhost:5000/api/expense/friend-transactions?userId=${userId}&friendId=${friendId}`
      );
      setFriendDetails(
        Array.isArray(response.data.transactions)
          ? response.data.transactions
          : []
      );
    } catch (error) {
      console.error("Error fetching friend transactions:", error);
    }
  };

  const handleFriendClick = async (friend) => {
    setSelectedFriend(friend);
    await fetchFriendDetails(friend.id);
    setIsFriendDialogOpen(true);
  };

  const handleCloseFriendDialog = () => {
    setIsFriendDialogOpen(false);
    setSelectedFriend(null);
  };

  const totalOwed = friends.reduce(
    (sum, friend) => sum + (friend.balance < 0 ? -friend.balance : 0),
    0
  );
  const totalOwes = friends.reduce(
    (sum, friend) => sum + (friend.balance > 0 ? friend.balance : 0),
    0
  );
  const netBalance = totalOwes - totalOwed;
  const totalTransactions = totalOwes + totalOwed;
  const owesPercentage = totalTransactions
    ? (totalOwes / totalTransactions) * 100
    : 0;

  return (
    <>
      {isDialogOpen && (
        <ExpenseDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
        />
      )}

      {isFriendDialogOpen && (
        <FriendDetailsDialog
          isOpen={isFriendDialogOpen}
          onClose={handleCloseFriendDialog}
          transactions={friendDetails}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white font-sans">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8 bg-gray-800 bg-opacity-50 rounded-3xl shadow-2xl p-8 border border-gray-700">
            <div className="text-3xl font-bold flex items-center justify-between mb-6">
              <span>
                Hi,{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-300 to-white">
                  {userName}
                </span>
              </span>
              <button
                onClick={handleAddExpense}
                className="flex items-center bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 px-6 py-3 rounded-full transition duration-300 transform hover:scale-105"
              >
                <PlusCircle className="mr-2 h-6 w-6" /> Add Expense
              </button>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg text-gray-300">Total Balance</span>
              <span
                className={`text-2xl font-bold ${
                  netBalance >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                ₹{Math.abs(netBalance).toFixed(2)}
              </span>
            </div>
            <div className="relative h-6 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-gray-500 to-gray-400"
                style={{ width: `${owesPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-300">
                You are owed: ₹{totalOwes.toFixed(2)}
              </span>
              <span className="text-gray-300">
                You owe: ₹{totalOwed.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="bg-gray-800 bg-opacity-50 rounded-3xl shadow-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-300 to-white">
              Friends Balance
            </h2>
            <ul className="space-y-4">
              {friends.map((friend) => (
                <li
                  key={friend.id}
                  onClick={() => handleFriendClick(friend)}
                  className="flex items-center justify-between p-4 bg-gray-900 rounded-2xl cursor-pointer transition duration-300 transform hover:scale-105"
                >
                  <div className="flex items-center">
                    <span className="text-xl font-medium">{friend.name}</span>
                  </div>
                  {friend.balance > 0 ? (
                    <div className="flex items-center text-green-400">
                      <ArrowLeft className="mr-2 h-5 w-5" />
                      <span className="text-lg">
                      ₹{friend.balance.toFixed(2)} owed to you
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-400">
                      <ArrowRight className="mr-2 h-5 w-5" />
                      <span className="text-lg">
                      ₹{Math.abs(friend.balance).toFixed(2)} you owe
                      </span>
                    </div>


                  )}
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </>   
  );
};

export default HomePage;
