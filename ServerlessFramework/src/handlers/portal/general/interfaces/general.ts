export interface Countries {
  name: string;
  states: States[];
}

export interface States {
  name: string;
  cities: Cities[];
}

export interface Cities {
  name: string;
}

export interface GeneralType {
  countries: { name: string; states: { name: string; cities: { name: string }[] }[] }[];
  destinations: string[];
  variants: {
    airtime: Omit<Properties, 'value'>[];
    plan: Omit<Properties, 'value'>[];
    validity: Omit<Properties, 'value'>[];
    delivery: Omit<Properties, 'value'>[];
  };
  simTypes: Omit<Properties, 'price' | 'value'>[];
}

export interface Properties {
  name: string;
  price: number;
  value: string;
}
