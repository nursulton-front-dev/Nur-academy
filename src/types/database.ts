export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: string
          avatar_url: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: string
          avatar_url?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: string
          avatar_url?: string | null
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string | null
          cover_url: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          cover_url?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          cover_url?: string | null
        }
      }
      course_translations: {
        Row: {
          course_id: string
          locale: string
          title: string
          description: string | null
        }
        Insert: {
          course_id: string
          locale: string
          title: string
          description?: string | null
        }
        Update: {
          course_id?: string
          locale?: string
          title?: string
          description?: string | null
        }
      }
      modules: {
        Row: {
          id: string
          course_id: string
          order_index: number
        }
        Insert: {
          id?: string
          course_id: string
          order_index: number
        }
        Update: {
          id?: string
          course_id?: string
          order_index?: number
        }
      }
      module_translations: {
        Row: {
          module_id: string
          locale: string
          title: string
        }
        Insert: {
          module_id: string
          locale: string
          title: string
        }
        Update: {
          module_id?: string
          locale?: string
          title?: string
        }
      }
      lessons: {
        Row: {
          id: string
          module_id: string
          video_url: string | null
          content: string | null
          order_index: number
        }
        Insert: {
          id?: string
          module_id: string
          video_url?: string | null
          content?: string | null
          order_index: number
        }
        Update: {
          id?: string
          module_id?: string
          video_url?: string | null
          content?: string | null
          order_index?: number
        }
      }
      lesson_translations: {
        Row: {
          lesson_id: string
          locale: string
          title: string
          content: string | null
        }
        Insert: {
          lesson_id: string
          locale: string
          title: string
          content?: string | null
        }
        Update: {
          lesson_id?: string
          locale?: string
          title?: string
          content?: string | null
        }
      }
      quizzes: {
        Row: {
          id: string
          lesson_id: string
        }
        Insert: {
          id?: string
          lesson_id: string
        }
        Update: {
          id?: string
          lesson_id?: string
        }
      }
      questions: {
        Row: {
          id: string
          quiz_id: string
          order_index: number
        }
        Insert: {
          id?: string
          quiz_id: string
          order_index: number
        }
        Update: {
          id?: string
          quiz_id?: string
          order_index?: number
        }
      }
      question_translations: {
        Row: {
          question_id: string
          locale: string
          question_text: string
        }
        Insert: {
          question_id: string
          locale: string
          question_text: string
        }
        Update: {
          question_id?: string
          locale?: string
          question_text?: string
        }
      }
      answers: {
        Row: {
          id: string
          question_id: string
          is_correct: boolean
        }
        Insert: {
          id?: string
          question_id: string
          is_correct: boolean
        }
        Update: {
          id?: string
          question_id?: string
          is_correct?: boolean
        }
      }
      answer_translations: {
        Row: {
          answer_id: string
          locale: string
          answer_text: string
        }
        Insert: {
          answer_id: string
          locale: string
          answer_text: string
        }
        Update: {
          answer_id?: string
          locale?: string
          answer_text?: string
        }
      }
      enrollments: {
        Row: {
          user_id: string
          course_id: string
          enrolled_at: string
        }
        Insert: {
          user_id: string
          course_id: string
          enrolled_at?: string
        }
        Update: {
          user_id?: string
          course_id?: string
          enrolled_at?: string
        }
      }
      progress: {
        Row: {
          user_id: string
          lesson_id: string
          completed: boolean
          quiz_score: number | null
          completed_at: string | null
        }
        Insert: {
          user_id: string
          lesson_id: string
          completed?: boolean
          quiz_score?: number | null
          completed_at?: string | null
        }
        Update: {
          user_id?: string
          lesson_id?: string
          completed?: boolean
          quiz_score?: number | null
          completed_at?: string | null
        }
      }
    }
  }
}
