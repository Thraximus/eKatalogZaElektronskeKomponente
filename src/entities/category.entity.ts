import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
  } from "typeorm";
  import { Article } from "./article.entity";
  import { Feature } from "./feature.entity";
  import * as Validator from 'class-validator';

  @Index("FK_category_category", ["parentCategoryId"], {})
  @Index("name", ["name"], { unique: true })
  @Entity("category", { schema: "ekatalogzaelektronskeuredjaje" })
  export class Category {
    @PrimaryGeneratedColumn({ type: "int", name: "category_id", unsigned: true })
    categoryId: number;
  
    @Column("varchar", { name: "name", unique: true, length: 255 })
    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(1,255)
    name: string;
  
    @Column("varchar", { name: "image_path", length: 255 })
    @Validator.IsOptional()
    @Validator.IsString()
    @Validator.Length(1,255)
    imagePath: string;
  
    @Column("int", { name: "parent_category_id", nullable: true, unsigned: true })
    parentCategoryId: number | null;
  
    @OneToMany(() => Article, (article) => article.category)
    articles: Article[];
  
    @ManyToOne(() => Category, (category) => category.categories, {
      onDelete: "NO ACTION",
      onUpdate: "NO ACTION",
    })
    @JoinColumn([
      { name: "parent_category_id", referencedColumnName: "categoryId" },
    ])
    parentCategory: Category;
  
    @OneToMany(() => Category, (category) => category.parentCategory)
    categories: Category[];
  
    @OneToMany(() => Feature, (feature) => feature.category)
    features: Feature[];
  }
  