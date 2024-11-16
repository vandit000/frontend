import React, { useEffect, useState } from "react";
import { Briefcase, X } from "lucide-react";
import axios from "axios";

export default function ExpenseDialog({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [expenseDetails, setExpenseDetails] = useState({
    amount: "",
    description: "",
    splitType: "equal",
    splits: {},
  });
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      fetchGroups();
      fetchUsers();
    }
  }, [isOpen]);

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchGroups = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/group/getGroups"
      );
      const userId = user._id ? user._id : user._id.toString();

      const userGroups = response.data.filter((group) => {
        return group.members.some((member) => member.id.toString() === userId);
      });

      setGroups(userGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/users/getUser"
      );
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleNext = async () => {
    if (
      step === 1 &&
      (selectedGroups.length > 0 || selectedFriends.length > 0)
    ) {
      setStep(2);
    } else if (
      step === 2 &&
      expenseDetails.amount &&
      expenseDetails.description
    ) {
      const expenseAmount = parseFloat(expenseDetails.amount);
      const expenseData = {
        amount: expenseAmount,
        createdBy: user?.email,
        createdAt: new Date(),
        description: expenseDetails.description,
      };

      let owedUserDetails = [];
      let owesUserDetails = [];

      const participants =
        selectedGroups.length > 0 ? selectedGroups[0].members : selectedFriends;

      if (expenseDetails.splitType === "equal") {
        const splitAmount = expenseAmount / participants.length;
        participants.forEach((friend) => {
          if (friend.id !== user._id) {
            owesUserDetails.push({
              userId: friend.id,
              amount: splitAmount,
            });
          }
        });
      } else if (expenseDetails.splitType === "unequal") {
        let totalSplit = 0;
        for (let userId of Object.keys(expenseDetails.splits)) {
          const userAmount = parseFloat(expenseDetails.splits[userId]);
          totalSplit += userAmount;
          if (userId !== user._id) {
            owesUserDetails.push({
              userId: userId,
              amount: userAmount,
            });
          }
        }
        if (Math.abs(totalSplit - expenseAmount) > 0.01) {
          alert(
            "The sum of split amounts does not match the total expense amount."
          );
          return;
        }
      }

      owedUserDetails.push({
        userId: user._id,
        amount: expenseAmount,
      });

      const expenseDocs = owesUserDetails.map((owes) => ({
        paidBy: {
          id: user._id,
          name: user.name,
        },
        owedBy: {
          id: owes.userId,
          name: participants.find((p) => p.id === owes.userId)?.name,
        },
        amount: owes.amount,
        description: expenseData.description,
        createdAt: expenseData.createdAt,
      }));

      try {
        console.log(expenseDocs);
        await axios.post(
          "http://localhost:5000/api/expense/create",
          expenseDocs
        );
        onClose();
        resetForm();
      } catch (error) {
        console.error("Error submitting expense:", error);
      }
    }
  };

  const resetForm = () => {
    setStep(1);
    setExpenseDetails({
      amount: "",
      description: "",
      splitType: "equal",
      splits: {},
    });
    setSelectedFriends([]);
    setSelectedGroups([]);
  };

  const handleSplitChange = (id, amount) => {
    setExpenseDetails((prev) => ({
      ...prev,
      splits: { ...prev.splits, [id]: parseFloat(amount) || 0 },
    }));
  };

  const handleGroupSelect = (group) => {
    if (selectedGroups.some((item) => item.id === group.id)) {
      setSelectedGroups([]); 
    } else {
      setSelectedGroups([group]); 
    }
    setSelectedFriends([]); 
  };

  const renderStep1 = () => (
    <div className="space-y-6 overflow-y-auto h-[400px] pr-2">
      <div>
        <h3 className="text-lg font-semibold text-gray-200 mb-2">Groups</h3>
        <div className="space-y-2">
          {console.log(groups)}
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => handleGroupSelect(group)}
              className={`w-full px-4 py-3 rounded-md text-left flex items-center justify-between transition-colors ${
                selectedGroups.some((item) => item._id === group._id)
                  ? "bg-gray-700 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              <div className="flex items-center">
                <Briefcase className="mr-3 h-5 w-5" />
                {group.name}
              </div>
              <span className="text-xs text-gray-400">
                ({group.members.length} members)
              </span>
            </button>
          ))}
          {console.log(selectedGroups)}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-200 mb-2">Friends</h3>
        <div className="space-y-2">
          {users.map((friend) => (
            <button
              key={friend._id}
              onClick={() => handleFriendSelect(friend)}
              className={`w-full px-4 py-3 rounded-md text-left flex items-center transition-colors ${
                selectedFriends.some((item) => item.id === friend._id)
                  ? "bg-gray-700 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              <div className="bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                {friend.name[0]}
              </div>
              {friend.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const handleFriendSelect = (friend) => {
    setSelectedGroups([]);
    setSelectedFriends((prevSelectedFriends) => {
      const isFriendSelected = prevSelectedFriends.some(
        (item) => item.id === friend._id
      );
      return isFriendSelected
        ? prevSelectedFriends.filter((item) => item.id !== friend._id)
        : [...prevSelectedFriends, { id: friend._id, name: friend.name }];
    });
  };


  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="relative">
        <input
          id="amount"
          type="number"
          placeholder="Enter amount"
          value={expenseDetails.amount}
          onChange={(e) =>
            setExpenseDetails({ ...expenseDetails, amount: e.target.value })
          }
          className="w-full bg-transparent border-b border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none py-2"
        />
        <label
          htmlFor="amount"
          className="absolute left-0 -top-3.5 text-sm font-medium text-gray-300"
        >
          Amount
        </label>
      </div>
      <div className="relative">
        <input
          id="description"
          type="text"
          placeholder="Enter description"
          value={expenseDetails.description || ""}
          onChange={(e) =>
            setExpenseDetails({
              ...expenseDetails,
              description: e.target.value,
            })
          }
          className="w-full bg-transparent border-b border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none py-2"
        />
        <label
          htmlFor="description"
          className="absolute left-0 -top-3.5 text-sm font-medium text-gray-300"
        >
          Description
        </label>
      </div>
      <div>
        <span className="block text-sm font-medium text-gray-300 mb-2">
          Split Type
        </span>
        <div className="flex space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-blue-600 bg-gray-700 border-gray-600"
              name="splitType"
              value="equal"
              checked={expenseDetails.splitType === "equal"}
              onChange={(e) =>
                setExpenseDetails({
                  ...expenseDetails,
                  splitType: e.target.value,
                })
              }
            />
            <span className="ml-2 text-gray-300">Equal</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-gray-600 bg-gray-700 border-gray-600"
              name="splitType"
              value="unequal"
              checked={expenseDetails.splitType === "unequal"}
              onChange={(e) =>
                setExpenseDetails({
                  ...expenseDetails,
                  splitType: e.target.value,
                })
              }
            />
            <span className="ml-2 text-gray-300">Unequal</span>
          </label>
        </div>
      </div>
      {expenseDetails.splitType === "unequal" && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300 mb-2">
            Split amounts
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {(selectedGroups.length > 0
              ? selectedGroups[0].members
              : selectedFriends
            ).map((member) => (
              <React.Fragment key={member.id}>
                <div className="col-span-1 text-gray-300">{member.name}</div>
                <div className="col-span-1">
                  <input
                    type="number"
                    placeholder={`${member.name}'s amount`}
                    value={expenseDetails.splits[member.id] || ""}
                    onChange={(e) =>
                      handleSplitChange(member.id, e.target.value)
                    }
                    className="w-full bg-transparent border-b border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none py-1"
                  />
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-md h-[600px] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            {step === 1 ? "Select Group or Friend" : "Enter Expense Details"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-grow overflow-y-auto p-6">
          {step === 1 ? renderStep1() : renderStep2()}
        </div>
        <div className="bg-gray-800 px-6 py-4 flex justify-end space-x-2 rounded-b-lg">
          {step === 2 && (
            <button
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors"
              onClick={() => setStep(1)}
            >
              Back
            </button>
          )}
          <button
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            onClick={handleNext}
          >
            {step === 1 ? "Next" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
