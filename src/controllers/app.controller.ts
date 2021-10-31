import { Controller, Get, UseGuards } from '@nestjs/common';
import { AllowToRoles } from 'src/misc/allow.to.roles.descriptor';
import { RoleCheckeGuard } from 'src/misc/role.checker.guard';

@Controller()
export class AppController {
  
  @Get()
  @UseGuards(RoleCheckeGuard)
  @AllowToRoles('Admin',"Guest")
  getIndex(): string {
    return 'Home page';
  }

  
}
