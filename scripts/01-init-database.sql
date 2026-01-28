-- Tabla de usuarios (estudiantes y docentes)
CREATE TABLE IF NOT EXISTS users (
  -- ID Principal: BIGSERIAL (autoincremental)
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('student', 'teacher', 'admin')),
  avatar_url TEXT,
  bio TEXT,
  specialties TEXT[],
  institution TEXT,
  verified_email BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de cursos
CREATE TABLE IF NOT EXISTS courses (
  -- ID Principal: BIGSERIAL
  id BIGSERIAL PRIMARY KEY,
  -- Clave Foránea: BIGINT
  teacher_id BIGINT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  price DECIMAL(10, 2) DEFAULT 0,
  image_url TEXT,
  duration_hours INTEGER,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de módulos/secciones del curso
CREATE TABLE IF NOT EXISTS course_modules (
  -- ID Principal: BIGSERIAL
  id BIGSERIAL PRIMARY KEY,
  -- Clave Foránea: BIGINT
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de lecciones
CREATE TABLE IF NOT EXISTS lessons (
  -- ID Principal: BIGSERIAL
  id BIGSERIAL PRIMARY KEY,
  -- Clave Foránea: BIGINT
  module_id BIGINT NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  video_type TEXT CHECK (video_type IN ('youtube', 'vimeo', 'upload')),
  duration_seconds INTEGER,
  transcript TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de recursos de lección
CREATE TABLE IF NOT EXISTS lesson_resources (
  -- ID Principal: BIGSERIAL
  id BIGSERIAL PRIMARY KEY,
  -- Clave Foránea: BIGINT
  lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de inscripciones de estudiantes
CREATE TABLE IF NOT EXISTS enrollments (
  -- ID Principal: BIGSERIAL
  id BIGSERIAL PRIMARY KEY,
  -- Claves Foráneas: BIGINT
  student_id BIGINT NOT NULL REFERENCES users(id),
  course_id BIGINT NOT NULL REFERENCES courses(id),
  progress_percentage INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(student_id, course_id)
);

-- Tabla de progreso de lecciones
CREATE TABLE IF NOT EXISTS lesson_progress (
  -- ID Principal: BIGSERIAL
  id BIGSERIAL PRIMARY KEY,
  -- Claves Foráneas: BIGINT
  student_id BIGINT NOT NULL REFERENCES users(id),
  lesson_id BIGINT NOT NULL REFERENCES lessons(id),
  completed BOOLEAN DEFAULT false,
  watched_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(student_id, lesson_id)
);

-- Tabla de quiz
CREATE TABLE IF NOT EXISTS quizzes (
  -- ID Principal: BIGSERIAL
  id BIGSERIAL PRIMARY KEY,
  -- Clave Foránea: BIGINT
  course_id BIGINT NOT NULL REFERENCES courses(id),
  title TEXT NOT NULL,
  description TEXT,
  time_limit_minutes INTEGER,
  attempts_allowed INTEGER DEFAULT 1,
  passing_score INTEGER DEFAULT 70,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de preguntas del quiz
CREATE TABLE IF NOT EXISTS quiz_questions (
  -- ID Principal: BIGSERIAL
  id BIGSERIAL PRIMARY KEY,
  -- Clave Foránea: BIGINT
  quiz_id BIGINT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
  points INTEGER DEFAULT 1,
  order_index INTEGER NOT NULL
);

-- Tabla de opciones de preguntas
CREATE TABLE IF NOT EXISTS quiz_options (
  -- ID Principal: BIGSERIAL
  id BIGSERIAL PRIMARY KEY,
  -- Clave Foránea: BIGINT
  question_id BIGINT NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL
);

-- Tabla de respuestas de estudiantes
CREATE TABLE IF NOT EXISTS quiz_submissions (
  -- ID Principal: BIGSERIAL
  id BIGSERIAL PRIMARY KEY,
  -- Claves Foráneas: BIGINT
  student_id BIGINT NOT NULL REFERENCES users(id),
  quiz_id BIGINT NOT NULL REFERENCES quizzes(id),
  score INTEGER,
  passed BOOLEAN,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de respuestas individuales
CREATE TABLE IF NOT EXISTS student_answers (
  -- ID Principal: BIGSERIAL
  id BIGSERIAL PRIMARY KEY,
  -- Claves Foráneas: BIGINT
  submission_id BIGINT NOT NULL REFERENCES quiz_submissions(id) ON DELETE CASCADE,
  question_id BIGINT NOT NULL REFERENCES quiz_questions(id),
  selected_option_id BIGINT REFERENCES quiz_options(id),
  answer_text TEXT
);

-- Tabla de asignaciones
CREATE TABLE IF NOT EXISTS assignments (
  -- ID Principal: BIGSERIAL
  id BIGSERIAL PRIMARY KEY,
  -- Clave Foránea: BIGINT
  course_id BIGINT NOT NULL REFERENCES courses(id),
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de entregas de asignaciones
CREATE TABLE IF NOT EXISTS assignment_submissions (
  -- ID Principal: BIGSERIAL
  id BIGSERIAL PRIMARY KEY,
  -- Claves Foráneas: BIGINT
  assignment_id BIGINT NOT NULL REFERENCES assignments(id),
  student_id BIGINT NOT NULL REFERENCES users(id),
  submission_url TEXT NOT NULL,
  grade INTEGER,
  feedback TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  graded_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de discusiones/foro
CREATE TABLE IF NOT EXISTS discussions (
  -- ID Principal: BIGSERIAL
  id BIGSERIAL PRIMARY KEY,
  -- Claves Foráneas: BIGINT
  course_id BIGINT NOT NULL REFERENCES courses(id),
  author_id BIGINT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_answered BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de respuestas en discusiones
CREATE TABLE IF NOT EXISTS discussion_replies (
  -- ID Principal: BIGSERIAL
  id BIGSERIAL PRIMARY KEY,
  -- Claves Foráneas: BIGINT
  discussion_id BIGINT NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
  author_id BIGINT NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  is_verified_answer BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
  -- ID Principal: BIGSERIAL
  id BIGSERIAL PRIMARY KEY,
  -- Clave Foránea: BIGINT
  user_id BIGINT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de wishlist
CREATE TABLE IF NOT EXISTS wishlist (
  -- ID Principal: BIGSERIAL
  id BIGSERIAL PRIMARY KEY,
  -- Claves Foráneas: BIGINT
  student_id BIGINT NOT NULL REFERENCES users(id),
  course_id BIGINT NOT NULL REFERENCES courses(id),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, course_id)
);

-- Tabla de certificaciones
CREATE TABLE IF NOT EXISTS certificates (
  -- ID Principal: BIGSERIAL
  id BIGSERIAL PRIMARY KEY,
  -- Claves Foráneas: BIGINT
  student_id BIGINT NOT NULL REFERENCES users(id),
  course_id BIGINT NOT NULL REFERENCES courses(id),
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  certificate_url TEXT
);

-- Crear índices para mejor performance (cambio de tipo de columna)
CREATE INDEX idx_courses_teacher_id ON courses(teacher_id);
CREATE INDEX idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_lessons_module_id ON lessons(module_id);
CREATE INDEX idx_quiz_course_id ON quizzes(course_id);
CREATE INDEX idx_discussions_course_id ON discussions(course_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_wishlist_student_id ON wishlist(student_id);
