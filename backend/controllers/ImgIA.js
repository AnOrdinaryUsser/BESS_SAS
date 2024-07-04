// ImgRoadsController.js

import CameraImage from "../models/ImgModel.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Controlador sin middleware para utilizar en el enrutador
export const addImage = async (req, res) => {
  try {
    const { serialNumber, name } = req.body;

    console.log("USUARIO: ", serialNumber);
    console.log("IMAGEN: ", req.file);  // req.file ahora contendrá la información del archivo
    console.log("NOMBRE: ", name);

    await CameraImage.create({
      serialNumber: "serialNumber",
      image: req.file.buffer,  // Utiliza el buffer del archivo
      name: "name",
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
    addImage(req, res);
    
  });
};

export const drawBoundingBoxes64 = (originalImageBase64, imageData) => {
  return new Promise((resolve, reject) => {
    const originalImage = new Image();
    originalImage.src = `data:image/jpeg;base64,${originalImageBase64}`;

    originalImage.addEventListener("load", () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = originalImage.width;
      canvas.height = originalImage.height;

      ctx.drawImage(originalImage, 0, 0);

      const classColors = {
        D00: "rgba(255, 0, 0, 0.7)", // Red
        D10: "rgba(0, 255, 0, 0.7)", // Green
        D20: "rgba(0, 0, 255, 0.7)", // Blue
        D30: "rgba(255, 255, 0, 0.7)", // Yellow
        D40: "rgba(255, 0, 255, 0.7)" // Purple
      };

      // Draw predictions
      imageData.predictions.forEach((prediction) => {
        const { x, y, width, height, class: predictionClass } = prediction;

        const x1 = x - width / 2;
        const y1 = y - height / 2;
        const x2 = x + width / 2;
        const y2 = y + height / 2;

        ctx.strokeStyle = classColors[predictionClass] || "rgba(0, 0, 0, 0.7)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.rect(x1, y1, width, height);
        ctx.stroke();

        ctx.fillStyle = classColors[predictionClass] || "rgba(0, 0, 0, 0.7)";
        if (width < 60) {
          ctx.fillRect(x1, y1, 33, -20);
        } else {
          ctx.fillRect(x1, y1, 33, -20);
        }

        ctx.font = "12px Arial";
        ctx.fillStyle = "white";
        ctx.fillText(predictionClass, x1 + 5, y1 - 5);
      });

      const base64Image = canvas.toDataURL("image/jpeg");
      resolve(base64Image);
    });
      originalImage.addEventListener("error", (error) => {
      reject(error);
    });
  });
};

export const getAllImages = async (req, res) => {
  try {
    const serialNumber = req.params.serialNumber;
    console.log(serialNumber);
    const images = await CameraImage.findAll({
            where:{
                serialNumber: serialNumber
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
    const serialNumber = req.params.serialNumber;
    const imageName = req.params.imageName;

    // Buscar y eliminar la imagen por nombre de usuario e nombre de imagen
    const deletedImage = await CameraImage.destroy({
      where: {
        serialNumber: serialNumber,
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