export interface Vehicle {
  id: string;
  organization_id: string;
  registration_number: string;
  driver_name?: string | null;
  capacity_details?: string | null;
  created_at: string;
}

export interface VehicleInput {
  registration_number: string;
  driver_name?: string | null;
  capacity_details?: string | null;
}
