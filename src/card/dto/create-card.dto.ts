import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class CreateCardDto {
  @ApiProperty({ example: [{ instagram: 'link' }, { telegram: 'link' }] })
  @IsArray()
  fields: object[];
}
