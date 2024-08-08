/* eslint-disable no-undef */
import { stringToBuffer } from '@aw/libs';

export const base64ToBuffer = (bse64Str: string): Buffer => stringToBuffer(bse64Str.replace(/^data:image\/\w+;base64,/, ''));
