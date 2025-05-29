export interface BusLog {
  id: string;
  created_at: string;
  bus_number: string;
  purpose: string;
  start_location: string;
  end_location: string;
  start_km: number;
  end_km: number;
  start_time: string;
  end_time: string;
  shift_type: string;
  passenger_count: number;
  date: string;
  driver_id: string;
}

export interface Profile {
  id: string;
  created_at: string;
  name: string;
  driver_id: string;
  role: string;
  email: string;
}