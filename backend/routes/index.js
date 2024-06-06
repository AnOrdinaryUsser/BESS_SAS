/**
 * @file Routes or endpoints
 */
import express from "express";
import { getUsers, Register, Login, Logout, modifyUser, deleteUser } from "../controllers/Users.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { refreshToken } from "../controllers/RefreshToken.js";
import { recoverPassword, resetPassword } from "../controllers/Mail.js";
import { addRoadWithMiddleware, getAllImages, deleteImage } from "../controllers/imgRoads.js";
import { addDevice, deleteDevice, getDevices, getDevice, modifyDevice } from "../controllers/Devices.js";
//import { processVideo } from "../controllers/videoRoads.js";
import bodyParser from "body-parser";
 
const router = express.Router();

router.use(bodyParser.json({ limit: '5000mb' }));
router.use(bodyParser.urlencoded({ extended: true, limit: '5000mb' }));

// User DB
router.get('/users', verifyToken, getUsers);
router.post('/modifyUser', modifyUser);
router.post('/users', Register);
router.post('/deleteUser', deleteUser);
router.post('/login', Login);
router.get('/token', refreshToken);
router.delete('/logout', Logout);

// Mail
router.post('/recoverPassword', recoverPassword)
router.post('/resetPassword', resetPassword)

// Device
router.get('/devices', getDevices);
router.post('/getDevice', getDevice);
router.post('/deleteDevice', deleteDevice);
router.post('/addDevice', addDevice);
router.post('/modifyDevice',modifyDevice);


// Roads
router.post('/uploadImage', addRoadWithMiddleware);
router.get('/getAllImages/:userName', getAllImages);
router.delete('/deleteImage/:userName/:imageName', deleteImage);



// Video Roads
//router.post('/uploadVideo', processVideo);

export default router;