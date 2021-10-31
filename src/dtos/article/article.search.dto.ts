import * as Validator from 'class-validator'
import { ArticleSearchFeatureComponentDto } from './article.search.feature.component';
export class ArticleSearchDto
{
    
    @Validator.IsNotEmpty()
    @Validator.IsPositive()
    categoryId:number;
    
    @Validator.IsOptional()
    @Validator.IsString()    
    keywords: string;

    @Validator.IsOptional()
    @Validator.IsNumber({allowInfinity:false,allowNaN:false,maxDecimalPlaces:2})
    @Validator.IsPositive()
    priceMin:number;
    @Validator.IsOptional()
    @Validator.IsNumber({allowInfinity:false,allowNaN:false,maxDecimalPlaces:2})
    @Validator.IsPositive()
    priceMax:number;

    features:ArticleSearchFeatureComponentDto[];

    @Validator.IsOptional()   
    @Validator.IsIn(['name','price'])
    orderBy: 'name' | 'price';

    @Validator.IsOptional()   
    @Validator.IsIn(['ASC','DESC'])
    orderDirection: 'ASC' | 'DESC';

    @Validator.IsOptional()   
    @Validator.IsNumber({allowInfinity:false,allowNaN:false,maxDecimalPlaces:0})
    page: number;

    @Validator.IsOptional()
    @Validator.IsIn([5,10,20,40])
    itemsPerPage: 5 | 10 | 20 | 40;
}