export interface BaseTag {
    id: string,
    content: string,
}


export interface TagWithTodoInterface {
    id: number;
    tag: {
      id: number;
      content: string;
    };
  }
  