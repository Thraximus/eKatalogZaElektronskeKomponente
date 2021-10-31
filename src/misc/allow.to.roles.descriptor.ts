import { SetMetadata } from "@nestjs/common"

export const AllowToRoles = (...roles:("Guest"|"Admin")[]) =>
{
    return SetMetadata('allow_to_roles',roles);
}