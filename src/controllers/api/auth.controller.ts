import { Controller, Post, Body, Req, UseGuards } from "@nestjs/common";
import {AdministratorTableService} from "src/services/administrator-table/administrator.servise"
import { LoginAdministratorDto } from "src/dtos/administrator/login.administrator.dto";
import { ApiResponse } from "src/misc/api.response.class";
import * as crypto from 'crypto';
import { LoginInfoAdministratorDto } from "src/dtos/administrator/login.info.administrator.dto";
import * as jwt from 'jsonwebtoken';
import { JwtDataAdministratorDto } from "src/dtos/administrator/jwt.data.administrator.dto";
import { Request } from "express";
import { jwtSecret } from "cfg/jwt.secret";
import { AllowToRoles } from "src/misc/allow.to.roles.descriptor";
import { RoleCheckeGuard } from "src/misc/role.checker.guard";

@Controller('auth')
export class AuthController
{
    constructor(public administratorService:  AdministratorTableService){}

    @Post('login')
    @UseGuards(RoleCheckeGuard)
    @AllowToRoles("Guest")
    async doLogin(@Body() data: LoginAdministratorDto,@Req() request:Request): Promise<ApiResponse |LoginInfoAdministratorDto>
    {
        const administrator = await this.administratorService.getByUsername(data.username);

        if (!administrator)
        {
            return new Promise(resolve=> { resolve(new ApiResponse('error',-1003))})
        }

        const passwordHash = crypto.createHash('sha512');
        passwordHash.update(data.password);
        const passwordHashString = passwordHash.digest('hex').toUpperCase();

        if(administrator.passwordHash !== passwordHashString)
        {
            return new Promise(resolve=>{resolve(new ApiResponse('error',-1004))})
        }

        const jwtData = new JwtDataAdministratorDto();
        jwtData.administratorId=administrator.administratorId;
        jwtData.username=administrator.username;
        let now = new Date();
        now.setDate(now.getDate()+14);
        const expStamp = now.getTime()/1000;
        jwtData.exp= expStamp;
        jwtData.ip = request.ip.toString();
        jwtData.ua=request.headers["user-agent"];


        let token: string = jwt.sign(jwtData.toPlainObject(),jwtSecret);

        const reponseObject = new LoginInfoAdministratorDto(administrator.administratorId,administrator.username,token);
        return new Promise(resolve=>resolve(reponseObject));
    }
}