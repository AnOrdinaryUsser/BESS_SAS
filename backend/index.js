import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import bcrypt from "bcrypt";
import db from "./config/AuthDB.js";
import router from "./routes/index.js";
import Users from "./models/UserModel.js";
import Devices from "./models/DevicesModel.js";
import DataDevices from './models/DataDevices.js';
import { Sequelize } from "sequelize";

dotenv.config();

const app = express();
const { DataTypes } = Sequelize;
const DB_PASSWORD = process.env.DB_PASSWORD;
const IP_SERVER = process.env.IP_SERVER;
const PORT_FRONTEND = process.env.PORT_FRONTEND;

app.use(cors({ credentials: true, origin: `http://${IP_SERVER}:${PORT_FRONTEND}` }));
app.use(cookieParser());
app.use(express.json());
app.use(router);
app.use('/public', express.static('public'));

app.listen(9000, async () => {
  console.log('Server running at port 9000');

  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hash(DB_PASSWORD, salt);

  try {
    await db.sync();

    const user = await Users.findByPk(1);

    if (!user) {
      await Users.create({
        name: 'admin',
        email: "aereal-vision-not-reply@hotmail.com",
        password: hashPassword,
        role: "admin"
      });
    }

    DataDevices.forEach(async (item) => {
      // Verifica si el dispositivo ya existe (puedes ajustar esta lógica según tus necesidades)
      const device = await Devices.findOne({ where: { serialNumber: item.serialNumber } });
      
      // Si el dispositivo no existe, créalo
      if (!device) {
        await Devices.create(item);
      }
    });

  } catch (err) {
    console.error(err);
  }
});
