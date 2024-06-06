// UserImageModel.js
import { Sequelize } from "sequelize";
import db from "../config/AuthDB.js";

const { DataTypes } = Sequelize;

const RoadImage = db.define('user_images', {
  userName:{
    type: DataTypes.STRING
  },
  image: {
    type: DataTypes.BLOB('long'),
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
  },
}, {
  freezeTableName: true
});

(async () => {
  await db.sync();
})();

export default RoadImage;
