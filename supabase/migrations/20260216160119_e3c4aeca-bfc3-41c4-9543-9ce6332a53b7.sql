
-- Mood journal entries
CREATE TABLE public.mood_journal (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  emotion TEXT NOT NULL,
  note TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.mood_journal ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own moods" ON public.mood_journal FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Users can view own moods" ON public.mood_journal FOR SELECT USING (auth.uid() = student_id);

-- Badges table
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own badges" ON public.badges FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Users can view own badges" ON public.badges FOR SELECT USING (auth.uid() = student_id);

-- Daily streaks
CREATE TABLE public.daily_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL UNIQUE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.daily_streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own streak" ON public.daily_streaks FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Users can view own streak" ON public.daily_streaks FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Users can update own streak" ON public.daily_streaks FOR UPDATE USING (auth.uid() = student_id);

-- Add avatar and total_points to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT '🧒';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_points INTEGER NOT NULL DEFAULT 0;
