import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from "typeorm";
  import { Article } from "./article.entity";
  import { Feature } from "./feature.entity";
  import * as Validator from 'class-validator';
  
  @Index("FK_article_feature_article", ["articleId"], {})
  @Index("FK_article_feature_feature", ["featureId"], {})
  @Entity("article_feature", { schema: "ekatalogzaelektronskeuredjaje" })
  export class ArticleFeature {
    @PrimaryGeneratedColumn({
      type: "int",
      name: "artivle_feature_id",
      unsigned: true,
    })
    artivleFeatureId: number;
  
    @Column("int", { name: "article_id", unsigned: true })
    articleId: number;
  
    @Column("int", { name: "feature_id", unsigned: true })
    featureId: number;
  
    @Column("varchar", { name: "value", length: 50 })
    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(1,255)
    value: string;
    
  
    @ManyToOne(() => Article, (article) => article.articleFeatures, {
      onDelete: "NO ACTION",
      onUpdate: "NO ACTION",
    })
    @JoinColumn([{ name: "article_id", referencedColumnName: "articleId" }])
    article: Article;
  
    @ManyToOne(() => Feature, (feature) => feature.articleFeatures, {
      onDelete: "NO ACTION",
      onUpdate: "NO ACTION",
    })
    @JoinColumn([{ name: "feature_id", referencedColumnName: "featureId" }])
    feature: Feature;
  }
  