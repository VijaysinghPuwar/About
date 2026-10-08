-- Reading history for the /books reader.
--
-- One row per reader per book. A row per page turn would grow without limit
-- and nobody would ever read it; what the reader needs back is "where was I"
-- and "which chapters have I been through", and that fits in one row.
--
--   chapter_id / position   where to reopen: chapter, and 0..1 down its length
--   percent                 overall progress, weighted by chapter word count
--   chapters                { "<chapter id>": { "p": furthest 0..1, "t": iso time } }
--
-- The client keeps a local copy and syncs here on a debounce, so this table
-- sees at most one write every few seconds per active reader.

CREATE TABLE public.reading_progress (
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_slug   TEXT        NOT NULL CHECK (book_slug ~ '^[a-z0-9-]{1,40}$'),
  chapter_id  TEXT        NOT NULL CHECK (char_length(chapter_id) BETWEEN 1 AND 40),
  position    REAL        NOT NULL DEFAULT 0 CHECK (position >= 0 AND position <= 1),
  percent     REAL        NOT NULL DEFAULT 0 CHECK (percent >= 0 AND percent <= 100),
  chapters    JSONB       NOT NULL DEFAULT '{}'::jsonb
                          CHECK (jsonb_typeof(chapters) = 'object' AND pg_column_size(chapters) < 16384),
  started_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, book_slug)
);

CREATE INDEX reading_progress_recent_idx ON public.reading_progress (user_id, updated_at DESC);

ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Readers can view own progress"
ON public.reading_progress FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Readers can insert own progress"
ON public.reading_progress FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Readers can update own progress"
ON public.reading_progress FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Readers can delete own progress"
ON public.reading_progress FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all reading progress"
ON public.reading_progress FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- The server owns the clock. A client with a skewed clock must not be able to
-- make a stale write look newer than a fresh one from another device.
CREATE OR REPLACE FUNCTION public.reading_progress_touch()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  IF TG_OP = 'UPDATE' THEN
    NEW.started_at := OLD.started_at;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER reading_progress_touch
BEFORE INSERT OR UPDATE ON public.reading_progress
FOR EACH ROW EXECUTE FUNCTION public.reading_progress_touch();
