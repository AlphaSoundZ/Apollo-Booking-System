import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table
export default class DeviceType extends Model<DeviceType> {
    @Column(DataType.INTEGER)
    ID: number;

    @Column(DataType.STRING)
    name: string;

    @Column(DataType.STRING)
    type: string;
}
