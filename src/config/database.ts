import { Sequelize } from "sequelize-typescript";
import * as log4js from "log4js";
const logger = log4js.getLogger("database");

// Models
import User from "../models/user";
import DeviceType from "../models/deviceType";
import Device from "../models/device";
import Booking from "../models/booking";

const sequelize = new Sequelize(process.env.DATABASE);

sequelize.addModels([User, DeviceType, Device, Booking]);

export default sequelize;
