import { Actions } from 'src/enums/actions';

export type Notification = {
  templateName: string;
  action: Actions;
  [k: string]: string | number | boolean | [];
};
