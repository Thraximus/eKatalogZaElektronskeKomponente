import * as Validator from 'class-validator';

export class AddCategoryPhotoDto
{
    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(5,255)
    imagePath:string;
}