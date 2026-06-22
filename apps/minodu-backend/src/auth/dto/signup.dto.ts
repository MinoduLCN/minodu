import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumberString, IsPhoneNumber, IsString } from "class-validator";

export class SignUpDto {
  @ApiProperty({ type: String, name: 'fullName', description: "User names" })
  @IsString()
  @IsNotEmpty()
  fullName: string;
  
  @ApiProperty({ type: String, name: 'phone', description: "User phone" })
  @IsNotEmpty()
  @IsNumberString()
  phone: string;

  @ApiProperty({ type: String, name: 'gender', description: "User gender" })
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiProperty({ type: String, name: 'password', description: "User password" })
  @IsString()
  @IsNotEmpty()
  password: string;
}
