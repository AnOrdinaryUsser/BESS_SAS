import React, { useEffect, useState, createRef } from "react";
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from "@coreui/react";
import { CChart } from '@coreui/react-chartjs'
import { useLocation } from "react-router-dom";
import CIcon from "@coreui/icons-react";
import {
  getDevices,
  getDevice,
  deleteDevice,
  modifyDevice,
  addDevice,
} from "../../services/DevicesService";
import { refreshToken } from "../../services/UsersService";


const IP_SERVER = process.env.REACT_APP_IP_SERVER;
const PORT_BACKEND = process.env.REACT_APP_PORT_BACKEND;
import { cilLockLocked, cilUser } from "@coreui/icons";
import { Register } from "../../services/UsersService.js";
import usalEscudo from './../../assets/brand/usal.png'
import ocs from './../../assets/brand/OCS.png'

import organic from './../../assets/images/organicG.png'
import plastic from './../../assets/images/plasticG.png'
import metal from './../../assets/images/metalG.png'
import paper from './../../assets/images/paperG.png'
import glass from './../../assets/images/glassG.png'




function getStyle(variable) {
  return getComputedStyle(document.documentElement).getPropertyValue(variable);
}

/**
 * @description View for Register
 * In this view the user can register.
 */
const Registered = () => {
  const [validated, setValidated] = useState(false);
  const location = useLocation();
  const [device, setDevice] = useState([]);


  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const serialNumber = params.get('serialNumber');

    getDevice(serialNumber, setDevice);
  
  }, [location]);


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
                  display: false, // Ocultar la leyenda para evitar solapamientos
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
              width: '100px', // ajusta el tamaño de la imagen según sea necesario
              height: '100px', // ajusta el tamaño de la imagen según sea necesario
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
                  display: false, // Ocultar la leyenda para evitar solapamientos
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
              width: '100px', // ajusta el tamaño de la imagen según sea necesario
              height: '100px', // ajusta el tamaño de la imagen según sea necesario
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
                  display: false, // Ocultar la leyenda para evitar solapamientos
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
              width: '100px', // ajusta el tamaño de la imagen según sea necesario
              height: '100px', // ajusta el tamaño de la imagen según sea necesario
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
                  display: false, // Ocultar la leyenda para evitar solapamientos
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
              width: '150px', // ajusta el tamaño de la imagen según sea necesario
              height: '150px', // ajusta el tamaño de la imagen según sea necesario
            }}
          />
        </div>
          </CCol>
        </CRow>
      </CContainer>
    </div>
    <div className="position-absolute bottom-0 end-0 p-3">
        <a href="#" style={{ textDecoration: 'none', color: '#4b4b4b', fontWeight: 'bold', fontSize: 'larger' }}>¿Cómo funciona?</a>
      </div>
    </div>
  );
};

export default Registered;
