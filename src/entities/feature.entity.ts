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
  import { ArticleFeature } from "./articleFeature.entity";
  import { Category } from "./category.entity";
  import { Article } from "./article.entity";
  import * as Validator from 'class-validator';
  
  @Index("FK_feature_category", ["categoryId"], {})
  @Index("name", ["name"], { unique: true })
  @Entity("feature", { schema: "ekatalogzaelektronskeuredjaje" })
  export class Feature {
    @PrimaryGeneratedColumn({ type: "int", name: "feature_id", unsigned: true })
    featureId: number;
  
    @Column("varchar", { name: "name", unique: true, length: 50 })
    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(1,50)
    name: string;
  
    @Column("int", { name: "category_id", unsigned: true })
    categoryId: number;
  
    @OneToMany(() => ArticleFeature, (articleFeature) => articleFeature.feature)
    articleFeatures: ArticleFeature[];

    @ManyToMany(type=> Article, article => article.features)
    @JoinTable({
      name:"article_feature",
      joinColumn: {name: "feature_id", referencedColumnName: "featureId"},
      inverseJoinColumn:{name: "article_id",referencedColumnName: "articleId"}
    })
    articles: Article[];
  
    @ManyToOne(() => Category, (category) => category.features, {
      onDelete: "NO ACTION",
      onUpdate: "NO ACTION",
    })
    @JoinColumn([{ name: "category_id", referencedColumnName: "categoryId" }])
    category: Category;
  }
  