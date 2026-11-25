import {Controller, Get, Param} from '@nestjs/common';
import {isStatisticVar} from 'common/functions/statistic.typeguards';
import {ApiError} from '../../classes/api-error';
import {DbService} from '../../services/db/db.service';
import {Statistic} from 'common/interfaces/statistic';

@Controller('statistic')
export class StatisticController {
  constructor(
    private readonly db: DbService
  ) {
  }

  @Get(':var1{/:var2}')
  async get(
    @Param('var1') var1: string,
    @Param('var2') var2: string | undefined
  ): Promise<Statistic> {
    if (!isStatisticVar(var1)) throw new ApiError('invalid-data', ['var1', var1]);
    if (!isStatisticVar(var2) && (typeof var2 !== 'undefined')) throw new ApiError('invalid-data', ['var2', var2]);
    return await this.db.getStatistic(var1, var2);
  }
}
