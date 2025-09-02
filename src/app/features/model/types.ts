
export type Item = {
    id: number;                
    tenantId: string;
    name: string;
    memo: string | null;       
    imageUrl: string | null;  
    isCompleted: boolean;     
  };
  

  export type CreateItemDto = {
    name: string;
  };
  

  export type UpdateItemDto = {
    name?: string;
    memo?: string | null;
    imageUrl?: string | null;
    isCompleted?: boolean;
  };

  export const TENANT_ID = "seunghyun";
