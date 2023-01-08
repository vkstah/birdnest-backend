import { Violator } from "../types/index";
import { supabase } from "./supabase";

/**
 * Fetch stored violators from the database.
 * @returns Array of violators.
 */
export const fetchViolators = () => {
  return supabase.from("violators").select();
};

/**
 * Insert violators into the database.
 * @param violators Array of violators.
 * @returns Array of inserted violators.
 */
export const insertViolators = (violators: Violator[]) => {
  return supabase.from("violators").insert(violators).select();
};

/**
 * Delete violators from the database using serial numbers.
 * @param serialNumbers Array of serial numbers.
 * @returns Array of deleted violators.
 */
export const deleteViolators = (serialNumbers: string[]) => {
  return supabase.from("violators").delete().in("serialNumber", serialNumbers);
};
