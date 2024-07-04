import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import axios from 'axios';
import { createCanvas, loadImage } from 'canvas';
import CameraImage from "../models/ImgModel.js";
import Devices from "../models/DevicesModel.js";
import NodeWebcam from 'node-webcam';
import { SerialPort } from 'serialport'; 
import dotenv from "dotenv";
dotenv.config();

const IP_SERVER = process.env.IP_SERVER;
const PORT_BACKEND = process.env.PORT_BACKEND;
const PORT_FRONTEND = process.env.PORT_FRONTEND;
const PORT_PROXY = process.env.PORT_PROXY;

const arduinoPort = new SerialPort({
  path: 'COM8',
  baudRate: 115200,
})

arduinoPort.on('open', () => {
  console.log('Serial Port Opened');
});

const opts = {
  width: 225,
  height: 225,
  quality: 25,
  delay: 0,
  saveShots: true,
  output: "jpeg",
  device: false,
  callbackReturn: "buffer",
  verbose: false
};

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

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};


app.listen(PORT_PROXY, IP_SERVER, () => {
  console.log(`Servidor escuchando en http://${IP_SERVER}:${PORT_PROXY}`);
});


// Aumentar el límite de tamaño de carga
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.post('/captureImage', async (req, res) => {
  try {
    
    // Enviar '1' al Arduino a través de comunicación serial
    arduinoPort.write('1', async (err) => {
      if (err) {
        console.error('Error writing to Arduino:', err);
        return res.status(500).json({ error: 'Error writing to Arduino' });
      }
    });
    await sleep(5000);
    arduinoPort.write('2', async (err) => {
      if (err) {
        console.error('Error writing to Arduino:', err);
        return res.status(500).json({ error: 'Error writing to Arduino' });
      }
    });

    await sleep(1000);

    arduinoPort.write("nc", async (err) => {
      if (err) {    
        console.error('Error writing to Arduino:', err);
        return res.status(500).json({ error: 'Error writing to Arduino' });
      }
    });

    await sleep(2000);

  } catch (error) {
    console.error('Error sending data to Arduino:', error);
    res.status(500).json({ error: 'Error sending data to Arduino' });
  }

  try {
    // Capturar la imagen utilizando node-webcam
    NodeWebcam.capture("test_picture", opts, async (err, data) => {
      if (err) {
        console.error('Error capturing image:', err);
        return res.status(500).json({ error: 'Error capturing image' });
      }

      try {
        const imageBase64 = Buffer.from(data).toString('base64');

        const formData = new URLSearchParams();
        formData.append("image", imageBase64);

        const response = await axios.post('https://detect.roboflow.com/trash-s8fg7/3', imageBase64, {
          params: {
            api_key: "wJZutlXpplqTvia14fsi",
            confidence: 0.3
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });

        const newImageBase64 = await drawBoundingBoxes64(imageBase64, response.data);

        const newImageBuffer = base64ToBuffer(newImageBase64);
    
        var clase;

        if (response.data.predictions.length > 1) {
          const sortedPredictions = response.data.predictions.sort((a, b) => b.confidence - a.confidence);
          clase = sortedPredictions[0].class;
          console.log("Class with highest confidence:", clase);
        } else if (response.data.predictions.length === 1) {
          console.log("Single Class:", response.data.predictions[0].class);
          clase = response.data.predictions[0].class;
        } else {
          console.log("No predictions available.");
        } 
    
        await CameraImage.create({
          serialNumber: "C91G9-2CJ77-YP8NW",
          image: newImageBuffer,  
          class: clase,
        });

        let cont1 = 0, cont2 = 0, cont3 = 0, cont4 = 0;

        if (clase == "can" || clase == "metal" || clase == "plastic"){
          cont2 += 5;
          arduinoPort.write('n1', async (err) => {
            if (err) {
              console.error('Error writing to Arduino:', err);
              return res.status(500).json({ error: 'Error writing to Arduino' });
            }
          });
        } else if (clase == "glass") {
          cont4 += 5;
          arduinoPort.write('n2', async (err) => {
            if (err) {
              console.error('Error writing to Arduino:', err);
              return res.status(500).json({ error: 'Error writing to Arduino' });
            }
          });
        } else if (clase == "paper") {
          cont3 += 5;
          arduinoPort.write('n4', async (err) => {
            if (err) {
              console.error('Error writing to Arduino:', err);
              return res.status(500).json({ error: 'Error writing to Arduino' });
            }
          });
        } else if (clase == "egg shell"){
          cont1 += 5;
          arduinoPort.write('n3', async (err) => {
            if (err) {
              console.error('Error writing to Arduino:', err);
              return res.status(500).json({ error: 'Error writing to Arduino' });
            }
          });
        } else {
          arduinoPort.write('n0', async (err) => {
            if (err) {
              console.error('Error writing to Arduino:', err);
              return res.status(500).json({ error: 'Error writing to Arduino' });
            }
          });
        }
  
        await sleep(10000);

        arduinoPort.write('c', async (err) => {
          if (err) {
            console.error('Error writing to Arduino:', err);
            return res.status(500).json({ error: 'Error writing to Arduino' });
          }
        });
  
        await sleep(2000);
  
        arduinoPort.write('o', async (err) => {
          if (err) {
            console.error('Error writing to Arduino:', err);
            return res.status(500).json({ error: 'Error writing to Arduino' });
          }
        });
  
        await sleep(2000);
        
        arduinoPort.write('n1', async (err) => {
          if (err) {
            console.error('Error writing to Arduino:', err);
            return res.status(500).json({ error: 'Error writing to Arduino' });
          }
        });

        const device = await Devices.findOne({ where: { serialNumber: "C91G9-2CJ77-YP8NW" } });

        if (!device) {
            return res.status(404).json({ error: 'Device not found' });
        }

        await Devices.update({
            container1: device.container1 + cont1,
            container2: device.container2 + cont2,
            container3: device.container3 + cont3,
            container4: device.container4 + cont4,
        }, {
            where: { serialNumber: "C91G9-2CJ77-YP8NW" }
        });
        
        res.status(200).json({
          image: response.data.image,
          predictions: response.data.predictions,
          originalImageBase64: imageBase64,
          newImageBase64: newImageBase64, // Include the new Base64 image in the response
        });
      } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).json({ error: 'Error processing image' });
      }
    });
  } catch (error) {
    console.error('Error capturing image:', error);
    res.status(500).json({ error: 'Error capturing image' });
  }

});

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
      if (imageData.predictions.length > 0) {
        // Encontrar la predicción con la mayor confianza
        const highestConfidencePrediction = imageData.predictions.reduce((prev, current) => {
            return (prev.confidence > current.confidence) ? prev : current;
        });
    
        console.log(highestConfidencePrediction);
        const { x, y, width, height, class: predictionClass } = highestConfidencePrediction;
    
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
    } else {
        console.log("No predictions available.");
    }

      const base64Image = canvas.toDataURL("image/jpeg").split(",")[1];
      resolve(base64Image);
    } catch (error) {
      reject(error);
    }
  });
};

const generateUniqueName = () => {
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().replace(/[-:.]/g, '').replace('T', '_').split('.')[0];
  return `image_${formattedDate}`;
};
