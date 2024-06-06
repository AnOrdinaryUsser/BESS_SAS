import React, { useState, useEffect } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import {
  CButton,
  CCol,
  CFormInput,
  CRow,
  CContainer,
  CForm,
} from "@coreui/react";
import { refreshToken, modifyUser } from "../../services/UsersService.js";

const IP_SERVER = process.env.REACT_APP_IP_SERVER;
const PORT_BACKEND = process.env.REACT_APP_PORT_BACKEND;

/**
 * @description View for Dashboard
 * This view will list all users of the system. Only the administrator user will be able to access it. You can also add or delete users in the system.
 */
const Dashboard = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [visibility, setVisibility] = useState(true);
  const [validated, setValidated] = useState(false);
  const [show, setShow] = useState(true);
  const [edit, setEdit] = useState(false);

  const buttonHandler = () => {
    setVisibility(!visibility);
    setShow(!show);
    setEdit(!edit);
    console.log(show);
  };

  useEffect(() => {
    refreshToken(setToken, setExpire, setName, setEmail);
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

  return (
    <>
      <h1 className="mb-4">Bienvenido de nuevo: {name}</h1>
      <h2 className="mb-4">Mis datos</h2>
      <CContainer>
        <CRow>
          <CCol md={20} lg={20} xl={6}>
            <CForm
              className="row g-4"
              validated={validated}
              onSubmit={(e) => modifyUser(e, name, setValidated)}
            >
              <CCol md={6}>
                <CFormInput
                  type="text"
                  id="nombre"
                  label="Nombre"
                  defaultValue={name}
                  disabled={visibility}
                  required
                />
              </CCol>
              <CCol xs={12}>
                <CFormInput
                  type="email"
                  id="emailInput"
                  label="Email"
                  defaultValue={email}
                  disabled={visibility}
                  required
                />
              </CCol>
              <CCol xs={12}>
                <CFormInput
                  type="password"
                  id="pass"
                  label="Contraseña"
                  defaultValue={email}
                  disabled={visibility}
                  required
                />
              </CCol>
              <CCol md={12}>
                {show && (
                  <CButton
                    color="secondary"
                    style={{ color: "white" }}
                    aria-pressed="true"
                    onClick={buttonHandler}
                  >
                    Editar
                  </CButton>
                )}
              </CCol>
              <CCol md={3}>
                {edit && (
                  <CButton color="success" aria-pressed="true" type="submit">
                    Guardar
                  </CButton>
                )}
              </CCol>
              <CCol md={3}>
                {edit && (
                  <CButton
                    color="danger"
                    aria-pressed="true"
                    onClick={buttonHandler}
                  >
                    Cancelar
                  </CButton>
                )}
              </CCol>
            </CForm>
          </CCol>
          <p className="mb-4"></p>
        </CRow>
      </CContainer>
    </>
  );
};

export default Dashboard;
