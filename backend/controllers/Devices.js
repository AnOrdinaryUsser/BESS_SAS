/**
 * @file Controller to handle frontend devices requests
 */
import Devices from "../models/DevicesModel.js";


/**
 * Module to get all devices
 * @module getDevices
 */
export const getDevices = async(req, res) => {
    try {
        const devices = await Devices.findAll({
            attributes:['serialNumber','location','registered','status']
        });
        res.json(devices);
    } catch (error) {
        console.log(error);
    }
}

/**
 * Module to get a device
 * @module getDevice
 */
export const getDevice = async(req, res) => {
    const { serialNumber } = req.body;
    try {
        const device = await Devices.findOne({ where: { serialNumber: serialNumber } });
        res.json(device);
    } catch (error) {
        console.log(error);
    }
}
 
/**
 * Module to add a device
 * @module addDevice
 */
export const addDevice = async(req, res) => {
    const { serialNumber , location , registered , status } = req.body;
    try {

        await Devices.create({
            serialNumber: serialNumber,
            location: location,
            registered: registered,
            status: status,
        });
        res.json({msg: "Device Created"});
    } catch (error) {
        console.log(error);
    }
}

/**
 * Module to modify a device
 * @module modifyDevice
 */
export const modifyDevice = async(req, res) => {
    const { serialNumber , location , registered , status } = req.body;
    try {
        const device = await Devices.findOne({
            where: {
                serialNumber: serialNumber,
            }
        });

        if (!device) {
            return res.status(404).json({ msg: "Device not found" });
        }

        console.log("Device found:", device);
        console.log("Updating with:", req.body);

        await Devices.update({
            location: location,
            registered: registered,
            status: status,
        }, {
            where: { serialNumber: serialNumber }
        });          
        res.json({msg: "Device modified"});
    } catch (error) {
        console.log(error);
    }
}

/**
 * Module to delete a device
 * @module deleteDevice
 */
export const deleteDevice = async(req, res) => {
    const { serialNumber } = req.body;
    try {
        await Devices.destroy({
            where: { serialNumber: serialNumber },
        });
        res.json({msg: "Device Destroyed"});
    } catch (error) {
        console.log(error);
    }
}

/**
 * Module to upload an image
 * @module uploadImg
 */
export const uploadImg = async(req, res) => {
    try {
        res.json({msg: "ImageUpload"});
    } catch (error) {
        return res.status(201).json({ url: "http://192.168.1.128:9000/image/" + serialNumber });
    }
}

