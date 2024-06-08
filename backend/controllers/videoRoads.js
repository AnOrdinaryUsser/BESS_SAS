import express from 'express';
import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';
import cors from 'cors';
import bodyParser from 'body-parser';
import axios from 'axios';
import fsExtra from 'fs-extra';
import { createCanvas, loadImage } from 'canvas';
import CameraImage from "../models/ImgModel.js";

import dotenv from "dotenv";
dotenv.config();

const IP_SERVER = process.env.IP_SERVER;
const PORT_BACKEND = process.env.PORT_BACKEND;
const PORT_FRONTEND = process.env.PORT_FRONTEND;
const PORT_PROXY = process.env.PORT_PROXY;



const app = express();

const port = 3000;
console.log('IP_SERVER:', process.env.IP_SERVER);
console.log('PORT_PROXY:', process.env.PORT_PROXY);

app.use(cors({
  origin: `http://${IP_SERVER}:${PORT_FRONTEND}`,
  credentials: true,
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configura Multer para manejar el cuerpo de la solicitud y almacenar el video en 'tmp'
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });





app.post('/processVideo', upload.single('video'), async (req, res) => {
  try {
    // Asegúrate de que el archivo sea del tipo 'video/mp4'
    if (!req.file || req.file.mimetype !== 'video/mp4') {
      res.status(400).send('Formato de video no válido');
      return;
    }

    // Guarda el buffer en un archivo temporal
    const videoPath = resolve(__dirname,'input.mp4');
    fs.writeFileSync(videoPath, req.file.buffer);

	const count = req.body.intValue;
	console.log(count);

    // Crea un flujo de lectura para pasar el contenido del video a ffmpeg
    const videoStream = fs.createReadStream(videoPath);

    ffmpeg(videoPath)
      .on('end', function () {
        console.log('Extracción de fotogramas completa');
        res.status(200).send('Proceso completado correctamente');
      })
      .on('error', function (err) {
        console.error('Error al extraer fotogramas: ' + err);
        res.status(500).send('Error en el servidor');
      })
      .screenshots({
		    count: count,
        folder: resolve(__dirname, 'tmp'),
        filename: 'frame.png',
        size: '626x456',
      });
  } catch (e) {
    console.error('Error general: ' + e.message);
    res.status(500).send('Error en el servidor');
  }
});

app.get('/getImagesFromVideo', (req, res) => {
	try {
	  const screenshotsPath = resolve(__dirname, 'tmp');
  
	  // Verifica si la carpeta 'screenshots' existe
	  if (!fs.existsSync(screenshotsPath)) {
		res.status(404).send('No hay imágenes disponibles');
		return;
	  }
  
	  const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp']; // Agrega las extensiones que deseas permitir
	  const images = fs.readdirSync(screenshotsPath);
  
	  // Filtra solo los archivos con extensiones permitidas
	  const filteredImages = images.filter((image) =>
		allowedExtensions.some((extension) => image.toLowerCase().endsWith(extension))
	  );
  
	  const imageBlobs = filteredImages.map((image) => {
		const imagePath = resolve(screenshotsPath, image);
		const blob = fs.readFileSync(imagePath);
		return { name: image, blob: Buffer.from(blob).toString('base64') };
	  });
  
	  // Envía las imágenes como respuesta
	  res.json({ images: imageBlobs });
    // Elimina la carpeta temporal después de enviar las imágenes
    fsExtra.removeSync(screenshotsPath);
	} catch (error) {
	  console.error('Error al obtener las imágenes:', error);
	  res.status(500).send('Error en el servidor');
	}
  });

  app.listen(PORT_PROXY, IP_SERVER, () => {
    console.log(`Servidor escuchando en http://${IP_SERVER}:${PORT_PROXY}`);
  });


// Aumentar el límite de tamaño de carga
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.post('/proxy', async (req, res) => {
  try {
    const image = req.body.image; // asumiendo que req.body.image contiene la imagen en base64

    const response = await axios.post('https://detect.roboflow.com/trash-detection-swacn/5', image, {
      params: {
        api_key: "wJZutlXpplqTvia14fsi"
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    //res.status(response.status).json(response.data);
    console.log(response.data)
    res.status(200).json({
      image: response.data.image,
      predictions: response.data.predictions,
      originalImageBase64: image,
    });

  } catch (error) {
    console.error('Error in Roboflow request:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const loadImageBase64 = (buffer) => {
  return buffer.toString('base64');
};

app.post('/test', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;

    // Convert the image buffer to a Base64 string
    const imageBase64 = loadImageBase64(file.buffer);

    // Log the base64 string for debugging
    console.log("Base64 Image String:", imageBase64);

    // Create form data for the request
    const formData = new URLSearchParams();
    formData.append('image', imageBase64);

    // Send the form data to the Roboflow API
    const response = await axios.post('https://detect.roboflow.com/trash-s8fg7/3', imageBase64, {
      params: {
        api_key: "wJZutlXpplqTvia14fsi"
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const newImageBase64 = await drawBoundingBoxes64(imageBase64, response.data);
    console.log("New Base64 Image String with Bounding Boxes:", newImageBase64); // Log the new Base64 string

    // Convert the original and new Base64 images to buffers
    const originalImageBuffer = base64ToBuffer(imageBase64);
    const newImageBuffer = base64ToBuffer(newImageBase64);

    var clase;

    // Llamar a la función para obtener la clase
    if (response.data.predictions.length > 1) {
      clase = response.data.predictions.map(prediction => prediction.class).join(', ');
    } else if (response.data.predictions.length === 1) {
      console.log("Single Class:", response.data.predictions[0].class);
      clase = response.data.predictions[0].class;
    } else {
      console.log("No predictions available.");
    } 

    // Save both images in the database
    await CameraImage.create({
      serialNumber: "C91G9-2CJ77-YP8NW",
      image: newImageBuffer,  // Save the new image buffer with bounding boxes
      class: clase,
    });

    res.status(200).json({
      image: response.data.image,
      predictions: response.data.predictions,
      originalImageBase64: imageBase64,
      newImageBase64: newImageBase64, // Include the new Base64 image in the response
    });
    

  } catch (error) {
    console.error('Error in Roboflow request:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const generateClassName = async (className) => {
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().replace(/[-:.]/g, '').replace('T', '_').split('.')[0];
  return `image_${formattedDate}`;
};

async function getClassFromResponse(responseData) {
  try {
    // Acceder a response.data.predictions.class y devolverlo
    return responseData.predictions.class;
  } catch (error) {
    // Manejar errores si es necesario
    console.error('Error getting class from response:', error);
    return null; // Devolver null en caso de error
  }
}


const base64ToBuffer = (base64) => {
  return Buffer.from(base64, 'base64');
};

const drawBoundingBoxes64 = async (originalImageBase64, imageData) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(imageData);
      const originalImage = await loadImage(`data:image/jpeg;base64,${originalImageBase64}`);
      const canvas = createCanvas(originalImage.width, originalImage.height);
      const ctx = canvas.getContext('2d');

      ctx.drawImage(originalImage, 0, 0);

      const classColors = {
        metal: "rgba(255, 0, 0, 0.7)", // Red
        paper: "rgba(0, 255, 0, 0.7)", // Green
        plastic: "rgba(0, 0, 255, 0.7)", // Blue
        D30: "rgba(255, 255, 0, 0.7)", // Yellow
        D40: "rgba(255, 0, 255, 0.7)" // Purple
      };

      // Draw predictions
      imageData.predictions.forEach((prediction) => {
        const { x, y, width, height, class: predictionClass } = prediction;

        const x1 = x - width / 2;
        const y1 = y - height / 2;

        ctx.strokeStyle = classColors[predictionClass] || "rgba(0, 0, 0, 0.7)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.rect(x1, y1, width, height);
        ctx.stroke();

        ctx.fillStyle = classColors[predictionClass] || "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(x1, y1 - 20, 33, 20); // Ajuste para que la etiqueta esté siempre encima del cuadro

        ctx.font = "12px Arial";
        ctx.fillStyle = "white";
        ctx.fillText(predictionClass, x1 + 5, y1 - 5);
      });

      const base64Image = canvas.toDataURL("image/jpeg").split(",")[1];
      resolve(base64Image);
    } catch (error) {
      reject(error);
    }
  });
};