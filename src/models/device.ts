import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table
export default class Device extends Model<Device> {
    @Column(DataType.INTEGER)
    ID: number;

    @Column(DataType.INTEGER)
    type: number;
}
