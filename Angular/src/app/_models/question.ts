export class Question {
  no: number;
  name: string;
  placeholder: boolean;
  type: string;
  required: boolean;
  acknowledgement?: string;
  noOfImages?: number;
  options?: any[];
  phoneValidation: boolean;
  emailValidation: boolean;
}

export class QuestionsPage {
  pageNo: number;
  pageTitle: string;
  pageSubTitle: string;
  picture: string;
  questions: Question[];
}
