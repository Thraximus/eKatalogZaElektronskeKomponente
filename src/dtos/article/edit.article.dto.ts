import * as Validator from 'class-validator';
import { ArtickleFeatureComponentDto } from './article.feature.component.dto';

export class EditArticleDto
{
    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(5,50)
    name:string;
    categoryId: number;

    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(10,255)
    excerpt: string;

    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(50,10240)
    description: string;

    @Validator.IsNotEmpty()
    @Validator.IsNumber({allowInfinity:false,allowNaN:false,maxDecimalPlaces:2})
    @Validator.IsPositive()
    price:number;
    
    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(1,100)
    manufacturer:string;

    @Validator.IsOptional()
    @Validator.IsArray()
    @Validator.ValidateNested({always:true})
    features: ArtickleFeatureComponentDto[] | null;
}