import * as Validator from 'class-validator';
export class EditAdministratorDto
{
    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(1,50)
    password: string;
}