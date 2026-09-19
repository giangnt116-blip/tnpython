import { supabase } from '../lib/supabase'

export interface ExamResultInput {
  student_name: string
  class_name: string | null
  score: number
  correct_count: number
  wrong_count: number
  blank_count: number
  duration_seconds: number

  topic_1_score: number
  topic_2_score: number
  topic_3_score: number
  topic_4_score: number
  topic_5_score: number
  topic_6_score: number
  topic_7_score: number
  topic_8_score: number
  topic_9_score: number
  topic_10_score: number

  answers_json: Record<string, string | null>

  exam_version?: string
}

export async function saveExamResult(result: ExamResultInput) {
  const { error } = await supabase
    .from('exam_results')
    .insert({
      ...result,
      exam_version: result.exam_version ?? 'python100-v1'
    })

  if (error) {
    throw error
  }

  return { success: true }
}
