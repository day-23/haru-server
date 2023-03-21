export interface BaseTag {
    id: string,
    content: string,
    tagOrder : number,
    isSelected : boolean
}


export interface BaseTagWithTodo {
    id: number;
    tag: {
      id: number;
      content: string;
    };
  }
  