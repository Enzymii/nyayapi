import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Jrrp } from './entity/jrrp.entity';
import { MyDiceD } from './utils/dice';
import { MyRequest } from 'express';
import { MyError } from 'utils';
import { DiceRecord } from './entity/diceRecord.entity';

@Injectable()
export class ApiService {
  constructor(private readonly entityManager: EntityManager) {}

  getHello(): string {
    return 'Hello World!';
  }

  private formatDateString(date: Date): string {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    const dateString = year + month + day;
    return dateString;
  }

  async checkJrrp(req: MyRequest): Promise<number> {
    const today = new Date();

    const result = await this.entityManager.find<Jrrp>('jrrp', {
      where: { date: this.formatDateString(today), userId: req.userId },
    });

    if (result.length > 0) return result[0].jrrp;

    // -1 if not exists
    return -1;
  }

  async newJrrp(req: MyRequest): Promise<number> {
    const result = MyDiceD(100);

    await this.entityManager.insert<Jrrp>('jrrp', {
      date: this.formatDateString(new Date()),
      jrrp: result,
      userId: req.userId,
    });

    return Promise.resolve(result);
  }

  async saveDiceRecord(
    req: MyRequest,
    val: number,
    max: number
  ): Promise<void> {
    try {
      await this.entityManager.insert<DiceRecord>('dice_record', {
        userId: req.userId,
        val: val,
        max: max,
      });
    } catch (err) {
      MyError.log(
        new MyError(
          2001,
          'internal',
          '保存骰子记录失败: ' + (err as Error).toString()
        )
      );
    }
  }
}
