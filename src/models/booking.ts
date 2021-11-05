import {
    Table,
    Column,
    Model,
    DataType,
    CreatedAt,
    BelongsTo,
    PrimaryKey,
    ForeignKey,
} from "sequelize-typescript";
import Device from "./device";
import User from "./user";

@Table
export default class Booking extends Model<Booking> {
    @PrimaryKey
    @Column(DataType.INTEGER)
    ID: number;

    @ForeignKey(() => User)
    @Column
    userId: number;

    @ForeignKey(() => Device)
    @Column
    deviceId: number;

    @Column
    @CreatedAt
    bookedAt!: Date;

    @Column(DataType.DATE)
    returnedAt: Date;

    @BelongsTo(() => User)
    user: User;

    @BelongsTo(() => Device)
    device: Device;
}
