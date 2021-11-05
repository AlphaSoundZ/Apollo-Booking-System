import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    ForeignKey,
    BelongsTo,
} from "sequelize-typescript";
import DeviceType from "./deviceType";

@Table
export default class Device extends Model<Device> {
    @PrimaryKey
    @Column(DataType.INTEGER)
    ID: number;

    @ForeignKey(() => DeviceType)
    @Column
    typeId: number;

    @Column(DataType.BOOLEAN)
    deactivated: boolean;

    @BelongsTo(() => DeviceType)
    type: DeviceType;
}
