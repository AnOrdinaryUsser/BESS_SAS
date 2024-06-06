// ImgRoadsController.js

import RoadImage from "../models/ImgRoadsModel.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Controlador sin middleware para utilizar en el enrutador
export const addRoad = async (req, res) => {
  try {
    const { userName, name } = req.body;

    console.log("USUARIO: ", userName);
    console.log("IMAGEN: ", req.file);  // req.file ahora contendrá la información del archivo
    console.log("NOMBRE: ", name);

    await RoadImage.create({
      userName: userName,
      image: req.file.buffer,  // Utiliza el buffer del archivo
      name: name,
    });

    res.json({ msg: 'Image uploaded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Internal Server Error' });
  }
};

// Middleware para utilizar con el enrutador
export const addRoadWithMiddleware = (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ msg: 'Error handling file upload' });
    }

    // Llamada a la función del controlador después de pasar por el middleware
    addRoad(req, res);
  });
};

export const getAllImages = async (req, res) => {
  try {
    const userName = req.params.userName;
    console.log(userName);
    const images = await RoadImage.findAll({
            where:{
                userName: userName
            }
        });
    console.log(images);
    res.json(images);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Internal Server Error' });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const userName = req.params.userName;
    const imageName = req.params.imageName;

    // Buscar y eliminar la imagen por nombre de usuario e nombre de imagen
    const deletedImage = await RoadImage.destroy({
      where: {
        userName: userName,
        name: imageName,
      },
    });

    if (deletedImage) {
      res.json({ msg: 'Image deleted successfully' });
    } else {
      res.status(404).json({ msg: 'Image not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Internal Server Error' });
  }
};