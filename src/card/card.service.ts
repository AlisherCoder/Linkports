import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Card } from './schema/card.schema';
import { Model } from 'mongoose';
import { User } from 'src/user/schema/user.schema';
import { Request } from 'express';

@Injectable()
export class CardService {
  constructor(
    @InjectModel(Card.name) private cardModel: Model<Card>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createCardDto: CreateCardDto, request: Request) {
    try {
      let user = request['user'];
      let newCard = {
        ...createCardDto,
        user: user.id,
      };

      let data = await this.cardModel.create(newCard);

      await this.userModel.findByIdAndUpdate(data.user, {
        $push: { cards: data._id },
      });

      return { data };
    } catch (error) {
      return { message: error.message };
    }
  }

  async findAll() {
    try {
      let data = await this.cardModel.find();
      return { data };
    } catch (error) {
      return { message: error.message };
    }
  }

  async findOne(id: string) {
    try {
      let data = await this.cardModel.findById(id);
      if (!data) {
        return { message: 'Not found card' };
      }
      return { data };
    } catch (error) {
      return { message: error.message };
    }
  }

  async update(id: string, updateCardDto: UpdateCardDto, request: Request) {
    try {
      let user = request['user'];
      let card = await this.cardModel.findById(id);
      if (!card) {
        return { message: 'Not found card' };
      }

      if (card.user != user.id && user.role != 'ADMIN') {
        throw new ForbiddenException();
      }

      let data = await this.cardModel.findByIdAndUpdate(id, updateCardDto, {
        new: true,
      });

      return { data };
    } catch (error) {
      return { message: error.message };
    }
  }

  async remove(id: string, request: Request) {
    try {
      let user = request['user'];
      let card = await this.cardModel.findById(id);

      if (!card) {
        return { message: 'Not found card' };
      }

      if (card.user != user.id && user.role != 'ADMIN') {
        throw new ForbiddenException();
      }
      
      await this.cardModel.findByIdAndDelete(id);
      return { data: card };
    } catch (error) {
      return { message: error.message };
    }
  }
}
