-- Drop the existing check constraint on the level column in the courses table
ALTER TABLE courses DROP CONSTRAINT courses_level_check;

-- Alter the data type of the level column in the courses table from TEXT to SMALLINT
ALTER TABLE courses ALTER COLUMN level TYPE SMALLINT USING 
    CASE 
        WHEN level = 'beginner' THEN 1
        WHEN level = 'intermediate' THEN 2
        WHEN level = 'advanced' THEN 3
        ELSE 1
    END;

-- Add a new check constraint to the level column to ensure values are between 1 and 5
ALTER TABLE courses ADD CONSTRAINT courses_level_check CHECK (level >= 1 AND level <= 5);