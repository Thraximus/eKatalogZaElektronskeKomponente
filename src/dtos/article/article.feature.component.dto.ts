import * as Validator from 'class-validator';
export class ArtickleFeatureComponentDto
{
    featureId:number;
    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(6,128)
    value: string;
}