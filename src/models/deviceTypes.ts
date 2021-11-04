import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table
export default class DeviceTypes extends Model<DeviceTypes> {
    @Column(DataType.INTEGER)
    ID: number;

    @Column(DataType.STRING)
    name: string;

    @Column(DataType.STRING)
    type: string;
}
