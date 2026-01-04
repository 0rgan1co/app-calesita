
export enum Role {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
}

export interface Participant {
  id: string;
  name: string;
  avatarColor: string;
  animalEmoji: string;
  status: 'pending' | 'accepted';
  isOwner: boolean;
  progress: number;
}

export interface UserProfile {
  nickname: string;
  childAge: string;
  userAge?: number;
  interest: string;
  role: string;       
  audience: string;   
  email?: string;
  pin?: string;
  animalEmoji?: string;
  avatarColor?: string;
  isOwner: boolean;
  hasVerifiedSocial?: boolean;
  values: {
    crianza: string;
    tecnologia: string;
    alimentacion: string;
    privacidad: string;
  };
}

export type AppStep = 
  | 'landing'           
  | 'pin_direct'        
  | 'share_room'        
  | 'room_lobby'        
  | 'registration'      
  | 'data_entry'        
  | 'processing'        
  | 'result'            
  | 'game_plan'         
  | 'payment'           
  | 'chat';             

export const VALUE_OPTIONS = {
  crianza: ['Respetuosa', 'Estructurada', 'Libre'],
  tecnologia: ['Sin Pantallas', 'Equilibrado', 'Tech-Friendly'],
  alimentacion: ['Saludable', 'Flexible', 'Sin Restricciones'],
  privacidad: ['Privado (no fotos)', 'Consultar antes', 'Abierto']
};

export const ANIMAL_AVATARS = [
  { emoji: '🦊', name: 'Zorro' },
  { emoji: '🐻', name: 'Oso' },
  { emoji: '🐼', name: 'Panda' },
  { emoji: '🦁', name: 'León' },
  { emoji: '🐨', name: 'Koala' },
  { emoji: '🐯', name: 'Tigre' },
  { emoji: '🐰', name: 'Conejo' },
  { emoji: '🦉', name: 'Búho' }
];

export const AVATAR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6', '#A4C639'
];
