CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



SET default_table_access_method = heap;

--
-- Name: prompt_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prompt_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    original_content text NOT NULL,
    enhanced_content text NOT NULL,
    mode text DEFAULT 'formal'::text NOT NULL,
    file_type text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: prompt_history prompt_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prompt_history
    ADD CONSTRAINT prompt_history_pkey PRIMARY KEY (id);


--
-- Name: prompt_history Allow all access to prompt_history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all access to prompt_history" ON public.prompt_history USING (true) WITH CHECK (true);


--
-- Name: prompt_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.prompt_history ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;