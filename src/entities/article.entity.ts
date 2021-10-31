import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    ManyToMany,
    JoinTable,
  } from "typeorm";
  import { Category } from "./category.entity";
  import { ArticleFeature } from "./articleFeature.entity";
  import { ArticlePrice } from "./articlePrice.entity";
  import { Photo } from "./photo.entity";
import { Feature } from "./feature.entity";
import * as Validator from 'class-validator';
  
  @Index("FK_article_category", ["categoryId"], {})
  @Index("name", ["name"], { unique: true })
  @Entity("article", { schema: "ekatalogzaelektronskeuredjaje" })
  export class Article {
    @PrimaryGeneratedColumn({ type: "int", name: "article_id", unsigned: true })
    articleId: number;
  
    @Column("varchar", { name: "name", unique: true, length: 50 })
    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(5,50)
    name: string;
  
    @Column("int", { name: "category_id", unsigned: true, default: () => "'0'" })
    categoryId: number;
  
    @Column("varchar", { name: "excerpt", length: 255, default: () => "'0'" })
    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(10,255)
    excerpt: string;
  
    @Column("text", {
      name: "description"      
    })
    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(50,10240)
    description: string;
  
    @Column("varchar", {
      name: "manufacturer",
      length: 100,
      default: () => "'0'",
    })
    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(1,100)
    manufacturer: string;

    @ManyToMany(type=> Feature, feature => feature.articles)
    @JoinTable({
      name:"article_feature",
      joinColumn: {name: "article_id", referencedColumnName: "articleId"},
      inverseJoinColumn:{name: "feature_id",referencedColumnName: "featureId"}
    })
    features: Feature[];
  
    @ManyToOne(() => Category, (category) => category.articles, {
      onDelete: "NO ACTION",
      onUpdate: "NO ACTION",
    })
    @JoinColumn([{ name: "category_id", referencedColumnName: "categoryId" }])
    category: Category;
  
    @OneToMany(() => ArticleFeature, (articleFeature) => articleFeature.article)
    articleFeatures: ArticleFeature[];
  
    @OneToMany(() => ArticlePrice, (articlePrice) => articlePrice.article)
    articlePrices: ArticlePrice[];
  
    @OneToMany(() => Photo, (photo) => photo.article)
    photos: Photo[];
  }
  