import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {DatabaseCfg} from "cfg/databese.cfg";
import { Administrator } from 'src/entities/administrator.entity';
import { AdministratorTableService } from "src/services/administrator-table/administrator.servise";
import { Article } from 'src/entities/article.entity';
import { ArticleFeature } from 'src/entities/articleFeature.entity';
import { ArticlePrice } from 'src/entities/articlePrice.entity';
import { Category } from 'src/entities/category.entity';
import { Feature } from 'src/entities/feature.entity';
import { Photo } from 'src/entities/photo.entity';
import { AdministratorController } from './controllers/api/administrator.controller';
import { CategoryController } from './controllers/api/category.controller';
import { CategoryService } from './services/category/category.service';
import { ArticleService } from './services/article/article.service';
import { ArticleController } from './controllers/api/article.controller';
import { AuthController } from './controllers/api/auth.controller';
import { AuthMiddleware } from './middleware/auth.middleware';
import { PhotoService } from './services/photo/photo.service';
import { FeatureService } from './services/feature/feature.service';
import { FeatureController } from './controllers/api/feature.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot
    ({
      type: 'mysql',
      host: DatabaseCfg.hostname,
      port: 3306,
      username: DatabaseCfg.username,
      password: DatabaseCfg.password,
      database: DatabaseCfg.database,
      entities: [Administrator,Article,ArticleFeature,ArticlePrice,Category,Feature,Photo]
    }),
    TypeOrmModule.forFeature([Administrator,Category,Article,ArticlePrice,ArticleFeature,Feature,Photo])
  ],
  controllers: [AppController,AdministratorController,CategoryController,ArticleController,AuthController,FeatureController,],
  providers: [AdministratorTableService,CategoryService,ArticleService,PhotoService,FeatureService,],
  exports:
  [
    AdministratorTableService,
  ]
})
export class AppModule implements NestModule 
{
  configure(consumer: MiddlewareConsumer) 
  {
    consumer.apply(AuthMiddleware).forRoutes('/*')  
  }
  
}
