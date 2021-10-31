import { Controller, UseGuards, Post, Body, UseInterceptors, Param, UploadedFile, Req, Delete, Patch } from "@nestjs/common";
import { Crud } from "@nestjsx/crud";
import { Category } from "src/entities/category.entity";
import { CategoryService } from "src/services/category/category.service";
import { RoleCheckeGuard } from "src/misc/role.checker.guard";
import { AllowToRoles } from "src/misc/allow.to.roles.descriptor";
import {AddCategoryDto} from "src/dtos/add.category.dto"
import { FileInterceptor } from "@nestjs/platform-express";
import {diskStorage} from "multer"
import { StorageConfig } from "cfg/storage.cfg";
import { ApiResponse } from "src/misc/api.response.class";
import * as fileType from 'file-type';
import * as fs from 'fs';
import { AddCategoryPhotoDto } from "src/dtos/add.category.photo.dto";
import * as sharp from 'sharp';

@Controller('api/category')
@Crud
({
    model: 
    {
        type: Category
    },
    params:
    {
        id:
        {
            field: 'categoryId',
            type: 'number',
            primary:true
        },
        
    },
    query:
    {
        join:
        {
            categories:
            {
                eager:true // joined by default
            },
            parentCategory:
            {
                eager:true // joined by default
            },
            features:
            {
                eager:false // add /?join=features
            },
            articles:
            {
                eager: false // add /?join=articles
            }

        }
    },
    routes:
    {
        only:
        [
            "getManyBase","getOneBase",
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
export class CategoryController
{
    constructor(public service: CategoryService){}

    @Post() 
    @UseGuards(RoleCheckeGuard)
    @AllowToRoles('Admin')
    createCompleteCategory(@Body() data: AddCategoryDto)
    {
        return this.service.createCompleteCategory(data);
    }

    @Patch('/:categoryId')
    @UseGuards(RoleCheckeGuard)
    @AllowToRoles('Admin')
    public async editCategory(@Param('categoryId') categoryId: number,@Body() data: AddCategoryDto): Promise <ApiResponse|Category>
    {
        return this.service.editCompleteCategory(categoryId,data);
    }

    @Delete('delete/:categoryId')
    @UseGuards(RoleCheckeGuard)
    @AllowToRoles('Admin')
    public async deleteCategory(@Param('categoryId') categoryId: number): Promise <ApiResponse|Category>
    {
        return this.service.deleteCategory(categoryId);
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
    async uploadPhoto(@Param('id') categoryId:number,@UploadedFile() photo,@Req() req): Promise<ApiResponse | Category>
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

        let imagePath = photo.filename;
        let dto: AddCategoryPhotoDto = new AddCategoryPhotoDto();
        dto.imagePath = imagePath;
        const addedPhoto = await this.service.addCategoryPhoto(categoryId,dto);
        
        if (!addedPhoto)
        {
           return new ApiResponse('error', -4001);
        }
        await this.createResizedImg(photo,StorageConfig.photo.resize.categoryPhoto);
        fs.unlinkSync(StorageConfig.photo.destination+'/'+photo.filename);
        return addedPhoto;
        
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

    
}