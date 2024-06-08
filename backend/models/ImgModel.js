// ImgModel.js
import { Sequelize } from "sequelize";
import db from "../config/AuthDB.js";

const { DataTypes } = Sequelize;

const RoadImage = db.define('IA_images', {
  serialNumber:{
    type: DataTypes.STRING
  },
  image: {
    type: DataTypes.BLOB('long'),
    allowNull: false,
  },
  class: {
    type: DataTypes.STRING,
  },
}, {
  freezeTableName: true
});

(async () => {
  await db.sync();
})();

export default RoadImage;
