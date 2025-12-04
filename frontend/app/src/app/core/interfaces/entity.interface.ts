export interface IID {
  id?: string;
}

export interface ITimestamps {
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IEntity extends IID, ITimestamps {}
