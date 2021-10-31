import { Injectable } from "@nestjs/common";
import {TypeOrmCrudService} from "@nestjsx/crud-typeorm"
import { Category } from "src/entities/category.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { AddCategoryDto } from "src/dtos/add.category.dto";
import { ApiResponse } from "src/misc/api.response.class";
import { AddCategoryPhotoDto } from "src/dtos/add.category.photo.dto";
import { Article } from "src/entities/article.entity";
import { Feature } from "src/entities/feature.entity";

@Injectable()
export class CategoryService extends TypeOrmCrudService<Category>
{
    constructor(@InjectRepository(Article) private readonly article: Repository<Article>,
                 @InjectRepository(Category) private readonly category: Repository<Category>,
                 @InjectRepository(Feature) private readonly feature: Repository<Feature>)
    {super(category);}

    async createCompleteCategory(data: AddCategoryDto): Promise<Category|ApiResponse>
    {
        let newCategory: Category = new Category();
        newCategory.name = data.name;
        newCategory.parentCategoryId=data.parentCategoryId;
        let savedCategory = await this.category.save(newCategory);

        return await this.category.findOne(savedCategory.categoryId,
        {
            relations:
            [
                "categories",
            ]
        })

    }

    async editCompleteCategory(id:number, data: AddCategoryDto): Promise<Category|ApiResponse>
    {
        let newCategory: Category = await this.category.findOne(id);
        newCategory.name = data.name;
        newCategory.parentCategoryId=data.parentCategoryId;
        let savedCategory = await this.category.save(newCategory);

        return await this.category.findOne(savedCategory.categoryId,
        {
            relations:
            [
                "categories",
            ]
        })

    }

    async addCategoryPhoto(categoryId:number, data: AddCategoryPhotoDto): Promise<Category|ApiResponse>
    {
        const existingCategory: Category = await this.category.findOne(categoryId,{relations:['categories','features']});

        if(!existingCategory)
        {
            return new ApiResponse('error',-6007,"Article not found.");
        }

        existingCategory.imagePath = data.imagePath
        

        const savedCategory = await this.category.save(existingCategory);
        if(!savedCategory)
        {
            return new ApiResponse('error',-6008,"Edit failed.");
        }

        return existingCategory;
    }

    async deleteCategory(categoryId:number): Promise <ApiResponse| Category>
    {
        if ((await (this.category.find({parentCategoryId: categoryId}))).length ===0)
        {
            if ((await this.category.findOne({categoryId: categoryId})) !== undefined )
            {
                if ((await this.article.find({categoryId: categoryId})).length ===0)
                {
                    this.feature.delete({categoryId: categoryId});
                    this.category.delete(categoryId);
                    return new ApiResponse('ok',0,"Category deleted")
                }else
                {
                    return new ApiResponse('error',-3399,"Cannot delete category that has articles")
                }
            }else
            {
                return new ApiResponse('error',-3388,"Category doesnt exist")
            }
        }
        
        return new ApiResponse('error',-3377,"Category has sub categories")
    }
}