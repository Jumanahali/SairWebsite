import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore'; 
import EyeIcon from '../images/eye.png';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../Violations.css';
import SAIRLogo from '../images/SAIRlogo.png';
import logoutIcon from '../images/logout.png';
import { Table } from 'antd';

const ViolationList = () => {
  const [violations, setViolations] = useState([]);
  const [drivers, setDrivers] = useState({});
  const [motorcycles, setMotorcycles] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const navigate = useNavigate();

  // Fetch Drivers Data
  useEffect(() => {
    const fetchDrivers = async () => {
      const driverCollection = collection(db, 'Driver');
      onSnapshot(driverCollection, (snapshot) => {
        const driverMap = {};
        snapshot.forEach((doc) => {
          const data = doc.data();
          driverMap[data.DriverID] = `${data.Fname} ${data.Lname}`;
        });
        setDrivers(driverMap);
      });
    };

    const fetchMotorcycles = async () => {
      const motorcycleCollection = collection(db, 'Motorcycle');
      onSnapshot(motorcycleCollection, (snapshot) => {
        const motorcycleMap = {};
        snapshot.forEach((doc) => {
          const data = doc.data();
          motorcycleMap[data.GPSnumber] = data.LicensePlate;
        });
        setMotorcycles(motorcycleMap);
      });
    };

    fetchDrivers();
    fetchMotorcycles();
  }, []);

  // Fetch Violations Data
  useEffect(() => {
    const fetchViolations = () => {
      const violationCollection = collection(db, 'te2');
      const unsubscribe = onSnapshot(violationCollection, (snapshot) => {
        const violationList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setViolations(violationList);
      });
      return () => unsubscribe();
    };

    fetchViolations();
  }, []);

  // Filtering logic based on searchQuery and searchDate
  const filteredViolations = violations.filter((violation) => {
    const driverName = drivers[violation.DriverID] || '';
    const licensePlate = motorcycles[violation.GPSnumber] || '';

    // Check if the violation has a valid date and compare it to the search date
    const violationDate = violation.date || '';

    // Log to check date values
    console.log('Violation Date:', violationDate, 'Search Date:', searchDate);

    // Check if the search query matches either driver name or license plate
    const matchesSearchQuery = driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      licensePlate.toLowerCase().includes(searchQuery.toLowerCase());

    // Check if the date matches exactly (both are in mm/dd/yyyy format)
    const matchesSearchDate = searchDate ? violationDate === searchDate : true;

    return matchesSearchQuery && matchesSearchDate;
  });

  const columns = [
    {
      title: 'Violation ID',
      dataIndex: 'ViolationID',
      key: 'ViolationID',
    },
    {
      title: 'Driver Name',
      key: 'driverName',
      render: (text, record) => {
        const driverName = drivers[record.DriverID];
        return driverName || 'Unknown';
      },
    },
    {
      title: 'Motorcycle License Plate',
      key: 'motorcyclePlate',
      render: (text, record) => {
        return motorcycles[record.GPSnumber] || 'Unknown';
      },
    },
    {
      title: 'Speed',
      dataIndex: 'speed',
      key: 'speed',
    },
    {
      title: 'Details',
      key: 'Details',
      render: (text, record) => (
        <Link to={`/violation/general/${record.id}`}>
          <img style={{ cursor: 'pointer' }} src={EyeIcon} alt="Details" />
        </Link>
      ),
    },
  ];

  const handleLogout = () => {
    auth.signOut()
      .then(() => navigate('/'))
      .catch((error) => console.error('Error logging out:', error));
  };

  return (
    <>
      <header>
        <nav>
          <a onClick={() => navigate('/Employeehomepage')}>
            <img className="logo" src={SAIRLogo} alt="SAIR Logo" />
          </a>
          <div className="nav-links" id="navLinks">
            <ul>
              <li><a onClick={() => navigate('/employer-home')}>Home</a></li>
              <li><a className="active" onClick={() => navigate('/violations')}>Violations List</a></li>
              <li><a onClick={() => navigate('/crashes')}>Crashes List</a></li>
              <li><a onClick={() => navigate('/complaints')}>Complaints List</a></li>
              <li><a onClick={() => navigate('/driverslist')}>Drivers List</a></li>
              <li><a onClick={() => navigate('/motorcycleslist')}>Motorcycles List</a></li>
              <li><a onClick={() => navigate('/employee-profile')}>Profile</a></li>
            </ul>
          </div>
          <button className="logoutBu" onClick={handleLogout}>
            <img className="logout" src={logoutIcon} alt="Logout" />
          </button>
        </nav>
      </header>

      <main>
        <div className="breadcrumb">
          <a onClick={() => navigate('/employer-home')}>Home</a>
          <span> / </span>
          <a onClick={() => navigate('/violations')}>Violations List</a>
        </div>
        <h2 className='title'>Violations List</h2>
        <div className='search-inputs'>
          <div className="search-container">
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="#059855" strokeLinecap="round" strokeWidth="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
            </svg>
            <input
              type="text"
              placeholder="Search by Driver Name or Plate Number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '300px' }}
            />
          </div>
          <div className="search-container">
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
            />
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={filteredViolations}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </main>
    </>
  );
};

export default ViolationList;
