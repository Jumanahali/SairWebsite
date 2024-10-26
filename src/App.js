import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './Maincomponent/UserAuth/Login';
import Signup from './Maincomponent/UserAuth/Signup';
import ForgotPassword from './Maincomponent/UserAuth/ForgotPassword';
import EmployeeHome from './Maincomponent/Employeehomepage';
import DriversList from './Maincomponent/driverslist';
import MotorcyclesList from './Maincomponent/motorcycleslist';
import Violations from './Maincomponent/Violations';
import Complaints from './Maincomponent/Complaints';
import Crashes from './Maincomponent/Crashes';
import EmployeeProfile from './Maincomponent/Employeeprofilepage';
import ViolationDetail from './Maincomponent/ViolationDetail';
import 'antd/dist/reset.css';
import AddDriver from './Maincomponent/AddDriver';
import EditDriver from './Maincomponent/EditDriver';
import ViolationGeneral from './Maincomponent/Violationgeneral';
import AddMotorcycle from './Maincomponent/AddMotorcycle';
import EditMotorcycle from './Maincomponent/EditMotorcycle';
import DriverDetails from './Maincomponent/DriverDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/employer-home" element={<EmployeeHome />} />
        <Route path="/driverslist" element={<DriversList />} />
        <Route path="/motorcycleslist" element={<MotorcyclesList />} />
        <Route path="/violations" element={<Violations />} />
        <Route path="/complaints" element={<Complaints />} />
        <Route path="/crashes" element={<Crashes />} />
        <Route path="/employee-profile" element={<EmployeeProfile />} />
        <Route path="/edit-driver/:driverId" element={<EditDriver />} />
        <Route path="/add-driver" element={<AddDriver />} />
        <Route path="/violation/general/:violationId" element={<ViolationGeneral />} />
        <Route path="/violation/detail/:driverId" element={<ViolationDetail />} />
        <Route path="/edit-motorcycle/:motorcycleId" element={<EditMotorcycle />} />
        <Route path="/add-motorcycle" element={<AddMotorcycle />} />
        <Route path="/driver-details/:driverId" element={<DriverDetails />} /> {/* Use element prop here */}
      </Routes>
    </Router>
  );
}

export default App;