import React, { useEffect, useState, createRef } from "react";
import ReactDOM from 'react-dom'
import axios from "axios";
import jwt_decode from "jwt-decode";
import {
  CButton,
  CCol,
  CFormInput,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CContainer,
  CForm,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CFormLabel,
  CBadge,
} from "@coreui/react";



import {
  getDevices,
  getDevice,
  deleteDevice,
  modifyDevice,
  addDevice,
} from "../../services/DevicesService";
import { refreshToken } from "../../services/UsersService";

import CIcon from "@coreui/icons-react";
import { cilSearch, cilPencil, cilTrash, cilChartPie } from "@coreui/icons";

const IP_SERVER = process.env.REACT_APP_IP_SERVER;
const PORT_BACKEND = process.env.REACT_APP_PORT_BACKEND;
import { useNavigate } from 'react-router-dom';

const PacientList = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [device, setDevice] = useState([]);
  const [deviceList, setDeviceList] = useState([]);
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [visibility, setVisibility] = useState(true);
  const [validated, setValidated] = useState(false);
  const [show, setShow] = useState(true);
  const [edit, setEdit] = useState(false);
  const [visibleModify, setVisibleModify] = useState(false);


  const getBadge = (status) => {
    switch (status) {
      case 'Active':
        return 'success'
      case 'Inactive':
        return 'secondary'
      case 'Pending':
        return 'warning'
      case 'Banned':
        return 'danger'
      default:
        return 'primary'
    }
  }

 /* useEffect(() => {
    PatientService.getPatientsData()
      .then((response) => response.json())
      .then((response) => {
        if (response) {
          setDeviceList(response);
          //console.log(response)
        }
      });
  }, []);*/

  useEffect(() => {
    refreshToken(setToken, setExpire, setName, setEmail);
    getDevices(setDeviceList);
  }, []);

  const axiosJWT = axios.create();

  axiosJWT.interceptors.request.use(
    async (config) => {
      const currentDate = new Date();
      if (expire * 1000 < currentDate.getTime()) {
        const response = await axios.get(`http://${IP_SERVER}:${PORT_BACKEND}/token`);
        config.headers.Authorization = `Bearer ${response.data.accessToken}`;
        setToken(response.data.accessToken);
        const decoded = jwt_decode(response.data.accessToken);
        setExpire(decoded.exp);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  function handlerButton(deviceSerialNumber) {
    console.log(deviceSerialNumber);
    setVisibleModify(!visibleModify);
    getDevice(deviceSerialNumber, setDevice);
  }


  return (
    <>
      <CContainer>
      <h1 className="mb-4">Listado de dispositivos</h1>
        <CRow className="mb-4">
          <CCol md={20} lg={20} xl={6}>
            <CForm className="row g-4">
              <CCol md={8}>
                <CFormInput type="text" id="inputEmail4" placeholder="" onChange={(e => setSearch(e.target.value))} />
              </CCol>
              <CCol md={4}>
                <CButton  color="secondary"
                    style={{ color: "white" }}
                    aria-pressed="true">
                  <CIcon icon={cilSearch}></CIcon>
                </CButton>
              </CCol>
            </CForm>
          </CCol>
        </CRow>
        <CTable className="mb-4" >
          <CTableHead color="secondary">
            <CTableRow>
              <CTableHeaderCell scope="col">ID</CTableHeaderCell>
              <CTableHeaderCell scope="col">Número de serie</CTableHeaderCell>
              <CTableHeaderCell scope="col">Localización</CTableHeaderCell>
              <CTableHeaderCell scope="col">Registrada</CTableHeaderCell>
              <CTableHeaderCell scope="col">Estado</CTableHeaderCell>
              <CTableHeaderCell scope="col">Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {deviceList
             .filter(device => device.serialNumber.includes(search))
             .map((item, key) => (
                <CTableRow key={key}>
                  <CTableHeaderCell scope="row">{key + 1}</CTableHeaderCell>
                  <CTableDataCell>{item.serialNumber}</CTableDataCell>
                  <CTableDataCell>{item.location}</CTableDataCell>
                  <CTableDataCell>{item.registered}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color={getBadge(item.status)}>{item.status}</CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                  <CButton
                    id={item.serialNumber}
                    style={{
                      backgroundColor: "#3a8cbe",
                      borderColor: "#3a8cbe",
                      marginRight: "5px",
                    }}
                    onClick={() => handlerButton(item.serialNumber)}
                  >
                    <CIcon icon={cilPencil}></CIcon>
                  </CButton>
                  <CButton
                    id={item.serialNumber}
                    style={{
                      backgroundColor: "#e8463a",
                      borderColor: "#e8463a",
                      marginRight: "5px",
                    }}
                    onClick={deleteDevice}
                  >
                    <CIcon icon={cilTrash}></CIcon>
                  </CButton>
                  <CButton
                    id={item.serialNumber}
                    style={{
                      backgroundColor: "#5ab660",
                      borderColor: "#5ab660",
                    }}
                    onClick={() => navigate(`/device?serialNumber=${item.serialNumber}`)}
                  >
                    <CIcon icon={cilChartPie}></CIcon>
                  </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))} 
          </CTableBody>
        </CTable>
        <CRow>
          <CContainer fluid>
            <CButton
                className="mb-4 d-grid mx-auto"
                color="secondary"
                style={{ color: "white" }}
                onClick={() => setVisible(!visible)}
            >
            Añadir dispositivo  
            </CButton>
          </CContainer>
            <CModal
              alignment="center"
              visible={visible}
              onClose={() => setVisible(false)}
            >
              <CModalHeader onClose={() => setVisible(false)}>
                <CModalTitle>Añadir dispositivo</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <CForm
                  className="mb-4"
                  validated={validated}
                  onSubmit={(e) => addDevice(e,setValidated)}
                >
                  <CRow className="mb-3">
                    <CFormLabel
                      htmlFor="colFormLabel"
                      className="col-sm-2 col-form-label"
                    >
                      Nº serie
                    </CFormLabel>
                    <CCol sm={10}>
                      <CFormInput
                        type="text"
                        id="serialNumber"
                        placeholder="Número de serie"
                        pattern="^[a-zA-Z ()]*$"
                        title="Solo puedes introducir letras a-Z, parentesis o espacios"
                        required
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CFormLabel
                      htmlFor="colFormLabel"
                      className="col-sm-2 col-form-label"
                    >
                      Local.
                    </CFormLabel>
                    <CCol sm={10}>
                      <CFormInput
                        type="text"
                        id="location_"
                        placeholder="Localización"
                        required
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CFormLabel
                      htmlFor="colFormLabel"
                      className="col-sm-2 col-form-label"
                    >
                      Reg.
                    </CFormLabel>
                    <CCol sm={10}>
                      <CFormInput
                        type="text"
                        id="registered"
                        placeholder="Registrado"
                        required
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CFormLabel
                      htmlFor="colFormLabel"
                      className="col-sm-2 col-form-label"
                    >
                      Estado
                    </CFormLabel>
                    <CCol sm={10}>
                      <CFormInput
                        type="text"
                        id="status_"
                        placeholder="Estado"
                        required
                      />
                    </CCol>
                  </CRow>

                  <CButton
                    className='className="mb-4 d-grid gap-2 col-6 mx-auto'
                    type="submit"
                    color="secondary"
                    style={{ color: "white" }}
                  >
                    Añadir
                  </CButton>
                </CForm>
              </CModalBody>
            </CModal>
            <CModal
              alignment="center"
              visible={visibleModify}
              onClose={() => setVisibleModify(false)}
            >
              <CModalHeader onClose={() => setVisibleModify(false)}>
                <CModalTitle>Modificar dispositivo</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <CForm
                  className="mb-4"
                  validated={validated}
                  onSubmit={(e) => modifyDevice(e, device.serialNumber, setValidated)}
                >
                  <CRow className="mb-3">
                    <CFormLabel
                      htmlFor="colFormLabel"
                      className="col-sm-2 col-form-label"
                    >
                      Nº serie
                    </CFormLabel>
                    <CCol sm={10}>
                      <CFormInput
                        type="text"
                        id="serialNumber_"
                        placeholder="Número de serie"
                        defaultValue={device.serialNumber}
                        title="Solo puedes introducir letras a-Z, parentesis o espacios"
                        required
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CFormLabel
                      htmlFor="colFormLabel"
                      className="col-sm-2 col-form-label"
                    >
                      Local.
                    </CFormLabel>
                    <CCol sm={10}>
                      <CFormInput
                        type="text"
                        id="location_"
                        defaultValue={device.location}
                        placeholder="Localización"
                        required
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CFormLabel
                      htmlFor="colFormLabel"
                      className="col-sm-2 col-form-label"
                    >
                      Reg.
                    </CFormLabel>
                    <CCol sm={10}>
                      <CFormInput
                        type="text"
                        id="registered"
                        defaultValue={device.registered}
                        placeholder="Registrado"
                        required
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CFormLabel
                      htmlFor="colFormLabel"
                      className="col-sm-2 col-form-label"
                    >
                      Estado
                    </CFormLabel>
                    <CCol sm={10}>
                      <CFormInput
                        type="text"
                        id="status_"
                        defaultValue={device.status}
                        placeholder="Estado"
                        required
                      />
                    </CCol>
                  </CRow>

                  <CButton
                    className='className="mb-4 d-grid gap-2 col-6 mx-auto'
                    type="submit"
                    color="secondary"
                    style={{ color: "white" }}
                  >
                    Modificar
                  </CButton>
                </CForm>
              </CModalBody>
            </CModal>
        </CRow>
      </CContainer>
    </>
  );
};

export default PacientList;