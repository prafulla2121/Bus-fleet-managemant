/*
  # Bus Fleet Management System Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - Links to auth.users
      - `name` (text) - Driver's full name
      - `driver_id` (text) - Driver's identification number
      - `email` (text) - Driver's email address
      - `role` (text) - User role (driver, admin, etc.)
      - `created_at` (timestamptz) - When the profile was created
    
    - `bus_logs`
      - `id` (uuid, primary key)
      - `created_at` (timestamptz)
      - `bus_number` (text) - Bus identifier
      - `purpose` (text) - Purpose of the trip
      - `start_location` (text) - Starting location
      - `end_location` (text) - Ending location
      - `start_km` (float) - Starting odometer reading
      - `end_km` (float) - Ending odometer reading
      - `start_time` (time) - Trip start time
      - `end_time` (time) - Trip end time
      - `shift_type` (text) - Pickup or drop
      - `passenger_count` (integer) - Number of passengers
      - `date` (date) - Date of the trip
      - `driver_id` (uuid) - References profiles.id

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to:
      - Read own profile data
      - Update own profile data
      - Create bus log entries
      - Read own bus log entries
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  name text,
  driver_id text,
  email text,
  role text DEFAULT 'driver',
  CONSTRAINT driver_id_unique UNIQUE (driver_id)
);

-- Create bus_logs table
CREATE TABLE IF NOT EXISTS bus_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  bus_number text NOT NULL,
  purpose text NOT NULL,
  start_location text NOT NULL,
  end_location text NOT NULL,
  start_km float NOT NULL CHECK (start_km >= 0),
  end_km float NOT NULL CHECK (end_km > start_km),
  start_time time NOT NULL,
  end_time time NOT NULL,
  shift_type text NOT NULL CHECK (shift_type IN ('pickup', 'drop')),
  passenger_count integer NOT NULL CHECK (passenger_count >= 0),
  date date NOT NULL,
  driver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bus_logs ENABLE ROW LEVEL SECURITY;

-- Policies for profiles table
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policies for bus_logs table
CREATE POLICY "Drivers can create bus logs"
  ON bus_logs
  FOR INSERT
  WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Drivers can view their own bus logs"
  ON bus_logs
  FOR SELECT
  USING (auth.uid() = driver_id);

-- Triggers to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bus_logs_driver_id ON bus_logs(driver_id);
CREATE INDEX IF NOT EXISTS idx_bus_logs_date ON bus_logs(date);
CREATE INDEX IF NOT EXISTS idx_bus_logs_bus_number ON bus_logs(bus_number);