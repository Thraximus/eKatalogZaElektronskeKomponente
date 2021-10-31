import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from "typeorm";
  import { Article } from "./article.entity";
  import * as Validator from 'class-validator';
  
  @Index("FK_photo_article", ["articleId"], {})
  @Entity("photo", { schema: "ekatalogzaelektronskeuredjaje" })
  export class Photo {
    @PrimaryGeneratedColumn({ type: "int", name: "photo_id", unsigned: true })
    photoId: number;
  
    @Column("int", { name: "article_id", unsigned: true })
    articleId: number;
  
    @Column("varchar", { name: "image_path" })
    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(1,255)
    imagePath: String;
  
    @ManyToOne(() => Article, (article) => article.photos, {
      onDelete: "NO ACTION",
      onUpdate: "NO ACTION",
    })
    @JoinColumn([{ name: "article_id", referencedColumnName: "articleId" }])
    article: Article;
  }
  