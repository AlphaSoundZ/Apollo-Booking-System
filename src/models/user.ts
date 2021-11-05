import {
    Table,
    Column,
    Model,
    DataType,
    CreatedAt,
    UpdatedAt,
    PrimaryKey,
} from "sequelize-typescript";

@Table
export default class User extends Model<User> {
    @PrimaryKey
    @Column(DataType.INTEGER)
    ID: number;

    @Column(DataType.STRING)
    name: string;

    @Column
    @CreatedAt
    createdAt!: Date;

    @Column
    @UpdatedAt
    updatedAt!: Date;
}
