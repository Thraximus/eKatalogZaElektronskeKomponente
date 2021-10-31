import { Injectable } from "@nestjs/common";
import {TypeOrmCrudService} from "@nestjsx/crud-typeorm"
import { Article } from "src/entities/article.entity";
import { Repository, In, InsertQueryBuilder } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { AddArticleDto } from "src/dtos/article/add.article.dto";
import { promises } from "dns";
import { ApiResponse } from "src/misc/api.response.class";
import { ArticlePrice } from "src/entities/articlePrice.entity";
import { ArticleFeature } from "src/entities/articleFeature.entity";
import { EditArticleDto } from "src/dtos/article/edit.article.dto";
import { ArticleSearchDto } from "src/dtos/article/article.search.dto";
import { isPrimitive } from "util";
import { PhotoService } from "../photo/photo.service";
import { Photo } from "src/entities/photo.entity";
import { identity } from "rxjs";

@Injectable()
export class ArticleService extends TypeOrmCrudService<Article>
{
    constructor
    (
        @InjectRepository(Article)
        private readonly article: Repository<Article>,

        @InjectRepository(ArticlePrice)
        private readonly articlePrice: Repository<ArticlePrice>,

        @InjectRepository(ArticleFeature)
        private readonly articleFeature: Repository<ArticleFeature>
    ){
        super(article);
    }

    async createCompleteArticle(data: AddArticleDto): Promise<Article|ApiResponse>
    {
        let newArticle: Article = new Article();
        newArticle.name=data.name;
        newArticle.categoryId=data.categoryId;
        newArticle.excerpt=data.excerpt;
        newArticle.description=data.description;
        newArticle.manufacturer = data.manufacturer;
        let savedArticle = await this.article.save(newArticle);


        let newArticlePrice: ArticlePrice = new ArticlePrice();
        newArticlePrice.articleId=savedArticle.articleId;
        newArticlePrice.price = data.price;

        await this.articlePrice.save(newArticlePrice);
        
        for(let feature of data.features)
        {
            let newArticleFeature: ArticleFeature = new ArticleFeature();
            newArticleFeature.articleId=savedArticle.articleId;
            newArticleFeature.featureId=feature.featureId;
            newArticleFeature.value = feature.value;

            await this.articleFeature.save(newArticleFeature);
        }
    
        return await this.article.findOne(savedArticle.articleId,
        {
            relations:
            [
                "category",
                "articleFeatures",
                "features",
                "articlePrices"
            ]
        })

        
    }

    async deleteArticleFeature(id: number)
    {
        if (this.articleFeature.find({articleId: id}))
        {
            this.articleFeature.delete({articleId: id});
        }
    }

    async deleteArticlePrice(id: number)
    {
        this.articlePrice.delete({articleId: id});
    }

    async deleteArticle(id: number)
    {
        this.article.delete(id);
    }


    async editCompleteArticle(articleId:number, data: EditArticleDto): Promise<Article|ApiResponse>
    {
        const existingArticle: Article = await this.article.findOne(articleId,{relations:['articlePrices','articleFeatures']});

        if(!existingArticle)
        {
            return new ApiResponse('error',-6007,"Article not found.");
        }

        existingArticle.name = data.name;
        existingArticle.categoryId = data.categoryId;
        existingArticle.excerpt = data.excerpt;
        existingArticle.description = data.description;
        existingArticle.manufacturer = data.manufacturer;

        const savedArticle = await this.article.save(existingArticle);
        if(!savedArticle)
        {
            return new ApiResponse('error',-6008,"Edit failed.");
        }
        
        const newPriceString: string = Number(data.price).toFixed(2);

        const currentPrice = existingArticle.articlePrices[existingArticle.articlePrices.length-1].price;
        const currentPriceString: string = Number(currentPrice).toFixed(2);
        
        if(newPriceString !== currentPriceString)
        {
            const newArticlePrice = new ArticlePrice();
            newArticlePrice.articleId = articleId;
            newArticlePrice.price = data.price;

            const savedArticlePrice = this.articlePrice.save(newArticlePrice);
            if(!savedArticlePrice){
                return new ApiResponse('error',-6009,"Price edit failed.");
            }
        }
        
        
        if(data.features !== null)
        {
            await this.articleFeature.remove(existingArticle.articleFeatures);


            for(let feature of data.features)
            {
                let newArticleFeature: ArticleFeature = new ArticleFeature();
                newArticleFeature.articleId=articleId;
                newArticleFeature.featureId=feature.featureId;
                newArticleFeature.value = feature.value;

                await this.articleFeature.save(newArticleFeature);
            }
        }

        return await this.article.findOne(articleId,
            {
                relations:
                [
                    "category",
                    "articleFeatures",
                    "features",
                    "articlePrices"
                    
                ]
            })
    }

    async search(data: ArticleSearchDto): Promise<Article[] | ApiResponse>
    {
        const builder = await this.article.createQueryBuilder("article");

        builder.innerJoinAndSelect("article.articlePrices", "ap","ap.created_at = (SELECT ap.createdAt FROM article_price as ap WHERE ap.articleId = article.article_id ORDER BY ap.created_at DESC LIMIT 1)");
        builder.leftJoinAndSelect("article.articleFeatures", "af");
        builder.leftJoinAndSelect("article.features", "features");
        builder.leftJoinAndSelect("article.photos", "photos");


        builder.where('article.categoryId = :id',{id: data.categoryId});
        
        if (data.keywords && data.keywords.length>0)
        {
            builder.andWhere(`(article.name LIKE :kw OR article.excerpt LIKE :kw OR article.description LIKE :kw)`, {kw: '%'+data.keywords+'%'})
        }
        
        if ( data.priceMin && typeof data.priceMin === 'number')
        {
            builder.andWhere('ap.price >= :min', {min: data.priceMin})
        }
        
        if (data.priceMax && typeof data.priceMax === 'number')
        {
            builder.andWhere('ap.price <= :max', {max: data.priceMax})
        }

        if(data.features && data.features.length > 0)
        {
            for(const feature of data.features)
            {
                builder.andWhere('af.featureId = :fId AND af.value IN (:fVals)',{fId: feature.featureId, fVals: feature.values})
            }
        }

        let orderBy = 'article.name';
        let orderDirection: 'ASC' | 'DESC' = 'ASC'

        if (data.orderBy)
        {
            orderBy = data.orderBy;
            if (orderBy === 'price')
            {
                orderBy = 'ap.price';
            }

            if (orderBy === 'name')
            {
                orderBy = 'article.name';
            }
        }

        if (data.orderDirection)
        {
            orderDirection = data.orderDirection;
        }

        builder.orderBy(orderBy,orderDirection)

        let page = 0;
        if(data.page && typeof data.page ==='number')
        {
            page = data.page;
        }

        let iPPage: 5|10|20|40 = 10;
        if(data.itemsPerPage && typeof data.itemsPerPage ==='number')
        {
            iPPage = data.itemsPerPage;
        }

        builder.skip(page*iPPage)
        builder.take(iPPage)
        
        let articles = await builder.getMany();

        if (articles.length === 0) {
            return new ApiResponse("ok", 0, "No articles found.");
        }

        return articles;
    }
}