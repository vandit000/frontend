import { useState, useEffect } from "react";
import { ChevronRight, Check } from "lucide-react";
import axios from "axios";
import Header from "./header";

const CreateGroup = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [groupName, setGroupName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/users/getUser"
        );
        setFriends(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleNext = () => {
    if (groupName.trim()) {
      setStep(2);
    }
  };

  const handleFriendToggle = (friend) => {
    setSelectedFriends((prev) =>
      prev.includes(friend)
        ? prev.filter((f) => f !== friend)
        : [...prev, friend]
    );
  };

  const handleCreateGroup = async () => {
    try {
      
      const members = selectedFriends.map(friend => ({
        id: friend._id,
        name: friend.name
      }));
      
      const groupData = { name: groupName, members };
      const response = await axios.post(
        "http://localhost:5000/api/group/createGroup",
        groupData
      );
  
      if (response.data) {
        setStep(1);
        setGroupName("");
        setSelectedFriends([]);
        onClose();
      }
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };
  
  return (
    <>
      <Header/>
    <div className="min-h-[623px] bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white font-sans flex justify-center">
      <div className="rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-6">
          <h2 className="text-xl font-semibold text-white">
            {step === 1 ? "Create New Group" : "Select Friends"}
          </h2>
        </div>

        <div className="p-6">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  id="groupName"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none py-2 px-1"
                  placeholder="Enter group name"
                />
                <label
                  htmlFor="groupName"
                  className="absolute left-0 -top-3.5 text-sm font-medium text-gray-400 transition-all"
                >
                  Group Name
                </label>
              </div>
              <button
                onClick={handleNext}
                className="w-full mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
                disabled={!groupName.trim()}
              >
                Next
                <ChevronRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-300 mb-4">
                Select friends to add to {groupName}
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {friends.map((friend) => (
                  <button
                    key={friend._id}
                    onClick={() => handleFriendToggle(friend)}
                    className={`w-full px-4 py-3 rounded-md text-left flex items-center justify-between transition-colors ${
                      selectedFriends.includes(friend)
                        ? "bg-gray-700 text-white"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                        {friend.name[0]}
                      </div>
                      {friend.name}
                    </div>
                    {selectedFriends.includes(friend) && (
                      <Check className="h-5 w-5 text-blue-500" />
                    )}
                  </button>
                ))}
              </div>
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleCreateGroup}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                  disabled={selectedFriends.length === 0}
                >
                  Create Group
                  <Check className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </>
  );
};

export default CreateGroup;
