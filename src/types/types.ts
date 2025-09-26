// Пользователь и связанные модели

export type Role =
  | 'admin'
  | 'limited_admin'
  | 'producer'
  | 'receiver'
  | 'lab_assistant'
  | 'pile_operator'
  | 'boom_operator'
  | 'weight_operator'
  | 'security';

export type Counterparty = {
  id: number;
  guid: string;
  name: string;
  bin: string;
  is_active: boolean;
};

export type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  iin: string;
  role: {
    label: string;
    value: Role;
  };
  is_active: boolean;
  counterparty?: Counterparty | null;
  prefix: string;
};

/** Модель пользователя, вложенная в контракт */
export type UserForContract = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: Role;
  is_active: boolean;
};

// Ответ при логине

export type LoginResponse = {
  status: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
};

// Контракт и запросы по нему

export type Contract = {
  id: number;
  guid: string;
  user: UserForContract;
  number: string;
  start_date: string; // формат YYYY-MM-DD
  end_date: string; // формат YYYY-MM-DD
  is_active: boolean;
};

/** Альтернативная модель контракта с user_id вместо вложенного объекта */
export type ContractEntity = {
  id: number;
  user_id: number;
  number: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
};

export type ContractRequest = {
  user_id: number;
  number: string;
  start_date: string;
  end_date: string;
  /** при обновлении можно указать */
  is_active?: boolean;
};

// Водитель

export type Driver = {
  id: number;
  name: string;
  phone: string;
  user_id: number;
};

export type DriverRequest = {
  user_id: number;
  name: string;
  phone: string;
};

// Транспортное средство

export type Vehicle = {
  id: number;
  brand: string;
  plate_number: string;
  user_id: number;
};

export type VehicleRequest = {
  user_id: number;
  license_plate: string;
  brand: string;
};

// Поле и продукт (для рейса)

export type Field = {
  id: number;
  number: string;
};

export type Product = {
  id: number;
  name: string;
};

// Рейс (Shipment)

export interface VehicleBrand {
  id: number;
  name: string;
}

export interface UserRole {
  label: string;
  value: string;
}

export interface ActionLogUser {
  id: number;
  name: string;
  role: string;
}

export interface ActionLog {
  id: number;
  user: ActionLogUser;
  action: string;
  created_at: string; // ISO date string
  details: string | null;
}

export interface Consignment {
  id: number;
  shipment_id: string;
  gross_weight: string;
  tare_weight: string;
  net_weight: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Shipment {
  id: string;
  prefix: string;
  driver_info: string;
  vehicle_number: string;
  vehicle_brand: VehicleBrand;
  user: User;
  contract: Contract;
  counterparty: Counterparty;
  product: Product;
  receiver: unknown | null;
  lab_assistant: unknown | null;
  pile_operator: unknown | null;
  boom_operator: unknown | null;
  consignments: Consignment[] | '-';
  action_log: ActionLog[] | '-';
  departure_time: string; // ISO date string
  declined_reason: string | null;
  estimated_arrival_time: string; // ISO date string
  actual_arrival_time: string | null;
  status: {
    label: string;
    value: string;
  };
  boom_number: string | null;
  pile_number: string | null;
  gross_weight: string | null;
  tare_weight: string | null;
  net_weight: string | null;
  is_conditioned: boolean | null;
  lead_lab_testing: string | null;
  general_contamination: string | null;
  sugar_content: string | null;
  is_active: boolean | null;
}

export type ShipmentRequest = {
  id?: string;
  counterparty_bin: string;
  contract_id: string;
  driver_info: string;
  vehicle_brand_id: string | null;
  vehicle_brand: string;
  vehicle_number: string;
  gross_weight?: number;
  tare_weight?: number;
  net_weight?: number;
  departure_time: string;
  estimated_arrival_time: number;
  user_id: string;
  prefix: string;
};

// Детальный рейс с логами

export type ShipmentDetail = Omit<
  Shipment,
  'departure_time' | 'estimated_arrival_time'
> & {
  departure_time: string | null;
  estimated_arrival_time: string | null;
  action_logs: ActionLog[];
};

// Создание и обновление пользователя

export type UserCreateRequest = {
  name: string;
  email: string;
  phone: string;
  iin: string;
  role: Role;
  /** обязательно, если role === 'producer' */
  contractor_id?: number;
  password: string;
};

export type UserUpdateRequest = {
  name: string;
  email: string;
  phone: string;
  iin: string;
  role: Role;
  /** обязательно, если role === 'producer' */
  contractor_id?: number;
  is_active: boolean;
  /** указывать только при смене пароля */
  password?: string;
};

// Стандартные ответы об ошибках

export type ErrorResponse = {
  message: string;
};

export type ValidationErrorResponse = {
  message: string;
  errors: {
    [field: string]: string[];
  };
};
