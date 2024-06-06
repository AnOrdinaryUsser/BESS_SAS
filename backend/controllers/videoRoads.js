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

    const response = await axios.post('https://detect.roboflow.com/crddc22_china_spain_uav/2', image, {
      params: {
        api_key: 'wJZutlXpplqTvia14fsi',
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



  