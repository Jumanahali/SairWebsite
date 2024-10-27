import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { collection, onSnapshot, doc, getDoc, query, where } from 'firebase/firestore'; 
import EyeIcon from '../images/eye.png';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../Violations.css';
import SAIRLogo from '../images/SAIRlogo.png';
import logoutIcon from '../images/logout.png';
import { Table } from 'antd';

const ViolationList = () => {
  const [motorcycles, setMotorcycles] = useState([]);
  const [violations, setViolations] = useState([]);
  const [drivers, setDrivers] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const navigate = useNavigate();
  const [currentEmployerCompanyName, setCurrentEmployerCompanyName] = useState('');
  const employerUID = sessionStorage.getItem('employerUID');

  // Fetch Employer Company Name and Motorcycles
  useEffect(() => {
    const fetchEmployerCompanyName = async () => {
      if (employerUID) {
        const employerDoc = await getDoc(doc(db, 'Employer', employerUID));
        if (employerDoc.exists()) {
          setCurrentEmployerCompanyName(employerDoc.data().CompanyName);
        } else {
          console.error("No such employer!");
        }
      }
    };

    const fetchMotorcycles = () => {
  const motorcycleCollection = query(
    collection(db, 'Motorcycle'),
    where('CompanyName', '==', currentEmployerCompanyName)
  );

  const unsubscribe = onSnapshot(motorcycleCollection, (snapshot) => {
    const motorcycleMap = {}; // Create an object to hold GPS to License Plate mapping
    snapshot.forEach((doc) => {
      const data = doc.data();
      motorcycleMap[data.GPSnumber] = data.LicensePlate; // Map GPS number to License Plate
    });
    setMotorcycles(motorcycleMap); // Set the state with the mapped object
    const gpsNumbers = Object.keys(motorcycleMap);
    if (gpsNumbers.length > 0) {
      fetchViolations(gpsNumbers);  // Fetch violations only if there are GPS numbers
    } else {
      setViolations([]); // Clear violations if no motorcycles found
    }
  });

      return () => unsubscribe();
    };

    fetchEmployerCompanyName(); // Fetch company name first
    fetchMotorcycles(); // Fetch motorcycles based on company name
  }, [employerUID, currentEmployerCompanyName]);

  // Fetch Violations Data
  const fetchViolations = (gpsNumbers) => {
    // Run the query only if there are GPS numbers
    if (gpsNumbers.length === 0) return;

    const violationCollection = query(
      collection(db, 'Violation'),
      where('GPSnumber', 'in', gpsNumbers) // Fetch violations for these GPS numbers
    );

    const unsubscribe = onSnapshot(violationCollection, (snapshot) => {
      const violationList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setViolations(violationList);
      fetchDrivers(violationList); // Fetch drivers after getting violations
    });

    return () => unsubscribe();
  };

  // Fetch Drivers Data
  const fetchDrivers = (violationList) => {
    const driverIDs = violationList.map(v => v.driverID);
    const driverCollection = collection(db, 'Driver');

    const unsubscribe = onSnapshot(driverCollection, (snapshot) => {
      const driverMap = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Only add drivers that are in the violation list
        if (driverIDs.includes(data.DriverID)) {
          driverMap[data.DriverID] = `${data.Fname} ${data.Lname}`;
        }
      });
      setDrivers(driverMap);
    });

    return () => unsubscribe();
  };

  // Filtering logic based on searchQuery and searchDate
  const filteredViolations = violations.filter((violation) => {
    const driverName = drivers[violation.driverID] || 'Unknown Driver';
    const licensePlate = motorcycles[violation.GPSnumber] || 'Unknown Plate';

    // Convert timestamp to date string for comparison
  // Convert the Unix timestamp to a Date object
  let violationDate = '';
  if (violation.time) {
    // Assuming violation.time is in seconds
    violationDate = new Date(violation.time * 1000).toISOString().split('T')[0];
  }
    // Check if the search query matches either driver name or license plate
    const matchesSearchQuery = driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      licensePlate.toLowerCase().includes(searchQuery.toLowerCase());

    // Check if the date matches exactly (both are in yyyy-mm-dd format)
    const matchesSearchDate = searchDate ? violationDate === searchDate : true;

    return matchesSearchQuery && matchesSearchDate;
  });

  const columns = [
    {
      title: 'Violation ID',
      dataIndex: 'violationID',
      key: 'id',
      align: 'center',
    },
    {
      title: 'Driver Name',
      key: 'driverName',
      align: 'center',
      render: (text, record) => {
        return drivers[record.driverID] || 'Unknown Driver'; // Fallback if driver not found
      },
    },
    {
      title: 'Motorcycle Licence Plate Number',
      key: 'motorcyclePlate',
      align: 'center',
      render: (text, record) => {
        return motorcycles[record.GPSnumber] || 'Unknown Plate'; // Access the license plate from the motorcycles map
      },
    },
    {
      title: 'Speed',
      dataIndex: 'driverSpeed',
      key: 'driverSpeed',
      align: 'center',
    },
    {
      title: 'Details',
      key: 'Details',
      align: 'center',
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
        <div className="breadcrumb" style={{ marginRight: '100px' }}>
          <a onClick={() => navigate('/employer-home')}>Home</a>
          <span> / </span>
          <a onClick={() => navigate('/violations')}>Violations List</a>
        </div>
        <div className='search-inputs' style={{ padding: '0px 100px' }}>
          <h2 className='title' style={{ marginRight: '300px', fontWeight:"bold" }}>Violations List</h2>
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
          style={{ width: '1200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '0 auto' }}
        />
      </main>
    </>
  );
};

export default ViolationList;