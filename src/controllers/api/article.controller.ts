import { Controller, Post, Body, Param, UseInterceptors, UploadedFile, Req, Delete, Patch, UseGuards } from "@nestjs/common";
import { Crud } from "@nestjsx/crud";
import { Article } from "src/entities/article.entity";
import { ArticleService as ArticleService } from "src/services/article/article.service";
import { AddArticleDto } from "src/dtos/article/add.article.dto";
import {FileInterceptor} from "@nestjs/platform-express";
import {diskStorage} from "multer"
import { StorageConfig } from "cfg/storage.cfg";
import { PhotoService } from "src/services/photo/photo.service";
import { Photo } from "src/entities/photo.entity";
import { ApiResponse } from "src/misc/api.response.class";
import * as fileType from 'file-type';
import * as fs from 'fs';
import * as sharp from 'sharp';
import { EditArticleDto } from "src/dtos/article/edit.article.dto";
import { AllowToRoles } from "src/misc/allow.to.roles.descriptor";
import { RoleCheckeGuard } from "src/misc/role.checker.guard";
import { ArticleSearchDto } from "src/dtos/article/article.search.dto";
import { FeatureService } from "src/services/feature/feature.service";


@Controller('api/article')
@Crud
({
    model: 
    {
        type: Article
    },
    params:
    {
        id:
        {
            field: 'articleId',
            type: 'number',
            primary:true
        }
    },
    query:
    {
        join:
        {
            articleFeatures:
            {
                eager:true // joined by default
            },
            articlePrices:
            {
                eager:true // joined by default
            },
            photos:
            {
                eager:true // joined by default
            },
            category:
            {
                eager: true // joined by default
            },
            features:
            {
                eager: true
            }


        }
    },
    routes:
    {
        only:
        [
            "getManyBase","getOneBase"
        ],
        
        getManyBase: {decorators:[
            UseGuards(RoleCheckeGuard),
            AllowToRoles('Admin',"Guest"),
        ]},
        getOneBase: {decorators:[
            UseGuards(RoleCheckeGuard),
            AllowToRoles('Admin',"Guest"),
        ]}
    }
})
export class ArticleController
{
    constructor(public service: ArticleService, public photoService:PhotoService, public featureService: FeatureService){}

    @Post() 
    @UseGuards(RoleCheckeGuard)
    @AllowToRoles('Admin')
    createCompleteArticle(@Body() data: AddArticleDto)
    {
        return this.service.createCompleteArticle(data);
    }

    @Patch(':id')
    @UseGuards(RoleCheckeGuard)
    @AllowToRoles('Admin')
    editCompleteArticle(@Param('id') id:number,@Body() data:EditArticleDto)
    {
        return this.service.editCompleteArticle(id,data);
    }

    @Post(':id/uploadPhoto')
    @UseGuards(RoleCheckeGuard)
    @AllowToRoles('Admin')
    @UseInterceptors(FileInterceptor('photo',
    {
        storage: diskStorage
        ({
            destination: StorageConfig.photo.destination,
            filename: (req,file,callback)=>
            {
                let original: string = file.originalname;

                let normalized = original.replace(/\s+/g,'-');
                normalized=normalized.replace(/^A-z0-9\.\-]/g,'');
                let now = new Date();
                let datePart = '';
                datePart += now.getFullYear();
                datePart += (now.getMonth()+1);
                datePart += now.getDate().toString();
                let randomPart: string = new Array(10).fill(0).map(e=>(Math.random()*9).toFixed(0).toString()).join('');

                let finalFileName = datePart+'-'+randomPart+'-'+normalized;
                finalFileName = finalFileName.toLocaleLowerCase();
                callback(null,finalFileName);
            }
        }),
        fileFilter: (req,file,callback)=>
        {
            if(!file.originalname.toLocaleLowerCase().match(/\.(jpg|png)$/))
            {
                req.fileFilterError = 'Bad file extension';
                callback(null,false);
                return;
            }


            callback(null,true);
        },
        limits:{
            files: 1,
            fieldSize: StorageConfig.photo.maxSize
        }
    }))
    async uploadPhoto(@Param('id') articleId:number,@UploadedFile() photo,@Req() req): Promise<ApiResponse | Photo>
    {
        if (req.fileFilterError )
        {
            return new ApiResponse('error',4002,req.fileFilterError)
        }

        if (!photo)
        {
            return new ApiResponse('error',4002,'file not uploaded')
        }

        const fileTypeResult = await fileType.fromFile(photo.path);
        if(!fileTypeResult)
        {
            fs.unlinkSync(photo.path);
            return new ApiResponse('error',4002,'cannot detect filetype');
        }

        const realMimeType = fileTypeResult.mime;
        if(!(realMimeType.includes('jpeg')|| realMimeType.includes('png')))
        {
            fs.unlinkSync(photo.path);
            return new ApiResponse('error',4002,'bad content type');
        }
        await this.createResizedImg(photo,StorageConfig.photo.resize.thumb)
        await this.createResizedImg(photo,StorageConfig.photo.resize.small)


        let imagePath = photo.filename;

        const newPhoto: Photo = new Photo();
        newPhoto.articleId = articleId;
        newPhoto.imagePath = photo.filename;

       const savedPhoto = await this.photoService.add(newPhoto);

       if (!savedPhoto)
       {
           return new ApiResponse('error', -4001);
       }

       return savedPhoto;
    }

    async createResizedImg(photo,settings)
    {
        const originalFilePath = photo.path;
        const fileName = photo.filename;

        const destinationFilePath = settings.destination+ '/'+fileName;

        await sharp(originalFilePath).resize({
            fit: 'cover',
            width: settings.width,
            height:settings.height,
            }).toFile(destinationFilePath);

    }

    @Delete(':articleId/deletePhoto/:photoId')
    @UseGuards(RoleCheckeGuard)
    @AllowToRoles('Admin')
    public async deletePhoto(@Param('articleId') articleId: number, @Param('photoId') photoId: number)
    {
        const photo = await this.photoService.findOne({ articleId: articleId,photoId: photoId});

        if(!photo)
        {
            return new ApiResponse('error',-5002,"Photo not found");
        }
        try{
            fs.unlinkSync(StorageConfig.photo.destination+'/'+photo.imagePath);
            fs.unlinkSync(StorageConfig.photo.resize.small.destination+'/'+photo.imagePath);
            fs.unlinkSync(StorageConfig.photo.resize.thumb.destination+'/'+photo.imagePath);
        }catch(e){}

        const deleteResult = await this.photoService.deleteById(photo.photoId);
        if(deleteResult.affected == 0)
        {
            return new ApiResponse('error',-5002,"Photo not found");
        }

        return new ApiResponse('ok',0,"photo removed");
    }

    @Delete('delete/:articleId')
    @UseGuards(RoleCheckeGuard)
    @AllowToRoles('Admin')
    public async deleteArticle(@Param('articleId') articleId: number): Promise<null| ApiResponse>
    {
        const article = await this.service.findOne({articleId: articleId});
        if(article)
        {
            const photos = await this.photoService.find({articleId: articleId});
            if(photos)
            {
                for (let photo of photos)
                {
                    await this.deletePhoto(articleId,photo.photoId);
                    await this.photoService.deleteById(photo.photoId)
                    
                }
            }
            if (this.service.find)
            await this.service.deleteArticleFeature(articleId);

            await this.service.deleteArticlePrice(articleId);

            await this.service.deleteArticle(articleId);

            return new ApiResponse('ok',0,"article removed")
        }
        return new ApiResponse('error',-3366,"article not found")
    }

    @Post('search')
    @UseGuards(RoleCheckeGuard)
    @AllowToRoles('Admin','Guest')
    async search(@Body() data: ArticleSearchDto): Promise<Article[] | ApiResponse>
    {
        return await this.service.search(data);
    }
}