
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Login from './components/auth/login';
import Homepage from './components/homepage';
import CreateGroup from './components/createGroup';
import Header from './components/header';
import Protected from './components/auth/protectd';

const App = () => {

  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Protected><Homepage /></Protected>} />
        <Route path="/create-group" element={<Protected><CreateGroup /></Protected>} />
      </Routes>
    </Router>
  );
};

export default App;
