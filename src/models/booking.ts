import { Table, Column, Model, DataType, CreatedAt, UpdatedAt } from "sequelize-typescript";

@Table
export default class Booking extends Model<Booking> {
    @Column(DataType.INTEGER)
    ID: number;

    @Column(DataType.INTEGER)
    user: number;

    @Column(DataType.INTEGER)
    device: number;

    @Column
    @CreatedAt
    bookedAt!: Date;

    @Column
    @UpdatedAt
    updatedAt!: Date;
}
