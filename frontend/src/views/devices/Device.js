import React, { useEffect, useState, createRef } from "react";
import {
  CCol,
  CContainer,
  CRow,
  CButton,
  CModal,
  CModalBody,
  CModalHeader,
} from "@coreui/react";
import { CChart } from '@coreui/react-chartjs'
import { useLocation } from "react-router-dom";
import { getDevice } from "../../services/DevicesService";
import { handleCaptureImage, handleArduinoDoors } from "../../services/ImgService"
import usalEscudo from './../../assets/images/usal.png'
import ocs from './../../assets/images/OCS.png'
import organic from './../../assets/images/organicG.png'
import plastic from './../../assets/images/plasticG.png'
import paper from './../../assets/images/paperG.png'
import glass from './../../assets/images/glassG.png'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';


/**
 * @description View for Device Chart
 * In this view you can see capacity charts of containers
 */
const Device = () => {
  const location = useLocation();
  const [device, setDevice] = useState([]);
  const [showMessage, setShowMessage] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const serialNumber = params.get('serialNumber');
    getDevice(serialNumber, setDevice);
  }, [location]);

  useEffect(() => {
    if (showMessage && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setShowMessage(false);
      setTimeLeft(5);
    }
  }, [showMessage, timeLeft]);

  const handleButtonClick = async () => {
    try {
      setShowMessage(true);
      handleCaptureImage();
    } catch (error) {
      alert('Error al cerrar las puertas de Arduino. Por favor, inténtelo de nuevo.');
      console.error('Error en handleArduinoDoors:', error);
    }
  };

  return (
    <div>
    <div className="d-flex justify-content-between align-items-center py-4 px-5">
      <div style={{ width: '100px' }}></div>
      <img src={ocs} alt="Logo Central" className="mx-auto" style={{ width: '600px' }} />
      <img src={usalEscudo} alt="Logo Derecho" style={{ width: '100px' }} />
    </div>
    <div className="d-flex flex-row align-items-center" style={{minHeight: '65vh'}}>
      <CContainer>
        <CRow className="justify-content-center mb-5"> {/* mb-5 y mt-5 combinados para más margen */}
          <CCol md={12} className="text-center">
            <h1 style={{color:'#279b48'}}>Simplemente deposite los residuos dentro</h1>
          </CCol>
        </CRow>
        <CRow className="justify-content-center">
          <CCol md={2} lg={3} xl={3}>
          <div style={{ position: 'relative'}}>
          <CChart
            type="doughnut"
            data={{
              datasets: [
                {
                  backgroundColor: ['#279b48', '#c3c3c3'],
                  data: [device.container1, 100-device.container1],
                  borderJoinStyle: 'round',
                },
              ],
            }}
            options={{
              cutout: '80%',
              plugins: {
                legend: {
                  display: false, 
                },
              },
            }}
          />
          <img
            src={organic}
            alt="Descripción de la imagen"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100px', 
              height: '100px', 
            }}
          />
        </div>
          </CCol>
          <CCol md={2} lg={3} xl={3}>
          <div style={{ position: 'relative'}}>
          <CChart
            type="doughnut"
            data={{
              datasets: [
                {
                  backgroundColor: ['#279b48', '#c3c3c3'],
                  data: [device.container2, 100-device.container2],
                  borderJoinStyle: 'round',
                },
              ],
            }}
            options={{
              cutout: '80%',
              plugins: {
                legend: {
                  display: false, 
                },
              },
            }}
          />
          <img
            src={plastic}
            alt="Descripción de la imagen"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100px',
              height: '100px', 
            }}
          />
        </div>
          </CCol>
          <CCol md={2} lg={3} xl={3}>
          <div style={{ position: 'relative'}}>
          <CChart
            type="doughnut"
            data={{
              datasets: [
                {
                  backgroundColor: ['#279b48', '#c3c3c3'],
                  data: [device.container3, 100-device.container3],
                  borderJoinStyle: 'round',
                },
              ],
            }}
            options={{
              cutout: '80%',
              plugins: {
                legend: {
                  display: false, 
                },
              },
            }}
          />
          <img
            src={paper}
            alt="Descripción de la imagen"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100px', 
              height: '100px', 
            }}
          />
        </div>
          </CCol>
          <CCol md={2} lg={3} xl={3}>
          <div style={{ position: 'relative'}}>
          <CChart
            type="doughnut"
            data={{
              datasets: [
                {
                  backgroundColor: ['#279b48', '#c3c3c3'],
                  data: [device.container4, 100-device.container4],
                  borderJoinStyle: 'round',
                },
              ],
            }}
            options={{
              cutout: '80%',
              plugins: {
                legend: {
                  display: false, 
                },
              },
            }}
          />
          <img
            src={glass}
            alt="Descripción de la imagen"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '150px', 
              height: '150px', 
            }}
          />
        </div>
          </CCol>
        </CRow>
        <CRow className="justify-content-center mt-5">
            <CCol md={3} className="text-center">
              <CButton style={{ backgroundColor: "#279b48", borderColor:"#279b48"}}
               size="lg" onClick={handleButtonClick}>Iniciar reciclaje</CButton>
            </CCol>
          </CRow>
      </CContainer>
    </div>
      <div className="position-absolute bottom-0 end-0 p-3">
          <a href="#" style={{ textDecoration: 'none', color: '#4b4b4b', fontWeight: 'bold', fontSize: 'larger' }}>¿Cómo funciona?</a>
      </div>
      <CModal visible={showMessage} onClose={() => setShowMessage(false)} backdrop="static" keyboard={false} alignment="center">
          <CModalBody className="text-center">
          <div style={{ width: '450px', height: '450px', margin: '0 auto' }}>
            <CircularProgressbar
              value={5 - timeLeft}
              maxValue={5}
              text={`${timeLeft}`}
              styles={buildStyles({
                pathColor: '#279b48',
                textColor: '#279b48',
                trailColor: '#d6d6d6',
              })}
            />
          </div>
          <h2 style={{ color: '#279b48', marginTop: '10px' }}>Abriendo puertas, deposite el material en el interior</h2>
        </CModalBody>
      </CModal>
    </div>
  );
};

export default Device;
