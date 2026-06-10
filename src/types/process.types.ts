export interface Area {
  id: string;
  name: string;
  processCount: number;
  description: string;
  collaboratorIds?: string[];
}

export interface Processo {
  id: string;
  areaId: string;
  name: string;
  updatedAt: string;
  assignedUserIds: string[];
}

export interface Etapa {
  id: string;
  processId: string;
  order: number;
  title: string;
  description?: string;
}