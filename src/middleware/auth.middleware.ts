import { NestMiddleware, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { AdministratorTableService } from "src/services/administrator-table/administrator.servise";
import * as jwt from 'jsonwebtoken';
import { JwtDataAdministratorDto } from "src/dtos/administrator/jwt.data.administrator.dto";
import { jwtSecret } from "cfg/jwt.secret";

@Injectable()
export class AuthMiddleware implements NestMiddleware
{
    constructor(private readonly administratorService: AdministratorTableService){}

    async use(req: Request,res: Response,next: NextFunction)
    {
        req.error = null;
        if(!req.headers.authorization)
        {
            req.error = 1;
        }
        if(req.error === null)
        {
            const token = req.headers.authorization;
            const tokenParts = token.split(' ');
            
            if (tokenParts.length !==2){
                req.error = 2;
                
            }
            if(req.error === null)
            {
                const tokenString = tokenParts[1];
                
                let jwtData: JwtDataAdministratorDto;
                
                try{
                jwtData = jwt.verify(tokenString,jwtSecret);
                }catch(e)
                {
                    req.error = 3;
                }
                if(req.error === null)
                {

                    if (!jwtData)
                    {
                        req.error = 4;
                    }

                    if(req.error === null)
                    {
                        if (jwtData.ip !== req.ip.toString())
                        {
                            req.error =5;
                        }

                        if (jwtData.ua !== req.headers["user-agent"])
                        {
                            req.error = 5;
                        }
                        
                        if(req.error === null)
                        {

                            const administrator = await this.administratorService.getById(jwtData.administratorId);
                            if(!administrator)
                            {
                                req.error = 6;
                            }

                            if(req.error === null)
                            {
                                const currentStamp = new Date().getTime()/1000;

                                if(currentStamp >= jwtData.exp)
                                {
                                    req.error = 7;
                                }
                            }
                        }
                    }
                }
            }
        }
        

        next();
    }
}