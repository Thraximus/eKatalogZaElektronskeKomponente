import * as Validator from 'class-validator';
export class LoginAdministratorDto
{
    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Matches(/^[A-Za-z][A-Za-z0-9\.]{3,30}[A-Za-z0-9]$/)
    username: string;

    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(6,128)
    password: string;
}