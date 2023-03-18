export interface BaseTag {
    id: string,
    content: string,
}


export interface BaseTagWithTodo {
    id: number;
    tag: {
      id: number;
      content: string;
    };
  }
  