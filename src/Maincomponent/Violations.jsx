import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { collection, doc, onSnapshot, getDoc } from 'firebase/firestore'; 
import EyeIcon from '../images/eye.png';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../Violations.css';
import SAIRLogo from '../images/SAIRlogo.png';
import logoutIcon from '../images/logout.png';
import { Table } from 'antd';

const ViolationList = () => {
  const [violations, setViolations] = useState([]);
  const [isDetailsPopupVisible, setIsDetailsPopupVisible] = useState(false);
  const [currentViolation, setCurrentViolation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');

  const navigate = useNavigate();

  const handleLogout = () => {
    auth.signOut().then(() => {
      navigate('/');
    }).catch((error) => {
      console.error('Error logging out:', error);
    });
  };

  useEffect(() => {
    const fetchUserName = async () => {
      const employerUID = sessionStorage.getItem('employerUID');
      if (employerUID) {
        try {
          const userDocRef = doc(db, 'Employer', employerUID);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            setCurrentUserName(docSnap.data().Fname);
          }
        } catch (error) {
          console.error('Error fetching employer data:', error);
        }
      }
    };

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

    fetchUserName();
    fetchViolations();
  }, []);

  const openDetailsPopup = async (violationId) => {
    const violationDocRef = doc(db, 'te2', violationId);
    const violationDoc = await getDoc(violationDocRef);

    if (violationDoc.exists()) {
      const violationData = violationDoc.data();
      // Fetch additional data as needed
      setCurrentViolation({
        id: violationId,
        date: new Date(violationData.time.seconds * 1000).toLocaleDateString(),
        time: new Date(violationData.time.seconds * 1000).toLocaleTimeString(),
        speed: violationData.speed,
        maxSpeed: violationData.MaxSpeed,
        driverId: violationData.DriverID,
        // Add other fields as needed
      });
      setIsDetailsPopupVisible(true);
    }
  };

  function formatDate(date) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return [year, month, day].join('-');
  }

  const filteredData = violations
    .filter(violation => {
      const violationDate = new Date(violation.time); // Convert Firestore timestamp
      const formattedViolationDate = formatDate(violationDate * 1000); 
      return (
        violation.id.includes(searchQuery) &&
        (!searchDate || formattedViolationDate === searchDate) // Compare formatted dates
      );
    })
  
  const columns = [
    {
      title: 'Violation ID',
      dataIndex: 'ViolationID',
      key: 'ViolationID',
    },
    {
      title: 'Violation Location',
      dataIndex: 'location',
      key: 'location'
    },
    {
      title: 'Driver Speed',
      dataIndex: 'speed',
      key: 'speed',
    },
    {
      title: 'Details',
      key: 'Details',
      render: (text, record) => { 
        return <Link to={`/violation/general/${record.id}`}>
          <img
            style={{ cursor: 'pointer' }}
            src={EyeIcon}
            alt="Details"
          />
        </Link>
}
    } 
  ]; 

  return (
    < >
      <header>
        <nav>
          <a onClick={() => navigate('/Employeehomepage')}>
            <img className="logo" src={SAIRLogo} alt="SAIR Logo" />
          </a>

          <div className="nav-links" id="navLinks">
            <ul>
              <li><a onClick={() => navigate('/employer-home')}>Home</a></li>
              <li><a class="active" onClick={() => navigate('/violations')}>Violations List</a></li>
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
        <div className='search-header'>
          <h2 className='title'>Violations List</h2>
          <div className='search-inputs '>

            <div className="search-container">
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
              />
            </div>
            <div className="search-container">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="#059855" stroke-linecap="round" stroke-width="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
              </svg>

              <input
                type="text"
                placeholder="Search by Violation ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />

      </main>
    </>
  );
};

export default ViolationList;