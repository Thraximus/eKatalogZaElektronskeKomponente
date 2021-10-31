import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from "@nestjs/common";
import {Observable} from 'rxjs';
import {Request} from 'express';
import { Reflector } from "@nestjs/core";

@Injectable()
export class RoleCheckeGuard implements CanActivate{

    constructor(private reflector: Reflector){}
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const req: Request = context.switchToHttp().getRequest();
        let role: "Guest" | "Admin";
        if (req.error === null)
        {
            role ="Admin";
        }else{
            role ="Guest";
        }
        

        const allowedToRoles = this.reflector.get<('Admin' | 'Guest')[]>('allow_to_roles',context.getHandler());

        if(!allowedToRoles.includes(role))
        {
            switch(req.error){
                case 1:
                {
                    throw new HttpException('No token found',HttpStatus.UNAUTHORIZED);
                }
                case 2:
                {
                    throw new HttpException('Bad token',HttpStatus.UNAUTHORIZED);
                }
                case 3:
                {
                    throw new HttpException('Bad token',HttpStatus.UNAUTHORIZED);
                }
                case 4:
                {
                    throw new HttpException('Bad token',HttpStatus.UNAUTHORIZED);       
                }
                case 5:
                {
                    throw new HttpException('Bad token',HttpStatus.UNAUTHORIZED);
                }
                case 6:
                {
                    throw new HttpException('Account not found',HttpStatus.UNAUTHORIZED);
                }
                case 7:
                {
                    throw new HttpException('Token has expired',HttpStatus.UNAUTHORIZED);
                }
            }
            
        }
        return true;
        
    }

}