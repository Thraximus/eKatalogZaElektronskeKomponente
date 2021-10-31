import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import * as Validator from 'class-validator';

@Index("username", ["username"], { unique: true })
@Entity("administrator", { schema: "ekatalogzaelektronskeuredjaje" })
export class Administrator {
  @PrimaryGeneratedColumn({
    type: "int",
    name: "administrator_id",
    unsigned: true,
  })
  administratorId: number;

  @Column("varchar", { name: "username", unique: true, length: 32 })
  @Validator.IsNotEmpty()
  @Validator.IsString()
  @Validator.Matches(/^[A-Za-z][A-Za-z0-9\.]{3,30}[A-Za-z0-9]$/)
  username: string;

  @Column("varchar", { name: "password_hash", length: 255 })
  @Validator.IsNotEmpty()
  @Validator.IsHash('sha512')
  passwordHash: string;
}