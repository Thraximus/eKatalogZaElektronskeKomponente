import { JwtDataAdministratorDto } from "src/dtos/administrator/jwt.data.administrator.dto";

declare module 'express'
{
    interface Request
    {
        error: number | null;
    }
}