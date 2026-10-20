import { Pipe, PipeTransform } from '@angular/core';
import { pretty, typeEs } from '../utils/type-labels';

/** 'fire' -> 'Fuego' */
@Pipe({ name: 'typeEs', standalone: true })
export class TypeEsPipe implements PipeTransform {
  transform(value: string | undefined): string {
    return typeEs(value);
  }
}

/** 'solar-beam' -> 'solar beam' */
@Pipe({ name: 'pretty', standalone: true })
export class PrettyPipe implements PipeTransform {
  transform(value: string | undefined): string {
    return pretty(value);
  }
}
