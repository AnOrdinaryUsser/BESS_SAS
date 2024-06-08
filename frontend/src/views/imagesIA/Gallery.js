import React, { useEffect, useState, createRef } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import {
  CButton,
  CCol,
  CRow,
  CContainer,
  CCard,
  CCardBody,
} from "@coreui/react";
import {
  getDevices,
  getDevice,
} from "../../services/DevicesService";
import { refreshToken } from "../../services/UsersService";
import CIcon from "@coreui/icons-react";
import { cilTrash, cilVerticalAlignBottom } from "@coreui/icons";
import { getAllImages } from "../../services/ImgService.js";
import { useNavigate } from 'react-router-dom';

const IP_SERVER = process.env.REACT_APP_IP_SERVER;
const PORT_BACKEND = process.env.REACT_APP_PORT_BACKEND;

/**
 * @description View for Device Chart
 * In this view you can see a gallery of analyzed photos
 */
const Gallery = () => {

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
  const [images, setImages] = useState([]);

  useEffect(() => {
    refreshToken(setToken, setExpire, setName, setEmail);
    getDevices(setDeviceList);
    const fetchData = async () => {
        try {
          console.log(name);
          const imagesData = await getAllImages("C91G9-2CJ77-YP8NW");
          console.log("IMÁGENES RECUPERADAS: ", imagesData);

          const updatedImages = imagesData.map((image) => {
          const storedArrayBuffer = Uint8Array.from(image.image.data).buffer;
      
            console.log(storedArrayBuffer);
      
            return {
              ...image,
              buffer: storedArrayBuffer,
            };
          });

          setImages(updatedImages);
        } catch (error) {
          console.error(error.message);
        }
      };
  
      fetchData();
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
            <CRow
              className="mb-4"
              xs={{ cols: 1 }}
              sm={{ cols: 2 }}
              md={{ cols: 2 }}
              xl={{ cols: 4 }}
            >
              {images.map((image, index) => {
                return (
                  <CCol key={index} className="mb-4">
                    <CCard className="text-center" style={{ width: "14rem" }}>
                      <CCardBody>
                      <img
                            src={URL.createObjectURL(new Blob([image.buffer], { type: 'image/jpg' }))}
                            alt={image.class}
                            style={{ maxWidth: '100%', maxHeight: '200px' }}
                        />
                        <p>Tipo: {image.class}</p>
                        <CButton
                          color="secondary"
                          style={{
                            marginTop: "15px",
                          }}
                        >
                          <CIcon size="xs" icon={cilVerticalAlignBottom} />{" "}
                        </CButton>
                        <CButton
                          style={{
                            backgroundColor: "#e8463a",
                            borderColor: "#e8463a",
                            marginTop: "15px",
                            marginLeft: "5px",
                          }}
                        >
                          <CIcon size="xs" icon={cilTrash} />{" "}
                        </CButton>
                      </CCardBody>
                    </CCard>
                  </CCol>
                );
              })}
            </CRow>
          </CContainer>
    </>
  );
};

export default Gallery;