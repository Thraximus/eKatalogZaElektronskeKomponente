export class LoginInfoAdministratorDto
{
    administratorId: number;
    username: string;
    token: string;

    constructor(id:number,user:string,jwt:string )
    {
        this.administratorId=id;
        this.username=user;
        this.token=jwt;
    }
}