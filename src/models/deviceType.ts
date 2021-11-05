import { Table, Column, Model, DataType, PrimaryKey } from "sequelize-typescript";

@Table
export default class DeviceType extends Model<DeviceType> {
    @PrimaryKey
    @Column(DataType.INTEGER)
    ID: number;

    @Column(DataType.STRING)
    name: string;

    @Column(DataType.STRING)
    type: string;
}
