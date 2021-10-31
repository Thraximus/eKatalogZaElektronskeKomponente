import { Injectable } from "@nestjs/common";
import {TypeOrmCrudService} from "@nestjsx/crud-typeorm"
import { Feature } from "src/entities/feature.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { ArticleFeature } from "src/entities/articleFeature.entity";
import DistinctFeatureValuesDto from "src/dtos/feature/distinct.feature.values.dto";

@Injectable()
export class FeatureService extends TypeOrmCrudService<Feature>
{
    constructor(@InjectRepository(ArticleFeature)
    private readonly articleFeature: Repository<ArticleFeature>, @InjectRepository(Feature) private readonly feature: Repository<Feature>)
    {super(feature);}

    async deleteFeature(id: number)
    {
        this.articleFeature.delete({featureId: id})
        this.feature.delete({featureId: id});
    }

    async getDistinctValuesByCategoryId(categoryId: number): Promise<DistinctFeatureValuesDto> {
        const features = await this.feature.find({
            categoryId: categoryId,
        });

        const featureResult: DistinctFeatureValuesDto= {
            features: [],
        };

        if(!features || features.length === 0) {
            return featureResult;
        }

        featureResult.features = await Promise.all(features.map(async feature => {
            const values: string[] = 
                (
                    await this.articleFeature.createQueryBuilder("af")
                    .select("DISTINCT af.value", 'value')
                    .where('af.featureId = :featureId', {featureId: feature.featureId})
                    .orderBy('af.value', 'ASC')
                    .getRawMany()
                ).map(item => item.value);

            return {
                featureId: feature.featureId,
                name: feature.name,
                values: values, 
            };
        }));

        return featureResult;
    }
}