import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Jrrp } from './entity/jrrp.entity';
import { MyDiceD } from './utils/dice';
import { MyRequest } from 'express';
import { MyError } from 'utils';
import { DiceRecord } from './entity/diceRecord.entity';
import { CocCharacter } from './entity/coc/character.entity';
import { CocAttribute } from './entity/coc/attribute.entity';
import { CocSkill } from './entity/coc/skill.entity';
import {
  CocCheckResult,
  CocRuleBookCheck,
  isAttribute,
} from './utils/cocRules';
import { AF2024Record } from './entity/af2024.entity';
import { Choice } from './entity/choice/choice.entity';
import { Option as MyOption } from './entity/choice/option.entity';

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

  async setCharacterAttribute(
    req: MyRequest,
    { name, value }: { name: string; value: number },
    characterId?: number
  ): Promise<number> {
    try {
      let character;

      if (!characterId) {
        character = await this.entityManager.findOne<CocCharacter>(
          'coc_character',
          { where: { creator: req.userId }, order: { id: 'DESC' } }
        );

        if (!character) {
          character = new CocCharacter();
          character.creator = req.userId;
          await this.entityManager.insert<CocCharacter>(
            'coc_character',
            character
          );
        }
      } else {
        character = await this.entityManager.findOne<CocCharacter>(
          'coc_character',
          { where: { id: characterId } }
        );

        if (!character) {
          MyError.log(new MyError(1003, 'api', '角色不存在'));
          return Promise.reject(-1);
        }
      }

      const target = await this.entityManager.findOne<CocAttribute>(
        'coc_attribute',
        { where: { character: { id: character.id }, name } }
      );
      if (target) {
        target.value = value;
        await this.entityManager.save(CocAttribute, target);
      } else {
        const attribute = new CocAttribute();
        attribute.character = character;
        attribute.name = name;
        attribute.value = value;
        await this.entityManager.insert<CocAttribute>(
          'coc_attribute',
          attribute
        );
      }

      return character.id;
    } catch (e) {
      console.log(e);
      throw new MyError(2001, 'internal', (e as Error).message);
    }
  }

  async setCharacterSkill(
    req: MyRequest,
    value: CocSkill,
    characterId?: number
  ): Promise<number> {
    try {
      let character;

      if (!characterId) {
        character = await this.entityManager.findOne<CocCharacter>(
          'coc_character',
          { where: { creator: req.userId }, order: { id: 'DESC' } }
        );

        if (!character) {
          character = new CocCharacter();
          character.creator = req.userId;
          await this.entityManager.insert<CocCharacter>(
            'coc_character',
            character
          );
        }
      } else {
        character = await this.entityManager.findOne<CocCharacter>(
          'coc_character',
          { where: { id: characterId } }
        );

        if (!character) {
          MyError.log(new MyError(1003, 'api', '角色不存在'));
          return Promise.reject(-1);
        }
      }

      const target = await this.entityManager.findOne<CocSkill>('coc_skill', {
        where: { character: { id: character.id }, name: value.name },
      });
      if (target) {
        await this.entityManager.save(CocSkill, { ...target, ...value });
      } else {
        await this.entityManager.insert<CocSkill>('coc_skill', {
          ...value,
          character,
        });
      }

      return character.id;
    } catch (e) {
      console.log(e);
      throw new MyError(2001, 'internal', (e as Error).message);
    }
  }

  async cocCheck(
    req: MyRequest,
    { name, value, bonus }: { name: string; value?: number; bonus?: number }
  ): Promise<CocCheckResult> {
    try {
      let realValue = value;
      if (!realValue) {
        if (isAttribute(name)) {
          const characters = await this.entityManager.find<CocCharacter>(
            'coc_character',
            { where: { creator: req.userId }, order: { id: 'DESC' } }
          );

          for (const character of characters) {
            const attribute = await this.entityManager.findOne<CocAttribute>(
              'coc_attribute',
              {
                where: { character: { id: character.id }, name },
                order: { id: 'DESC' },
              }
            );

            if (attribute) {
              realValue = attribute.value!;
              break;
            }
          }
          if (!realValue) {
            throw new MyError(1003, 'api', '属性值未设置');
          }
        } else {
          const characters = await this.entityManager.find<CocCharacter>(
            'coc_character',
            { where: { creator: req.userId }, order: { id: 'DESC' } }
          );

          for (const character of characters) {
            const skill = await this.entityManager.findOne<CocSkill>(
              'coc_skill',
              {
                where: { character: { id: character.id }, name },
                order: { id: 'DESC' },
              }
            );

            if (skill) {
              if (skill.value) {
                realValue = skill.value;
              } else {
                realValue =
                  (skill.enhancement ?? 0) +
                  (skill.profession ?? 0) +
                  (skill.interest ?? 0);
              }
              break;
            }
          }
          if (!realValue) {
            throw new MyError(1003, 'api', '技能值未设置');
          }
        }
      }

      // check result according to coc rule book
      const checkRule = new CocRuleBookCheck();
      // TODO: add more rules, maybe rule switcher

      return checkRule.check({
        target: realValue,
        bonus: bonus ?? 0,
        saver: (v, m) => this.saveDiceRecord(req, v, m),
      });
    } catch (e) {
      throw new MyError(2001, 'internal', (e as Error).message);
    }
  }

  async checkAF2024Record(req: MyRequest): Promise<boolean> {
    const checkSuccess = await this.entityManager.findOne<AF2024Record>(
      'af2024_record',
      { where: { userId: req.userId, success: true } }
    );

    return !!checkSuccess?.id;
  }

  async tryAF2024Record(
    req: MyRequest,
    val: string,
    success: boolean = false
  ): Promise<boolean> {
    const checkSuccess = await this.checkAF2024Record(req);

    await this.entityManager.insert<AF2024Record>('af2024_record', {
      userId: req.userId,
      val,
      success: success || checkSuccess,
    });

    return checkSuccess;
  }
  
  async saveChoiceRecord(
    req: MyRequest,
    options: string[],
    indices: number[],
    count: number
  ): Promise<void> {
    try {
      const choice = new Choice();

      const optionEntities = options.map((opt, i) => {
        const option = new MyOption();
        option.content = opt;
        option.chosen = indices.includes(i);
        return option;
      });

      choice.options = optionEntities;
      choice.optionCount = options.length;
      choice.choiceCount = count;
      choice.userID = req.userId;

      await this.entityManager.insert<Choice>('choice', choice);
      optionEntities.forEach((opt) => {
        opt.choice = choice;
        this.entityManager.insert<MyOption>('option', opt);
      });
    } catch (err) {
      MyError.log(
        new MyError(
          2001,
          'internal',
          '保存选择记录失败: ' + (err as Error).toString()
        )
      );
    }
  }
}
