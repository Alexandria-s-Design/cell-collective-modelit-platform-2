export default [
	"create or replace function is_json(varchar) returns boolean as $$\
        declare\
            x json;\
        begin\
            begin\
            x := $1;\
            exception when others then\
            return false;\
            end;\
\
            return true;\
        end;\
    $$ language plpgsql immutable;",

		`CREATE OR REPLACE FUNCTION use_version (BIGINT) RETURNS BIGINT \
			AS 'select modelid from model_version where id in (select id from model_version where modelid=$1) order by selected, version desc limit 1' \
		LANGUAGE SQL;`,

	`CREATE OR REPLACE FUNCTION get_original_model(IN id BIGINT) \
RETURNS BIGINT AS $$ \
DECLARE origin BIGINT; \
BEGIN \
	SELECT originid INTO origin FROM model WHERE model.id=$1; \
		RETURN CASE \
			WHEN origin IS NOT NULL THEN get_original_model(origin) \
				ELSE $1 \
		END; \
	END; \
$$ LANGUAGE plpgsql IMMUTABLE;`,

	`CREATE OR REPLACE FUNCTION get_original_lesson (IN id BIGINT) \
RETURNS BIGINT AS $$ \
DECLARE origin BIGINT; \
DECLARE role BIGINT; \
BEGIN \
	SELECT INTO origin, role model.originid, authority.role_id FROM model INNER JOIN authority on model.userid = authority.user_id WHERE model.id=$1; \
	RETURN CASE \
		WHEN ((role = 2) and (origin IS NOT NULL)) THEN get_original_lesson(origin) \
			ELSE $1 \
	END; \
END; \
$$ LANGUAGE plpgsql IMMUTABLE;`
];