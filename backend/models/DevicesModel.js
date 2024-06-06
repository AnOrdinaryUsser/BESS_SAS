/**
 * @file Data model for users
 */
import { Sequelize } from "sequelize";
import db from "../config/AuthDB.js";
 
const { DataTypes } = Sequelize;
 
const Users = db.define('devices',{
    serialNumber:{
        type: DataTypes.STRING,
        unique: true
    },
    location:{
        type: DataTypes.STRING
    },
    registered:{
        type: DataTypes.STRING
    },
    status:{
        type: DataTypes.STRING
    },
    container1:{
        type: DataTypes.FLOAT
    },
    container2:{
        type: DataTypes.FLOAT
    },
    container3:{
        type: DataTypes.FLOAT
    },
    container4:{
        type: DataTypes.FLOAT
    },
},{
    freezeTableName:true
});
 
(async () => {
    await db.sync();
})();
 
export default Users;