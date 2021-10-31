import { Controller, Get, Param, Put, Body, Post, UseGuards, Patch } from "@nestjs/common";
import { AdministratorTableService } from "src/services/administrator-table/administrator.servise";
import { Administrator } from "src/entities/administrator.entity";
import { AddAdministratorDto } from "src/dtos/administrator/add.administrator.dto";
import { EditAdministratorDto } from "src/dtos/administrator/edit.administrator.dto";
import { ApiResponse } from "src/misc/api.response.class";
import { resolve } from "dns";
import { AllowToRoles } from "src/misc/allow.to.roles.descriptor";
import { RoleCheckeGuard } from "src/misc/role.checker.guard";

@Controller('api/administrator')
export class AdministratorController
{
    constructor(private administratorService: AdministratorTableService){}

    @Get()
    @UseGuards(RoleCheckeGuard)
    @AllowToRoles("Admin")
    getAll(): Promise<Administrator[]>
    {
    return this.administratorService.getAll();
    }

    @Get(':id')
    @UseGuards(RoleCheckeGuard)
    @AllowToRoles('Admin')
    async getById( @Param('id') administratorId: number): Promise<Administrator | ApiResponse>
    {
        return new Promise(async(resolve)=>
        {
            let admin = await this.administratorService.getById(administratorId);

            if (admin === undefined)
            {
                resolve(new ApiResponse("error",-1002))
            }
            resolve(admin);
        });
        
    }

    @Post()
    @UseGuards(RoleCheckeGuard)
    @AllowToRoles('Admin')
    add(@Body() data: AddAdministratorDto): Promise<Administrator | ApiResponse>
    {
        return this.administratorService.add(data);
    }

    @Patch(':id')
    @UseGuards(RoleCheckeGuard)
    @AllowToRoles('Admin')
    edit(@Param('id') administratorId: number, @Body() data: EditAdministratorDto): Promise<Administrator|ApiResponse>
    {
        return this.administratorService.editById(administratorId,data);
    }
}

