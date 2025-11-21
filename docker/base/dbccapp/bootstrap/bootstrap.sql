--
-- PostgreSQL database dump
--

-- Dumped from database version 9.5.16
-- Dumped by pg_dump version 9.6.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: metadata; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA metadata;


--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

--
-- Name: is_json(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION is_json(text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $_$
begin
    perform $1::json;
    return true;
exception
    when invalid_text_representation then 
        return false;
end $_$;


--
-- Name: is_json(character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION is_json(character varying) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $_$
        declare
            x json;
        begin
            begin
            x := $1;
            exception when others then
            return false;
            end;

            return true;
        end;
    $_$;


--
-- Name: is_valid_json(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION is_valid_json(p_json text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
begin
  return (p_json::json is not null);
exception 
  when others then
     return false;  
end;
$$;


--
-- Name: isdigit(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION isdigit(text) RETURNS boolean
    LANGUAGE sql
    AS $_$select $1 ~ '^(-)?[0-9]+$' as result$_$;


--
-- Name: isnumeric(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION isnumeric(text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $_$
DECLARE x NUMERIC;
BEGIN
    x = $1::NUMERIC;
    RETURN TRUE;
EXCEPTION WHEN others THEN
    RETURN FALSE;
END;
$_$;
