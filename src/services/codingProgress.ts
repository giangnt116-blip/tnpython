import { supabase } from '../lib/supabase'

export type CodingTrack = 'basic' | 'september'

export type CodingStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'

export type CodingProgressInput = {
  student_name: string
  class_name: string | null
  track: CodingTrack
  problem_id: string
  status: CodingStatus
  started_at?: string | null
  completed_at?: string | null
}

export async function saveCodingProgress(
  progress: CodingProgressInput
) {
  const { error } = await supabase
    .from('coding_progress')
    .insert({
      ...progress,
      updated_at: new Date().toISOString()
    })

  if (error) {
    throw error
  }

  return { success: true }
}
