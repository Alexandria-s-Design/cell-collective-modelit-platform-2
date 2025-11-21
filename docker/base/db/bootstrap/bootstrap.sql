--
-- PostgreSQL database dump
--

-- Dumped from database version 11.9
-- Dumped by pg_dump version 11.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: postgres; Type: USER; 
--

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'postgres') THEN
        CREATE ROLE postgres WITH SUPERUSER LOGIN PASSWORD 'HelikarLab@aZZnAmtz';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'ccadmin') THEN
        CREATE USER ccadmin WITH SUPERUSER PASSWORD 'HelikarLab@aZZnAmtz';
    END IF;
END $$;

--
-- Name: metadata; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA metadata;


ALTER SCHEMA metadata OWNER TO postgres;

--
-- Name: enum_Distributions_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Distributions_type" AS ENUM (
    'normal',
    'lognormal',
    'uniform',
    'logit',
    'box_cox',
    'heavy_tail',
    'custom'
);


ALTER TYPE public."enum_Distributions_type" OWNER TO postgres;

--
-- Name: enum_Functions_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Functions_type" AS ENUM (
    'custom',
    'power'
);


ALTER TYPE public."enum_Functions_type" OWNER TO postgres;

--
-- Name: enum_KineticModifiers_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_KineticModifiers_type" AS ENUM (
    'activator',
    'inhibitor'
);


ALTER TYPE public."enum_KineticModifiers_type" OWNER TO postgres;

--
-- Name: enum_PKCompartments_cmp; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_PKCompartments_cmp" AS ENUM (
    'drug',
    'metabolite'
);


ALTER TYPE public."enum_PKCompartments_cmp" OWNER TO postgres;

--
-- Name: enum_PKCompartments_ext_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_PKCompartments_ext_type" AS ENUM (
    'in',
    'out'
);


ALTER TYPE public."enum_PKCompartments_ext_type" OWNER TO postgres;

--
-- Name: enum_PKCompartments_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_PKCompartments_type" AS ENUM (
    'int',
    'ext'
);


ALTER TYPE public."enum_PKCompartments_type" OWNER TO postgres;

--
-- Name: enum_PKCovariates_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_PKCovariates_type" AS ENUM (
    'body-weight',
    'age',
    'creatine',
    'custom'
);


ALTER TYPE public."enum_PKCovariates_type" OWNER TO postgres;

--
-- Name: enum_PKDosings_route; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_PKDosings_route" AS ENUM (
    'iv',
    'od'
);


ALTER TYPE public."enum_PKDosings_route" OWNER TO postgres;

--
-- Name: enum_PKDosings_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_PKDosings_type" AS ENUM (
    'single',
    'multiple',
    'custom'
);


ALTER TYPE public."enum_PKDosings_type" OWNER TO postgres;

--
-- Name: enum_PKParameters_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_PKParameters_type" AS ENUM (
    'fraction',
    'K',
    'volume',
    'dosing'
);


ALTER TYPE public."enum_PKParameters_type" OWNER TO postgres;

--
-- Name: enum_PKParameters_value_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_PKParameters_value_type" AS ENUM (
    'inst',
    'zero',
    'first',
    'mm'
);


ALTER TYPE public."enum_PKParameters_value_type" OWNER TO postgres;

--
-- Name: enum_PKPopulations_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_PKPopulations_type" AS ENUM (
    'body-weight',
    'age',
    'creatine',
    'custom'
);


ALTER TYPE public."enum_PKPopulations_type" OWNER TO postgres;

--
-- Name: enum_PKVariabilities_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_PKVariabilities_type" AS ENUM (
    'ind',
    'occ'
);


ALTER TYPE public."enum_PKVariabilities_type" OWNER TO postgres;

--
-- Name: enum_Reactions_boundary; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Reactions_boundary" AS ENUM (
    'sinks',
    'demands',
    'exchanges'
);


ALTER TYPE public."enum_Reactions_boundary" OWNER TO postgres;

--
-- Name: enum_Units_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Units_type" AS ENUM (
    'ampere',
    'candela',
    'dimentionless',
    'kilogram',
    'kelvin',
    'litre',
    'metre',
    'mole',
    'second'
);


ALTER TYPE public."enum_Units_type" OWNER TO postgres;

--
-- Name: enum_model_modeltype; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_model_modeltype AS ENUM (
    'boolean',
    'metabolic'
);


ALTER TYPE public.enum_model_modeltype OWNER TO postgres;

--
-- Name: enum_regulator_regulationtype; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_regulator_regulationtype AS ENUM (
    'POSITIVE',
    'NEGATIVE'
);


ALTER TYPE public.enum_regulator_regulationtype OWNER TO postgres;

--
-- Name: fn_get_basemodel_id(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_get_basemodel_id(prm_model_id bigint) RETURNS bigint
    LANGUAGE plpgsql
    AS $$
		DECLARE
				model_type VARCHAR(255) := null;
				rtn_model_id BIGINT := null;
		BEGIN
				model_type := (select modeltype from model where id=prm_model_id);
				if model_type = 'boolean' then
					rtn_model_id := (select mv.modelid
						from model_version mv 
						where mv.id = (select id from model_version where modelid = prm_model_id)
						order by mv.modelid, "version" asc limit 1
					);
				else
					rtn_model_id := prm_model_id;
					if model_type is null then
						rtn_model_id := null;
					end if;
				end if;
				return rtn_model_id;
		END;
		$$;


ALTER FUNCTION public.fn_get_basemodel_id(prm_model_id bigint) OWNER TO postgres;

--
-- Name: fn_get_original_lesson(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_get_original_lesson(prm_lesson_id bigint) RETURNS bigint
    LANGUAGE plpgsql IMMUTABLE PARALLEL SAFE
    AS $$
    DECLARE
        original_id bigint := null;
        tmp_lesson_id BIGINT := 0;
        curr_lesson record;
        stop boolean := false;
        lmt_end smallint := 0;
    BEGIN
        tmp_lesson_id := prm_lesson_id;
        IF (prm_lesson_id IS NULL OR prm_lesson_id < 1) THEN
          RETURN original_id;
        END IF;

        WHILE stop = false LOOP
        lmt_end := lmt_end +1;
        SELECT m2.id, m2.userid, m2.originid, m2j.userid as orig_user
        FROM model m2
        LEFT JOIN model m2j ON m2j.id = m2.originid
        WHERE m2.id = tmp_lesson_id and m2."type" = 'learning'
          INTO curr_lesson;

					IF curr_lesson.userid IS NULL THEN
						stop := true;
					END IF;

					-- Ensure both user and original exist
					IF (curr_lesson.orig_user IS NULL) THEN
						stop := true;
						original_id := curr_lesson.id;
					END IF;

          IF curr_lesson.userid = curr_lesson.orig_user THEN
              tmp_lesson_id := curr_lesson.originid;
            
							-- Check copy of the same teacher
							IF (select count(1) as t from authority a2 where a2.user_id = curr_lesson.userid and a2.role_id = 1) > 0 THEN
								stop := true;
								original_id := curr_lesson.id;
							END IF;
              
              -- Force stop to avoid overflow
              IF lmt_end > 25 THEN
                  stop := true;
									original_id := curr_lesson.id;
              END IF;
          ELSE
							-- Check if is teacher
              IF (select count(1) as t from authority a2 where a2.user_id = curr_lesson.userid and a2.role_id = 1) > 0 THEN
                original_id := curr_lesson.id;
              ELSE
                original_id := curr_lesson.originid;
                IF original_id IS NULL THEN
                    original_id := curr_lesson.id;
                END IF;
              END IF;       
              stop := true;
          END IF;
        END LOOP;

        RETURN original_id;
    END;
    $$;


ALTER FUNCTION public.fn_get_original_lesson(prm_lesson_id bigint) OWNER TO postgres;

--
-- Name: fn_get_test(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_get_test() RETURNS bigint
    LANGUAGE plpgsql
    AS $$
BEGIN
	return 9999991;
END;
$$;


ALTER FUNCTION public.fn_get_test() OWNER TO postgres;

--
-- Name: fn_latest_version(bigint, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_latest_version(mid bigint, mtype character varying) RETURNS bigint
    LANGUAGE plpgsql
    AS $$
		DECLARE
			rtn_id bigint = null;
		BEGIN
			if mtype = 'boolean' then	
				select modelid from model_version mv1
					where mv1.id = (select id from model_version mv2 where mv2.modelid = mid limit 1)
					order by mv1."version" desc limit 1 into rtn_id;
				end if;
			if rtn_id is null then
				return use_version(mid);
			end if;
			return rtn_id;
		END;
		$$;


ALTER FUNCTION public.fn_latest_version(mid bigint, mtype character varying) OWNER TO postgres;

--
-- Name: get_original_lesson(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_original_lesson(id bigint) RETURNS bigint
    LANGUAGE plpgsql IMMUTABLE
    AS $_$ DECLARE origin BIGINT; DECLARE role BIGINT; BEGIN 	SELECT INTO origin, role model.originid, authority.role_id FROM model INNER JOIN authority on model.userid = authority.user_id WHERE model.id=$1; 	RETURN CASE 		WHEN ((role = 2) and (origin IS NOT NULL)) THEN get_original_lesson(origin) 			ELSE $1 	END; END; $_$;


ALTER FUNCTION public.get_original_lesson(id bigint) OWNER TO postgres;

--
-- Name: get_original_model(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_original_model(id bigint) RETURNS bigint
    LANGUAGE plpgsql IMMUTABLE
    AS $_$ DECLARE origin BIGINT; BEGIN 	SELECT originid INTO origin FROM model WHERE model.id=$1; 		RETURN CASE 			WHEN origin IS NOT NULL THEN get_original_model(origin) 				ELSE $1 		END; 	END; $_$;


ALTER FUNCTION public.get_original_model(id bigint) OWNER TO postgres;

--
-- Name: is_json(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.is_json(character varying) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $_$        declare            x json;        begin            begin            x := $1;            exception when others then            return false;            end;            return true;        end;    $_$;


ALTER FUNCTION public.is_json(character varying) OWNER TO postgres;

--
-- Name: share_student_modelsbyname(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.share_student_modelsbyname(modelname text) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
	model_cursor CURSOR FOR SELECT * FROM model WHERE name = modelName;

	userId bigint := 3104; -- user id for cellcdev@gmail.com
	model_row model%ROWTYPE;
BEGIN
	FOR model_row IN model_cursor LOOP
		INSERT INTO model_share(id, access, creationdate, updatedate, userid, model_id)
			VALUES (nextval('model_share_id_seq'), 'ADMIN', current_timestamp, current_timestamp, userId, model_row.id)
            ON CONFLICT DO NOTHING;


			

			
			

		raise notice 'model id is %', model_row.id;
	END LOOP;

	RETURN true;
END
$$;


ALTER FUNCTION public.share_student_modelsbyname(modelname text) OWNER TO postgres;

--
-- Name: use_version(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.use_version(bigint) RETURNS bigint
    LANGUAGE sql
    AS $_$select modelid from model_version where id in (select id from model_version where modelid=$1) order by selected, version desc limit 1$_$;


ALTER FUNCTION public.use_version(bigint) OWNER TO postgres;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: definition; Type: TABLE; Schema: metadata; Owner: postgres
--

CREATE TABLE metadata.definition (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    type character varying(12) NOT NULL,
    visibleall boolean NOT NULL,
    range boolean,
    CONSTRAINT allowed_types CHECK (((type)::text = ANY (ARRAY[('Integer'::character varying)::text, ('Decimal'::character varying)::text, ('Text'::character varying)::text, ('Bool'::character varying)::text, ('Date'::character varying)::text, ('Attachment'::character varying)::text])))
);


ALTER TABLE metadata.definition OWNER TO postgres;

--
-- Name: definition_id_seq; Type: SEQUENCE; Schema: metadata; Owner: postgres
--

CREATE SEQUENCE metadata.definition_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE metadata.definition_id_seq OWNER TO postgres;

--
-- Name: entity_value; Type: TABLE; Schema: metadata; Owner: postgres
--

CREATE TABLE metadata.entity_value (
    entity_id bigint NOT NULL,
    value_id bigint NOT NULL
);


ALTER TABLE metadata.entity_value OWNER TO postgres;

--
-- Name: value; Type: TABLE; Schema: metadata; Owner: postgres
--

CREATE TABLE metadata.value (
    id bigint NOT NULL,
    definition_id bigint NOT NULL,
    updatedate timestamp without time zone NOT NULL,
    "position" integer
);


ALTER TABLE metadata.value OWNER TO postgres;

--
-- Name: value_attachment; Type: TABLE; Schema: metadata; Owner: postgres
--

CREATE TABLE metadata.value_attachment (
    value_id bigint NOT NULL,
    value bigint
);


ALTER TABLE metadata.value_attachment OWNER TO postgres;

--
-- Name: value_bool; Type: TABLE; Schema: metadata; Owner: postgres
--

CREATE TABLE metadata.value_bool (
    value_id bigint NOT NULL,
    value boolean
);


ALTER TABLE metadata.value_bool OWNER TO postgres;

--
-- Name: value_date; Type: TABLE; Schema: metadata; Owner: postgres
--

CREATE TABLE metadata.value_date (
    value_id bigint NOT NULL,
    value timestamp with time zone
);


ALTER TABLE metadata.value_date OWNER TO postgres;

--
-- Name: value_decimal; Type: TABLE; Schema: metadata; Owner: postgres
--

CREATE TABLE metadata.value_decimal (
    value_id bigint NOT NULL,
    value double precision
);


ALTER TABLE metadata.value_decimal OWNER TO postgres;

--
-- Name: value_integer; Type: TABLE; Schema: metadata; Owner: postgres
--

CREATE TABLE metadata.value_integer (
    value_id bigint NOT NULL,
    value integer
);


ALTER TABLE metadata.value_integer OWNER TO postgres;

--
-- Name: value_text; Type: TABLE; Schema: metadata; Owner: postgres
--

CREATE TABLE metadata.value_text (
    value_id bigint NOT NULL,
    value text
);


ALTER TABLE metadata.value_text OWNER TO postgres;

--
-- Name: entity_metadata_view; Type: VIEW; Schema: metadata; Owner: postgres
--

CREATE VIEW metadata.entity_metadata_view AS
 SELECT v.id,
    ev.entity_id,
    v.definition_id,
    v."position",
    d.visibleall,
    d.range,
        CASE d.type
            WHEN 'Integer'::text THEN 1
            WHEN 'Bool'::text THEN 2
            WHEN 'Decimal'::text THEN 3
            WHEN 'Text'::text THEN 4
            WHEN 'Date'::text THEN 5
            WHEN 'Attachment'::text THEN 6
            ELSE NULL::integer
        END AS index,
        CASE d.type
            WHEN 'Integer'::text THEN ( SELECT sv.value
               FROM metadata.value_integer sv
              WHERE (v.id = sv.value_id))
            ELSE NULL::integer
        END AS value_int,
        CASE d.type
            WHEN 'Bool'::text THEN ( SELECT sv.value
               FROM metadata.value_bool sv
              WHERE (v.id = sv.value_id))
            ELSE NULL::boolean
        END AS value_bool,
        CASE d.type
            WHEN 'Decimal'::text THEN ( SELECT sv.value
               FROM metadata.value_decimal sv
              WHERE (v.id = sv.value_id))
            ELSE NULL::double precision
        END AS value_decimal,
        CASE d.type
            WHEN 'Text'::text THEN ( SELECT sv.value
               FROM metadata.value_text sv
              WHERE (v.id = sv.value_id))
            ELSE NULL::text
        END AS value_text,
        CASE d.type
            WHEN 'Date'::text THEN ( SELECT sv.value
               FROM metadata.value_date sv
              WHERE (v.id = sv.value_id))
            ELSE NULL::timestamp with time zone
        END AS value_date,
        CASE d.type
            WHEN 'Attachment'::text THEN ( SELECT sv.value
               FROM metadata.value_attachment sv
              WHERE (v.id = sv.value_id))
            ELSE NULL::bigint
        END AS value_attachment
   FROM ((metadata.value v
     JOIN metadata.definition d ON ((v.definition_id = d.id)))
     JOIN metadata.entity_value ev ON ((ev.value_id = v.id)));


ALTER TABLE metadata.entity_metadata_view OWNER TO postgres;

--
-- Name: metadata_range_view; Type: VIEW; Schema: metadata; Owner: postgres
--

CREATE VIEW metadata.metadata_range_view AS
 SELECT v.id,
    v.definition_id,
    v."position",
        CASE d.type
            WHEN 'Integer'::text THEN 1
            WHEN 'Bool'::text THEN 2
            WHEN 'Decimal'::text THEN 3
            WHEN 'Text'::text THEN 4
            WHEN 'Date'::text THEN 5
            WHEN 'Attachment'::text THEN 6
            ELSE NULL::integer
        END AS index,
        CASE d.type
            WHEN 'Integer'::text THEN ( SELECT sv.value
               FROM metadata.value_integer sv
              WHERE (v.id = sv.value_id))
            ELSE NULL::integer
        END AS value_int,
        CASE d.type
            WHEN 'Bool'::text THEN ( SELECT sv.value
               FROM metadata.value_bool sv
              WHERE (v.id = sv.value_id))
            ELSE NULL::boolean
        END AS value_bool,
        CASE d.type
            WHEN 'Decimal'::text THEN ( SELECT sv.value
               FROM metadata.value_decimal sv
              WHERE (v.id = sv.value_id))
            ELSE NULL::double precision
        END AS value_decimal,
        CASE d.type
            WHEN 'Text'::text THEN ( SELECT sv.value
               FROM metadata.value_text sv
              WHERE (v.id = sv.value_id))
            ELSE NULL::text
        END AS value_text,
        CASE d.type
            WHEN 'Date'::text THEN ( SELECT sv.value
               FROM metadata.value_date sv
              WHERE (v.id = sv.value_id))
            ELSE NULL::timestamp with time zone
        END AS value_date,
        CASE d.type
            WHEN 'Attachment'::text THEN ( SELECT sv.value
               FROM metadata.value_attachment sv
              WHERE (v.id = sv.value_id))
            ELSE NULL::bigint
        END AS value_attachment
   FROM (metadata.value v
     JOIN metadata.definition d ON (((v.definition_id = d.id) AND (d.range = true))));


ALTER TABLE metadata.metadata_range_view OWNER TO postgres;

--
-- Name: value_id_seq; Type: SEQUENCE; Schema: metadata; Owner: postgres
--

CREATE SEQUENCE metadata.value_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE metadata.value_id_seq OWNER TO postgres;

--
-- Name: AccountPlans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AccountPlans" (
    id integer NOT NULL,
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    name character varying(255),
    length character varying(255),
    cost numeric(15,2),
    permissions json,
    "studentRange" integer,
    "noOfStudentAccount" integer,
    domain character varying(11),
    features jsonb
);


ALTER TABLE public."AccountPlans" OWNER TO postgres;

--
-- Name: AccountPlans_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."AccountPlans_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."AccountPlans_id_seq" OWNER TO postgres;

--
-- Name: AccountPlans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."AccountPlans_id_seq" OWNED BY public."AccountPlans".id;


--
-- Name: AclRules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AclRules" (
    id integer NOT NULL,
    rules character varying(255)[]
);


ALTER TABLE public."AclRules" OWNER TO postgres;

--
-- Name: AclRules_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."AclRules_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."AclRules_id_seq" OWNER TO postgres;

--
-- Name: AclRules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."AclRules_id_seq" OWNED BY public."AclRules".id;


--
-- Name: Annotations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Annotations" (
    id integer NOT NULL,
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    source character varying(255),
    annotations character varying(255)[],
    "ModelVersionId" bigint,
    "CompartmentId" integer,
    "ConstraintBasedModelId" integer,
    "GeneId" integer,
    "MetaboliteId" integer,
    "ReactionId" integer,
    "KineticModelId" bigint[]
);


ALTER TABLE public."Annotations" OWNER TO postgres;

--
-- Name: Annotations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Annotations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Annotations_id_seq" OWNER TO postgres;

--
-- Name: Annotations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Annotations_id_seq" OWNED BY public."Annotations".id;


--
-- Name: CompartmentSpecies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CompartmentSpecies" (
    "CompartmentId" integer NOT NULL,
    "SpeciesId" bigint NOT NULL
);


ALTER TABLE public."CompartmentSpecies" OWNER TO postgres;

--
-- Name: Compartments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Compartments" (
    id integer NOT NULL,
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    "compartmentId" character varying(255),
    name character varying(255)
);


ALTER TABLE public."Compartments" OWNER TO postgres;

--
-- Name: Compartments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Compartments_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Compartments_id_seq" OWNER TO postgres;

--
-- Name: Compartments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Compartments_id_seq" OWNED BY public."Compartments".id;


--
-- Name: ConstraintBasedModels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ConstraintBasedModels" (
    id integer NOT NULL,
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    "ModelVersionId" bigint
);


ALTER TABLE public."ConstraintBasedModels" OWNER TO postgres;

--
-- Name: ConstraintBasedModels_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ConstraintBasedModels_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ConstraintBasedModels_id_seq" OWNER TO postgres;

--
-- Name: ConstraintBasedModels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ConstraintBasedModels_id_seq" OWNED BY public."ConstraintBasedModels".id;


--
-- Name: ContentModel; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ContentModel" (
    id bigint NOT NULL,
    "sectionModelId" bigint,
    flagged boolean,
    text text,
    "position" integer,
    creationdate timestamp with time zone,
    creationuser bigint,
    updatedate timestamp with time zone,
    updateuser bigint,
    "_deletedBy" integer,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false
);


ALTER TABLE public."ContentModel" OWNER TO postgres;

--
-- Name: ContentModelReference; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ContentModelReference" (
    id bigint NOT NULL,
    creationdate timestamp with time zone NOT NULL,
    creationuser bigint,
    "position" integer NOT NULL,
    content_id bigint NOT NULL,
    reference_id bigint NOT NULL,
    datatype character varying(255),
    citationtype character varying(255)
);


ALTER TABLE public."ContentModelReference" OWNER TO postgres;

--
-- Name: ContentModel_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ContentModel_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ContentModel_id_seq" OWNER TO postgres;

--
-- Name: ContentModel_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ContentModel_id_seq" OWNED BY public."ContentModel".id;


--
-- Name: ContentReactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ContentReactions" (
    id bigint NOT NULL,
    "sectionReactionId" bigint,
    flagged boolean,
    text text,
    "position" integer,
    creationdate timestamp with time zone,
    creationuser bigint,
    updatedate timestamp with time zone,
    updateuser bigint,
    "_deletedBy" integer,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false
);


ALTER TABLE public."ContentReactions" OWNER TO postgres;

--
-- Name: ContentReactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ContentReactions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ContentReactions_id_seq" OWNER TO postgres;

--
-- Name: ContentReactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ContentReactions_id_seq" OWNED BY public."ContentReactions".id;


--
-- Name: Countries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Countries" (
    id integer NOT NULL,
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    name character varying(255) NOT NULL,
    abbreviation character varying(255),
    "CurrencyId" integer
);


ALTER TABLE public."Countries" OWNER TO postgres;

--
-- Name: Countries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Countries_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Countries_id_seq" OWNER TO postgres;

--
-- Name: Countries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Countries_id_seq" OWNED BY public."Countries".id;


--
-- Name: CountryLanguages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CountryLanguages" (
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    "CountryId" integer NOT NULL,
    "LanguageId" integer NOT NULL
);


ALTER TABLE public."CountryLanguages" OWNER TO postgres;

--
-- Name: Courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Courses" (
    id integer NOT NULL,
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    title character varying(60) NOT NULL,
    description character varying(255),
    "startDate" timestamp with time zone,
    "endDate" timestamp with time zone,
    published boolean,
    "codeKey" character varying(60),
    domain character varying(255) DEFAULT 'learning'::character varying
);


ALTER TABLE public."Courses" OWNER TO postgres;

--
-- Name: Courses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Courses_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Courses_id_seq" OWNER TO postgres;

--
-- Name: Courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Courses_id_seq" OWNED BY public."Courses".id;


--
-- Name: Currencies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Currencies" (
    id integer NOT NULL,
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    name character varying(255) NOT NULL,
    symbol character varying(255)
);


ALTER TABLE public."Currencies" OWNER TO postgres;

--
-- Name: Currencies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Currencies_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Currencies_id_seq" OWNER TO postgres;

--
-- Name: Currencies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Currencies_id_seq" OWNED BY public."Currencies".id;


--
-- Name: Distributions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Distributions" (
    id integer NOT NULL,
    "_createdBy" integer,
    "_createdAt" timestamp with time zone,
    "_updatedBy" integer,
    "_updatedAt" timestamp with time zone,
    "_deletedBy" integer,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    name text,
    type public."enum_Distributions_type",
    parameters jsonb
);


ALTER TABLE public."Distributions" OWNER TO postgres;

--
-- Name: Distributions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Distributions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Distributions_id_seq" OWNER TO postgres;

--
-- Name: Distributions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Distributions_id_seq" OWNED BY public."Distributions".id;


--
-- Name: DrugEnvironments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."DrugEnvironments" (
    id bigint NOT NULL,
    name character varying(60),
    "isDefault" boolean,
    "position" integer,
    "ConstraintBasedModelId" bigint,
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false
);


ALTER TABLE public."DrugEnvironments" OWNER TO postgres;

--
-- Name: DrugEnvironments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."DrugEnvironments_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."DrugEnvironments_id_seq" OWNER TO postgres;

--
-- Name: DrugEnvironments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."DrugEnvironments_id_seq" OWNED BY public."DrugEnvironments".id;


--
-- Name: Functions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Functions" (
    id integer NOT NULL,
    "_createdBy" integer,
    "_createdAt" timestamp with time zone,
    "_updatedBy" integer,
    "_updatedAt" timestamp with time zone,
    "_deletedBy" integer,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    name text,
    type public."enum_Functions_type",
    formula text,
    parameters jsonb
);


ALTER TABLE public."Functions" OWNER TO postgres;

--
-- Name: Functions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Functions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Functions_id_seq" OWNER TO postgres;

--
-- Name: Functions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Functions_id_seq" OWNED BY public."Functions".id;


--
-- Name: GeneConstraintBasedModel; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."GeneConstraintBasedModel" (
    "ConstraintBasedModelId" integer NOT NULL,
    "GeneId" integer NOT NULL
);


ALTER TABLE public."GeneConstraintBasedModel" OWNER TO postgres;

--
-- Name: Genes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Genes" (
    id integer NOT NULL,
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    "SpeciesId" bigint,
    "position" integer
);


ALTER TABLE public."Genes" OWNER TO postgres;

--
-- Name: Genes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Genes_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Genes_id_seq" OWNER TO postgres;

--
-- Name: Genes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Genes_id_seq" OWNED BY public."Genes".id;


--
-- Name: Institutions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Institutions" (
    id integer NOT NULL,
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    name character varying(255) NOT NULL,
    category character varying(25),
    city character varying(255),
    country character varying(255),
    state character varying(255),
    domains character varying(255)[],
    websites character varying(255)[],
    "CountryId" integer[]
);


ALTER TABLE public."Institutions" OWNER TO postgres;

--
-- Name: Institutions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Institutions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Institutions_id_seq" OWNER TO postgres;

--
-- Name: Institutions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Institutions_id_seq" OWNED BY public."Institutions".id;


--
-- Name: KineticBasedModels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."KineticBasedModels" (
    id integer NOT NULL,
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    "BaseModelId" bigint
);


ALTER TABLE public."KineticBasedModels" OWNER TO postgres;

--
-- Name: KineticBasedModels_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."KineticBasedModels_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."KineticBasedModels_id_seq" OWNER TO postgres;

--
-- Name: KineticBasedModels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."KineticBasedModels_id_seq" OWNED BY public."KineticBasedModels".id;


--
-- Name: KineticCompartments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."KineticCompartments" (
    id integer NOT NULL,
    name text,
    "_createdBy" integer,
    "_createdAt" timestamp with time zone,
    "_updatedBy" integer,
    "_updatedAt" timestamp with time zone,
    "_deletedBy" integer,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    size double precision,
    "KineticModelId" integer
);


ALTER TABLE public."KineticCompartments" OWNER TO postgres;

--
-- Name: KineticCompartments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."KineticCompartments_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."KineticCompartments_id_seq" OWNER TO postgres;

--
-- Name: KineticCompartments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."KineticCompartments_id_seq" OWNED BY public."KineticCompartments".id;


--
-- Name: KineticGlobalParams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."KineticGlobalParams" (
    id integer NOT NULL,
    "_createdBy" integer,
    "_createdAt" timestamp with time zone,
    "_updatedBy" integer,
    "_updatedAt" timestamp with time zone,
    "_deletedBy" integer,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    name character varying(255),
    parameter_id character varying(255),
    value double precision,
    unit_definition_id integer,
    "KineticModelId" integer NOT NULL
);


ALTER TABLE public."KineticGlobalParams" OWNER TO postgres;

--
-- Name: KineticGlobalParams_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."KineticGlobalParams_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."KineticGlobalParams_id_seq" OWNER TO postgres;

--
-- Name: KineticGlobalParams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."KineticGlobalParams_id_seq" OWNED BY public."KineticGlobalParams".id;


--
-- Name: KineticLawTypes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."KineticLawTypes" (
    id integer NOT NULL,
    type character varying(255) NOT NULL
);


ALTER TABLE public."KineticLawTypes" OWNER TO postgres;

--
-- Name: KineticLawTypes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."KineticLawTypes_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."KineticLawTypes_id_seq" OWNER TO postgres;

--
-- Name: KineticLawTypes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."KineticLawTypes_id_seq" OWNED BY public."KineticLawTypes".id;


--
-- Name: KineticLaws; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."KineticLaws" (
    id integer NOT NULL,
    "_createdBy" integer,
    "_createdAt" timestamp with time zone,
    "_updatedBy" integer,
    "_updatedAt" timestamp with time zone,
    "_deletedBy" integer,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    formula text,
    "KineticReactionId" integer NOT NULL,
    "KineticLawTypeId" integer NOT NULL,
    description character varying(255),
    "numSubstrates" boolean,
    "numProducts" boolean
);


ALTER TABLE public."KineticLaws" OWNER TO postgres;

--
-- Name: KineticLaws_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."KineticLaws_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."KineticLaws_id_seq" OWNER TO postgres;

--
-- Name: KineticLaws_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."KineticLaws_id_seq" OWNED BY public."KineticLaws".id;


--
-- Name: KineticLocalParams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."KineticLocalParams" (
    id integer NOT NULL,
    "_createdBy" integer,
    "_createdAt" timestamp with time zone,
    "_updatedBy" integer,
    "_updatedAt" timestamp with time zone,
    "_deletedBy" integer,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    name character varying(255),
    value double precision,
    "KineticLawId" integer NOT NULL,
    unit_definition_id bigint
);


ALTER TABLE public."KineticLocalParams" OWNER TO postgres;

--
-- Name: KineticLocalParams_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."KineticLocalParams_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."KineticLocalParams_id_seq" OWNER TO postgres;

--
-- Name: KineticLocalParams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."KineticLocalParams_id_seq" OWNED BY public."KineticLocalParams".id;


--
-- Name: KineticModels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."KineticModels" (
    id integer NOT NULL,
    name text,
    "_createdBy" integer,
    "_createdAt" timestamp with time zone,
    "_updatedBy" integer,
    "_updatedAt" timestamp with time zone,
    "_deletedBy" integer,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    "ModelVersionId" bigint NOT NULL
);


ALTER TABLE public."KineticModels" OWNER TO postgres;

--
-- Name: KineticModels_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."KineticModels_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."KineticModels_id_seq" OWNER TO postgres;

--
-- Name: KineticModels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."KineticModels_id_seq" OWNED BY public."KineticModels".id;


--
-- Name: KineticModifiers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."KineticModifiers" (
    id integer NOT NULL,
    "KineticReactionId" integer NOT NULL,
    "KineticSpeciesId" integer NOT NULL,
    type public."enum_KineticModifiers_type"
);


ALTER TABLE public."KineticModifiers" OWNER TO postgres;

--
-- Name: KineticModifiers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."KineticModifiers_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."KineticModifiers_id_seq" OWNER TO postgres;

--
-- Name: KineticModifiers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."KineticModifiers_id_seq" OWNED BY public."KineticModifiers".id;


--
-- Name: KineticProducts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."KineticProducts" (
    id integer NOT NULL,
    "KineticReactionId" integer NOT NULL,
    "KineticSpeciesId" integer NOT NULL,
    stoichiometry integer
);


ALTER TABLE public."KineticProducts" OWNER TO postgres;

--
-- Name: KineticProducts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."KineticProducts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."KineticProducts_id_seq" OWNER TO postgres;

--
-- Name: KineticProducts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."KineticProducts_id_seq" OWNED BY public."KineticProducts".id;


--
-- Name: KineticReactants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."KineticReactants" (
    id integer NOT NULL,
    "KineticReactionId" integer NOT NULL,
    "KineticSpeciesId" integer NOT NULL,
    stoichiometry integer
);


ALTER TABLE public."KineticReactants" OWNER TO postgres;

--
-- Name: KineticReactants_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."KineticReactants_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."KineticReactants_id_seq" OWNER TO postgres;

--
-- Name: KineticReactants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."KineticReactants_id_seq" OWNED BY public."KineticReactants".id;


--
-- Name: KineticReactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."KineticReactions" (
    id integer NOT NULL,
    reaction_id text,
    name text,
    "_createdBy" integer,
    "_createdAt" timestamp with time zone,
    "_updatedBy" integer,
    "_updatedAt" timestamp with time zone,
    "_deletedBy" integer,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    "KineticModelId" integer,
    reversible boolean
);


ALTER TABLE public."KineticReactions" OWNER TO postgres;

--
-- Name: KineticReactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."KineticReactions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."KineticReactions_id_seq" OWNER TO postgres;

--
-- Name: KineticReactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."KineticReactions_id_seq" OWNED BY public."KineticReactions".id;


--
-- Name: KineticSpecies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."KineticSpecies" (
    id integer NOT NULL,
    species_id character varying(255),
    name character varying(255),
    "_createdBy" integer,
    "_createdAt" timestamp with time zone,
    "_updatedBy" integer,
    "_updatedAt" timestamp with time zone,
    "_deletedBy" integer,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    initial_concentration double precision,
    "KineticCompartmentId" integer NOT NULL,
    "KineticModelId" integer,
    unit_definition_id bigint
);


ALTER TABLE public."KineticSpecies" OWNER TO postgres;

--
-- Name: KineticSpecies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."KineticSpecies_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."KineticSpecies_id_seq" OWNER TO postgres;

--
-- Name: KineticSpecies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."KineticSpecies_id_seq" OWNED BY public."KineticSpecies".id;


--
-- Name: KineticUnits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."KineticUnits" (
    id integer NOT NULL,
    "KineticModelId" integer NOT NULL,
    "UnitDefinitionId" integer NOT NULL
);


ALTER TABLE public."KineticUnits" OWNER TO postgres;

--
-- Name: KineticUnits_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."KineticUnits_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."KineticUnits_id_seq" OWNER TO postgres;

--
-- Name: KineticUnits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."KineticUnits_id_seq" OWNED BY public."KineticUnits".id;


--
-- Name: Languages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Languages" (
    id integer NOT NULL,
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    name character varying(255) NOT NULL,
    code character varying(255),
    "nativeName" character varying(255)
);


ALTER TABLE public."Languages" OWNER TO postgres;

--
-- Name: Languages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Languages_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Languages_id_seq" OWNER TO postgres;

--
-- Name: Languages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Languages_id_seq" OWNED BY public."Languages".id;


--
-- Name: LearningObjective; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."LearningObjective" (
    id bigint NOT NULL,
    "versionId" bigint NOT NULL,
    version integer NOT NULL,
    "valueRefId" bigint DEFAULT 0,
    "valueId" bigint,
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."LearningObjective" OWNER TO postgres;

--
-- Name: LearningObjectiveAssocs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."LearningObjectiveAssocs" (
    id integer NOT NULL,
    origin integer,
    sub integer,
    modelid bigint
);


ALTER TABLE public."LearningObjectiveAssocs" OWNER TO postgres;

--
-- Name: LearningObjectiveAssocs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."LearningObjectiveAssocs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."LearningObjectiveAssocs_id_seq" OWNER TO postgres;

--
-- Name: LearningObjectiveAssocs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."LearningObjectiveAssocs_id_seq" OWNED BY public."LearningObjectiveAssocs".id;


--
-- Name: LearningObjective_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."LearningObjective_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."LearningObjective_id_seq" OWNER TO postgres;

--
-- Name: LearningObjective_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."LearningObjective_id_seq" OWNED BY public."LearningObjective".id;


--
-- Name: MetaboliteConstraintBasedModel; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MetaboliteConstraintBasedModel" (
    "ConstraintBasedModelId" integer NOT NULL,
    "MetaboliteId" integer NOT NULL
);


ALTER TABLE public."MetaboliteConstraintBasedModel" OWNER TO postgres;

--
-- Name: Metabolites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Metabolites" (
    id integer NOT NULL,
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    name character varying(255),
    formula character varying(255),
    charge integer,
    "KineticBasedModelId" integer,
    "CompartmentId" integer,
    "SpeciesId" bigint
);


ALTER TABLE public."Metabolites" OWNER TO postgres;

--
-- Name: Metabolites_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Metabolites_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Metabolites_id_seq" OWNER TO postgres;

--
-- Name: Metabolites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Metabolites_id_seq" OWNED BY public."Metabolites".id;


--
-- Name: ModelContext; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ModelContext" (
    id bigint NOT NULL,
    "contextType" character varying(10) NOT NULL,
    "modelId" bigint,
    "modelOriginId" bigint,
    uploads jsonb,
    downloads jsonb,
    settings jsonb NOT NULL,
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false
);


ALTER TABLE public."ModelContext" OWNER TO postgres;

--
-- Name: ModelContextData; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ModelContextData" (
    id bigint NOT NULL,
    "modelContextId" bigint,
    "dataType" character varying(35),
    data jsonb,
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false
);


ALTER TABLE public."ModelContextData" OWNER TO postgres;

--
-- Name: ModelContextData_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ModelContextData_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ModelContextData_id_seq" OWNER TO postgres;

--
-- Name: ModelContextData_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ModelContextData_id_seq" OWNED BY public."ModelContextData".id;


--
-- Name: ModelContext_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ModelContext_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ModelContext_id_seq" OWNER TO postgres;

--
-- Name: ModelContext_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ModelContext_id_seq" OWNED BY public."ModelContext".id;


--
-- Name: ModelCourse; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ModelCourse" (
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    "CourseId" integer NOT NULL,
    "ModelId" bigint NOT NULL,
    "BaseModelId" bigint,
    "prevId" bigint
);


ALTER TABLE public."ModelCourse" OWNER TO postgres;

--
-- Name: ModelStartedLesson; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ModelStartedLesson" (
    id bigint NOT NULL,
    "modelId" bigint,
    "courseId" bigint,
    canceled smallint DEFAULT 0,
    "canceledMsg" character varying(200),
    submitted boolean DEFAULT false,
    "submittedAt" timestamp with time zone,
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false
);


ALTER TABLE public."ModelStartedLesson" OWNER TO postgres;

--
-- Name: ModelStartedLesson_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ModelStartedLesson_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ModelStartedLesson_id_seq" OWNER TO postgres;

--
-- Name: ModelStartedLesson_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ModelStartedLesson_id_seq" OWNED BY public."ModelStartedLesson".id;


--
-- Name: Modules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Modules" (
    id integer NOT NULL,
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    "BaseModelId" bigint
);


ALTER TABLE public."Modules" OWNER TO postgres;

--
-- Name: Modules_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Modules_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Modules_id_seq" OWNER TO postgres;

--
-- Name: Modules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Modules_id_seq" OWNED BY public."Modules".id;


--
-- Name: MultiscaleModels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MultiscaleModels" (
    id integer NOT NULL,
    "_createdBy" integer,
    "_createdAt" timestamp with time zone,
    "_updatedBy" integer,
    "_updatedAt" timestamp with time zone,
    "_deletedBy" integer,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    "ModelVersionId" bigint NOT NULL
);


ALTER TABLE public."MultiscaleModels" OWNER TO postgres;

--
-- Name: MultiscaleModels_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."MultiscaleModels_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."MultiscaleModels_id_seq" OWNER TO postgres;

--
-- Name: MultiscaleModels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."MultiscaleModels_id_seq" OWNED BY public."MultiscaleModels".id;


--
-- Name: MultiscaleTemplateFilePaths; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MultiscaleTemplateFilePaths" (
    id integer NOT NULL,
    config character varying(255),
    "logicalModel" character varying(255),
    "logicalModelMapping" character varying(255),
    "cbmModel" character varying(255),
    "cbmModelMapping" character varying(255),
    "MultiscaleModelId" bigint,
    "_createdBy" integer,
    "_createdAt" timestamp with time zone,
    "_updatedBy" integer,
    "_updatedAt" timestamp with time zone,
    "_deletedBy" integer,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false
);


ALTER TABLE public."MultiscaleTemplateFilePaths" OWNER TO postgres;

--
-- Name: MultiscaleTemplateFilePaths_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."MultiscaleTemplateFilePaths_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."MultiscaleTemplateFilePaths_id_seq" OWNER TO postgres;

--
-- Name: MultiscaleTemplateFilePaths_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."MultiscaleTemplateFilePaths_id_seq" OWNED BY public."MultiscaleTemplateFilePaths".id;


--
-- Name: ObjectiveFunctions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ObjectiveFunctions" (
    id integer NOT NULL,
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    name character varying(255),
    "ConstraintBasedModelId" integer
);


ALTER TABLE public."ObjectiveFunctions" OWNER TO postgres;

--
-- Name: ObjectiveFunctions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ObjectiveFunctions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ObjectiveFunctions_id_seq" OWNER TO postgres;

--
-- Name: ObjectiveFunctions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ObjectiveFunctions_id_seq" OWNED BY public."ObjectiveFunctions".id;


--
-- Name: ObjectiveReactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ObjectiveReactions" (
    id integer NOT NULL,
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    coefficient double precision DEFAULT '1'::double precision,
    "ObjectiveFunctionId" integer,
    "ReactionId" integer
);


ALTER TABLE public."ObjectiveReactions" OWNER TO postgres;

--
-- Name: ObjectiveReactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ObjectiveReactions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ObjectiveReactions_id_seq" OWNER TO postgres;

--
-- Name: ObjectiveReactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ObjectiveReactions_id_seq" OWNED BY public."ObjectiveReactions".id;


--
-- Name: PKCompartments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PKCompartments" (
    id integer NOT NULL,
    "_createdBy" integer,
    "_createdAt" timestamp with time zone,
    "_updatedBy" integer,
    "_updatedAt" timestamp with time zone,
    "_deletedBy" integer,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    name text,
    type public."enum_PKCompartments_type",
    cmp public."enum_PKCompartments_cmp",
    ext_type public."enum_PKCompartments_ext_type",
    "PharmacokineticModelId" bigint
);


ALTER TABLE public."PKCompartments" OWNER TO postgres;

--
-- Name: PKCompartments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."PKCompartments_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."PKCompartments_id_seq" OWNER TO postgres;

--
-- Name: PKCompartments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."PKCompartments_id_seq" OWNED BY public."PKCompartments".id;


--
-- Name: PKCovariates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PKCovariates" (
    id integer NOT NULL,
    "_createdBy" integer,
    "_createdAt" timestamp with time zone,
    "_updatedBy" integer,
    "_updatedAt" timestamp with time zone,
    "_deletedBy" integer,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    name text,
    type public."enum_PKCovariates_type",
    function_id bigint,
    parameter_id bigint
);


ALTER TABLE public."PKCovariates" OWNER TO postgres;

--
-- Name: PKCovariates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."PKCovariates_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."PKCovariates_id_seq" OWNER TO postgres;

--
-- Name: PKCovariates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."PKCovariates_id_seq" OWNED BY public."PKCovariates".id;


--
-- Name: PKDosings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PKDosings" (
    id integer NOT NULL,
    "_createdBy" integer,
    "_createdAt" timestamp with time zone,
    "_updatedBy" integer,
    "_updatedAt" timestamp with time zone,
    "_deletedBy" integer,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    type public."enum_PKDosings_type",
    route public."enum_PKDosings_route",
    amount double precision,
    duration double precision,
    "interval" double precision,
    parameter_id bigint
);


ALTER TABLE public."PKDosings" OWNER TO postgres;

--
-- Name: PKDosings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."PKDosings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."PKDosings_id_seq" OWNER TO postgres;

--
-- Name: PKDosings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."PKDosings_id_seq" OWNED BY public."PKDosings".id;


--
-- Name: PKParameters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PKParameters" (
    id integer NOT NULL,
    "_createdBy" integer,
    "_createdAt" timestamp with time zone,
    "_updatedBy" integer,
    "_updatedAt" timestamp with time zone,
    "_deletedBy" integer,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    name text,
    type public."enum_PKParameters_type",
    value double precision,
    value_type public."enum_PKParameters_value_type",
    "PKCompartmentId" bigint,
    "PKRateId" bigint
);


ALTER TABLE public."PKParameters" OWNER TO postgres;

--
-- Name: PKParameters_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."PKParameters_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."PKParameters_id_seq" OWNER TO postgres;

--
-- Name: PKParameters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."PKParameters_id_seq" OWNED BY public."PKParameters".id;


--
-- Name: PKPopulations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PKPopulations" (
    id integer NOT NULL,
    "_createdBy" integer,
    "_createdAt" timestamp with time zone,
    "_updatedBy" integer,
    "_updatedAt" timestamp with time zone,
    "_deletedBy" integer,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    name text,
    type public."enum_PKPopulations_type",
    distribution_id bigint,
    "PharmacokineticModelId" bigint
);


ALTER TABLE public."PKPopulations" OWNER TO postgres;

--
-- Name: PKPopulations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."PKPopulations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."PKPopulations_id_seq" OWNER TO postgres;

--
-- Name: PKPopulations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."PKPopulations_id_seq" OWNED BY public."PKPopulations".id;


--
-- Name: PKRates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PKRates" (
    id integer NOT NULL,
    "_createdBy" integer,
    "_createdAt" timestamp with time zone,
    "_updatedBy" integer,
    "_updatedAt" timestamp with time zone,
    "_deletedBy" integer,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    name text,
    from_compartment_id bigint NOT NULL,
    to_compartment_id bigint NOT NULL,
    "PharmacokineticModelId" bigint
);


ALTER TABLE public."PKRates" OWNER TO postgres;

--
-- Name: PKRates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."PKRates_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."PKRates_id_seq" OWNER TO postgres;

--
-- Name: PKRates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."PKRates_id_seq" OWNED BY public."PKRates".id;


--
-- Name: PKVariabilities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PKVariabilities" (
    id integer NOT NULL,
    "_createdBy" integer,
    "_createdAt" timestamp with time zone,
    "_updatedBy" integer,
    "_updatedAt" timestamp with time zone,
    "_deletedBy" integer,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    type public."enum_PKVariabilities_type",
    distribution_id bigint,
    parameter_id bigint
);


ALTER TABLE public."PKVariabilities" OWNER TO postgres;

--
-- Name: PKVariabilities_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."PKVariabilities_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."PKVariabilities_id_seq" OWNER TO postgres;

--
-- Name: PKVariabilities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."PKVariabilities_id_seq" OWNED BY public."PKVariabilities".id;


--
-- Name: PageModel; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PageModel" (
    id bigint NOT NULL,
    "reactionId" bigint,
    "geneId" bigint,
    "speciesId" bigint,
    "metaboliteId" bigint,
    "compartmentId" bigint,
    "ModelVersionId" bigint,
    creationdate timestamp with time zone,
    creationuser bigint,
    updatedate timestamp with time zone,
    updateuser bigint,
    "_deletedBy" integer,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false
);


ALTER TABLE public."PageModel" OWNER TO postgres;

--
-- Name: PageModelReference; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PageModelReference" (
    id bigint NOT NULL,
    "pageModelId" bigint NOT NULL,
    "referenceId" bigint NOT NULL,
    creationdate timestamp with time zone,
    creationuser bigint,
    "_deletedBy" integer,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false
);


ALTER TABLE public."PageModelReference" OWNER TO postgres;

--
-- Name: PageModelReference_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."PageModelReference_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."PageModelReference_id_seq" OWNER TO postgres;

--
-- Name: PageModelReference_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."PageModelReference_id_seq" OWNED BY public."PageModelReference".id;


--
-- Name: PageModel_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."PageModel_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."PageModel_id_seq" OWNER TO postgres;

--
-- Name: PageModel_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."PageModel_id_seq" OWNED BY public."PageModel".id;


--
-- Name: PageReactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PageReactions" (
    id bigint NOT NULL,
    "reactionId" bigint NOT NULL,
    creationdate timestamp with time zone,
    creationuser bigint,
    updatedate timestamp with time zone,
    updateuser bigint,
    "_deletedBy" integer,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false
);


ALTER TABLE public."PageReactions" OWNER TO postgres;

--
-- Name: PageReactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."PageReactions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."PageReactions_id_seq" OWNER TO postgres;

--
-- Name: PageReactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."PageReactions_id_seq" OWNED BY public."PageReactions".id;


--
-- Name: PharmacokineticModels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PharmacokineticModels" (
    id integer NOT NULL,
    "_createdBy" integer,
    "_createdAt" timestamp with time zone,
    "_updatedBy" integer,
    "_updatedAt" timestamp with time zone,
    "_deletedBy" integer,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    "ModelVersionId" bigint NOT NULL
);


ALTER TABLE public."PharmacokineticModels" OWNER TO postgres;

--
-- Name: PharmacokineticModels_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."PharmacokineticModels_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."PharmacokineticModels_id_seq" OWNER TO postgres;

--
-- Name: PharmacokineticModels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."PharmacokineticModels_id_seq" OWNED BY public."PharmacokineticModels".id;


--
-- Name: ReactionCoefficients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ReactionCoefficients" (
    id integer NOT NULL,
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    coefficient double precision,
    "ReactionId" integer,
    "MetaboliteId" integer
);


ALTER TABLE public."ReactionCoefficients" OWNER TO postgres;

--
-- Name: ReactionCoefficients_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ReactionCoefficients_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ReactionCoefficients_id_seq" OWNER TO postgres;

--
-- Name: ReactionCoefficients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ReactionCoefficients_id_seq" OWNED BY public."ReactionCoefficients".id;


--
-- Name: ReactionConstraintBasedModel; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ReactionConstraintBasedModel" (
    "ConstraintBasedModelId" integer NOT NULL,
    "ReactionId" integer NOT NULL
);


ALTER TABLE public."ReactionConstraintBasedModel" OWNER TO postgres;

--
-- Name: ReactionGenes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ReactionGenes" (
    id integer NOT NULL,
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    "GeneId" integer,
    "ReactionId" integer
);


ALTER TABLE public."ReactionGenes" OWNER TO postgres;

--
-- Name: ReactionGenes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ReactionGenes_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ReactionGenes_id_seq" OWNER TO postgres;

--
-- Name: ReactionGenes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ReactionGenes_id_seq" OWNED BY public."ReactionGenes".id;


--
-- Name: Reactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Reactions" (
    id integer NOT NULL,
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    "reactionId" character varying(255),
    name character varying(255),
    "lowerBound" double precision DEFAULT '-1000'::double precision,
    "upperBound" double precision DEFAULT '1000'::double precision,
    "objectiveCoefficient" double precision DEFAULT '0'::double precision,
    "KineticBasedModelId" integer,
    "SubSystemId" integer,
    boundary public."enum_Reactions_boundary"
);


ALTER TABLE public."Reactions" OWNER TO postgres;

--
-- Name: Reactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Reactions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Reactions_id_seq" OWNER TO postgres;

--
-- Name: Reactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Reactions_id_seq" OWNED BY public."Reactions".id;


--
-- Name: RenewalItems; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RenewalItems" (
    id integer NOT NULL,
    "subscriptionId" integer,
    "accountPlanId" integer,
    "renewalDateTime" timestamp with time zone,
    "masterSubId" integer,
    status character varying(255),
    "retryCount" integer,
    "isError" boolean,
    "errorDesc" text,
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false
);


ALTER TABLE public."RenewalItems" OWNER TO postgres;

--
-- Name: RenewalItems_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."RenewalItems_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."RenewalItems_id_seq" OWNER TO postgres;

--
-- Name: RenewalItems_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."RenewalItems_id_seq" OWNED BY public."RenewalItems".id;


--
-- Name: Responses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Responses" (
    id integer NOT NULL,
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    "responseID" character varying(32) NOT NULL,
    code integer NOT NULL,
    status character varying(255) NOT NULL,
    data json,
    error json
);


ALTER TABLE public."Responses" OWNER TO postgres;

--
-- Name: Responses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Responses_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Responses_id_seq" OWNER TO postgres;

--
-- Name: Responses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Responses_id_seq" OWNED BY public."Responses".id;


--
-- Name: SectionModel; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SectionModel" (
    id bigint NOT NULL,
    "pageModelId" bigint,
    title character varying(200),
    type character varying(80),
    "position" integer,
    creationdate timestamp with time zone,
    creationuser bigint,
    updatedate timestamp with time zone,
    updateuser bigint,
    "_deletedBy" integer,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false
);


ALTER TABLE public."SectionModel" OWNER TO postgres;

--
-- Name: SectionModel_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."SectionModel_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."SectionModel_id_seq" OWNER TO postgres;

--
-- Name: SectionModel_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."SectionModel_id_seq" OWNED BY public."SectionModel".id;


--
-- Name: SectionReactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SectionReactions" (
    id bigint NOT NULL,
    "pageReactionId" bigint,
    title character varying(200),
    type character varying(80),
    "position" integer,
    creationdate timestamp with time zone,
    creationuser bigint,
    updatedate timestamp with time zone,
    updateuser bigint,
    "_deletedBy" integer,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false
);


ALTER TABLE public."SectionReactions" OWNER TO postgres;

--
-- Name: SectionReactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."SectionReactions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."SectionReactions_id_seq" OWNER TO postgres;

--
-- Name: SectionReactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."SectionReactions_id_seq" OWNED BY public."SectionReactions".id;


--
-- Name: SequelizeMeta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL
);


ALTER TABLE public."SequelizeMeta" OWNER TO postgres;

--
-- Name: SubSystems; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SubSystems" (
    id integer NOT NULL,
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    "subSystemId" character varying(255),
    name character varying(255),
    "ConstraintBasedModelId" bigint
);


ALTER TABLE public."SubSystems" OWNER TO postgres;

--
-- Name: SubSystems_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."SubSystems_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."SubSystems_id_seq" OWNER TO postgres;

--
-- Name: SubSystems_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."SubSystems_id_seq" OWNED BY public."SubSystems".id;


--
-- Name: Tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Tasks" (
    id bigint NOT NULL,
    job character varying(15),
    name character varying(60),
    description character varying(500),
    "processId" integer,
    progress smallint,
    state character varying(8),
    "startedAt" timestamp with time zone,
    "finishedAt" timestamp with time zone,
    "prevRun" timestamp with time zone,
    "nextRun" timestamp with time zone,
    sleep bigint,
    "daysRun" integer,
    priority smallint,
    "failureMessage" text,
    files text,
    "executedBy" bigint,
    "resultLogPath" character varying(300),
    "resultData" text,
    "resultDataType" character varying(15),
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false
);


ALTER TABLE public."Tasks" OWNER TO postgres;

--
-- Name: Tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Tasks_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Tasks_id_seq" OWNER TO postgres;

--
-- Name: Tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Tasks_id_seq" OWNED BY public."Tasks".id;


--
-- Name: UnitDefinition_Units; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UnitDefinition_Units" (
    id integer NOT NULL,
    "UnitDefinitionId" integer NOT NULL,
    "UnitId" integer NOT NULL
);


ALTER TABLE public."UnitDefinition_Units" OWNER TO postgres;

--
-- Name: UnitDefinition_Units_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."UnitDefinition_Units_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."UnitDefinition_Units_id_seq" OWNER TO postgres;

--
-- Name: UnitDefinition_Units_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."UnitDefinition_Units_id_seq" OWNED BY public."UnitDefinition_Units".id;


--
-- Name: UnitDefinitions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UnitDefinitions" (
    id integer NOT NULL,
    "_createdBy" integer,
    "_createdAt" timestamp with time zone,
    "_updatedBy" integer,
    "_updatedAt" timestamp with time zone,
    "_deletedBy" integer,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    name character varying(255)
);


ALTER TABLE public."UnitDefinitions" OWNER TO postgres;

--
-- Name: UnitDefinitions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."UnitDefinitions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."UnitDefinitions_id_seq" OWNER TO postgres;

--
-- Name: UnitDefinitions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."UnitDefinitions_id_seq" OWNED BY public."UnitDefinitions".id;


--
-- Name: Units; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Units" (
    id integer NOT NULL,
    "_createdBy" integer,
    "_createdAt" timestamp with time zone,
    "_updatedBy" integer,
    "_updatedAt" timestamp with time zone,
    "_deletedBy" integer,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    name character varying(255),
    type public."enum_Units_type",
    multiplier integer,
    exponent integer,
    scale integer
);


ALTER TABLE public."Units" OWNER TO postgres;

--
-- Name: Units_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Units_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Units_id_seq" OWNER TO postgres;

--
-- Name: Units_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Units_id_seq" OWNED BY public."Units".id;


--
-- Name: UserCourses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserCourses" (
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    "UserId" bigint NOT NULL,
    "CourseId" integer NOT NULL
);


ALTER TABLE public."UserCourses" OWNER TO postgres;

--
-- Name: UserCoursesUnenroll; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserCoursesUnenroll" (
    id bigint NOT NULL,
    "userId" bigint NOT NULL,
    "courseId" bigint NOT NULL,
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false
);


ALTER TABLE public."UserCoursesUnenroll" OWNER TO postgres;

--
-- Name: UserCoursesUnenroll_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."UserCoursesUnenroll_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."UserCoursesUnenroll_id_seq" OWNER TO postgres;

--
-- Name: UserCoursesUnenroll_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."UserCoursesUnenroll_id_seq" OWNED BY public."UserCoursesUnenroll".id;


--
-- Name: UserEcommerces; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserEcommerces" (
    id integer NOT NULL,
    "userId" integer,
    "masterSubId" integer,
    "customerId" character varying(255),
    "cardHolderName" character varying(255),
    "expirationMonth" integer,
    "expirationYear" integer,
    country character varying(255),
    state character varying(255),
    city character varying(255),
    pincode integer,
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false
);


ALTER TABLE public."UserEcommerces" OWNER TO postgres;

--
-- Name: UserEcommerces_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."UserEcommerces_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."UserEcommerces_id_seq" OWNER TO postgres;

--
-- Name: UserEcommerces_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."UserEcommerces_id_seq" OWNED BY public."UserEcommerces".id;


--
-- Name: UserSubscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserSubscriptions" (
    id integer NOT NULL,
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    "AccountPlanId" integer,
    "startDateTime" timestamp with time zone,
    "endDateTime" timestamp with time zone,
    "noOfStudentAccountPurchased" integer,
    status character varying(255),
    "prevSubscriptionId" integer,
    "masterSubId" integer,
    "userId" integer,
    "termOrder" integer
);


ALTER TABLE public."UserSubscriptions" OWNER TO postgres;

--
-- Name: UserSubscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."UserSubscriptions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."UserSubscriptions_id_seq" OWNER TO postgres;

--
-- Name: UserSubscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."UserSubscriptions_id_seq" OWNED BY public."UserSubscriptions".id;


--
-- Name: activity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activity (
    id bigint NOT NULL,
    logindate timestamp without time zone NOT NULL,
    user_id bigint NOT NULL
);


ALTER TABLE public.activity OWNER TO postgres;

--
-- Name: activity_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.activity_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.activity_id_seq OWNER TO postgres;

--
-- Name: analysis_activity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.analysis_activity (
    id bigint NOT NULL,
    parentid bigint NOT NULL,
    componentid bigint NOT NULL,
    min double precision,
    max double precision
);


ALTER TABLE public.analysis_activity OWNER TO postgres;

--
-- Name: analysis_activity_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.analysis_activity_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.analysis_activity_id_seq OWNER TO postgres;

--
-- Name: analysis_environment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.analysis_environment (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    modelid bigint NOT NULL,
    userid bigint NOT NULL,
    "isDefault" boolean,
    "position" integer
);


ALTER TABLE public.analysis_environment OWNER TO postgres;

--
-- Name: analysis_environment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.analysis_environment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.analysis_environment_id_seq OWNER TO postgres;

--
-- Name: anonymous_user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.anonymous_user (
    id bigint NOT NULL,
    ip character varying(30) NOT NULL,
    useragent character varying(500),
    creationdate timestamp without time zone NOT NULL
);


ALTER TABLE public.anonymous_user OWNER TO postgres;

--
-- Name: anonymous_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.anonymous_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.anonymous_user_id_seq OWNER TO postgres;

--
-- Name: authority; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authority (
    user_id bigint NOT NULL,
    role_id bigint NOT NULL
);


ALTER TABLE public.authority OWNER TO postgres;

--
-- Name: authority_request; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authority_request (
    userid bigint NOT NULL,
    roleid bigint NOT NULL,
    token character varying(80) NOT NULL,
    creationdate timestamp without time zone NOT NULL,
    approvaldate timestamp without time zone,
    rejectiondate timestamp without time zone
);


ALTER TABLE public.authority_request OWNER TO postgres;

--
-- Name: cached_scores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cached_scores (
    id integer NOT NULL,
    modelid bigint,
    score double precision,
    "for" character varying(255),
    "createdAt" time without time zone,
    "updatedAt" time without time zone,
    courseid bigint,
    objective bigint
);


ALTER TABLE public.cached_scores OWNER TO postgres;

--
-- Name: cached_scores_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cached_scores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cached_scores_id_seq OWNER TO postgres;

--
-- Name: cached_scores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cached_scores_id_seq OWNED BY public.cached_scores.id;


--
-- Name: calc_interval; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.calc_interval (
    id bigint NOT NULL,
    experimentid bigint NOT NULL,
    "from" integer,
    "to" integer
);


ALTER TABLE public.calc_interval OWNER TO postgres;

--
-- Name: calc_interval_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.calc_interval_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.calc_interval_id_seq OWNER TO postgres;

--
-- Name: component_pair; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.component_pair (
    id bigint NOT NULL,
    firstcomponentid bigint NOT NULL,
    secondcomponentid bigint NOT NULL,
    delay integer,
    threshold integer
);


ALTER TABLE public.component_pair OWNER TO postgres;

--
-- Name: component_pair_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.component_pair_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.component_pair_id_seq OWNER TO postgres;

--
-- Name: condition_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.condition_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.condition_id_seq OWNER TO postgres;

--
-- Name: condition; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.condition (
    id bigint DEFAULT nextval('public.condition_id_seq'::regclass) NOT NULL,
    name character varying(60),
    speciesrelation character varying(3),
    state character varying(3) NOT NULL,
    subconditionrelation character varying(3),
    type character varying(7) NOT NULL,
    regulator_id bigint NOT NULL,
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false
);


ALTER TABLE public.condition OWNER TO postgres;

--
-- Name: condition_species; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.condition_species (
    condition_id bigint NOT NULL,
    species_id bigint NOT NULL,
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    "GeneId" integer
);


ALTER TABLE public.condition_species OWNER TO postgres;

--
-- Name: content; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.content (
    id bigint NOT NULL,
    creationdate timestamp without time zone NOT NULL,
    creationuser bigint,
    flagged boolean NOT NULL,
    "position" integer NOT NULL,
    text text NOT NULL,
    updatedate timestamp without time zone NOT NULL,
    updateuser bigint,
    section_id bigint NOT NULL
);


ALTER TABLE public.content OWNER TO postgres;

--
-- Name: content_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.content_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.content_id_seq OWNER TO postgres;

--
-- Name: content_reference; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.content_reference (
    id bigint NOT NULL,
    creationdate timestamp without time zone NOT NULL,
    creationuser bigint,
    "position" integer NOT NULL,
    content_id bigint NOT NULL,
    reference_id bigint NOT NULL,
    datatype character varying(7),
    citationtype character varying(11)
);


ALTER TABLE public.content_reference OWNER TO postgres;

--
-- Name: content_reference_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.content_reference_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.content_reference_id_seq OWNER TO postgres;

--
-- Name: course; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.course (
    id bigint NOT NULL,
    name character varying(100),
    modelid bigint NOT NULL
);


ALTER TABLE public.course OWNER TO postgres;

--
-- Name: course_activity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.course_activity (
    id bigint NOT NULL,
    courserangeid bigint NOT NULL,
    speciesid bigint NOT NULL,
    value double precision,
    min double precision,
    max double precision
);


ALTER TABLE public.course_activity OWNER TO postgres;

--
-- Name: course_activity_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.course_activity_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.course_activity_id_seq OWNER TO postgres;

--
-- Name: course_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.course_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.course_id_seq OWNER TO postgres;

--
-- Name: course_mutation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.course_mutation (
    id bigint NOT NULL,
    courserangeid bigint NOT NULL,
    speciesid bigint NOT NULL,
    state character varying(5) NOT NULL
);


ALTER TABLE public.course_mutation OWNER TO postgres;

--
-- Name: course_mutation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.course_mutation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.course_mutation_id_seq OWNER TO postgres;

--
-- Name: course_range; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.course_range (
    id bigint NOT NULL,
    courseid bigint NOT NULL,
    "from" integer,
    "to" integer,
    name character varying(100)
);


ALTER TABLE public.course_range OWNER TO postgres;

--
-- Name: course_range_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.course_range_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.course_range_id_seq OWNER TO postgres;

--
-- Name: dominance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dominance (
    negative_regulator_id bigint NOT NULL,
    positive_regulator_id bigint NOT NULL
);


ALTER TABLE public.dominance OWNER TO postgres;

--
-- Name: experiment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.experiment (
    id bigint NOT NULL,
    creationdate timestamp without time zone NOT NULL,
    lastaccessdate timestamp without time zone,
    lastrundate timestamp without time zone,
    name character varying(100) NOT NULL,
    published boolean NOT NULL,
    settings text NOT NULL,
    shared boolean NOT NULL,
    state character varying(255),
    updatedate timestamp without time zone NOT NULL,
    userid bigint,
    model_id bigint NOT NULL,
    courseid bigint,
    updatetype character varying(13),
    environmentid bigint,
    lastrunenvironmentid bigint,
    exper_type character varying(10),
    err_msg character varying(200),
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone,
    "_deletedAt" timestamp with time zone,
    _deleted boolean,
    "drugEnvironmentId" bigint,
    "lastRunDrugEnvironmentId" bigint
);


ALTER TABLE public.experiment OWNER TO postgres;

--
-- Name: experiment_data; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.experiment_data (
    experiment_id bigint NOT NULL,
    simulation bigint NOT NULL,
    data text NOT NULL,
    calcintervalid bigint NOT NULL
);


ALTER TABLE public.experiment_data OWNER TO postgres;

--
-- Name: experiment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.experiment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.experiment_id_seq OWNER TO postgres;

--
-- Name: initial_state; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.initial_state (
    id bigint NOT NULL,
    creationdate timestamp without time zone NOT NULL,
    name character varying(80) NOT NULL,
    updatedate timestamp without time zone NOT NULL,
    model_id bigint NOT NULL
);


ALTER TABLE public.initial_state OWNER TO postgres;

--
-- Name: initial_state_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.initial_state_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.initial_state_id_seq OWNER TO postgres;

--
-- Name: initial_state_species; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.initial_state_species (
    initial_state_id bigint NOT NULL,
    species_id bigint NOT NULL
);


ALTER TABLE public.initial_state_species OWNER TO postgres;

--
-- Name: layout; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.layout (
    id bigint NOT NULL,
    name character varying(80),
    top double precision,
    bottom double precision,
    "left" double precision,
    "right" double precision,
    creationdate timestamp without time zone NOT NULL,
    updatedate timestamp without time zone NOT NULL,
    modelid bigint NOT NULL
);


ALTER TABLE public.layout OWNER TO postgres;

--
-- Name: layout_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.layout_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.layout_id_seq OWNER TO postgres;

--
-- Name: layout_node; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.layout_node (
    id bigint NOT NULL,
    componentid bigint NOT NULL,
    layoutid bigint NOT NULL,
    x double precision,
    y double precision
);


ALTER TABLE public.layout_node OWNER TO postgres;

--
-- Name: layout_node_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.layout_node_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.layout_node_id_seq OWNER TO postgres;

--
-- Name: learning_activity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.learning_activity (
    id bigint NOT NULL,
    masterid bigint NOT NULL,
    name character varying(100) NOT NULL,
    "position" integer NOT NULL,
    workspacelayout text NOT NULL,
    version integer NOT NULL,
    views text,
    groupid integer
);


ALTER TABLE public.learning_activity OWNER TO postgres;

--
-- Name: learning_activity_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.learning_activity_groups (
    id integer NOT NULL,
    name character varying(255),
    "position" integer,
    masterid bigint
);


ALTER TABLE public.learning_activity_groups OWNER TO postgres;

--
-- Name: learning_activity_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.learning_activity_groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.learning_activity_groups_id_seq OWNER TO postgres;

--
-- Name: learning_activity_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.learning_activity_groups_id_seq OWNED BY public.learning_activity_groups.id;


--
-- Name: learning_activity_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.learning_activity_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.learning_activity_id_seq OWNER TO postgres;

--
-- Name: logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.logs (
    id integer NOT NULL,
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    type character varying(255),
    action character varying(255),
    transaction_uuid character varying(255),
    message json
);


ALTER TABLE public.logs OWNER TO postgres;

--
-- Name: logs_bkp_grp; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.logs_bkp_grp (
    id integer NOT NULL,
    content text NOT NULL
);


ALTER TABLE public.logs_bkp_grp OWNER TO postgres;

--
-- Name: logs_bkp_grp_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.logs_bkp_grp_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.logs_bkp_grp_id_seq OWNER TO postgres;

--
-- Name: logs_bkp_grp_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.logs_bkp_grp_id_seq OWNED BY public.logs_bkp_grp.id;


--
-- Name: logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.logs_id_seq OWNER TO postgres;

--
-- Name: logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.logs_id_seq OWNED BY public.logs.id;


--
-- Name: model_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.model_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.model_id_seq OWNER TO postgres;

--
-- Name: model; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.model (
    id bigint DEFAULT nextval('public.model_id_seq'::regclass) NOT NULL,
    creationdate timestamp with time zone,
    description text,
    name character varying(255),
    published boolean,
    tags character varying(255),
    updatedate timestamp with time zone,
    userid bigint,
    author character varying(70),
    cited integer,
    biologicupdatedate timestamp with time zone,
    knowledgebaseupdatedate timestamp without time zone,
    components integer,
    interactions integer,
    type character varying(30) NOT NULL,
    originid bigint,
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    modeltype character varying(255),
    "publishedAt" timestamp with time zone,
    metadata boolean DEFAULT false,
    "prevOrigin" bigint,
    is_reference boolean DEFAULT false
);


ALTER TABLE public.model OWNER TO postgres;

--
-- Name: model_domain_access; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.model_domain_access (
    modelid bigint NOT NULL,
    userid bigint NOT NULL,
    domain character varying(5) NOT NULL,
    creationdate timestamp without time zone NOT NULL,
    modellinkid bigint
);


ALTER TABLE public.model_domain_access OWNER TO postgres;

--
-- Name: model_initial_state; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.model_initial_state (
    modelid bigint NOT NULL,
    initialstateid bigint,
    layoutid bigint,
    workspacelayout text,
    survey text,
    content text
);


ALTER TABLE public.model_initial_state OWNER TO postgres;

--
-- Name: model_link; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.model_link (
    id bigint NOT NULL,
    accesscode character varying(80) NOT NULL,
    accesscount integer NOT NULL,
    creationdate timestamp without time zone NOT NULL,
    enddate timestamp without time zone,
    startdate timestamp without time zone,
    updatedate timestamp without time zone NOT NULL,
    userid bigint NOT NULL,
    model_id bigint NOT NULL,
    access character varying(6) DEFAULT 'VIEW'::character varying NOT NULL,
    CONSTRAINT allowed_access CHECK (((access)::text = ANY (ARRAY[('VIEW'::character varying)::text, ('SHARE'::character varying)::text])))
);


ALTER TABLE public.model_link OWNER TO postgres;

--
-- Name: model_link_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.model_link_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.model_link_id_seq OWNER TO postgres;

--
-- Name: model_metadata_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.model_metadata_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.model_metadata_id_seq OWNER TO postgres;

--
-- Name: model_reference; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.model_reference (
    id bigint NOT NULL,
    creationdate timestamp without time zone NOT NULL,
    creationuser bigint,
    "position" integer NOT NULL,
    model_id bigint NOT NULL,
    reference_id bigint NOT NULL
);


ALTER TABLE public.model_reference OWNER TO postgres;

--
-- Name: model_reference_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.model_reference_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.model_reference_id_seq OWNER TO postgres;

--
-- Name: model_reference_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.model_reference_types (
    id bigint NOT NULL,
    modelid bigint NOT NULL,
    referenceid bigint NOT NULL,
    citationtype character varying(11),
    datatype character varying(7)
);


ALTER TABLE public.model_reference_types OWNER TO postgres;

--
-- Name: model_reference_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.model_reference_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.model_reference_types_id_seq OWNER TO postgres;

--
-- Name: model_score; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.model_score (
    id bigint NOT NULL,
    citations integer NOT NULL,
    downloads integer NOT NULL,
    edits integer NOT NULL,
    lastcalculationdate timestamp without time zone NOT NULL,
    score double precision,
    simulations integer NOT NULL,
    model_id bigint NOT NULL
);


ALTER TABLE public.model_score OWNER TO postgres;

--
-- Name: model_score_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.model_score_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.model_score_id_seq OWNER TO postgres;

--
-- Name: model_share; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.model_share (
    id bigint NOT NULL,
    access character varying(6) NOT NULL,
    creationdate timestamp without time zone NOT NULL,
    email character varying(255),
    updatedate timestamp without time zone NOT NULL,
    userid bigint,
    model_id bigint NOT NULL,
    modellinkid bigint
);


ALTER TABLE public.model_share OWNER TO postgres;

--
-- Name: model_share_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.model_share_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.model_share_id_seq OWNER TO postgres;

--
-- Name: model_share_notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.model_share_notification (
    modelid bigint NOT NULL,
    email character varying(100) NOT NULL,
    modelshareid bigint NOT NULL,
    userid bigint NOT NULL,
    attempts integer NOT NULL,
    creationdate timestamp without time zone NOT NULL,
    updatedate timestamp without time zone NOT NULL,
    domain character varying(9)
);


ALTER TABLE public.model_share_notification OWNER TO postgres;

--
-- Name: model_share_owner; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.model_share_owner AS
 SELECT ms.userid AS share_user_id,
    m.id AS model_id,
    m.userid AS owner_user_id
   FROM (public.model m
     JOIN public.model_share ms ON ((m.id = ms.model_id)));


ALTER TABLE public.model_share_owner OWNER TO postgres;

--
-- Name: model_statistic; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.model_statistic (
    id bigint NOT NULL,
    creationdate timestamp without time zone NOT NULL,
    metadata text,
    type character varying(175) NOT NULL,
    userid bigint,
    model_id bigint NOT NULL
);


ALTER TABLE public.model_statistic OWNER TO postgres;

--
-- Name: model_statistic_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.model_statistic_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.model_statistic_id_seq OWNER TO postgres;

--
-- Name: model_version; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.model_version (
    id bigint NOT NULL,
    version bigint NOT NULL,
    description text,
    modelid bigint,
    userid bigint,
    creationdate timestamp with time zone,
    name character varying(80),
    selected boolean DEFAULT false NOT NULL,
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false
);


ALTER TABLE public.model_version OWNER TO postgres;

--
-- Name: model_version_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.model_version_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.model_version_id_seq OWNER TO postgres;

--
-- Name: model_version_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.model_version_id_seq OWNED BY public.model_version.id;


--
-- Name: page; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.page (
    id bigint NOT NULL,
    creationdate timestamp without time zone NOT NULL,
    creationuser bigint,
    updatedate timestamp without time zone NOT NULL,
    updateuser bigint
);


ALTER TABLE public.page OWNER TO postgres;

--
-- Name: page_reference; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.page_reference (
    id bigint NOT NULL,
    creationdate timestamp without time zone NOT NULL,
    creationuser bigint,
    "position" integer NOT NULL,
    page_id bigint NOT NULL,
    reference_id bigint NOT NULL
);


ALTER TABLE public.page_reference OWNER TO postgres;

--
-- Name: page_reference_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.page_reference_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.page_reference_id_seq OWNER TO postgres;

--
-- Name: profile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profile (
    id bigint NOT NULL,
    email character varying(100) NOT NULL,
    firstname character varying(40),
    institution character varying(150),
    lastname character varying(60),
    user_id bigint NOT NULL,
    institution_id integer,
    "thirdPartyId" character varying(255),
    "thirdPartyType" character varying(50),
    "alternateEmails" character varying(255)[],
    "avatarUri" character varying(255),
    "accessType" integer
);


ALTER TABLE public.profile OWNER TO postgres;

--
-- Name: profile_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.profile_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.profile_id_seq OWNER TO postgres;

--
-- Name: realtime_activity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.realtime_activity (
    id bigint NOT NULL,
    parentid bigint NOT NULL,
    componentid bigint NOT NULL,
    value double precision
);


ALTER TABLE public.realtime_activity OWNER TO postgres;

--
-- Name: realtime_activity_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.realtime_activity_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.realtime_activity_id_seq OWNER TO postgres;

--
-- Name: realtime_environment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.realtime_environment (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    modelid bigint NOT NULL,
    userid bigint NOT NULL
);


ALTER TABLE public.realtime_environment OWNER TO postgres;

--
-- Name: realtime_environment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.realtime_environment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.realtime_environment_id_seq OWNER TO postgres;

--
-- Name: reference; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reference (
    id bigint NOT NULL,
    creationdate timestamp without time zone NOT NULL,
    creationuser bigint,
    pmid character varying(50),
    text text NOT NULL,
    updatedate timestamp without time zone NOT NULL,
    updateuser bigint,
    shortcitation character varying(200),
    doi text
);


ALTER TABLE public.reference OWNER TO postgres;

--
-- Name: reference_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reference_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reference_id_seq OWNER TO postgres;

--
-- Name: registration; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.registration (
    id bigint NOT NULL,
    activationcode character varying NOT NULL,
    activationdate timestamp without time zone,
    registrationdate timestamp without time zone NOT NULL,
    user_id bigint NOT NULL
);


ALTER TABLE public.registration OWNER TO postgres;

--
-- Name: registration_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.registration_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.registration_id_seq OWNER TO postgres;

--
-- Name: regulator_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.regulator_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.regulator_id_seq OWNER TO postgres;

--
-- Name: regulator; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.regulator (
    id bigint DEFAULT nextval('public.regulator_id_seq'::regclass) NOT NULL,
    conditionrelation character varying(3),
    regulationtype character varying(8) NOT NULL,
    regulator_species_id bigint,
    species_id bigint,
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    "ReactionGeneId" integer,
    "position" integer
);


ALTER TABLE public.regulator OWNER TO postgres;

--
-- Name: role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role (
    id bigint NOT NULL,
    name character varying(30) NOT NULL
);


ALTER TABLE public.role OWNER TO postgres;

--
-- Name: saved_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.saved_images (
    id integer NOT NULL,
    file character varying(255),
    type character varying(255),
    "timestamp" timestamp with time zone,
    "profileId" bigint,
    "BaseModelId" bigint
);


ALTER TABLE public.saved_images OWNER TO postgres;

--
-- Name: saved_images_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.saved_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.saved_images_id_seq OWNER TO postgres;

--
-- Name: saved_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.saved_images_id_seq OWNED BY public.saved_images.id;


--
-- Name: section; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.section (
    id bigint NOT NULL,
    creationdate timestamp without time zone NOT NULL,
    creationuser bigint,
    "position" integer NOT NULL,
    title character varying(200),
    type character varying(80) NOT NULL,
    updatedate timestamp without time zone NOT NULL,
    updateuser bigint,
    page_id bigint NOT NULL
);


ALTER TABLE public.section OWNER TO postgres;

--
-- Name: section_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.section_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.section_id_seq OWNER TO postgres;

--
-- Name: species_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.species_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.species_id_seq OWNER TO postgres;

--
-- Name: species; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.species (
    id bigint DEFAULT nextval('public.species_id_seq'::regclass) NOT NULL,
    name character varying(255),
    absentstate character varying(3),
    creationdate timestamp without time zone,
    external boolean,
    updatedate timestamp without time zone,
    model_id bigint,
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    "speciesId" character varying(255),
    "position" integer
);


ALTER TABLE public.species OWNER TO postgres;

--
-- Name: sub_condition; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sub_condition (
    id bigint NOT NULL,
    name character varying(60),
    speciesrelation character varying(3),
    state character varying(3) NOT NULL,
    type character varying(7) NOT NULL,
    condition_id bigint NOT NULL,
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false
);


ALTER TABLE public.sub_condition OWNER TO postgres;

--
-- Name: sub_condition_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sub_condition_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sub_condition_id_seq OWNER TO postgres;

--
-- Name: sub_condition_species; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sub_condition_species (
    sub_condition_id bigint NOT NULL,
    species_id bigint NOT NULL,
    "GeneId" bigint
);


ALTER TABLE public.sub_condition_species OWNER TO postgres;

--
-- Name: upload; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.upload (
    id bigint NOT NULL,
    uploadname character varying(250) NOT NULL,
    storagename character varying(250) NOT NULL,
    filetype character varying(20) NOT NULL,
    userid bigint NOT NULL,
    description text,
    uploaddate timestamp with time zone NOT NULL
);


ALTER TABLE public.upload OWNER TO postgres;

--
-- Name: upload_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.upload_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.upload_id_seq OWNER TO postgres;

--
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id bigint NOT NULL,
    enabled boolean NOT NULL,
    password character varying(120) NOT NULL
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_id_seq OWNER TO postgres;

--
-- Name: user_identity_view; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.user_identity_view AS
 SELECT u.id,
    p.email,
    p.firstname,
    p.lastname,
    p.institution
   FROM (public."user" u
     JOIN public.profile p ON ((u.id = p.user_id)))
  ORDER BY u.id;


ALTER TABLE public.user_identity_view OWNER TO postgres;

--
-- Name: user_registration_notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_registration_notification (
    id bigint NOT NULL,
    domain character varying(8) NOT NULL,
    attempts integer NOT NULL,
    creationdate timestamp without time zone NOT NULL,
    updatedate timestamp with time zone NOT NULL
);


ALTER TABLE public.user_registration_notification OWNER TO postgres;

--
-- Name: user_subscription; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_subscription (
    id bigint NOT NULL,
    userid bigint NOT NULL,
    creationdate timestamp without time zone NOT NULL,
    expirationdate timestamp with time zone NOT NULL,
    modelssubmitted bigint NOT NULL
);


ALTER TABLE public.user_subscription OWNER TO postgres;

--
-- Name: user_subscription_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_subscription_id_seq OWNER TO postgres;

--
-- Name: users_ccapp; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users_ccapp (
    id bigint NOT NULL,
    user_id bigint,
    user_ccapp_id uuid,
    "_createdBy" bigint,
    "_createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_updatedBy" bigint,
    "_updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "_deletedBy" bigint,
    "_deletedAt" timestamp with time zone,
    _deleted boolean DEFAULT false,
    password_pending_update boolean
);


ALTER TABLE public.users_ccapp OWNER TO postgres;

--
-- Name: users_ccapp_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_ccapp_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_ccapp_id_seq OWNER TO postgres;

--
-- Name: users_ccapp_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_ccapp_id_seq OWNED BY public.users_ccapp.id;


--
-- Name: AccountPlans id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AccountPlans" ALTER COLUMN id SET DEFAULT nextval('public."AccountPlans_id_seq"'::regclass);


--
-- Name: AclRules id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AclRules" ALTER COLUMN id SET DEFAULT nextval('public."AclRules_id_seq"'::regclass);


--
-- Name: Annotations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Annotations" ALTER COLUMN id SET DEFAULT nextval('public."Annotations_id_seq"'::regclass);


--
-- Name: Compartments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Compartments" ALTER COLUMN id SET DEFAULT nextval('public."Compartments_id_seq"'::regclass);


--
-- Name: ConstraintBasedModels id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ConstraintBasedModels" ALTER COLUMN id SET DEFAULT nextval('public."ConstraintBasedModels_id_seq"'::regclass);


--
-- Name: ContentModel id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ContentModel" ALTER COLUMN id SET DEFAULT nextval('public."ContentModel_id_seq"'::regclass);


--
-- Name: ContentReactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ContentReactions" ALTER COLUMN id SET DEFAULT nextval('public."ContentReactions_id_seq"'::regclass);


--
-- Name: Countries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Countries" ALTER COLUMN id SET DEFAULT nextval('public."Countries_id_seq"'::regclass);


--
-- Name: Courses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Courses" ALTER COLUMN id SET DEFAULT nextval('public."Courses_id_seq"'::regclass);


--
-- Name: Currencies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Currencies" ALTER COLUMN id SET DEFAULT nextval('public."Currencies_id_seq"'::regclass);


--
-- Name: Distributions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Distributions" ALTER COLUMN id SET DEFAULT nextval('public."Distributions_id_seq"'::regclass);


--
-- Name: DrugEnvironments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DrugEnvironments" ALTER COLUMN id SET DEFAULT nextval('public."DrugEnvironments_id_seq"'::regclass);


--
-- Name: Functions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Functions" ALTER COLUMN id SET DEFAULT nextval('public."Functions_id_seq"'::regclass);


--
-- Name: Genes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Genes" ALTER COLUMN id SET DEFAULT nextval('public."Genes_id_seq"'::regclass);


--
-- Name: Institutions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Institutions" ALTER COLUMN id SET DEFAULT nextval('public."Institutions_id_seq"'::regclass);


--
-- Name: KineticBasedModels id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticBasedModels" ALTER COLUMN id SET DEFAULT nextval('public."KineticBasedModels_id_seq"'::regclass);


--
-- Name: KineticCompartments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticCompartments" ALTER COLUMN id SET DEFAULT nextval('public."KineticCompartments_id_seq"'::regclass);


--
-- Name: KineticGlobalParams id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticGlobalParams" ALTER COLUMN id SET DEFAULT nextval('public."KineticGlobalParams_id_seq"'::regclass);


--
-- Name: KineticLawTypes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticLawTypes" ALTER COLUMN id SET DEFAULT nextval('public."KineticLawTypes_id_seq"'::regclass);


--
-- Name: KineticLaws id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticLaws" ALTER COLUMN id SET DEFAULT nextval('public."KineticLaws_id_seq"'::regclass);


--
-- Name: KineticLocalParams id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticLocalParams" ALTER COLUMN id SET DEFAULT nextval('public."KineticLocalParams_id_seq"'::regclass);


--
-- Name: KineticModels id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticModels" ALTER COLUMN id SET DEFAULT nextval('public."KineticModels_id_seq"'::regclass);


--
-- Name: KineticModifiers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticModifiers" ALTER COLUMN id SET DEFAULT nextval('public."KineticModifiers_id_seq"'::regclass);


--
-- Name: KineticProducts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticProducts" ALTER COLUMN id SET DEFAULT nextval('public."KineticProducts_id_seq"'::regclass);


--
-- Name: KineticReactants id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticReactants" ALTER COLUMN id SET DEFAULT nextval('public."KineticReactants_id_seq"'::regclass);


--
-- Name: KineticReactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticReactions" ALTER COLUMN id SET DEFAULT nextval('public."KineticReactions_id_seq"'::regclass);


--
-- Name: KineticSpecies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticSpecies" ALTER COLUMN id SET DEFAULT nextval('public."KineticSpecies_id_seq"'::regclass);


--
-- Name: KineticUnits id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticUnits" ALTER COLUMN id SET DEFAULT nextval('public."KineticUnits_id_seq"'::regclass);


--
-- Name: Languages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Languages" ALTER COLUMN id SET DEFAULT nextval('public."Languages_id_seq"'::regclass);


--
-- Name: LearningObjective id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LearningObjective" ALTER COLUMN id SET DEFAULT nextval('public."LearningObjective_id_seq"'::regclass);


--
-- Name: LearningObjectiveAssocs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LearningObjectiveAssocs" ALTER COLUMN id SET DEFAULT nextval('public."LearningObjectiveAssocs_id_seq"'::regclass);


--
-- Name: Metabolites id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Metabolites" ALTER COLUMN id SET DEFAULT nextval('public."Metabolites_id_seq"'::regclass);


--
-- Name: ModelContext id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ModelContext" ALTER COLUMN id SET DEFAULT nextval('public."ModelContext_id_seq"'::regclass);


--
-- Name: ModelContextData id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ModelContextData" ALTER COLUMN id SET DEFAULT nextval('public."ModelContextData_id_seq"'::regclass);


--
-- Name: ModelStartedLesson id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ModelStartedLesson" ALTER COLUMN id SET DEFAULT nextval('public."ModelStartedLesson_id_seq"'::regclass);


--
-- Name: Modules id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Modules" ALTER COLUMN id SET DEFAULT nextval('public."Modules_id_seq"'::regclass);


--
-- Name: MultiscaleModels id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MultiscaleModels" ALTER COLUMN id SET DEFAULT nextval('public."MultiscaleModels_id_seq"'::regclass);


--
-- Name: MultiscaleTemplateFilePaths id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MultiscaleTemplateFilePaths" ALTER COLUMN id SET DEFAULT nextval('public."MultiscaleTemplateFilePaths_id_seq"'::regclass);


--
-- Name: ObjectiveFunctions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ObjectiveFunctions" ALTER COLUMN id SET DEFAULT nextval('public."ObjectiveFunctions_id_seq"'::regclass);


--
-- Name: ObjectiveReactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ObjectiveReactions" ALTER COLUMN id SET DEFAULT nextval('public."ObjectiveReactions_id_seq"'::regclass);


--
-- Name: PKCompartments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PKCompartments" ALTER COLUMN id SET DEFAULT nextval('public."PKCompartments_id_seq"'::regclass);


--
-- Name: PKCovariates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PKCovariates" ALTER COLUMN id SET DEFAULT nextval('public."PKCovariates_id_seq"'::regclass);


--
-- Name: PKDosings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PKDosings" ALTER COLUMN id SET DEFAULT nextval('public."PKDosings_id_seq"'::regclass);


--
-- Name: PKParameters id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PKParameters" ALTER COLUMN id SET DEFAULT nextval('public."PKParameters_id_seq"'::regclass);


--
-- Name: PKPopulations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PKPopulations" ALTER COLUMN id SET DEFAULT nextval('public."PKPopulations_id_seq"'::regclass);


--
-- Name: PKRates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PKRates" ALTER COLUMN id SET DEFAULT nextval('public."PKRates_id_seq"'::regclass);


--
-- Name: PKVariabilities id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PKVariabilities" ALTER COLUMN id SET DEFAULT nextval('public."PKVariabilities_id_seq"'::regclass);


--
-- Name: PageModel id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PageModel" ALTER COLUMN id SET DEFAULT nextval('public."PageModel_id_seq"'::regclass);


--
-- Name: PageModelReference id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PageModelReference" ALTER COLUMN id SET DEFAULT nextval('public."PageModelReference_id_seq"'::regclass);


--
-- Name: PageReactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PageReactions" ALTER COLUMN id SET DEFAULT nextval('public."PageReactions_id_seq"'::regclass);


--
-- Name: PharmacokineticModels id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PharmacokineticModels" ALTER COLUMN id SET DEFAULT nextval('public."PharmacokineticModels_id_seq"'::regclass);


--
-- Name: ReactionCoefficients id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReactionCoefficients" ALTER COLUMN id SET DEFAULT nextval('public."ReactionCoefficients_id_seq"'::regclass);


--
-- Name: ReactionGenes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReactionGenes" ALTER COLUMN id SET DEFAULT nextval('public."ReactionGenes_id_seq"'::regclass);


--
-- Name: Reactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reactions" ALTER COLUMN id SET DEFAULT nextval('public."Reactions_id_seq"'::regclass);


--
-- Name: RenewalItems id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RenewalItems" ALTER COLUMN id SET DEFAULT nextval('public."RenewalItems_id_seq"'::regclass);


--
-- Name: Responses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Responses" ALTER COLUMN id SET DEFAULT nextval('public."Responses_id_seq"'::regclass);


--
-- Name: SectionModel id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SectionModel" ALTER COLUMN id SET DEFAULT nextval('public."SectionModel_id_seq"'::regclass);


--
-- Name: SectionReactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SectionReactions" ALTER COLUMN id SET DEFAULT nextval('public."SectionReactions_id_seq"'::regclass);


--
-- Name: SubSystems id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SubSystems" ALTER COLUMN id SET DEFAULT nextval('public."SubSystems_id_seq"'::regclass);


--
-- Name: Tasks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tasks" ALTER COLUMN id SET DEFAULT nextval('public."Tasks_id_seq"'::regclass);


--
-- Name: UnitDefinition_Units id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnitDefinition_Units" ALTER COLUMN id SET DEFAULT nextval('public."UnitDefinition_Units_id_seq"'::regclass);


--
-- Name: UnitDefinitions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnitDefinitions" ALTER COLUMN id SET DEFAULT nextval('public."UnitDefinitions_id_seq"'::regclass);


--
-- Name: Units id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Units" ALTER COLUMN id SET DEFAULT nextval('public."Units_id_seq"'::regclass);


--
-- Name: UserCoursesUnenroll id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserCoursesUnenroll" ALTER COLUMN id SET DEFAULT nextval('public."UserCoursesUnenroll_id_seq"'::regclass);


--
-- Name: UserEcommerces id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserEcommerces" ALTER COLUMN id SET DEFAULT nextval('public."UserEcommerces_id_seq"'::regclass);


--
-- Name: UserSubscriptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserSubscriptions" ALTER COLUMN id SET DEFAULT nextval('public."UserSubscriptions_id_seq"'::regclass);


--
-- Name: cached_scores id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cached_scores ALTER COLUMN id SET DEFAULT nextval('public.cached_scores_id_seq'::regclass);


--
-- Name: learning_activity_groups id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_activity_groups ALTER COLUMN id SET DEFAULT nextval('public.learning_activity_groups_id_seq'::regclass);


--
-- Name: logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs ALTER COLUMN id SET DEFAULT nextval('public.logs_id_seq'::regclass);


--
-- Name: logs_bkp_grp id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs_bkp_grp ALTER COLUMN id SET DEFAULT nextval('public.logs_bkp_grp_id_seq'::regclass);


--
-- Name: model_version id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_version ALTER COLUMN id SET DEFAULT nextval('public.model_version_id_seq'::regclass);


--
-- Name: saved_images id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_images ALTER COLUMN id SET DEFAULT nextval('public.saved_images_id_seq'::regclass);


--
-- Name: users_ccapp id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_ccapp ALTER COLUMN id SET DEFAULT nextval('public.users_ccapp_id_seq'::regclass);


--
-- Data for Name: definition; Type: TABLE DATA; Schema: metadata; Owner: postgres
--

COPY metadata.definition (id, name, type, visibleall, range) FROM stdin;
1	TargetAudience	Text	t	t
3	Cover	Attachment	t	f
4	EstimatedTime	Decimal	t	f
5	DocumentPrivate	Attachment	f	f
6	DocumentPublic	Attachment	t	f
7	LearningObjective	Text	t	f
2	LearningType	Text	t	t
8	BackgroundImage	Attachment	f	f
\.


--
-- Data for Name: entity_value; Type: TABLE DATA; Schema: metadata; Owner: postgres
--

COPY metadata.entity_value (entity_id, value_id) FROM stdin;
\.


--
-- Data for Name: value; Type: TABLE DATA; Schema: metadata; Owner: postgres
--

COPY metadata.value (id, definition_id, updatedate, "position") FROM stdin;
\.


--
-- Data for Name: value_attachment; Type: TABLE DATA; Schema: metadata; Owner: postgres
--

COPY metadata.value_attachment (value_id, value) FROM stdin;
\.


--
-- Data for Name: value_bool; Type: TABLE DATA; Schema: metadata; Owner: postgres
--

COPY metadata.value_bool (value_id, value) FROM stdin;
\.


--
-- Data for Name: value_date; Type: TABLE DATA; Schema: metadata; Owner: postgres
--

COPY metadata.value_date (value_id, value) FROM stdin;
\.


--
-- Data for Name: value_decimal; Type: TABLE DATA; Schema: metadata; Owner: postgres
--

COPY metadata.value_decimal (value_id, value) FROM stdin;
\.


--
-- Data for Name: value_integer; Type: TABLE DATA; Schema: metadata; Owner: postgres
--

COPY metadata.value_integer (value_id, value) FROM stdin;
\.


--
-- Data for Name: value_text; Type: TABLE DATA; Schema: metadata; Owner: postgres
--

COPY metadata.value_text (value_id, value) FROM stdin;
\.


--
-- Data for Name: AccountPlans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AccountPlans" (id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, name, length, cost, permissions, "studentRange", "noOfStudentAccount", domain, features) FROM stdin;
\.


--
-- Data for Name: AclRules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AclRules" (id, rules) FROM stdin;
\.


--
-- Data for Name: Annotations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Annotations" (id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, source, annotations, "ModelVersionId", "CompartmentId", "ConstraintBasedModelId", "GeneId", "MetaboliteId", "ReactionId", "KineticModelId") FROM stdin;
\.


--
-- Data for Name: CompartmentSpecies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CompartmentSpecies" ("CompartmentId", "SpeciesId") FROM stdin;
\.


--
-- Data for Name: Compartments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Compartments" (id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, "compartmentId", name) FROM stdin;
\.


--
-- Data for Name: ConstraintBasedModels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ConstraintBasedModels" (id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, "ModelVersionId") FROM stdin;
\.


--
-- Data for Name: ContentModel; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ContentModel" (id, "sectionModelId", flagged, text, "position", creationdate, creationuser, updatedate, updateuser, "_deletedBy", "_deletedAt", _deleted) FROM stdin;
\.


--
-- Data for Name: ContentModelReference; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ContentModelReference" (id, creationdate, creationuser, "position", content_id, reference_id, datatype, citationtype) FROM stdin;
\.


--
-- Data for Name: ContentReactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ContentReactions" (id, "sectionReactionId", flagged, text, "position", creationdate, creationuser, updatedate, updateuser, "_deletedBy", "_deletedAt", _deleted) FROM stdin;
\.


--
-- Data for Name: Countries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Countries" (id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, name, abbreviation, "CurrencyId") FROM stdin;
\.


--
-- Data for Name: CountryLanguages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CountryLanguages" ("_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, "CountryId", "LanguageId") FROM stdin;
\.


--
-- Data for Name: Courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Courses" (id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, title, description, "startDate", "endDate", published, "codeKey", domain) FROM stdin;
\.


--
-- Data for Name: Currencies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Currencies" (id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, name, symbol) FROM stdin;
\.


--
-- Data for Name: Distributions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Distributions" (id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, name, type, parameters) FROM stdin;
\.


--
-- Data for Name: DrugEnvironments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."DrugEnvironments" (id, name, "isDefault", "position", "ConstraintBasedModelId", "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted) FROM stdin;
\.


--
-- Data for Name: Functions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Functions" (id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, name, type, formula, parameters) FROM stdin;
\.


--
-- Data for Name: GeneConstraintBasedModel; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."GeneConstraintBasedModel" ("ConstraintBasedModelId", "GeneId") FROM stdin;
\.


--
-- Data for Name: Genes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Genes" (id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, "SpeciesId", "position") FROM stdin;
\.


--
-- Data for Name: Institutions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Institutions" (id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, name, category, city, country, state, domains, websites, "CountryId") FROM stdin;
1	\N	2024-05-17 12:04:39.449798+00	\N	2024-05-17 12:04:39.449798+00	\N	\N	f	HCPSS Biotech Academy	Public School	Ellicott City	United States	Maryland	\N	\N	\N
2	\N	2021-09-14 14:30:23.511562+00	\N	2024-08-09 12:43:24.987+00	\N	\N	f	International College of Broadcasting	SPECIAL_FOCUS_TWO_YEAR	Dayton	US	OH	\N	\N	\N
3	\N	2021-09-14 14:30:14.046+00	\N	2024-08-09 12:42:57.477+00	\N	\N	f	CUNY Bronx Community College	ASSOCIATES	Bronx	US	NY	\N	\N	\N
4	\N	2021-09-14 14:30:53.275403+00	\N	2024-08-09 12:44:48.384+00	\N	\N	f	University of Nebraska at Omaha	DOCTORAL	Omaha	US	NE	\N	\N	\N
5	\N	2021-09-14 14:30:53.289169+00	\N	2024-08-09 12:44:48.429+00	\N	\N	f	University of Nebraska Medical Center	\N	Omaha	US	NE	\N	\N	\N
6	\N	2021-09-14 14:30:53.302601+00	\N	2024-08-09 12:44:48.493+00	\N	\N	f	University of Nebraska-Lincoln	DOCTORAL	Lincoln	US	NE	\N	\N	\N
\.


--
-- Data for Name: KineticBasedModels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."KineticBasedModels" (id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, "BaseModelId") FROM stdin;
\.


--
-- Data for Name: KineticCompartments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."KineticCompartments" (id, name, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, size, "KineticModelId") FROM stdin;
\.


--
-- Data for Name: KineticGlobalParams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."KineticGlobalParams" (id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, name, parameter_id, value, unit_definition_id, "KineticModelId") FROM stdin;
\.


--
-- Data for Name: KineticLawTypes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."KineticLawTypes" (id, type) FROM stdin;
\.


--
-- Data for Name: KineticLaws; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."KineticLaws" (id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, formula, "KineticReactionId", "KineticLawTypeId", description, "numSubstrates", "numProducts") FROM stdin;
\.


--
-- Data for Name: KineticLocalParams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."KineticLocalParams" (id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, name, value, "KineticLawId", unit_definition_id) FROM stdin;
\.


--
-- Data for Name: KineticModels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."KineticModels" (id, name, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, "ModelVersionId") FROM stdin;
\.


--
-- Data for Name: KineticModifiers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."KineticModifiers" (id, "KineticReactionId", "KineticSpeciesId", type) FROM stdin;
\.


--
-- Data for Name: KineticProducts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."KineticProducts" (id, "KineticReactionId", "KineticSpeciesId", stoichiometry) FROM stdin;
\.


--
-- Data for Name: KineticReactants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."KineticReactants" (id, "KineticReactionId", "KineticSpeciesId", stoichiometry) FROM stdin;
\.


--
-- Data for Name: KineticReactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."KineticReactions" (id, reaction_id, name, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, "KineticModelId", reversible) FROM stdin;
\.


--
-- Data for Name: KineticSpecies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."KineticSpecies" (id, species_id, name, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, initial_concentration, "KineticCompartmentId", "KineticModelId", unit_definition_id) FROM stdin;
\.


--
-- Data for Name: KineticUnits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."KineticUnits" (id, "KineticModelId", "UnitDefinitionId") FROM stdin;
\.


--
-- Data for Name: Languages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Languages" (id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, name, code, "nativeName") FROM stdin;
\.


--
-- Data for Name: LearningObjective; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."LearningObjective" (id, "versionId", version, "valueRefId", "valueId", "_createdBy", "_createdAt") FROM stdin;
\.


--
-- Data for Name: LearningObjectiveAssocs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."LearningObjectiveAssocs" (id, origin, sub, modelid) FROM stdin;
\.


--
-- Data for Name: MetaboliteConstraintBasedModel; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MetaboliteConstraintBasedModel" ("ConstraintBasedModelId", "MetaboliteId") FROM stdin;
\.


--
-- Data for Name: Metabolites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Metabolites" (id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, name, formula, charge, "KineticBasedModelId", "CompartmentId", "SpeciesId") FROM stdin;
\.


--
-- Data for Name: ModelContext; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ModelContext" (id, "contextType", "modelId", "modelOriginId", uploads, downloads, settings, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted) FROM stdin;
\.


--
-- Data for Name: ModelContextData; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ModelContextData" (id, "modelContextId", "dataType", data, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted) FROM stdin;
\.


--
-- Data for Name: ModelCourse; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ModelCourse" ("_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, "CourseId", "ModelId", "BaseModelId", "prevId") FROM stdin;
\.


--
-- Data for Name: ModelStartedLesson; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ModelStartedLesson" (id, "modelId", "courseId", canceled, "canceledMsg", submitted, "submittedAt", "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted) FROM stdin;
\.


--
-- Data for Name: Modules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Modules" (id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, "BaseModelId") FROM stdin;
\.


--
-- Data for Name: MultiscaleModels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MultiscaleModels" (id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, "ModelVersionId") FROM stdin;
\.


--
-- Data for Name: MultiscaleTemplateFilePaths; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MultiscaleTemplateFilePaths" (id, config, "logicalModel", "logicalModelMapping", "cbmModel", "cbmModelMapping", "MultiscaleModelId", "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted) FROM stdin;
\.


--
-- Data for Name: ObjectiveFunctions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ObjectiveFunctions" (id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, name, "ConstraintBasedModelId") FROM stdin;
\.


--
-- Data for Name: ObjectiveReactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ObjectiveReactions" (id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, coefficient, "ObjectiveFunctionId", "ReactionId") FROM stdin;
\.


--
-- Data for Name: PKCompartments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PKCompartments" (id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, name, type, cmp, ext_type, "PharmacokineticModelId") FROM stdin;
\.


--
-- Data for Name: PKCovariates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PKCovariates" (id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, name, type, function_id, parameter_id) FROM stdin;
\.


--
-- Data for Name: PKDosings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PKDosings" (id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, type, route, amount, duration, "interval", parameter_id) FROM stdin;
\.


--
-- Data for Name: PKParameters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PKParameters" (id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, name, type, value, value_type, "PKCompartmentId", "PKRateId") FROM stdin;
\.


--
-- Data for Name: PKPopulations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PKPopulations" (id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, name, type, distribution_id, "PharmacokineticModelId") FROM stdin;
\.


--
-- Data for Name: PKRates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PKRates" (id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, name, from_compartment_id, to_compartment_id, "PharmacokineticModelId") FROM stdin;
\.


--
-- Data for Name: PKVariabilities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PKVariabilities" (id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, type, distribution_id, parameter_id) FROM stdin;
\.


--
-- Data for Name: PageModel; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PageModel" (id, "reactionId", "geneId", "speciesId", "metaboliteId", "compartmentId", "ModelVersionId", creationdate, creationuser, updatedate, updateuser, "_deletedBy", "_deletedAt", _deleted) FROM stdin;
\.


--
-- Data for Name: PageModelReference; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PageModelReference" (id, "pageModelId", "referenceId", creationdate, creationuser, "_deletedBy", "_deletedAt", _deleted) FROM stdin;
\.


--
-- Data for Name: PageReactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PageReactions" (id, "reactionId", creationdate, creationuser, updatedate, updateuser, "_deletedBy", "_deletedAt", _deleted) FROM stdin;
\.


--
-- Data for Name: PharmacokineticModels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PharmacokineticModels" (id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, "ModelVersionId") FROM stdin;
\.


--
-- Data for Name: ReactionCoefficients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ReactionCoefficients" (id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, coefficient, "ReactionId", "MetaboliteId") FROM stdin;
\.


--
-- Data for Name: ReactionConstraintBasedModel; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ReactionConstraintBasedModel" ("ConstraintBasedModelId", "ReactionId") FROM stdin;
\.


--
-- Data for Name: ReactionGenes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ReactionGenes" (id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, "GeneId", "ReactionId") FROM stdin;
\.


--
-- Data for Name: Reactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Reactions" (id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, "reactionId", name, "lowerBound", "upperBound", "objectiveCoefficient", "KineticBasedModelId", "SubSystemId", boundary) FROM stdin;
\.


--
-- Data for Name: RenewalItems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RenewalItems" (id, "subscriptionId", "accountPlanId", "renewalDateTime", "masterSubId", status, "retryCount", "isError", "errorDesc", "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted) FROM stdin;
\.


--
-- Data for Name: SectionModel; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SectionModel" (id, "pageModelId", title, type, "position", creationdate, creationuser, updatedate, updateuser, "_deletedBy", "_deletedAt", _deleted) FROM stdin;
\.


--
-- Data for Name: SectionReactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SectionReactions" (id, "pageReactionId", title, type, "position", creationdate, creationuser, updatedate, updateuser, "_deletedBy", "_deletedAt", _deleted) FROM stdin;
\.


--
-- Data for Name: SequelizeMeta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SequelizeMeta" (name) FROM stdin;
20230526000001-create-kinetic-model.js
20230731155154-create-pk-dosing-regimen.js
20210227161909-create-cached-score.js
20250118120301-add-pending-password-ccapp.js
20210428012650-objectiveassoc-to-model.js
20220511002823-create-user-ecommerces.js
20240714132250-create-ContentModelReference-migration.js
20240119083820-add-cols-subcondition.js
20230731155151-create-function.js
20231123153013-create-units.js
20200828193440-transform-my-teaching-to-course.js
20230526000002-create-kinetic-compartment.js
20230731155151-create-pk-compartment.js
20241128092542-create-users-ccapp.js
20200322204359-add-unique_char_id-field-to-Course-table.js
20230727144801-create-pk-model.js
20230217081214-add-model-replacements.js
20230526000010-create-kinetic-local-params.js
20231009150141-add-accesstype-profile.js
20220423035754-add_column_AccountPlan.js
20190610164653-create-table.js
20231206102032-add-cbmid-subsystem.js
20231210220453-add-reactants-products-to-kinaticlaw.js
20230526000009-create-kinetic-law.js
20231018131126-add-reversible-to-reaction.js
20210427214147-create-learning-objective-assoc.js
20231207204312-add-unit-to-kinetic-local-params.js
20190603234004-create-learning-activity-group.js
20230612061543-add_column_experiments.js
20210301231838-cached_score_add_course.js
20231124095353-create-unitdefition-units.js
20241105054321-create-kinetic-global-params.js
20230731155151-create-distribution.js
20230328143452-model-add-btree.js
20230425123313-fn-latest-version.js
20240808091529-change-formula-to-text-kineticlaw.js
20210205214336-add-institution-mapping.js
20200410175043-extend-metabolic.js
20240229130840-add_is_reference_column-to-model.js
20240819054321-add-stoichiometry-kinetic.js
20230526000006-create-kinetic-products.js
20231124143914-add-unit-to-species.js
20210511200540-change-category.js
20240612090313-add-environment-default.js
20230526000003-create-kinetic-species.js
20200412210241-create-modelcourse-table.js
20230526000005-create-kinetic-reactants.js
20230526000008-create-kinetic-law-type.js
20230731155152-create-pk-variability.js
20200828193450-rename-model-modeltype.js
20230731155153-create-pk-covariate.js
20240126120512-add-gene-position.js
20240314094311-create-model-context.js
20220830111514-model-add-publish.js
20230526000007-create-kinetic-modifier.js
20230523093301-kinetic-model.js
20230227231915-add-modelcourse-replaces.js
20191202201733-la-group-basic-start-here.js
20210726223925-social-login.js
20230314114732-update-user-identity-view.js
20240702111203-create-environment-drug.js
20200212204350-create-course-table.js
20240314102127-create-model-context-data.js
20220511002537-create-renewalitems.js
20230328111117-fn-get-original-lesson.js
20191022163634-create-saved-images.js
20221209101217-model-add-metadata.js
20231123153010-create-unitdefinitions.js
20221909164350-create-user-course-unenroll.js
20210303192712-score-cache-add-objectives.js
20211110212925-test.js
20230731155152-create-pk-parameter.js
20231117192923-add_boundary_attribute_to_reactions_table.js
20220630000000-change-reaction-dtype.js
20221226154220-create-learning-objective.js
20200828193435-create-institution-table.js
20231002140223-create-page-model.js
20230711221215-create-tasks.js
20230227231512-fn-get-basemodel-id.js
20231124095353-create-kinetic-units.js
20230215091316-create-model-started-lesson.js
20220423035553-add_column_UserSubscription.js
20200828193460-metabolic-consistency.js
20230526000004-create-kinetic-reaction.js
20231018124440-add-description-to-kinetic-laws.js
20230731155152-create-pk-population.js
20230731155151-create-pk-rate.js
20240710174910-create_PageModelReference.js
\.


--
-- Data for Name: SubSystems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SubSystems" (id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, "subSystemId", name, "ConstraintBasedModelId") FROM stdin;
\.


--
-- Data for Name: Tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Tasks" (id, job, name, description, "processId", progress, state, "startedAt", "finishedAt", "prevRun", "nextRun", sleep, "daysRun", priority, "failureMessage", files, "executedBy", "resultLogPath", "resultData", "resultDataType", "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted) FROM stdin;
\.


--
-- Data for Name: UnitDefinition_Units; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UnitDefinition_Units" (id, "UnitDefinitionId", "UnitId") FROM stdin;
\.


--
-- Data for Name: UnitDefinitions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UnitDefinitions" (id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, name) FROM stdin;
\.


--
-- Data for Name: Units; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Units" (id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, name, type, multiplier, exponent, scale) FROM stdin;
\.


--
-- Data for Name: UserCourses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserCourses" ("_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, "UserId", "CourseId") FROM stdin;
\.


--
-- Data for Name: UserCoursesUnenroll; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserCoursesUnenroll" (id, "userId", "courseId", "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted) FROM stdin;
\.


--
-- Data for Name: UserEcommerces; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserEcommerces" (id, "userId", "masterSubId", "customerId", "cardHolderName", "expirationMonth", "expirationYear", country, state, city, pincode, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted) FROM stdin;
\.


--
-- Data for Name: UserSubscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserSubscriptions" (id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, "AccountPlanId", "startDateTime", "endDateTime", "noOfStudentAccountPurchased", status, "prevSubscriptionId", "masterSubId", "userId", "termOrder") FROM stdin;
\.


--
-- Data for Name: analysis_activity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.analysis_activity (id, parentid, componentid, min, max) FROM stdin;
\.


--
-- Data for Name: analysis_environment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.analysis_environment (id, name, modelid, userid, "isDefault", "position") FROM stdin;
\.


--
-- Data for Name: anonymous_user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.anonymous_user (id, ip, useragent, creationdate) FROM stdin;
3300	172.29.0.1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36	2025-02-19 20:16:44.888
1	10.145.24.132	Mozilla/5.0 (Windows NT 10.0; WOW64; rv:55.0) Gecko/20100101 Firefox/55.0	2017-08-07 00:51:37.94
2	75.170.96.78	Mozilla/5.0 (Windows NT 10.0; WOW64; rv:55.0) Gecko/20100101 Firefox/55.0	2017-08-07 00:58:07.948
3	66.249.75.7	Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; Google Web Preview Analytics) Chrome/41.0.2272.118 Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)	2017-08-07 03:25:10.938
\.


--
-- Data for Name: authority; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.authority (user_id, role_id) FROM stdin;
1	1
\.


--
-- Data for Name: authority_request; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.authority_request (userid, roleid, token, creationdate, approvaldate, rejectiondate) FROM stdin;
5828	1	023190f4-2757-40ff-8b4a-4bcc3f8406f0	2018-01-21 20:41:21.103	\N	\N
1	1	d9dc2d61-a715-43d8-92f1-b5f554da2fa0	2018-04-18 13:01:39.043	2018-04-18 13:02:11.295	\N
\.


--
-- Data for Name: cached_scores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cached_scores (id, modelid, score, "for", "createdAt", "updatedAt", courseid, objective) FROM stdin;
\.


--
-- Data for Name: calc_interval; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.calc_interval (id, experimentid, "from", "to") FROM stdin;
\.


--
-- Data for Name: component_pair; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.component_pair (id, firstcomponentid, secondcomponentid, delay, threshold) FROM stdin;
\.


--
-- Data for Name: condition; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.condition (id, name, speciesrelation, state, subconditionrelation, type, regulator_id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted) FROM stdin;
\.


--
-- Data for Name: condition_species; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.condition_species (condition_id, species_id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, "GeneId") FROM stdin;
\.


--
-- Data for Name: content; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.content (id, creationdate, creationuser, flagged, "position", text, updatedate, updateuser, section_id) FROM stdin;
\.


--
-- Data for Name: content_reference; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.content_reference (id, creationdate, creationuser, "position", content_id, reference_id, datatype, citationtype) FROM stdin;
\.


--
-- Data for Name: course; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.course (id, name, modelid) FROM stdin;
\.


--
-- Data for Name: course_activity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.course_activity (id, courserangeid, speciesid, value, min, max) FROM stdin;
\.


--
-- Data for Name: course_mutation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.course_mutation (id, courserangeid, speciesid, state) FROM stdin;
\.


--
-- Data for Name: course_range; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.course_range (id, courseid, "from", "to", name) FROM stdin;
\.


--
-- Data for Name: dominance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dominance (negative_regulator_id, positive_regulator_id) FROM stdin;
\.


--
-- Data for Name: experiment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.experiment (id, creationdate, lastaccessdate, lastrundate, name, published, settings, shared, state, updatedate, userid, model_id, courseid, updatetype, environmentid, lastrunenvironmentid, exper_type, err_msg, "_updatedBy", "_updatedAt", "_deletedAt", _deleted, "drugEnvironmentId", "lastRunDrugEnvironmentId") FROM stdin;
\.


--
-- Data for Name: initial_state; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.initial_state (id, creationdate, name, updatedate, model_id) FROM stdin;
\.


--
-- Data for Name: initial_state_species; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.initial_state_species (initial_state_id, species_id) FROM stdin;
\.


--
-- Data for Name: layout; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.layout (id, name, top, bottom, "left", "right", creationdate, updatedate, modelid) FROM stdin;
\.


--
-- Data for Name: layout_node; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.layout_node (id, componentid, layoutid, x, y) FROM stdin;
\.


--
-- Data for Name: learning_activity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.learning_activity (id, masterid, name, "position", workspacelayout, version, views, groupid) FROM stdin;
\.


--
-- Data for Name: learning_activity_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.learning_activity_groups (id, name, "position", masterid) FROM stdin;
\.


--
-- Data for Name: logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.logs (id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, type, action, transaction_uuid, message) FROM stdin;
\.


--
-- Data for Name: logs_bkp_grp; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.logs_bkp_grp (id, content) FROM stdin;
\.


--
-- Data for Name: model; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.model (id, creationdate, description, name, published, tags, updatedate, userid, author, cited, biologicupdatedate, knowledgebaseupdatedate, components, interactions, type, originid, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, modeltype, "publishedAt", metadata, "prevOrigin", is_reference) FROM stdin;
\.


--
-- Data for Name: model_domain_access; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.model_domain_access (modelid, userid, domain, creationdate, modellinkid) FROM stdin;
\.


--
-- Data for Name: model_initial_state; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.model_initial_state (modelid, initialstateid, layoutid, workspacelayout, survey, content) FROM stdin;
\.


--
-- Data for Name: model_link; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.model_link (id, accesscode, accesscount, creationdate, enddate, startdate, updatedate, userid, model_id, access) FROM stdin;
\.


--
-- Data for Name: model_reference; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.model_reference (id, creationdate, creationuser, "position", model_id, reference_id) FROM stdin;
\.


--
-- Data for Name: model_reference_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.model_reference_types (id, modelid, referenceid, citationtype, datatype) FROM stdin;
\.


--
-- Data for Name: model_score; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.model_score (id, citations, downloads, edits, lastcalculationdate, score, simulations, model_id) FROM stdin;
\.


--
-- Data for Name: model_share; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.model_share (id, access, creationdate, email, updatedate, userid, model_id, modellinkid) FROM stdin;
\.


--
-- Data for Name: model_share_notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.model_share_notification (modelid, email, modelshareid, userid, attempts, creationdate, updatedate, domain) FROM stdin;
\.


--
-- Data for Name: model_statistic; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.model_statistic (id, creationdate, metadata, type, userid, model_id) FROM stdin;
\.


--
-- Data for Name: model_version; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.model_version (id, version, description, modelid, userid, creationdate, name, selected, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted) FROM stdin;
\.


--
-- Data for Name: page; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.page (id, creationdate, creationuser, updatedate, updateuser) FROM stdin;
\.


--
-- Data for Name: page_reference; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.page_reference (id, creationdate, creationuser, "position", page_id, reference_id) FROM stdin;
\.


--
-- Data for Name: profile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profile (id, email, firstname, institution, lastname, user_id, institution_id, "thirdPartyId", "thirdPartyType", "alternateEmails", "avatarUri", "accessType") FROM stdin;
1	cchlteachertest@gmail.com	Teacher	UNL	Test	1	6	\N	\N	\N	\N	\N
\.


--
-- Data for Name: realtime_activity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.realtime_activity (id, parentid, componentid, value) FROM stdin;
\.


--
-- Data for Name: realtime_environment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.realtime_environment (id, name, modelid, userid) FROM stdin;
\.


--
-- Data for Name: reference; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reference (id, creationdate, creationuser, pmid, text, updatedate, updateuser, shortcitation, doi) FROM stdin;
\.


--
-- Data for Name: registration; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.registration (id, activationcode, activationdate, registrationdate, user_id) FROM stdin;
\.


--
-- Data for Name: regulator; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.regulator (id, conditionrelation, regulationtype, regulator_species_id, species_id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, "ReactionGeneId", "position") FROM stdin;
\.


--
-- Data for Name: role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role (id, name) FROM stdin;
4	ADMINISTRATOR
1	INSTRUCTOR
3	SCIENTIST
2	STUDENT
\.


--
-- Data for Name: saved_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.saved_images (id, file, type, "timestamp", "profileId", "BaseModelId") FROM stdin;
\.


--
-- Data for Name: section; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.section (id, creationdate, creationuser, "position", title, type, updatedate, updateuser, page_id) FROM stdin;
\.


--
-- Data for Name: species; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.species (id, name, absentstate, creationdate, external, updatedate, model_id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, "speciesId", "position") FROM stdin;
\.


--
-- Data for Name: sub_condition; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sub_condition (id, name, speciesrelation, state, type, condition_id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted) FROM stdin;
\.


--
-- Data for Name: sub_condition_species; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sub_condition_species (sub_condition_id, species_id, "GeneId") FROM stdin;
\.


--
-- Data for Name: upload; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.upload (id, uploadname, storagename, filetype, userid, description, uploaddate) FROM stdin;
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (id, enabled, password) FROM stdin;
1	t	25f9e794323b453885f5181f1b624d0b
\.


--
-- Data for Name: user_registration_notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_registration_notification (id, domain, attempts, creationdate, updatedate) FROM stdin;
0	RESEARCH	0	2023-10-09 18:23:00.078	2023-10-09 18:23:00.078+00
5854	RESEARCH	0	2023-10-09 19:20:59.897	2023-10-09 19:20:59.897+00
5855	RESEARCH	0	2023-12-18 12:16:50.735	2023-12-18 12:16:50.735+00
\.


--
-- Data for Name: user_subscription; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_subscription (id, userid, creationdate, expirationdate, modelssubmitted) FROM stdin;
\.


--
-- Data for Name: users_ccapp; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users_ccapp (id, user_id, user_ccapp_id, "_createdBy", "_createdAt", "_updatedBy", "_updatedAt", "_deletedBy", "_deletedAt", _deleted, password_pending_update) FROM stdin;
1	1	83a1c34f-60fd-445a-a2e9-65eee70e5690	\N	2025-01-22 00:05:23.665522+00	\N	2025-01-22 00:05:23.665522+00	\N	\N	f	f
\.


--
-- Name: definition_id_seq; Type: SEQUENCE SET; Schema: metadata; Owner: postgres
--

SELECT pg_catalog.setval('metadata.definition_id_seq', 8, false);


--
-- Name: value_id_seq; Type: SEQUENCE SET; Schema: metadata; Owner: postgres
--

SELECT pg_catalog.setval('metadata.value_id_seq', 1, true);


--
-- Name: AccountPlans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."AccountPlans_id_seq"', 1, false);


--
-- Name: AclRules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."AclRules_id_seq"', 1, false);


--
-- Name: Annotations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Annotations_id_seq"', 1, false);


--
-- Name: Compartments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Compartments_id_seq"', 1, false);


--
-- Name: ConstraintBasedModels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ConstraintBasedModels_id_seq"', 1, false);


--
-- Name: ContentModel_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ContentModel_id_seq"', 1, false);


--
-- Name: ContentReactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ContentReactions_id_seq"', 1, false);


--
-- Name: Countries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Countries_id_seq"', 1, false);


--
-- Name: Courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Courses_id_seq"', 1, false);


--
-- Name: Currencies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Currencies_id_seq"', 1, false);


--
-- Name: Distributions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Distributions_id_seq"', 1, false);


--
-- Name: DrugEnvironments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."DrugEnvironments_id_seq"', 1, false);


--
-- Name: Functions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Functions_id_seq"', 1, false);


--
-- Name: Genes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Genes_id_seq"', 1, false);


--
-- Name: Institutions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Institutions_id_seq"', 7, false);


--
-- Name: KineticBasedModels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."KineticBasedModels_id_seq"', 1, false);


--
-- Name: KineticCompartments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."KineticCompartments_id_seq"', 1, false);


--
-- Name: KineticGlobalParams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."KineticGlobalParams_id_seq"', 1, false);


--
-- Name: KineticLawTypes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."KineticLawTypes_id_seq"', 1, false);


--
-- Name: KineticLaws_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."KineticLaws_id_seq"', 1, false);


--
-- Name: KineticLocalParams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."KineticLocalParams_id_seq"', 1, false);


--
-- Name: KineticModels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."KineticModels_id_seq"', 1, false);


--
-- Name: KineticModifiers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."KineticModifiers_id_seq"', 1, false);


--
-- Name: KineticProducts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."KineticProducts_id_seq"', 1, false);


--
-- Name: KineticReactants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."KineticReactants_id_seq"', 1, false);


--
-- Name: KineticReactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."KineticReactions_id_seq"', 1, false);


--
-- Name: KineticSpecies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."KineticSpecies_id_seq"', 1, false);


--
-- Name: KineticUnits_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."KineticUnits_id_seq"', 1, false);


--
-- Name: Languages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Languages_id_seq"', 1, false);


--
-- Name: LearningObjectiveAssocs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."LearningObjectiveAssocs_id_seq"', 1, false);


--
-- Name: LearningObjective_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."LearningObjective_id_seq"', 1, false);


--
-- Name: Metabolites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Metabolites_id_seq"', 1, false);


--
-- Name: ModelContextData_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ModelContextData_id_seq"', 1, false);


--
-- Name: ModelContext_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ModelContext_id_seq"', 1, false);


--
-- Name: ModelStartedLesson_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ModelStartedLesson_id_seq"', 1, false);


--
-- Name: Modules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Modules_id_seq"', 1, false);


--
-- Name: MultiscaleModels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."MultiscaleModels_id_seq"', 1, false);


--
-- Name: MultiscaleTemplateFilePaths_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."MultiscaleTemplateFilePaths_id_seq"', 1, false);


--
-- Name: ObjectiveFunctions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ObjectiveFunctions_id_seq"', 1, false);


--
-- Name: ObjectiveReactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ObjectiveReactions_id_seq"', 1, false);


--
-- Name: PKCompartments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."PKCompartments_id_seq"', 1, false);


--
-- Name: PKCovariates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."PKCovariates_id_seq"', 1, false);


--
-- Name: PKDosings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."PKDosings_id_seq"', 1, false);


--
-- Name: PKParameters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."PKParameters_id_seq"', 1, false);


--
-- Name: PKPopulations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."PKPopulations_id_seq"', 1, false);


--
-- Name: PKRates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."PKRates_id_seq"', 1, false);


--
-- Name: PKVariabilities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."PKVariabilities_id_seq"', 1, false);


--
-- Name: PageModelReference_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."PageModelReference_id_seq"', 1, false);


--
-- Name: PageModel_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."PageModel_id_seq"', 1, false);


--
-- Name: PageReactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."PageReactions_id_seq"', 1, false);


--
-- Name: PharmacokineticModels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."PharmacokineticModels_id_seq"', 1, false);


--
-- Name: ReactionCoefficients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ReactionCoefficients_id_seq"', 1, false);


--
-- Name: ReactionGenes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ReactionGenes_id_seq"', 1, false);


--
-- Name: Reactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Reactions_id_seq"', 1, false);


--
-- Name: RenewalItems_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."RenewalItems_id_seq"', 1, false);


--
-- Name: Responses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Responses_id_seq"', 1, false);


--
-- Name: SectionModel_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."SectionModel_id_seq"', 1, false);


--
-- Name: SectionReactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."SectionReactions_id_seq"', 1, false);


--
-- Name: SubSystems_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."SubSystems_id_seq"', 1, false);


--
-- Name: Tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Tasks_id_seq"', 1, false);


--
-- Name: UnitDefinition_Units_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."UnitDefinition_Units_id_seq"', 1, false);


--
-- Name: UnitDefinitions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."UnitDefinitions_id_seq"', 1, false);


--
-- Name: Units_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Units_id_seq"', 1, false);


--
-- Name: UserCoursesUnenroll_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."UserCoursesUnenroll_id_seq"', 1, false);


--
-- Name: UserEcommerces_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."UserEcommerces_id_seq"', 1, false);


--
-- Name: UserSubscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."UserSubscriptions_id_seq"', 1, false);


--
-- Name: activity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.activity_id_seq', 1, false);


--
-- Name: analysis_activity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.analysis_activity_id_seq', 1, false);


--
-- Name: analysis_environment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.analysis_environment_id_seq', 1, false);


--
-- Name: anonymous_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.anonymous_user_id_seq', 1, false);


--
-- Name: cached_scores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cached_scores_id_seq', 1, false);


--
-- Name: calc_interval_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.calc_interval_id_seq', 1, false);


--
-- Name: component_pair_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.component_pair_id_seq', 1, false);


--
-- Name: condition_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.condition_id_seq', 1, false);


--
-- Name: content_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.content_id_seq', 1, false);


--
-- Name: content_reference_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.content_reference_id_seq', 1, false);


--
-- Name: course_activity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.course_activity_id_seq', 1, false);


--
-- Name: course_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.course_id_seq', 1, false);


--
-- Name: course_mutation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.course_mutation_id_seq', 1, false);


--
-- Name: course_range_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.course_range_id_seq', 1, false);


--
-- Name: experiment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.experiment_id_seq', 1, false);


--
-- Name: initial_state_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.initial_state_id_seq', 1, false);


--
-- Name: layout_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.layout_id_seq', 1, false);


--
-- Name: layout_node_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.layout_node_id_seq', 1, false);


--
-- Name: learning_activity_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.learning_activity_groups_id_seq', 1, false);


--
-- Name: learning_activity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.learning_activity_id_seq', 1, false);


--
-- Name: logs_bkp_grp_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.logs_bkp_grp_id_seq', 1, false);


--
-- Name: logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.logs_id_seq', 1, false);


--
-- Name: model_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.model_id_seq', 1, false);


--
-- Name: model_link_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.model_link_id_seq', 1, false);


--
-- Name: model_metadata_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.model_metadata_id_seq', 1, false);


--
-- Name: model_reference_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.model_reference_id_seq', 1, false);


--
-- Name: model_reference_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.model_reference_types_id_seq', 1, false);


--
-- Name: model_score_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.model_score_id_seq', 1, false);


--
-- Name: model_share_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.model_share_id_seq', 1, false);


--
-- Name: model_statistic_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.model_statistic_id_seq', 1, false);


--
-- Name: model_version_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.model_version_id_seq', 1, false);


--
-- Name: page_reference_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.page_reference_id_seq', 1, false);


--
-- Name: profile_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.profile_id_seq', 2, true);


--
-- Name: realtime_activity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.realtime_activity_id_seq', 1, false);


--
-- Name: realtime_environment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.realtime_environment_id_seq', 1, false);


--
-- Name: reference_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reference_id_seq', 1, false);


--
-- Name: registration_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.registration_id_seq', 1, false);


--
-- Name: regulator_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.regulator_id_seq', 1, false);


--
-- Name: saved_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.saved_images_id_seq', 1, false);


--
-- Name: section_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.section_id_seq', 1, false);


--
-- Name: species_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.species_id_seq', 1, false);


--
-- Name: sub_condition_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sub_condition_id_seq', 1, false);


--
-- Name: upload_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.upload_id_seq', 1, false);


--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_id_seq', 2, true);


--
-- Name: user_subscription_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_subscription_id_seq', 1, false);


--
-- Name: users_ccapp_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_ccapp_id_seq', 2, false);


--
-- Name: entity_value pk_entity_value; Type: CONSTRAINT; Schema: metadata; Owner: postgres
--

ALTER TABLE ONLY metadata.entity_value
    ADD CONSTRAINT pk_entity_value PRIMARY KEY (entity_id, value_id);


--
-- Name: definition pk_metadata; Type: CONSTRAINT; Schema: metadata; Owner: postgres
--

ALTER TABLE ONLY metadata.definition
    ADD CONSTRAINT pk_metadata PRIMARY KEY (id);


--
-- Name: value pk_value; Type: CONSTRAINT; Schema: metadata; Owner: postgres
--

ALTER TABLE ONLY metadata.value
    ADD CONSTRAINT pk_value PRIMARY KEY (id);


--
-- Name: value_attachment pk_value_attachment; Type: CONSTRAINT; Schema: metadata; Owner: postgres
--

ALTER TABLE ONLY metadata.value_attachment
    ADD CONSTRAINT pk_value_attachment PRIMARY KEY (value_id);


--
-- Name: value_bool pk_value_bool; Type: CONSTRAINT; Schema: metadata; Owner: postgres
--

ALTER TABLE ONLY metadata.value_bool
    ADD CONSTRAINT pk_value_bool PRIMARY KEY (value_id);


--
-- Name: value_date pk_value_date; Type: CONSTRAINT; Schema: metadata; Owner: postgres
--

ALTER TABLE ONLY metadata.value_date
    ADD CONSTRAINT pk_value_date PRIMARY KEY (value_id);


--
-- Name: value_decimal pk_value_decimal; Type: CONSTRAINT; Schema: metadata; Owner: postgres
--

ALTER TABLE ONLY metadata.value_decimal
    ADD CONSTRAINT pk_value_decimal PRIMARY KEY (value_id);


--
-- Name: value_integer pk_value_integer; Type: CONSTRAINT; Schema: metadata; Owner: postgres
--

ALTER TABLE ONLY metadata.value_integer
    ADD CONSTRAINT pk_value_integer PRIMARY KEY (value_id);


--
-- Name: value_text pk_value_text; Type: CONSTRAINT; Schema: metadata; Owner: postgres
--

ALTER TABLE ONLY metadata.value_text
    ADD CONSTRAINT pk_value_text PRIMARY KEY (value_id);


--
-- Name: definition uk_definition_name; Type: CONSTRAINT; Schema: metadata; Owner: postgres
--

ALTER TABLE ONLY metadata.definition
    ADD CONSTRAINT uk_definition_name UNIQUE (name);


--
-- Name: AccountPlans AccountPlans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AccountPlans"
    ADD CONSTRAINT "AccountPlans_pkey" PRIMARY KEY (id);


--
-- Name: AclRules AclRules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AclRules"
    ADD CONSTRAINT "AclRules_pkey" PRIMARY KEY (id);


--
-- Name: Annotations Annotations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Annotations"
    ADD CONSTRAINT "Annotations_pkey" PRIMARY KEY (id);


--
-- Name: CompartmentSpecies CompartmentSpecies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CompartmentSpecies"
    ADD CONSTRAINT "CompartmentSpecies_pkey" PRIMARY KEY ("CompartmentId", "SpeciesId");


--
-- Name: Compartments Compartments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Compartments"
    ADD CONSTRAINT "Compartments_pkey" PRIMARY KEY (id);


--
-- Name: ConstraintBasedModels ConstraintBasedModels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ConstraintBasedModels"
    ADD CONSTRAINT "ConstraintBasedModels_pkey" PRIMARY KEY (id);


--
-- Name: ContentModelReference ContentModelReference_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ContentModelReference"
    ADD CONSTRAINT "ContentModelReference_pkey" PRIMARY KEY (id);


--
-- Name: ContentModel ContentModel_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ContentModel"
    ADD CONSTRAINT "ContentModel_pkey" PRIMARY KEY (id);


--
-- Name: ContentReactions ContentReactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ContentReactions"
    ADD CONSTRAINT "ContentReactions_pkey" PRIMARY KEY (id);


--
-- Name: Countries Countries_abbreviation_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Countries"
    ADD CONSTRAINT "Countries_abbreviation_key" UNIQUE (abbreviation);


--
-- Name: Countries Countries_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Countries"
    ADD CONSTRAINT "Countries_name_key" UNIQUE (name);


--
-- Name: Countries Countries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Countries"
    ADD CONSTRAINT "Countries_pkey" PRIMARY KEY (id);


--
-- Name: CountryLanguages CountryLanguages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CountryLanguages"
    ADD CONSTRAINT "CountryLanguages_pkey" PRIMARY KEY ("CountryId", "LanguageId");


--
-- Name: Courses Courses_codeKey_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Courses"
    ADD CONSTRAINT "Courses_codeKey_key" UNIQUE ("codeKey");


--
-- Name: Courses Courses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Courses"
    ADD CONSTRAINT "Courses_pkey" PRIMARY KEY (id);


--
-- Name: Currencies Currencies_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Currencies"
    ADD CONSTRAINT "Currencies_name_key" UNIQUE (name);


--
-- Name: Currencies Currencies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Currencies"
    ADD CONSTRAINT "Currencies_pkey" PRIMARY KEY (id);


--
-- Name: Distributions Distributions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Distributions"
    ADD CONSTRAINT "Distributions_pkey" PRIMARY KEY (id);


--
-- Name: DrugEnvironments DrugEnvironments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DrugEnvironments"
    ADD CONSTRAINT "DrugEnvironments_pkey" PRIMARY KEY (id);


--
-- Name: Functions Functions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Functions"
    ADD CONSTRAINT "Functions_pkey" PRIMARY KEY (id);


--
-- Name: GeneConstraintBasedModel GeneConstraintBasedModel_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GeneConstraintBasedModel"
    ADD CONSTRAINT "GeneConstraintBasedModel_pkey" PRIMARY KEY ("ConstraintBasedModelId", "GeneId");


--
-- Name: Genes Genes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Genes"
    ADD CONSTRAINT "Genes_pkey" PRIMARY KEY (id);


--
-- Name: Institutions Institutions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Institutions"
    ADD CONSTRAINT "Institutions_pkey" PRIMARY KEY (id);


--
-- Name: KineticBasedModels KineticBasedModels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticBasedModels"
    ADD CONSTRAINT "KineticBasedModels_pkey" PRIMARY KEY (id);


--
-- Name: KineticCompartments KineticCompartments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticCompartments"
    ADD CONSTRAINT "KineticCompartments_pkey" PRIMARY KEY (id);


--
-- Name: KineticGlobalParams KineticGlobalParams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticGlobalParams"
    ADD CONSTRAINT "KineticGlobalParams_pkey" PRIMARY KEY (id);


--
-- Name: KineticLawTypes KineticLawTypes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticLawTypes"
    ADD CONSTRAINT "KineticLawTypes_pkey" PRIMARY KEY (id);


--
-- Name: KineticLaws KineticLaws_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticLaws"
    ADD CONSTRAINT "KineticLaws_pkey" PRIMARY KEY (id);


--
-- Name: KineticLocalParams KineticLocalParams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticLocalParams"
    ADD CONSTRAINT "KineticLocalParams_pkey" PRIMARY KEY (id);


--
-- Name: KineticModels KineticModels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticModels"
    ADD CONSTRAINT "KineticModels_pkey" PRIMARY KEY (id);


--
-- Name: KineticModifiers KineticModifiers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticModifiers"
    ADD CONSTRAINT "KineticModifiers_pkey" PRIMARY KEY (id);


--
-- Name: KineticProducts KineticProducts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticProducts"
    ADD CONSTRAINT "KineticProducts_pkey" PRIMARY KEY (id);


--
-- Name: KineticReactants KineticReactants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticReactants"
    ADD CONSTRAINT "KineticReactants_pkey" PRIMARY KEY (id);


--
-- Name: KineticReactions KineticReactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticReactions"
    ADD CONSTRAINT "KineticReactions_pkey" PRIMARY KEY (id);


--
-- Name: KineticSpecies KineticSpecies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticSpecies"
    ADD CONSTRAINT "KineticSpecies_pkey" PRIMARY KEY (id);


--
-- Name: KineticUnits KineticUnits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticUnits"
    ADD CONSTRAINT "KineticUnits_pkey" PRIMARY KEY (id);


--
-- Name: Languages Languages_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Languages"
    ADD CONSTRAINT "Languages_name_key" UNIQUE (name);


--
-- Name: Languages Languages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Languages"
    ADD CONSTRAINT "Languages_pkey" PRIMARY KEY (id);


--
-- Name: LearningObjectiveAssocs LearningObjectiveAssocs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LearningObjectiveAssocs"
    ADD CONSTRAINT "LearningObjectiveAssocs_pkey" PRIMARY KEY (id);


--
-- Name: LearningObjective LearningObjective_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LearningObjective"
    ADD CONSTRAINT "LearningObjective_pkey" PRIMARY KEY (id);


--
-- Name: MetaboliteConstraintBasedModel MetaboliteConstraintBasedModel_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MetaboliteConstraintBasedModel"
    ADD CONSTRAINT "MetaboliteConstraintBasedModel_pkey" PRIMARY KEY ("ConstraintBasedModelId", "MetaboliteId");


--
-- Name: Metabolites Metabolites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Metabolites"
    ADD CONSTRAINT "Metabolites_pkey" PRIMARY KEY (id);


--
-- Name: ModelContextData ModelContextData_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ModelContextData"
    ADD CONSTRAINT "ModelContextData_pkey" PRIMARY KEY (id);


--
-- Name: ModelContext ModelContext_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ModelContext"
    ADD CONSTRAINT "ModelContext_pkey" PRIMARY KEY (id);


--
-- Name: ModelCourse ModelCourse_CourseId_BaseModelId_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ModelCourse"
    ADD CONSTRAINT "ModelCourse_CourseId_BaseModelId_key" UNIQUE ("CourseId", "BaseModelId");


--
-- Name: ModelCourse ModelCourse_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ModelCourse"
    ADD CONSTRAINT "ModelCourse_pkey" PRIMARY KEY ("CourseId", "ModelId");


--
-- Name: ModelStartedLesson ModelStartedLesson_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ModelStartedLesson"
    ADD CONSTRAINT "ModelStartedLesson_pkey" PRIMARY KEY (id);


--
-- Name: Modules Modules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Modules"
    ADD CONSTRAINT "Modules_pkey" PRIMARY KEY (id);


--
-- Name: MultiscaleModels MultiscaleModels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MultiscaleModels"
    ADD CONSTRAINT "MultiscaleModels_pkey" PRIMARY KEY (id);


--
-- Name: MultiscaleTemplateFilePaths MultiscaleTemplateFilePaths_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MultiscaleTemplateFilePaths"
    ADD CONSTRAINT "MultiscaleTemplateFilePaths_pkey" PRIMARY KEY (id);


--
-- Name: ObjectiveFunctions ObjectiveFunctions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ObjectiveFunctions"
    ADD CONSTRAINT "ObjectiveFunctions_pkey" PRIMARY KEY (id);


--
-- Name: ObjectiveReactions ObjectiveReactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ObjectiveReactions"
    ADD CONSTRAINT "ObjectiveReactions_pkey" PRIMARY KEY (id);


--
-- Name: PKCompartments PKCompartments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PKCompartments"
    ADD CONSTRAINT "PKCompartments_pkey" PRIMARY KEY (id);


--
-- Name: PKCovariates PKCovariates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PKCovariates"
    ADD CONSTRAINT "PKCovariates_pkey" PRIMARY KEY (id);


--
-- Name: PKDosings PKDosings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PKDosings"
    ADD CONSTRAINT "PKDosings_pkey" PRIMARY KEY (id);


--
-- Name: PKParameters PKParameters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PKParameters"
    ADD CONSTRAINT "PKParameters_pkey" PRIMARY KEY (id);


--
-- Name: PKPopulations PKPopulations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PKPopulations"
    ADD CONSTRAINT "PKPopulations_pkey" PRIMARY KEY (id);


--
-- Name: PKRates PKRates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PKRates"
    ADD CONSTRAINT "PKRates_pkey" PRIMARY KEY (id);


--
-- Name: PKVariabilities PKVariabilities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PKVariabilities"
    ADD CONSTRAINT "PKVariabilities_pkey" PRIMARY KEY (id);


--
-- Name: PageModelReference PageModelReference_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PageModelReference"
    ADD CONSTRAINT "PageModelReference_pkey" PRIMARY KEY (id);


--
-- Name: PageModel PageModel_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PageModel"
    ADD CONSTRAINT "PageModel_pkey" PRIMARY KEY (id);


--
-- Name: PageReactions PageReactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PageReactions"
    ADD CONSTRAINT "PageReactions_pkey" PRIMARY KEY (id);


--
-- Name: PharmacokineticModels PharmacokineticModels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PharmacokineticModels"
    ADD CONSTRAINT "PharmacokineticModels_pkey" PRIMARY KEY (id);


--
-- Name: ReactionCoefficients ReactionCoefficients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReactionCoefficients"
    ADD CONSTRAINT "ReactionCoefficients_pkey" PRIMARY KEY (id);


--
-- Name: ReactionConstraintBasedModel ReactionConstraintBasedModel_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReactionConstraintBasedModel"
    ADD CONSTRAINT "ReactionConstraintBasedModel_pkey" PRIMARY KEY ("ConstraintBasedModelId", "ReactionId");


--
-- Name: ReactionGenes ReactionGenes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReactionGenes"
    ADD CONSTRAINT "ReactionGenes_pkey" PRIMARY KEY (id);


--
-- Name: Reactions Reactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reactions"
    ADD CONSTRAINT "Reactions_pkey" PRIMARY KEY (id);


--
-- Name: RenewalItems RenewalItems_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RenewalItems"
    ADD CONSTRAINT "RenewalItems_pkey" PRIMARY KEY (id);


--
-- Name: Responses Responses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Responses"
    ADD CONSTRAINT "Responses_pkey" PRIMARY KEY (id);


--
-- Name: SectionModel SectionModel_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SectionModel"
    ADD CONSTRAINT "SectionModel_pkey" PRIMARY KEY (id);


--
-- Name: SectionReactions SectionReactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SectionReactions"
    ADD CONSTRAINT "SectionReactions_pkey" PRIMARY KEY (id);


--
-- Name: SequelizeMeta SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


--
-- Name: SubSystems SubSystems_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SubSystems"
    ADD CONSTRAINT "SubSystems_pkey" PRIMARY KEY (id);


--
-- Name: Tasks Tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tasks"
    ADD CONSTRAINT "Tasks_pkey" PRIMARY KEY (id);


--
-- Name: UnitDefinition_Units UnitDefinition_Units_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnitDefinition_Units"
    ADD CONSTRAINT "UnitDefinition_Units_pkey" PRIMARY KEY (id);


--
-- Name: UnitDefinitions UnitDefinitions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnitDefinitions"
    ADD CONSTRAINT "UnitDefinitions_pkey" PRIMARY KEY (id);


--
-- Name: Units Units_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Units"
    ADD CONSTRAINT "Units_pkey" PRIMARY KEY (id);


--
-- Name: UserCoursesUnenroll UserCoursesUnenroll_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserCoursesUnenroll"
    ADD CONSTRAINT "UserCoursesUnenroll_pkey" PRIMARY KEY (id);


--
-- Name: UserCourses UserCourses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserCourses"
    ADD CONSTRAINT "UserCourses_pkey" PRIMARY KEY ("UserId", "CourseId");


--
-- Name: UserEcommerces UserEcommerces_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserEcommerces"
    ADD CONSTRAINT "UserEcommerces_pkey" PRIMARY KEY (id);


--
-- Name: UserSubscriptions UserSubscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserSubscriptions"
    ADD CONSTRAINT "UserSubscriptions_pkey" PRIMARY KEY (id);


--
-- Name: anonymous_user anonymous_user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.anonymous_user
    ADD CONSTRAINT anonymous_user_pkey PRIMARY KEY (id);


--
-- Name: cached_scores cached_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cached_scores
    ADD CONSTRAINT cached_scores_pkey PRIMARY KEY (id);


--
-- Name: experiment_data experiment_data_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.experiment_data
    ADD CONSTRAINT experiment_data_pkey PRIMARY KEY (experiment_id, simulation, calcintervalid);


--
-- Name: learning_activity_groups learning_activity_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_activity_groups
    ADD CONSTRAINT learning_activity_groups_pkey PRIMARY KEY (id);


--
-- Name: logs_bkp_grp logs_bkp_grp_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs_bkp_grp
    ADD CONSTRAINT logs_bkp_grp_pkey PRIMARY KEY (id);


--
-- Name: logs logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs
    ADD CONSTRAINT logs_pkey PRIMARY KEY (id);


--
-- Name: activity pk_activity; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity
    ADD CONSTRAINT pk_activity PRIMARY KEY (id);


--
-- Name: analysis_activity pk_analysis_activity; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analysis_activity
    ADD CONSTRAINT pk_analysis_activity PRIMARY KEY (id);


--
-- Name: analysis_environment pk_analysis_environment; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analysis_environment
    ADD CONSTRAINT pk_analysis_environment PRIMARY KEY (id);


--
-- Name: authority pk_authority; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authority
    ADD CONSTRAINT pk_authority PRIMARY KEY (user_id, role_id);


--
-- Name: authority_request pk_authority_request; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authority_request
    ADD CONSTRAINT pk_authority_request PRIMARY KEY (userid, roleid);


--
-- Name: calc_interval pk_calc_interval; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calc_interval
    ADD CONSTRAINT pk_calc_interval PRIMARY KEY (id);


--
-- Name: component_pair pk_component_pair; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.component_pair
    ADD CONSTRAINT pk_component_pair PRIMARY KEY (id);


--
-- Name: condition pk_condition; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.condition
    ADD CONSTRAINT pk_condition PRIMARY KEY (id);


--
-- Name: condition_species pk_condition_species; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.condition_species
    ADD CONSTRAINT pk_condition_species PRIMARY KEY (condition_id, species_id);


--
-- Name: content pk_content; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content
    ADD CONSTRAINT pk_content PRIMARY KEY (id);


--
-- Name: content_reference pk_content_reference; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_reference
    ADD CONSTRAINT pk_content_reference PRIMARY KEY (id);


--
-- Name: course pk_course; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course
    ADD CONSTRAINT pk_course PRIMARY KEY (id);


--
-- Name: course_activity pk_course_activity; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_activity
    ADD CONSTRAINT pk_course_activity PRIMARY KEY (id);


--
-- Name: course_mutation pk_course_mutation; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_mutation
    ADD CONSTRAINT pk_course_mutation PRIMARY KEY (id);


--
-- Name: course_range pk_course_range; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_range
    ADD CONSTRAINT pk_course_range PRIMARY KEY (id);


--
-- Name: dominance pk_dominance; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dominance
    ADD CONSTRAINT pk_dominance PRIMARY KEY (negative_regulator_id, positive_regulator_id);


--
-- Name: experiment pk_experiment; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.experiment
    ADD CONSTRAINT pk_experiment PRIMARY KEY (id);


--
-- Name: initial_state pk_initial_state; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.initial_state
    ADD CONSTRAINT pk_initial_state PRIMARY KEY (id);


--
-- Name: initial_state_species pk_initial_state_species; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.initial_state_species
    ADD CONSTRAINT pk_initial_state_species PRIMARY KEY (initial_state_id, species_id);


--
-- Name: layout pk_layout; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.layout
    ADD CONSTRAINT pk_layout PRIMARY KEY (id);


--
-- Name: layout_node pk_layout_node; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.layout_node
    ADD CONSTRAINT pk_layout_node PRIMARY KEY (id);


--
-- Name: learning_activity pk_learning_activity; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_activity
    ADD CONSTRAINT pk_learning_activity PRIMARY KEY (id);


--
-- Name: model pk_model; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model
    ADD CONSTRAINT pk_model PRIMARY KEY (id);


--
-- Name: model_domain_access pk_model_domain_access; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_domain_access
    ADD CONSTRAINT pk_model_domain_access PRIMARY KEY (modelid, userid, domain);


--
-- Name: model_initial_state pk_model_initial_state; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_initial_state
    ADD CONSTRAINT pk_model_initial_state PRIMARY KEY (modelid);


--
-- Name: model_link pk_model_link; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_link
    ADD CONSTRAINT pk_model_link PRIMARY KEY (id);


--
-- Name: model_reference pk_model_reference; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_reference
    ADD CONSTRAINT pk_model_reference PRIMARY KEY (id);


--
-- Name: model_reference_types pk_model_reference_types; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_reference_types
    ADD CONSTRAINT pk_model_reference_types PRIMARY KEY (id);


--
-- Name: model_score pk_model_score; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_score
    ADD CONSTRAINT pk_model_score PRIMARY KEY (id);


--
-- Name: model_share pk_model_share; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_share
    ADD CONSTRAINT pk_model_share PRIMARY KEY (id);


--
-- Name: model_share_notification pk_model_share_notification; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_share_notification
    ADD CONSTRAINT pk_model_share_notification PRIMARY KEY (modelid, email);


--
-- Name: model_statistic pk_model_statistic; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_statistic
    ADD CONSTRAINT pk_model_statistic PRIMARY KEY (id);


--
-- Name: model_version pk_model_version; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_version
    ADD CONSTRAINT pk_model_version PRIMARY KEY (id, version);


--
-- Name: page pk_page; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page
    ADD CONSTRAINT pk_page PRIMARY KEY (id);


--
-- Name: page_reference pk_page_reference; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page_reference
    ADD CONSTRAINT pk_page_reference PRIMARY KEY (id);


--
-- Name: profile pk_profile; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile
    ADD CONSTRAINT pk_profile PRIMARY KEY (id);


--
-- Name: realtime_activity pk_realtime_activity; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realtime_activity
    ADD CONSTRAINT pk_realtime_activity PRIMARY KEY (id);


--
-- Name: realtime_environment pk_realtime_environment; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realtime_environment
    ADD CONSTRAINT pk_realtime_environment PRIMARY KEY (id);


--
-- Name: reference pk_reference; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reference
    ADD CONSTRAINT pk_reference PRIMARY KEY (id);


--
-- Name: registration pk_registration; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registration
    ADD CONSTRAINT pk_registration PRIMARY KEY (id);


--
-- Name: regulator pk_regulator; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.regulator
    ADD CONSTRAINT pk_regulator PRIMARY KEY (id);


--
-- Name: role pk_role; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT pk_role PRIMARY KEY (id);


--
-- Name: section pk_section; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.section
    ADD CONSTRAINT pk_section PRIMARY KEY (id);


--
-- Name: species pk_species; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species
    ADD CONSTRAINT pk_species PRIMARY KEY (id);


--
-- Name: sub_condition pk_sub_condition; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_condition
    ADD CONSTRAINT pk_sub_condition PRIMARY KEY (id);


--
-- Name: sub_condition_species pk_sub_condition_species; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_condition_species
    ADD CONSTRAINT pk_sub_condition_species PRIMARY KEY (sub_condition_id, species_id);


--
-- Name: upload pk_upload; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upload
    ADD CONSTRAINT pk_upload PRIMARY KEY (id);


--
-- Name: user pk_user; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT pk_user PRIMARY KEY (id);


--
-- Name: user_registration_notification pk_user_registration_notification; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_registration_notification
    ADD CONSTRAINT pk_user_registration_notification PRIMARY KEY (id);


--
-- Name: user_subscription pk_user_subscription; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_subscription
    ADD CONSTRAINT pk_user_subscription PRIMARY KEY (id);


--
-- Name: profile profile_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile
    ADD CONSTRAINT profile_email_key UNIQUE (email);


--
-- Name: saved_images saved_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_images
    ADD CONSTRAINT saved_images_pkey PRIMARY KEY (id);


--
-- Name: model_reference_types uk_model_reference; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_reference_types
    ADD CONSTRAINT uk_model_reference UNIQUE (modelid, referenceid) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: role uk_profile_name; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT uk_profile_name UNIQUE (name);


--
-- Name: KineticLawTypes unique_KineticLawTypes_type; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticLawTypes"
    ADD CONSTRAINT "unique_KineticLawTypes_type" UNIQUE (type);


--
-- Name: users_ccapp users_ccapp_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_ccapp
    ADD CONSTRAINT users_ccapp_pkey PRIMARY KEY (id);


--
-- Name: idx_entity_value_entity; Type: INDEX; Schema: metadata; Owner: postgres
--

CREATE INDEX idx_entity_value_entity ON metadata.entity_value USING btree (entity_id);


--
-- Name: idx_entity_value_value; Type: INDEX; Schema: metadata; Owner: postgres
--

CREATE INDEX idx_entity_value_value ON metadata.entity_value USING btree (value_id);


--
-- Name: idx_value_attachment_value; Type: INDEX; Schema: metadata; Owner: postgres
--

CREATE INDEX idx_value_attachment_value ON metadata.value_attachment USING btree (value_id);


--
-- Name: idx_value_bool_value; Type: INDEX; Schema: metadata; Owner: postgres
--

CREATE INDEX idx_value_bool_value ON metadata.value_bool USING btree (value_id);


--
-- Name: idx_value_date_value; Type: INDEX; Schema: metadata; Owner: postgres
--

CREATE INDEX idx_value_date_value ON metadata.value_date USING btree (value_id);


--
-- Name: idx_value_decimal_value; Type: INDEX; Schema: metadata; Owner: postgres
--

CREATE INDEX idx_value_decimal_value ON metadata.value_decimal USING btree (value_id);


--
-- Name: idx_value_definition; Type: INDEX; Schema: metadata; Owner: postgres
--

CREATE INDEX idx_value_definition ON metadata.value USING btree (definition_id);


--
-- Name: idx_value_integer_value; Type: INDEX; Schema: metadata; Owner: postgres
--

CREATE INDEX idx_value_integer_value ON metadata.value_integer USING btree (value_id);


--
-- Name: idx_value_text_value; Type: INDEX; Schema: metadata; Owner: postgres
--

CREATE INDEX idx_value_text_value ON metadata.value_text USING btree (value_id);


--
-- Name: context_btree_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX context_btree_idx ON public."ModelContext" USING btree ("contextType");


--
-- Name: context_data_btree_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX context_data_btree_idx ON public."ModelContextData" USING btree ("dataType");


--
-- Name: courses_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX courses_code_key ON public."Courses" USING btree ("codeKey");


--
-- Name: drugenvs_default_btree_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX drugenvs_default_btree_idx ON public."DrugEnvironments" USING btree ("isDefault");


--
-- Name: drugenvs_pos_btree_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX drugenvs_pos_btree_idx ON public."DrugEnvironments" USING btree ("position");


--
-- Name: environment_default_btree_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX environment_default_btree_idx ON public.analysis_environment USING btree ("isDefault");


--
-- Name: experiment_expertype_btree_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX experiment_expertype_btree_idx ON public.experiment USING btree (exper_type);


--
-- Name: experiment_state_btree_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX experiment_state_btree_idx ON public.experiment USING btree (state);


--
-- Name: fki_first_component_to_species; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_first_component_to_species ON public.component_pair USING btree (firstcomponentid);


--
-- Name: fki_fk_model_version_to_model; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_fk_model_version_to_model ON public.model_version USING btree (modelid);


--
-- Name: fki_layout_node_to_component; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_layout_node_to_component ON public.layout_node USING btree (componentid);


--
-- Name: fki_layout_node_to_layout; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_layout_node_to_layout ON public.layout_node USING btree (layoutid);


--
-- Name: fki_layout_to_model; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_layout_to_model ON public.layout USING btree (modelid);


--
-- Name: fki_model_reference_types_to_reference; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_model_reference_types_to_reference ON public.model_reference_types USING btree (referenceid);


--
-- Name: fki_second_component_to_species; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_second_component_to_species ON public.component_pair USING btree (secondcomponentid);


--
-- Name: idx_analysis_environment_analysis_activity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analysis_environment_analysis_activity ON public.analysis_activity USING btree (parentid);


--
-- Name: idx_condition_species_species; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_condition_species_species ON public.condition_species USING btree (species_id);


--
-- Name: idx_condition_subcondition; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_condition_subcondition ON public.sub_condition USING btree (condition_id);


--
-- Name: idx_content_content_reference; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_content_reference ON public.content_reference USING btree (content_id);


--
-- Name: idx_course_range_course_activity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_course_range_course_activity ON public.course_activity USING btree (courserangeid);


--
-- Name: idx_course_range_course_mutation; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_course_range_course_mutation ON public.course_mutation USING btree (courserangeid);


--
-- Name: idx_experiment_calc_interval; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_experiment_calc_interval ON public.calc_interval USING btree (experimentid);


--
-- Name: idx_model_analysis_environment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_model_analysis_environment ON public.analysis_environment USING btree (modelid);


--
-- Name: idx_model_course; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_model_course ON public.course USING btree (modelid);


--
-- Name: idx_model_experiment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_model_experiment ON public.experiment USING btree (model_id);


--
-- Name: idx_model_initial_state; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_model_initial_state ON public.initial_state USING btree (model_id);


--
-- Name: idx_model_link_model_domain_access; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_model_link_model_domain_access ON public.model_domain_access USING btree (modellinkid);


--
-- Name: idx_model_link_model_share; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_model_link_model_share ON public.model_share USING btree (modellinkid);


--
-- Name: idx_model_model_link; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_model_model_link ON public.model_link USING btree (model_id);


--
-- Name: idx_model_model_reference; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_model_model_reference ON public.model_reference USING btree (model_id);


--
-- Name: idx_model_model_share; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_model_model_share ON public.model_share USING btree (model_id);


--
-- Name: idx_model_model_share_notification; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_model_model_share_notification ON public.model_share_notification USING btree (modelid);


--
-- Name: idx_model_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_model_name ON public.model USING btree (name);


--
-- Name: idx_model_published; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_model_published ON public.model USING btree (published);


--
-- Name: idx_model_realtime_environment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_model_realtime_environment ON public.realtime_environment USING btree (modelid);


--
-- Name: idx_model_score_model; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_model_score_model ON public.model_score USING btree (model_id);


--
-- Name: idx_model_share_model_share_notification; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_model_share_model_share_notification ON public.model_share_notification USING btree (modelshareid);


--
-- Name: idx_model_species; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_model_species ON public.species USING btree (model_id);


--
-- Name: idx_model_statistic_model; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_model_statistic_model ON public.model_statistic USING btree (model_id);


--
-- Name: idx_model_userid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_model_userid ON public.model USING btree (userid);


--
-- Name: idx_page_page_reference; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_page_page_reference ON public.page_reference USING btree (page_id);


--
-- Name: idx_page_section; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_page_section ON public.section USING btree (page_id);


--
-- Name: idx_realtime_environment_realtime_activity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_realtime_environment_realtime_activity ON public.realtime_activity USING btree (parentid);


--
-- Name: idx_reference_pmid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reference_pmid ON public.reference USING btree (pmid);


--
-- Name: idx_regulator_condition; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_regulator_condition ON public.condition USING btree (regulator_id);


--
-- Name: idx_regulator_negative_regulator; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_regulator_negative_regulator ON public.dominance USING btree (negative_regulator_id);


--
-- Name: idx_regulator_positive_regulator; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_regulator_positive_regulator ON public.dominance USING btree (positive_regulator_id);


--
-- Name: idx_section_content; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_section_content ON public.content USING btree (section_id);


--
-- Name: idx_species_course_activity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_species_course_activity ON public.course_activity USING btree (speciesid);


--
-- Name: idx_species_course_mutation; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_species_course_mutation ON public.course_mutation USING btree (speciesid);


--
-- Name: idx_species_initial_state_species; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_species_initial_state_species ON public.initial_state_species USING btree (species_id);


--
-- Name: idx_species_regulator; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_species_regulator ON public.regulator USING btree (species_id);


--
-- Name: idx_species_regulator_species; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_species_regulator_species ON public.regulator USING btree (regulator_species_id);


--
-- Name: idx_sub_condition_species_species; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sub_condition_species_species ON public.sub_condition_species USING btree (species_id);


--
-- Name: idx_upload_userid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_upload_userid ON public.upload USING btree (userid);


--
-- Name: model_deleted_btree_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX model_deleted_btree_idx ON public.model USING btree (_deleted);


--
-- Name: model_id_btree_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX model_id_btree_idx ON public.model USING btree (id);


--
-- Name: model_modeltype_btree_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX model_modeltype_btree_idx ON public.model USING btree (modeltype);


--
-- Name: model_originid_btree_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX model_originid_btree_idx ON public.model USING btree (originid);


--
-- Name: model_published_btree_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX model_published_btree_idx ON public.model USING btree (published);


--
-- Name: model_type_btree_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX model_type_btree_idx ON public.model USING btree (type);


--
-- Name: model_userid_btree_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX model_userid_btree_idx ON public.model USING btree (userid);


--
-- Name: pagemodel_compartmentid_btree; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pagemodel_compartmentid_btree ON public."PageModel" USING btree (id, "compartmentId");


--
-- Name: pagemodel_geneid_btree; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pagemodel_geneid_btree ON public."PageModel" USING btree (id, "geneId");


--
-- Name: pagemodel_metaboliteid_btree; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pagemodel_metaboliteid_btree ON public."PageModel" USING btree (id, "metaboliteId");


--
-- Name: pagemodel_modelversionid_btree; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pagemodel_modelversionid_btree ON public."PageModel" USING btree ("ModelVersionId");


--
-- Name: pagemodel_reactionid_btree; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pagemodel_reactionid_btree ON public."PageModel" USING btree (id, "reactionId");


--
-- Name: pagemodel_speciesid_btree; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pagemodel_speciesid_btree ON public."PageModel" USING btree (id, "speciesId");


--
-- Name: passpendingupdate_btree_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX passpendingupdate_btree_idx ON public.users_ccapp USING btree (password_pending_update);


--
-- Name: profile_accesstype_btree; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX profile_accesstype_btree ON public.profile USING btree (user_id, "accessType");


--
-- Name: reaction_genes__reaction_id__gene_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX reaction_genes__reaction_id__gene_id ON public."ReactionGenes" USING btree ("ReactionId", "GeneId");


--
-- Name: tasks_job_btree_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tasks_job_btree_idx ON public."Tasks" USING btree (job);


--
-- Name: tasks_state_btree_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tasks_state_btree_idx ON public."Tasks" USING btree (state);


--
-- Name: usersccapp_ccappid_btree_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX usersccapp_ccappid_btree_idx ON public.users_ccapp USING btree (user_ccapp_id);


--
-- Name: usersccapp_userid_btree_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX usersccapp_userid_btree_idx ON public.users_ccapp USING btree (user_id);


--
-- Name: entity_value fk_entity_value_to_value; Type: FK CONSTRAINT; Schema: metadata; Owner: postgres
--

ALTER TABLE ONLY metadata.entity_value
    ADD CONSTRAINT fk_entity_value_to_value FOREIGN KEY (value_id) REFERENCES metadata.value(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;


--
-- Name: value_attachment fk_value_attachment_to_upload; Type: FK CONSTRAINT; Schema: metadata; Owner: postgres
--

ALTER TABLE ONLY metadata.value_attachment
    ADD CONSTRAINT fk_value_attachment_to_upload FOREIGN KEY (value) REFERENCES public.upload(id) ON DELETE CASCADE;


--
-- Name: value_attachment fk_value_attachment_to_value; Type: FK CONSTRAINT; Schema: metadata; Owner: postgres
--

ALTER TABLE ONLY metadata.value_attachment
    ADD CONSTRAINT fk_value_attachment_to_value FOREIGN KEY (value_id) REFERENCES metadata.value(id) ON DELETE CASCADE;


--
-- Name: value_bool fk_value_bool_to_value; Type: FK CONSTRAINT; Schema: metadata; Owner: postgres
--

ALTER TABLE ONLY metadata.value_bool
    ADD CONSTRAINT fk_value_bool_to_value FOREIGN KEY (value_id) REFERENCES metadata.value(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;


--
-- Name: value_date fk_value_date_to_value; Type: FK CONSTRAINT; Schema: metadata; Owner: postgres
--

ALTER TABLE ONLY metadata.value_date
    ADD CONSTRAINT fk_value_date_to_value FOREIGN KEY (value_id) REFERENCES metadata.value(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;


--
-- Name: value_decimal fk_value_decimal_to_value; Type: FK CONSTRAINT; Schema: metadata; Owner: postgres
--

ALTER TABLE ONLY metadata.value_decimal
    ADD CONSTRAINT fk_value_decimal_to_value FOREIGN KEY (value_id) REFERENCES metadata.value(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;


--
-- Name: value_integer fk_value_integer_to_value; Type: FK CONSTRAINT; Schema: metadata; Owner: postgres
--

ALTER TABLE ONLY metadata.value_integer
    ADD CONSTRAINT fk_value_integer_to_value FOREIGN KEY (value_id) REFERENCES metadata.value(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;


--
-- Name: value_text fk_value_text_to_value; Type: FK CONSTRAINT; Schema: metadata; Owner: postgres
--

ALTER TABLE ONLY metadata.value_text
    ADD CONSTRAINT fk_value_text_to_value FOREIGN KEY (value_id) REFERENCES metadata.value(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;


--
-- Name: value fk_value_to_definition; Type: FK CONSTRAINT; Schema: metadata; Owner: postgres
--

ALTER TABLE ONLY metadata.value
    ADD CONSTRAINT fk_value_to_definition FOREIGN KEY (definition_id) REFERENCES metadata.definition(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;


--
-- Name: Annotations Annotations_CompartmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Annotations"
    ADD CONSTRAINT "Annotations_CompartmentId_fkey" FOREIGN KEY ("CompartmentId") REFERENCES public."Compartments"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Annotations Annotations_ConstraintBasedModelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Annotations"
    ADD CONSTRAINT "Annotations_ConstraintBasedModelId_fkey" FOREIGN KEY ("ConstraintBasedModelId") REFERENCES public."ConstraintBasedModels"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Annotations Annotations_GeneId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Annotations"
    ADD CONSTRAINT "Annotations_GeneId_fkey" FOREIGN KEY ("GeneId") REFERENCES public."Genes"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Annotations Annotations_MetaboliteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Annotations"
    ADD CONSTRAINT "Annotations_MetaboliteId_fkey" FOREIGN KEY ("MetaboliteId") REFERENCES public."Metabolites"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Annotations Annotations_ReactionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Annotations"
    ADD CONSTRAINT "Annotations_ReactionId_fkey" FOREIGN KEY ("ReactionId") REFERENCES public."Reactions"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CompartmentSpecies CompartmentSpecies_CompartmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CompartmentSpecies"
    ADD CONSTRAINT "CompartmentSpecies_CompartmentId_fkey" FOREIGN KEY ("CompartmentId") REFERENCES public."Compartments"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CompartmentSpecies CompartmentSpecies_SpeciesId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CompartmentSpecies"
    ADD CONSTRAINT "CompartmentSpecies_SpeciesId_fkey" FOREIGN KEY ("SpeciesId") REFERENCES public.species(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContentModelReference ContentModelReference_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ContentModelReference"
    ADD CONSTRAINT "ContentModelReference_content_id_fkey" FOREIGN KEY (content_id) REFERENCES public."ContentModel"(id);


--
-- Name: ContentModelReference ContentModelReference_reference_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ContentModelReference"
    ADD CONSTRAINT "ContentModelReference_reference_id_fkey" FOREIGN KEY (reference_id) REFERENCES public.reference(id);


--
-- Name: ContentModel ContentModel_sectionModelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ContentModel"
    ADD CONSTRAINT "ContentModel_sectionModelId_fkey" FOREIGN KEY ("sectionModelId") REFERENCES public."SectionModel"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ContentReactions ContentReactions_sectionReactionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ContentReactions"
    ADD CONSTRAINT "ContentReactions_sectionReactionId_fkey" FOREIGN KEY ("sectionReactionId") REFERENCES public."SectionReactions"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Countries Countries_CurrencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Countries"
    ADD CONSTRAINT "Countries_CurrencyId_fkey" FOREIGN KEY ("CurrencyId") REFERENCES public."Currencies"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CountryLanguages CountryLanguages_CountryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CountryLanguages"
    ADD CONSTRAINT "CountryLanguages_CountryId_fkey" FOREIGN KEY ("CountryId") REFERENCES public."Countries"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CountryLanguages CountryLanguages_LanguageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CountryLanguages"
    ADD CONSTRAINT "CountryLanguages_LanguageId_fkey" FOREIGN KEY ("LanguageId") REFERENCES public."Languages"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DrugEnvironments DrugEnvironments_ConstraintBasedModelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DrugEnvironments"
    ADD CONSTRAINT "DrugEnvironments_ConstraintBasedModelId_fkey" FOREIGN KEY ("ConstraintBasedModelId") REFERENCES public."ConstraintBasedModels"(id);


--
-- Name: GeneConstraintBasedModel GeneConstraintBasedModel_ConstraintBasedModelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GeneConstraintBasedModel"
    ADD CONSTRAINT "GeneConstraintBasedModel_ConstraintBasedModelId_fkey" FOREIGN KEY ("ConstraintBasedModelId") REFERENCES public."ConstraintBasedModels"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: GeneConstraintBasedModel GeneConstraintBasedModel_GeneId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GeneConstraintBasedModel"
    ADD CONSTRAINT "GeneConstraintBasedModel_GeneId_fkey" FOREIGN KEY ("GeneId") REFERENCES public."Genes"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Genes Genes_SpeciesId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Genes"
    ADD CONSTRAINT "Genes_SpeciesId_fkey" FOREIGN KEY ("SpeciesId") REFERENCES public.species(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: KineticBasedModels KineticBasedModels_BaseModelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticBasedModels"
    ADD CONSTRAINT "KineticBasedModels_BaseModelId_fkey" FOREIGN KEY ("BaseModelId") REFERENCES public.model(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: KineticCompartments KineticCompartments_KineticModelId_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticCompartments"
    ADD CONSTRAINT "KineticCompartments_KineticModelId_fk" FOREIGN KEY ("KineticModelId") REFERENCES public."KineticModels"(id) ON DELETE CASCADE;


--
-- Name: KineticCompartments KineticCompartments_KineticModelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticCompartments"
    ADD CONSTRAINT "KineticCompartments_KineticModelId_fkey" FOREIGN KEY ("KineticModelId") REFERENCES public."KineticModels"(id) ON DELETE CASCADE;


--
-- Name: KineticGlobalParams KineticGlobalParams_KineticModelId_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticGlobalParams"
    ADD CONSTRAINT "KineticGlobalParams_KineticModelId_fk" FOREIGN KEY ("KineticModelId") REFERENCES public."KineticModels"(id) ON DELETE CASCADE;


--
-- Name: KineticGlobalParams KineticGlobalParams_KineticModelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticGlobalParams"
    ADD CONSTRAINT "KineticGlobalParams_KineticModelId_fkey" FOREIGN KEY ("KineticModelId") REFERENCES public."KineticModels"(id) ON DELETE CASCADE;


--
-- Name: KineticGlobalParams KineticGlobalParams_unit_definition_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticGlobalParams"
    ADD CONSTRAINT "KineticGlobalParams_unit_definition_id_fk" FOREIGN KEY (unit_definition_id) REFERENCES public."UnitDefinitions"(id) ON DELETE SET NULL;


--
-- Name: KineticGlobalParams KineticGlobalParams_unit_definition_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticGlobalParams"
    ADD CONSTRAINT "KineticGlobalParams_unit_definition_id_fkey" FOREIGN KEY (unit_definition_id) REFERENCES public."UnitDefinitions"(id) ON DELETE SET NULL;


--
-- Name: KineticLaws KineticLaws_KineticLawTypeId_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticLaws"
    ADD CONSTRAINT "KineticLaws_KineticLawTypeId_fk" FOREIGN KEY ("KineticLawTypeId") REFERENCES public."KineticLawTypes"(id) ON DELETE CASCADE;


--
-- Name: KineticLaws KineticLaws_KineticLawTypeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticLaws"
    ADD CONSTRAINT "KineticLaws_KineticLawTypeId_fkey" FOREIGN KEY ("KineticLawTypeId") REFERENCES public."KineticLawTypes"(id) ON DELETE CASCADE;


--
-- Name: KineticLaws KineticLaws_KineticReactionId_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticLaws"
    ADD CONSTRAINT "KineticLaws_KineticReactionId_fk" FOREIGN KEY ("KineticReactionId") REFERENCES public."KineticReactions"(id) ON DELETE CASCADE;


--
-- Name: KineticLaws KineticLaws_KineticReactionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticLaws"
    ADD CONSTRAINT "KineticLaws_KineticReactionId_fkey" FOREIGN KEY ("KineticReactionId") REFERENCES public."KineticReactions"(id) ON DELETE CASCADE;


--
-- Name: KineticLocalParams KineticLocalParams_KineticLawId_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticLocalParams"
    ADD CONSTRAINT "KineticLocalParams_KineticLawId_fk" FOREIGN KEY ("KineticLawId") REFERENCES public."KineticLaws"(id) ON DELETE CASCADE;


--
-- Name: KineticLocalParams KineticLocalParams_KineticLawId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticLocalParams"
    ADD CONSTRAINT "KineticLocalParams_KineticLawId_fkey" FOREIGN KEY ("KineticLawId") REFERENCES public."KineticLaws"(id) ON DELETE CASCADE;


--
-- Name: KineticLocalParams KineticLocalParams_unit_definition_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticLocalParams"
    ADD CONSTRAINT "KineticLocalParams_unit_definition_id_fkey" FOREIGN KEY (unit_definition_id) REFERENCES public."UnitDefinitions"(id);


--
-- Name: KineticModifiers KineticModifiers_KineticReactionId_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticModifiers"
    ADD CONSTRAINT "KineticModifiers_KineticReactionId_fk" FOREIGN KEY ("KineticReactionId") REFERENCES public."KineticReactions"(id) ON DELETE CASCADE;


--
-- Name: KineticModifiers KineticModifiers_KineticReactionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticModifiers"
    ADD CONSTRAINT "KineticModifiers_KineticReactionId_fkey" FOREIGN KEY ("KineticReactionId") REFERENCES public."KineticReactions"(id) ON DELETE CASCADE;


--
-- Name: KineticModifiers KineticModifiers_KineticSpeciesId_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticModifiers"
    ADD CONSTRAINT "KineticModifiers_KineticSpeciesId_fk" FOREIGN KEY ("KineticSpeciesId") REFERENCES public."KineticSpecies"(id) ON DELETE CASCADE;


--
-- Name: KineticModifiers KineticModifiers_KineticSpeciesId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticModifiers"
    ADD CONSTRAINT "KineticModifiers_KineticSpeciesId_fkey" FOREIGN KEY ("KineticSpeciesId") REFERENCES public."KineticSpecies"(id) ON DELETE CASCADE;


--
-- Name: KineticProducts KineticProducts_KineticReactionId_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticProducts"
    ADD CONSTRAINT "KineticProducts_KineticReactionId_fk" FOREIGN KEY ("KineticReactionId") REFERENCES public."KineticReactions"(id) ON DELETE CASCADE;


--
-- Name: KineticProducts KineticProducts_KineticReactionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticProducts"
    ADD CONSTRAINT "KineticProducts_KineticReactionId_fkey" FOREIGN KEY ("KineticReactionId") REFERENCES public."KineticReactions"(id) ON DELETE CASCADE;


--
-- Name: KineticProducts KineticProducts_KineticSpeciesId_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticProducts"
    ADD CONSTRAINT "KineticProducts_KineticSpeciesId_fk" FOREIGN KEY ("KineticSpeciesId") REFERENCES public."KineticSpecies"(id) ON DELETE CASCADE;


--
-- Name: KineticProducts KineticProducts_KineticSpeciesId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticProducts"
    ADD CONSTRAINT "KineticProducts_KineticSpeciesId_fkey" FOREIGN KEY ("KineticSpeciesId") REFERENCES public."KineticSpecies"(id) ON DELETE CASCADE;


--
-- Name: KineticReactants KineticReactants_KineticReactionId_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticReactants"
    ADD CONSTRAINT "KineticReactants_KineticReactionId_fk" FOREIGN KEY ("KineticReactionId") REFERENCES public."KineticReactions"(id) ON DELETE CASCADE;


--
-- Name: KineticReactants KineticReactants_KineticReactionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticReactants"
    ADD CONSTRAINT "KineticReactants_KineticReactionId_fkey" FOREIGN KEY ("KineticReactionId") REFERENCES public."KineticReactions"(id) ON DELETE CASCADE;


--
-- Name: KineticReactants KineticReactants_KineticSpeciesId_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticReactants"
    ADD CONSTRAINT "KineticReactants_KineticSpeciesId_fk" FOREIGN KEY ("KineticSpeciesId") REFERENCES public."KineticSpecies"(id) ON DELETE CASCADE;


--
-- Name: KineticReactants KineticReactants_KineticSpeciesId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticReactants"
    ADD CONSTRAINT "KineticReactants_KineticSpeciesId_fkey" FOREIGN KEY ("KineticSpeciesId") REFERENCES public."KineticSpecies"(id) ON DELETE CASCADE;


--
-- Name: KineticReactions KineticReactions_KineticModelId_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticReactions"
    ADD CONSTRAINT "KineticReactions_KineticModelId_fk" FOREIGN KEY ("KineticModelId") REFERENCES public."KineticModels"(id) ON DELETE CASCADE;


--
-- Name: KineticReactions KineticReactions_KineticModelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticReactions"
    ADD CONSTRAINT "KineticReactions_KineticModelId_fkey" FOREIGN KEY ("KineticModelId") REFERENCES public."KineticModels"(id) ON DELETE CASCADE;


--
-- Name: KineticSpecies KineticSpecies_KineticCompartmentId_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticSpecies"
    ADD CONSTRAINT "KineticSpecies_KineticCompartmentId_fk" FOREIGN KEY ("KineticCompartmentId") REFERENCES public."KineticCompartments"(id) ON DELETE CASCADE;


--
-- Name: KineticSpecies KineticSpecies_KineticCompartmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticSpecies"
    ADD CONSTRAINT "KineticSpecies_KineticCompartmentId_fkey" FOREIGN KEY ("KineticCompartmentId") REFERENCES public."KineticCompartments"(id) ON DELETE CASCADE;


--
-- Name: KineticSpecies KineticSpecies_KineticModelId_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticSpecies"
    ADD CONSTRAINT "KineticSpecies_KineticModelId_fk" FOREIGN KEY ("KineticModelId") REFERENCES public."KineticModels"(id) ON DELETE CASCADE;


--
-- Name: KineticSpecies KineticSpecies_KineticModelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticSpecies"
    ADD CONSTRAINT "KineticSpecies_KineticModelId_fkey" FOREIGN KEY ("KineticModelId") REFERENCES public."KineticModels"(id) ON DELETE CASCADE;


--
-- Name: KineticSpecies KineticSpecies_unit_definition_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticSpecies"
    ADD CONSTRAINT "KineticSpecies_unit_definition_id_fkey" FOREIGN KEY (unit_definition_id) REFERENCES public."UnitDefinitions"(id);


--
-- Name: KineticUnits KineticUnits_KineticModelId_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticUnits"
    ADD CONSTRAINT "KineticUnits_KineticModelId_fk" FOREIGN KEY ("KineticModelId") REFERENCES public."KineticModels"(id) ON DELETE CASCADE;


--
-- Name: KineticUnits KineticUnits_KineticModelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticUnits"
    ADD CONSTRAINT "KineticUnits_KineticModelId_fkey" FOREIGN KEY ("KineticModelId") REFERENCES public."KineticModels"(id) ON DELETE CASCADE;


--
-- Name: KineticUnits KineticUnits_UnitDefinitionId_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticUnits"
    ADD CONSTRAINT "KineticUnits_UnitDefinitionId_fk" FOREIGN KEY ("UnitDefinitionId") REFERENCES public."UnitDefinitions"(id) ON DELETE CASCADE;


--
-- Name: KineticUnits KineticUnits_UnitDefinitionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KineticUnits"
    ADD CONSTRAINT "KineticUnits_UnitDefinitionId_fkey" FOREIGN KEY ("UnitDefinitionId") REFERENCES public."UnitDefinitions"(id) ON DELETE CASCADE;


--
-- Name: LearningObjective LearningObjective__createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LearningObjective"
    ADD CONSTRAINT "LearningObjective__createdBy_fkey" FOREIGN KEY ("_createdBy") REFERENCES public."user"(id);


--
-- Name: MetaboliteConstraintBasedModel MetaboliteConstraintBasedModel_ConstraintBasedModelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MetaboliteConstraintBasedModel"
    ADD CONSTRAINT "MetaboliteConstraintBasedModel_ConstraintBasedModelId_fkey" FOREIGN KEY ("ConstraintBasedModelId") REFERENCES public."ConstraintBasedModels"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MetaboliteConstraintBasedModel MetaboliteConstraintBasedModel_MetaboliteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MetaboliteConstraintBasedModel"
    ADD CONSTRAINT "MetaboliteConstraintBasedModel_MetaboliteId_fkey" FOREIGN KEY ("MetaboliteId") REFERENCES public."Metabolites"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Metabolites Metabolites_CompartmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Metabolites"
    ADD CONSTRAINT "Metabolites_CompartmentId_fkey" FOREIGN KEY ("CompartmentId") REFERENCES public."Compartments"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Metabolites Metabolites_KineticBasedModelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Metabolites"
    ADD CONSTRAINT "Metabolites_KineticBasedModelId_fkey" FOREIGN KEY ("KineticBasedModelId") REFERENCES public."KineticBasedModels"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Metabolites Metabolites_SpeciesId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Metabolites"
    ADD CONSTRAINT "Metabolites_SpeciesId_fkey" FOREIGN KEY ("SpeciesId") REFERENCES public.species(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ModelContextData ModelContextData_modelContextId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ModelContextData"
    ADD CONSTRAINT "ModelContextData_modelContextId_fkey" FOREIGN KEY ("modelContextId") REFERENCES public."ModelContext"(id);


--
-- Name: ModelContext ModelContext_modelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ModelContext"
    ADD CONSTRAINT "ModelContext_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES public.model(id);


--
-- Name: ModelContext ModelContext_modelOriginId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ModelContext"
    ADD CONSTRAINT "ModelContext_modelOriginId_fkey" FOREIGN KEY ("modelOriginId") REFERENCES public.model(id);


--
-- Name: ModelCourse ModelCourse_BaseModelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ModelCourse"
    ADD CONSTRAINT "ModelCourse_BaseModelId_fkey" FOREIGN KEY ("BaseModelId") REFERENCES public.model(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ModelCourse ModelCourse_CourseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ModelCourse"
    ADD CONSTRAINT "ModelCourse_CourseId_fkey" FOREIGN KEY ("CourseId") REFERENCES public."Courses"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ModelCourse ModelCourse_ModelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ModelCourse"
    ADD CONSTRAINT "ModelCourse_ModelId_fkey" FOREIGN KEY ("ModelId") REFERENCES public.model(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ModelStartedLesson ModelStartedLesson_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ModelStartedLesson"
    ADD CONSTRAINT "ModelStartedLesson_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Courses"(id);


--
-- Name: ModelStartedLesson ModelStartedLesson_modelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ModelStartedLesson"
    ADD CONSTRAINT "ModelStartedLesson_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES public.model(id);


--
-- Name: Modules Modules_BaseModelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Modules"
    ADD CONSTRAINT "Modules_BaseModelId_fkey" FOREIGN KEY ("BaseModelId") REFERENCES public.model(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MultiscaleTemplateFilePaths MultiscaleTemplateFilePaths_MultiscaleModelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MultiscaleTemplateFilePaths"
    ADD CONSTRAINT "MultiscaleTemplateFilePaths_MultiscaleModelId_fkey" FOREIGN KEY ("MultiscaleModelId") REFERENCES public."MultiscaleModels"(id) ON DELETE CASCADE;


--
-- Name: ObjectiveFunctions ObjectiveFunctions_ConstraintBasedModelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ObjectiveFunctions"
    ADD CONSTRAINT "ObjectiveFunctions_ConstraintBasedModelId_fkey" FOREIGN KEY ("ConstraintBasedModelId") REFERENCES public."ConstraintBasedModels"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ObjectiveReactions ObjectiveReactions_ObjectiveFunctionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ObjectiveReactions"
    ADD CONSTRAINT "ObjectiveReactions_ObjectiveFunctionId_fkey" FOREIGN KEY ("ObjectiveFunctionId") REFERENCES public."ObjectiveFunctions"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ObjectiveReactions ObjectiveReactions_ReactionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ObjectiveReactions"
    ADD CONSTRAINT "ObjectiveReactions_ReactionId_fkey" FOREIGN KEY ("ReactionId") REFERENCES public."Reactions"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PKCompartments PKCompartments_PharmacokineticModelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PKCompartments"
    ADD CONSTRAINT "PKCompartments_PharmacokineticModelId_fkey" FOREIGN KEY ("PharmacokineticModelId") REFERENCES public."PharmacokineticModels"(id) ON DELETE CASCADE;


--
-- Name: PKCovariates PKCovariates_function_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PKCovariates"
    ADD CONSTRAINT "PKCovariates_function_id_fkey" FOREIGN KEY (function_id) REFERENCES public."Functions"(id);


--
-- Name: PKCovariates PKCovariates_parameter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PKCovariates"
    ADD CONSTRAINT "PKCovariates_parameter_id_fkey" FOREIGN KEY (parameter_id) REFERENCES public."PKParameters"(id);


--
-- Name: PKDosings PKDosings_parameter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PKDosings"
    ADD CONSTRAINT "PKDosings_parameter_id_fkey" FOREIGN KEY (parameter_id) REFERENCES public."PKParameters"(id);


--
-- Name: PKParameters PKParameters_PKCompartmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PKParameters"
    ADD CONSTRAINT "PKParameters_PKCompartmentId_fkey" FOREIGN KEY ("PKCompartmentId") REFERENCES public."PKCompartments"(id) ON DELETE CASCADE;


--
-- Name: PKParameters PKParameters_PKRateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PKParameters"
    ADD CONSTRAINT "PKParameters_PKRateId_fkey" FOREIGN KEY ("PKRateId") REFERENCES public."PKRates"(id) ON DELETE CASCADE;


--
-- Name: PKPopulations PKPopulations_PharmacokineticModelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PKPopulations"
    ADD CONSTRAINT "PKPopulations_PharmacokineticModelId_fkey" FOREIGN KEY ("PharmacokineticModelId") REFERENCES public."PharmacokineticModels"(id) ON DELETE CASCADE;


--
-- Name: PKPopulations PKPopulations_distribution_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PKPopulations"
    ADD CONSTRAINT "PKPopulations_distribution_id_fkey" FOREIGN KEY (distribution_id) REFERENCES public."Distributions"(id);


--
-- Name: PKRates PKRates_PharmacokineticModelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PKRates"
    ADD CONSTRAINT "PKRates_PharmacokineticModelId_fkey" FOREIGN KEY ("PharmacokineticModelId") REFERENCES public."PharmacokineticModels"(id) ON DELETE CASCADE;


--
-- Name: PKRates PKRates_from_compartment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PKRates"
    ADD CONSTRAINT "PKRates_from_compartment_id_fkey" FOREIGN KEY (from_compartment_id) REFERENCES public."PKCompartments"(id) ON DELETE CASCADE;


--
-- Name: PKRates PKRates_to_compartment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PKRates"
    ADD CONSTRAINT "PKRates_to_compartment_id_fkey" FOREIGN KEY (to_compartment_id) REFERENCES public."PKCompartments"(id) ON DELETE CASCADE;


--
-- Name: PKVariabilities PKVariabilities_distribution_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PKVariabilities"
    ADD CONSTRAINT "PKVariabilities_distribution_id_fkey" FOREIGN KEY (distribution_id) REFERENCES public."Distributions"(id);


--
-- Name: PKVariabilities PKVariabilities_parameter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PKVariabilities"
    ADD CONSTRAINT "PKVariabilities_parameter_id_fkey" FOREIGN KEY (parameter_id) REFERENCES public."PKParameters"(id);


--
-- Name: PageModelReference PageModelReference_pageModelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PageModelReference"
    ADD CONSTRAINT "PageModelReference_pageModelId_fkey" FOREIGN KEY ("pageModelId") REFERENCES public."PageModel"(id);


--
-- Name: PageModelReference PageModelReference_referenceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PageModelReference"
    ADD CONSTRAINT "PageModelReference_referenceId_fkey" FOREIGN KEY ("referenceId") REFERENCES public.reference(id);


--
-- Name: ReactionCoefficients ReactionCoefficients_MetaboliteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReactionCoefficients"
    ADD CONSTRAINT "ReactionCoefficients_MetaboliteId_fkey" FOREIGN KEY ("MetaboliteId") REFERENCES public."Metabolites"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ReactionCoefficients ReactionCoefficients_ReactionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReactionCoefficients"
    ADD CONSTRAINT "ReactionCoefficients_ReactionId_fkey" FOREIGN KEY ("ReactionId") REFERENCES public."Reactions"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ReactionConstraintBasedModel ReactionConstraintBasedModel_ConstraintBasedModelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReactionConstraintBasedModel"
    ADD CONSTRAINT "ReactionConstraintBasedModel_ConstraintBasedModelId_fkey" FOREIGN KEY ("ConstraintBasedModelId") REFERENCES public."ConstraintBasedModels"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ReactionConstraintBasedModel ReactionConstraintBasedModel_ReactionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReactionConstraintBasedModel"
    ADD CONSTRAINT "ReactionConstraintBasedModel_ReactionId_fkey" FOREIGN KEY ("ReactionId") REFERENCES public."Reactions"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ReactionGenes ReactionGenes_GeneId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReactionGenes"
    ADD CONSTRAINT "ReactionGenes_GeneId_fkey" FOREIGN KEY ("GeneId") REFERENCES public."Genes"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ReactionGenes ReactionGenes_ReactionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReactionGenes"
    ADD CONSTRAINT "ReactionGenes_ReactionId_fkey" FOREIGN KEY ("ReactionId") REFERENCES public."Reactions"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Reactions Reactions_KineticBasedModelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reactions"
    ADD CONSTRAINT "Reactions_KineticBasedModelId_fkey" FOREIGN KEY ("KineticBasedModelId") REFERENCES public."KineticBasedModels"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Reactions Reactions_SubSystemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reactions"
    ADD CONSTRAINT "Reactions_SubSystemId_fkey" FOREIGN KEY ("SubSystemId") REFERENCES public."SubSystems"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: RenewalItems RenewalItems_accountPlanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RenewalItems"
    ADD CONSTRAINT "RenewalItems_accountPlanId_fkey" FOREIGN KEY ("accountPlanId") REFERENCES public."AccountPlans"(id);


--
-- Name: RenewalItems RenewalItems_subscriptionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RenewalItems"
    ADD CONSTRAINT "RenewalItems_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES public."UserSubscriptions"(id);


--
-- Name: SectionModel SectionModel_pageModelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SectionModel"
    ADD CONSTRAINT "SectionModel_pageModelId_fkey" FOREIGN KEY ("pageModelId") REFERENCES public."PageModel"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SectionReactions SectionReactions_pageReactionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SectionReactions"
    ADD CONSTRAINT "SectionReactions_pageReactionId_fkey" FOREIGN KEY ("pageReactionId") REFERENCES public."PageReactions"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SubSystems SubSystems_ConstraintBasedModelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SubSystems"
    ADD CONSTRAINT "SubSystems_ConstraintBasedModelId_fkey" FOREIGN KEY ("ConstraintBasedModelId") REFERENCES public."ConstraintBasedModels"(id);


--
-- Name: UnitDefinition_Units UnitDefinition_Units_UnitDefinitionId_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnitDefinition_Units"
    ADD CONSTRAINT "UnitDefinition_Units_UnitDefinitionId_fk" FOREIGN KEY ("UnitDefinitionId") REFERENCES public."UnitDefinitions"(id) ON DELETE CASCADE;


--
-- Name: UnitDefinition_Units UnitDefinition_Units_UnitDefinitionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnitDefinition_Units"
    ADD CONSTRAINT "UnitDefinition_Units_UnitDefinitionId_fkey" FOREIGN KEY ("UnitDefinitionId") REFERENCES public."UnitDefinitions"(id) ON DELETE CASCADE;


--
-- Name: UnitDefinition_Units UnitDefinition_Units_UnitId_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnitDefinition_Units"
    ADD CONSTRAINT "UnitDefinition_Units_UnitId_fk" FOREIGN KEY ("UnitId") REFERENCES public."Units"(id) ON DELETE CASCADE;


--
-- Name: UnitDefinition_Units UnitDefinition_Units_UnitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnitDefinition_Units"
    ADD CONSTRAINT "UnitDefinition_Units_UnitId_fkey" FOREIGN KEY ("UnitId") REFERENCES public."Units"(id) ON DELETE CASCADE;


--
-- Name: UserCoursesUnenroll UserCoursesUnenroll_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserCoursesUnenroll"
    ADD CONSTRAINT "UserCoursesUnenroll_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Courses"(id);


--
-- Name: UserCoursesUnenroll UserCoursesUnenroll_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserCoursesUnenroll"
    ADD CONSTRAINT "UserCoursesUnenroll_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: UserCourses UserCourses_CourseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserCourses"
    ADD CONSTRAINT "UserCourses_CourseId_fkey" FOREIGN KEY ("CourseId") REFERENCES public."Courses"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserCourses UserCourses_UserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserCourses"
    ADD CONSTRAINT "UserCourses_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserEcommerces UserEcommerces_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserEcommerces"
    ADD CONSTRAINT "UserEcommerces_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: UserSubscriptions UserSubscriptions_AccountPlanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserSubscriptions"
    ADD CONSTRAINT "UserSubscriptions_AccountPlanId_fkey" FOREIGN KEY ("AccountPlanId") REFERENCES public."AccountPlans"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: condition_species condition_species_GeneId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.condition_species
    ADD CONSTRAINT "condition_species_GeneId_fkey" FOREIGN KEY ("GeneId") REFERENCES public."Genes"(id);


--
-- Name: experiment_data experiment_data_experiment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.experiment_data
    ADD CONSTRAINT experiment_data_experiment_id_fkey FOREIGN KEY (experiment_id) REFERENCES public.experiment(id);


--
-- Name: experiment experiment_drugEnvironmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.experiment
    ADD CONSTRAINT "experiment_drugEnvironmentId_fkey" FOREIGN KEY ("drugEnvironmentId") REFERENCES public."DrugEnvironments"(id);


--
-- Name: experiment experiment_lastRunDrugEnvironmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.experiment
    ADD CONSTRAINT "experiment_lastRunDrugEnvironmentId_fkey" FOREIGN KEY ("lastRunDrugEnvironmentId") REFERENCES public."DrugEnvironments"(id);


--
-- Name: activity fk_activity_to_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity
    ADD CONSTRAINT fk_activity_to_user FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: analysis_activity fk_analysis_activity_to_component; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analysis_activity
    ADD CONSTRAINT fk_analysis_activity_to_component FOREIGN KEY (componentid) REFERENCES public.species(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;


--
-- Name: analysis_activity fk_analysis_activity_to_environment; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analysis_activity
    ADD CONSTRAINT fk_analysis_activity_to_environment FOREIGN KEY (parentid) REFERENCES public.analysis_environment(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;


--
-- Name: authority fk_authority_to_role; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authority
    ADD CONSTRAINT fk_authority_to_role FOREIGN KEY (role_id) REFERENCES public.role(id) ON DELETE CASCADE;


--
-- Name: authority fk_authority_to_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authority
    ADD CONSTRAINT fk_authority_to_user FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: calc_interval fk_calc_interval_to_experiment; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calc_interval
    ADD CONSTRAINT fk_calc_interval_to_experiment FOREIGN KEY (experimentid) REFERENCES public.experiment(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;


--
-- Name: condition_species fk_condition_species_to_condition; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.condition_species
    ADD CONSTRAINT fk_condition_species_to_condition FOREIGN KEY (condition_id) REFERENCES public.condition(id) ON DELETE CASCADE;


--
-- Name: condition_species fk_condition_species_to_species; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.condition_species
    ADD CONSTRAINT fk_condition_species_to_species FOREIGN KEY (species_id) REFERENCES public.species(id) ON DELETE CASCADE;


--
-- Name: condition fk_condition_to_regulator; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.condition
    ADD CONSTRAINT fk_condition_to_regulator FOREIGN KEY (regulator_id) REFERENCES public.regulator(id) ON DELETE CASCADE;


--
-- Name: content_reference fk_content_reference_to_content; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_reference
    ADD CONSTRAINT fk_content_reference_to_content FOREIGN KEY (content_id) REFERENCES public.content(id) ON DELETE CASCADE;


--
-- Name: content_reference fk_content_reference_to_reference; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_reference
    ADD CONSTRAINT fk_content_reference_to_reference FOREIGN KEY (reference_id) REFERENCES public.reference(id) ON DELETE CASCADE;


--
-- Name: content fk_content_to_section; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content
    ADD CONSTRAINT fk_content_to_section FOREIGN KEY (section_id) REFERENCES public.section(id) ON DELETE CASCADE;


--
-- Name: course_activity fk_course_activity_to_course_range; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_activity
    ADD CONSTRAINT fk_course_activity_to_course_range FOREIGN KEY (courserangeid) REFERENCES public.course_range(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;


--
-- Name: course_activity fk_course_activity_to_species; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_activity
    ADD CONSTRAINT fk_course_activity_to_species FOREIGN KEY (speciesid) REFERENCES public.species(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;


--
-- Name: course_mutation fk_course_mutation_to_course_range; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_mutation
    ADD CONSTRAINT fk_course_mutation_to_course_range FOREIGN KEY (courserangeid) REFERENCES public.course_range(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;


--
-- Name: course_mutation fk_course_mutation_to_species; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_mutation
    ADD CONSTRAINT fk_course_mutation_to_species FOREIGN KEY (speciesid) REFERENCES public.species(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;


--
-- Name: course_range fk_course_range_to_course; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_range
    ADD CONSTRAINT fk_course_range_to_course FOREIGN KEY (courseid) REFERENCES public.course(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;


--
-- Name: course fk_course_to_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course
    ADD CONSTRAINT fk_course_to_model FOREIGN KEY (modelid) REFERENCES public.model(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;


--
-- Name: experiment fk_experiment_to_course; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.experiment
    ADD CONSTRAINT fk_experiment_to_course FOREIGN KEY (courseid) REFERENCES public.course(id) ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED;


--
-- Name: experiment fk_experiment_to_environment; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.experiment
    ADD CONSTRAINT fk_experiment_to_environment FOREIGN KEY (environmentid) REFERENCES public.analysis_environment(id) ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED;


--
-- Name: experiment fk_experiment_to_last_environment; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.experiment
    ADD CONSTRAINT fk_experiment_to_last_environment FOREIGN KEY (lastrunenvironmentid) REFERENCES public.analysis_environment(id) ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED;


--
-- Name: component_pair fk_first_component_to_species; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.component_pair
    ADD CONSTRAINT fk_first_component_to_species FOREIGN KEY (firstcomponentid) REFERENCES public.species(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;


--
-- Name: initial_state_species fk_initial_state_species_to_initial_state; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.initial_state_species
    ADD CONSTRAINT fk_initial_state_species_to_initial_state FOREIGN KEY (initial_state_id) REFERENCES public.initial_state(id) ON DELETE CASCADE;


--
-- Name: initial_state_species fk_initial_state_species_to_species; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.initial_state_species
    ADD CONSTRAINT fk_initial_state_species_to_species FOREIGN KEY (species_id) REFERENCES public.species(id) ON DELETE CASCADE;


--
-- Name: initial_state fk_initial_state_to_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.initial_state
    ADD CONSTRAINT fk_initial_state_to_model FOREIGN KEY (model_id) REFERENCES public.model(id) ON DELETE CASCADE;


--
-- Name: layout_node fk_layout_node_to_component; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.layout_node
    ADD CONSTRAINT fk_layout_node_to_component FOREIGN KEY (componentid) REFERENCES public.species(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;


--
-- Name: layout_node fk_layout_node_to_layout; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.layout_node
    ADD CONSTRAINT fk_layout_node_to_layout FOREIGN KEY (layoutid) REFERENCES public.layout(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;


--
-- Name: layout fk_layout_to_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.layout
    ADD CONSTRAINT fk_layout_to_model FOREIGN KEY (modelid) REFERENCES public.model(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;


--
-- Name: model_domain_access fk_model_domain_access_to_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_domain_access
    ADD CONSTRAINT fk_model_domain_access_to_model FOREIGN KEY (modelid) REFERENCES public.model(id) ON DELETE CASCADE;


--
-- Name: model_domain_access fk_model_domain_access_to_model_link; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_domain_access
    ADD CONSTRAINT fk_model_domain_access_to_model_link FOREIGN KEY (modellinkid) REFERENCES public.model_link(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;


--
-- Name: model_initial_state fk_model_initial_state_to_initial_state; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_initial_state
    ADD CONSTRAINT fk_model_initial_state_to_initial_state FOREIGN KEY (initialstateid) REFERENCES public.initial_state(id) ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED;


--
-- Name: model_initial_state fk_model_initial_state_to_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_initial_state
    ADD CONSTRAINT fk_model_initial_state_to_model FOREIGN KEY (modelid) REFERENCES public.model(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;


--
-- Name: model_initial_state fk_model_layout_to_layout; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_initial_state
    ADD CONSTRAINT fk_model_layout_to_layout FOREIGN KEY (layoutid) REFERENCES public.layout(id) ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED;


--
-- Name: model_reference fk_model_reference_to_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_reference
    ADD CONSTRAINT fk_model_reference_to_model FOREIGN KEY (model_id) REFERENCES public.model(id) ON DELETE CASCADE;


--
-- Name: model_reference fk_model_reference_to_reference; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_reference
    ADD CONSTRAINT fk_model_reference_to_reference FOREIGN KEY (reference_id) REFERENCES public.reference(id) ON DELETE CASCADE;


--
-- Name: model_reference_types fk_model_reference_types_to_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_reference_types
    ADD CONSTRAINT fk_model_reference_types_to_model FOREIGN KEY (modelid) REFERENCES public.model(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;


--
-- Name: model_reference_types fk_model_reference_types_to_reference; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_reference_types
    ADD CONSTRAINT fk_model_reference_types_to_reference FOREIGN KEY (referenceid) REFERENCES public.reference(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;


--
-- Name: model_score fk_model_score_to_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_score
    ADD CONSTRAINT fk_model_score_to_model FOREIGN KEY (model_id) REFERENCES public.model(id) ON DELETE CASCADE;


--
-- Name: model_share_notification fk_model_share_notification_to_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_share_notification
    ADD CONSTRAINT fk_model_share_notification_to_model FOREIGN KEY (modelid) REFERENCES public.model(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;


--
-- Name: model_share_notification fk_model_share_notification_to_model_share; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_share_notification
    ADD CONSTRAINT fk_model_share_notification_to_model_share FOREIGN KEY (modelshareid) REFERENCES public.model_share(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;


--
-- Name: model_share fk_model_share_to_model_link; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_share
    ADD CONSTRAINT fk_model_share_to_model_link FOREIGN KEY (modellinkid) REFERENCES public.model_link(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;


--
-- Name: model_version fk_model_version_to_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_version
    ADD CONSTRAINT fk_model_version_to_model FOREIGN KEY (modelid) REFERENCES public.model(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;


--
-- Name: dominance fk_negative_regulator_to_regulator; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dominance
    ADD CONSTRAINT fk_negative_regulator_to_regulator FOREIGN KEY (negative_regulator_id) REFERENCES public.regulator(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;


--
-- Name: page_reference fk_page_reference_to_page; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page_reference
    ADD CONSTRAINT fk_page_reference_to_page FOREIGN KEY (page_id) REFERENCES public.page(id) ON DELETE CASCADE;


--
-- Name: page_reference fk_page_reference_to_reference; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page_reference
    ADD CONSTRAINT fk_page_reference_to_reference FOREIGN KEY (reference_id) REFERENCES public.reference(id) ON DELETE CASCADE;


--
-- Name: dominance fk_positive_regulator_to_regulator; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dominance
    ADD CONSTRAINT fk_positive_regulator_to_regulator FOREIGN KEY (positive_regulator_id) REFERENCES public.regulator(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;


--
-- Name: profile fk_profile_to_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile
    ADD CONSTRAINT fk_profile_to_user FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: realtime_activity fk_realtime_activity_to_component; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realtime_activity
    ADD CONSTRAINT fk_realtime_activity_to_component FOREIGN KEY (componentid) REFERENCES public.species(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;


--
-- Name: realtime_activity fk_realtime_activity_to_environment; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realtime_activity
    ADD CONSTRAINT fk_realtime_activity_to_environment FOREIGN KEY (parentid) REFERENCES public.realtime_environment(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;


--
-- Name: registration fk_registration_to_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registration
    ADD CONSTRAINT fk_registration_to_user FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: regulator fk_regulator_species_to_species; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.regulator
    ADD CONSTRAINT fk_regulator_species_to_species FOREIGN KEY (regulator_species_id) REFERENCES public.species(id) ON DELETE CASCADE;


--
-- Name: regulator fk_regulator_to_species; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.regulator
    ADD CONSTRAINT fk_regulator_to_species FOREIGN KEY (species_id) REFERENCES public.species(id) ON DELETE CASCADE;


--
-- Name: component_pair fk_second_component_to_species; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.component_pair
    ADD CONSTRAINT fk_second_component_to_species FOREIGN KEY (secondcomponentid) REFERENCES public.species(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;


--
-- Name: section fk_section_to_page; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.section
    ADD CONSTRAINT fk_section_to_page FOREIGN KEY (page_id) REFERENCES public.page(id) ON DELETE CASCADE;


--
-- Name: species fk_species_to_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species
    ADD CONSTRAINT fk_species_to_model FOREIGN KEY (model_id) REFERENCES public.model(id) ON DELETE CASCADE;


--
-- Name: sub_condition_species fk_sub_condition_species_to_species; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_condition_species
    ADD CONSTRAINT fk_sub_condition_species_to_species FOREIGN KEY (species_id) REFERENCES public.species(id) ON DELETE CASCADE;


--
-- Name: sub_condition_species fk_sub_condition_species_to_sub_condition; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_condition_species
    ADD CONSTRAINT fk_sub_condition_species_to_sub_condition FOREIGN KEY (sub_condition_id) REFERENCES public.sub_condition(id) ON DELETE CASCADE;


--
-- Name: sub_condition fk_sub_condition_to_condition; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_condition
    ADD CONSTRAINT fk_sub_condition_to_condition FOREIGN KEY (condition_id) REFERENCES public.condition(id) ON DELETE CASCADE;


--
-- Name: model model_prevOrigin_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model
    ADD CONSTRAINT "model_prevOrigin_fkey" FOREIGN KEY ("prevOrigin") REFERENCES public.model(id);


--
-- Name: profile profile_institution_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile
    ADD CONSTRAINT profile_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public."Institutions"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: saved_images saved_images_BaseModelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_images
    ADD CONSTRAINT "saved_images_BaseModelId_fkey" FOREIGN KEY ("BaseModelId") REFERENCES public.model(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: saved_images saved_images_profileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_images
    ADD CONSTRAINT "saved_images_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES public.profile(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sub_condition_species sub_condition_species_GeneId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_condition_species
    ADD CONSTRAINT "sub_condition_species_GeneId_fkey" FOREIGN KEY ("GeneId") REFERENCES public."Genes"(id);


--
-- PostgreSQL database dump complete
--
