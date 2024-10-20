
import { useEffect, useState } from 'react'
import { doc, getDoc, getDocs, query, where, collection } from 'firebase/firestore'
import { useParams } from 'react-router-dom'
import { db } from '../firebase';
import Map from './Map';
import "../ViolationDetail.css"

const ViolationGeneral = () => {
  const [currentViolation, setCurrentViolation] = useState({});
  const [currentMotorCycle, setCurrentMotorCycle] = useState({});
  const { violationId } = useParams()


  useEffect(() => {
    // fetch violation details
    const violationDocRef = doc(db, 'te2', violationId);
    getDoc(violationDocRef).then(violationDoc => {
      if (violationDoc.exists()) {
        const violationData = violationDoc.data();
        setCurrentViolation(violationData);
        // fetch motorcycle details
        if (violationData.GPSnumber) {
          const q = query(collection(db, "Motorcycle"), where("GPSnumber", "==", violationData.GPSnumber

          ));
          getDocs(q).then((querySnapshot) => {
            setCurrentMotorCycle(querySnapshot.docs[0]?.data())
          })
        }
      }
    })



  }, [violationId])

  console.log("currentViolation", currentViolation)
  console.log("currentMotorCycle", currentMotorCycle)

  return (
    <main >

      <h2 className="title">Violation Details </h2>


      {currentViolation.GPSnumber &&
        currentMotorCycle &&
        (
          <>
            <hr />

            <h3>Driver ID</h3>
            <p>{currentViolation.DriverID}</p>
            <h3>Motorcycle LicensePlate</h3>
            <p>{currentMotorCycle.LicensePlate}</p>
            <h3>GPS serial number</h3>
            <p>{currentMotorCycle.GPSnumber}</p>
            <h3>Motorcycle Type</h3>
            <p>{currentMotorCycle.Type}</p>
            <h3>Motorcycle Brand</h3>
            <p>{currentMotorCycle.Brand}</p>
            <h3>Motorcycle Model</h3>
            <p>{currentMotorCycle.Model}</p>


          </>
        )
      }


      <hr />


      <h3>Violation ID</h3>
      <p>{currentViolation.ViolationID}</p>
      <h3>Sreet Speed</h3>
      <p>{currentViolation.MaxSpeed}</p>
      <h3>Motorcycle speed </h3>
      <p>{currentViolation.speed}</p>
      <h3>Violation Price</h3>
      <p>{currentViolation.price} SAR</p>
      <h3>Time</h3>
      <p>{new Date(currentViolation.time).toLocaleTimeString()}</p>
      <h3>Date</h3>
      <p>{new Date(currentViolation.time).toLocaleDateString()}</p>


      <hr />

      <h3>Violation Location</h3>
      <p>{currentViolation.location}</p>

      <div className="map">
        {
          currentViolation?.position &&
          < Map lat={currentViolation.position?.y} lng={currentViolation.position?.x} />}
      </div>

    </main>


  )
}

export default ViolationGeneral;