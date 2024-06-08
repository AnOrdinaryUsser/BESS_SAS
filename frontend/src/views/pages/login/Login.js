import React, { useState, useRef } from "react";
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCardImage,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilLockLocked, cilUser } from "@coreui/icons";
import image from "./../../../assets/images/background.jpg";
import { Auth } from "../../../services/UsersService.js";
import ocs from './../../../assets/images/OCS.png'


/**
 * @description View for Login
 * In this view the user can log in to the system.
 */
const Login = () => {
  const [validated, setValidated] = useState(false);

  return (
    <div
    style={{
      backgroundImage: `url(${image})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
    }}
    className="min-vh-100 d-flex flex-row align-items-center"
  >
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={4}>
            <CCardGroup>
              <CCard className="p-4" style={{ paddingBottom: "0" }}>
                <CCardBody style={{ paddingBottom: "0" }}>
                  <CForm onSubmit={(e) => Auth(e, setValidated)}>
                    <h1>Inicia sesión</h1>
                    <p className="text-medium-emphasis">
                      Inicia sesión con tu cuenta
                    </p>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        id="user"
                        placeholder="Usuario"
                        //pattern="^[a-zA-Z0-9_.-]*$"
                        autoComplete="username"
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        id="password"
                        type="password"
                        placeholder="Contraseña"
                        autoComplete="current-password"
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                        <CButton type="submit" color="primary" className="px-4" 
                         style={{ backgroundColor: "#279b48", borderColor:"#279b48"}}>
                          Continuar
                        </CButton>
                      </CCol>
                    </CRow>
                    <CRow>
                      <p/>
                      <p className="text-medium-emphasis"
                       onClick={() => window.location.href = "/EnterEmail"}>
                        ¿Contraseña olvidada?
                      </p>
                    </CRow>
                  </CForm>
                  <CCardImage  src={ocs} style={{padding: "20px"}} /> 
                </CCardBody>
              </CCard>
              
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
};

export default Login;
