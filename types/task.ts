export type Task = {
  id: number;
  text: string;
  completed: boolean;
  cost: number;
  parent?: number;
};
