import  { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from './firebase';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);

  const navigate=useNavigate();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const { displayName, email } = result.user;
      const response = await axios.post('http://localhost:5000/api/users/login', { name: displayName, email });
      console.log('Server response:', response.data);
      if(response.data){
        localStorage.setItem("user",JSON.stringify(response.data.user))
        navigate("/")
      }
    } catch (error) {
      console.error('Error during login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-700 to-gray-900">
      <div className="w-full max-w-md bg-gray-800 shadow-lg rounded-lg">
        <div className="px-8 py-6">
          <h2 className="text-2xl font-bold text-center text-gray-100 mb-2">Welcome to Splitwise</h2>
          <p className="text-center text-gray-400 mb-6">Sign in to manage your expenses</p>
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-200 ease-in-out flex items-center justify-center"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                <path fill="none" d="M1 1h22v22H1z"/>
              </svg>
            )}
            {isLoading ? 'Signing In...' : 'Sign in with Google'}
          </button>
          <p className="mt-4 text-xs text-center text-gray-500">
            By signing in, you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}