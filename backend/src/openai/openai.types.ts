


export interface JSONSchema<T> {
  name: string;
  schema: {
    type: 'object';
    properties: {
      facts: {
        type: 'array';
        items: {
          type: 'object';
          additionalProperties: false;
          properties: T;
          required: string[];
        };
      };
    };
    required: string[];
    additionalProperties: false;
  };
  strict: boolean;
}
