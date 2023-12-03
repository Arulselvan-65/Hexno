import Home from './components/pages/Home';
import Profile from './components/pages/Profile';
import CrowdFunding from './components/pages/CrowdFunding';
import {
  Routes,
  Route,
} from "react-router-dom";
import SharedLayout from './components/pages/SharedLayout';

function App() {
  return (
    <div className="container">
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path ="/home" element={<SharedLayout/>}>
            <Route path="/home/profile" element={<Profile/>}/>
            <Route path="/home/crowdfunding" element={<CrowdFunding/>}/>
          </Route>
        </Routes>
    </div>
  );
}

export default App;