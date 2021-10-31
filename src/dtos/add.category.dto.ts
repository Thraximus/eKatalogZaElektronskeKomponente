import * as Validator from 'class-validator';

export class AddCategoryDto
{
    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(5,255)
    name:string;

    @Validator.IsOptional()
    @Validator.IsNotEmpty()
    @Validator.IsNumber()
    @Validator.IsPositive()
    parentCategoryId:number;

}