import { Controller, UseGuards, Delete, Param, Get } from "@nestjs/common";
import { Crud } from "@nestjsx/crud";
import { Feature } from "src/entities/feature.entity";
import { FeatureService } from "src/services/feature/feature.service";
import { AllowToRoles } from "src/misc/allow.to.roles.descriptor";
import { RoleCheckeGuard } from "src/misc/role.checker.guard";
import { ApiResponse } from "src/misc/api.response.class";
import DistinctFeatureValuesDto from "src/dtos/feature/distinct.feature.values.dto";

@Controller('api/feature')
@Crud
({
    model: 
    {
        type: Feature
    },
    params:
    {
        id:
        {
            field: 'featureId',
            type: 'number',
            primary:true
        },
        
    },
    query:
    {
        join:
        {
            category:
            {
                eager:true // joined by default
            },
            articleFeatures:
            {
                eager:false // add /?join=articleFeatures
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
            "createOneBase","createManyBase","getManyBase","getOneBase","updateOneBase"
        ],
        createOneBase: {decorators:[
            UseGuards(RoleCheckeGuard),
            AllowToRoles('Admin'),
        ]},
        createManyBase: {decorators:[
            UseGuards(RoleCheckeGuard),
            AllowToRoles('Admin'),
        ]},
        getManyBase: {decorators:[
            UseGuards(RoleCheckeGuard),
            AllowToRoles('Admin',"Guest"),
        ]},
        getOneBase: {decorators:[
            UseGuards(RoleCheckeGuard),
            AllowToRoles('Admin',"Guest"),
        ]},
        updateOneBase: {decorators:[
            UseGuards(RoleCheckeGuard),
            AllowToRoles('Admin'),
        ]}
    },
    
})
export class FeatureController
{
    constructor(public service: FeatureService){}

    @Delete('delete/:featureId')
    @UseGuards(RoleCheckeGuard)
    @AllowToRoles('Admin')
    public async deleteCategory(@Param('featureId') featureId: number): Promise <ApiResponse>
    {   
        if (this.service.findOne(featureId))
        {
            this.service.deleteFeature(featureId);
            return new ApiResponse('ok',0,"Feature deleted")
        }
        return new ApiResponse('error',-4411,"feature doesnt exist")
    }

    @Get('values/:categoryId')
    @UseGuards(RoleCheckeGuard)
    @AllowToRoles('Admin', 'Guest')
    getDistinctValuesByCategoryId(@Param('categoryId') categoryId: number): Promise<DistinctFeatureValuesDto> {
        return this.service.getDistinctValuesByCategoryId(categoryId);
    }
}