import React, { useState, useEffect } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import {
  CButton,
  CFormInput,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CContainer,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CForm,
  CInputGroup,
  CInputGroupText,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilLockLocked, cilUser } from "@coreui/icons";
import {
  refreshToken,
  getUsers,
  deleteUser,
  addUser,
} from "../../services/UsersService.js";

const IP_SERVER = process.env.REACT_APP_IP_SERVER;
const PORT_BACKEND = process.env.REACT_APP_PORT_BACKEND;

/**
 * @description View for AdminDashboard
 * This view will display the data of the user who is logged in to the system. In addition, you can edit the data of the logged in user.
 */
const AdminDashboard = () => {
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [users, setUsers] = useState([]);
  const [validated, setValidated] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    refreshToken(setToken, setExpire);
    getUsers(setUsers, token, axiosJWT);
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
      <h1 className="mb-4">Usuarios: </h1>
      <CContainer fluid>
        <CTable>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">Id</CTableHeaderCell>
              <CTableHeaderCell scope="col">Nombre</CTableHeaderCell>
              <CTableHeaderCell scope="col">Email</CTableHeaderCell>
              <CTableHeaderCell scope="col">Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {users.map((user, index) => {
              return (
                <CTableRow key={index}>
                  <CTableDataCell>{user.id}</CTableDataCell>
                  <CTableDataCell>{user.name}</CTableDataCell>
                  <CTableDataCell>{user.email}</CTableDataCell>
                  <CTableDataCell>
                    <CButton
                      id={user.id}
                      style={{
                        backgroundColor: "#e8463a",
                        borderColor: "#e8463a",
                        margin: "10px",
                      }}
                      onClick={deleteUser}
                    >
                      Eliminar
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              );
            })}
          </CTableBody>
        </CTable>
        <CButton
          className="mb-4 d-grid"
          color="secondary"
          style={{ color: "white" }}
          onClick={() => setVisible(true)}
        >
          Añadir usuario
        </CButton>
      </CContainer>
      <CModal
        alignment="center"
        visible={visible}
        onClose={() => setVisible(false)}
      >
        <CModalHeader onClose={() => setVisible(false)}>
          <CModalTitle>Añadir usuario</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm
            validated={validated}
            onSubmit={(e) => addUser(e, setValidated)}
          >
            <p className="text-medium-emphasis">Crea tu cuenta</p>
            <CInputGroup className="mb-3">
              <CInputGroupText>
                <CIcon icon={cilUser} />
              </CInputGroupText>
              <CFormInput
                placeholder="Usuario"
                id="user"
                pattern="^[a-zA-Z0-9_.-]*$"
                autoComplete="username"
                required
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>@</CInputGroupText>
              <CFormInput
                type="email"
                id="email"
                placeholder="Email"
                autoComplete="email"
                required
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>
                <CIcon icon={cilLockLocked} />
              </CInputGroupText>
              <CFormInput
                type="password"
                placeholder="Contraseña"
                autoComplete="new-password"
                id="pass"
                required
              />
            </CInputGroup>
            <CInputGroup className="mb-4">
              <CInputGroupText>
                <CIcon icon={cilLockLocked} />
              </CInputGroupText>
              <CFormInput
                type="password"
                placeholder="Repite tu constraseña"
                autoComplete="new-password"
                id="repeatPass"
                required
              />
            </CInputGroup>
            <div className="d-grid">
              <CButton type="submit" color="success" aria-pressed="true">
                Crear Cuenta
              </CButton>
            </div>
          </CForm>
        </CModalBody>
      </CModal>
    </>
  );
};

export default AdminDashboard;
