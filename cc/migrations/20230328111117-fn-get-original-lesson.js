'use strict';

/**
 * This function should be used to retrieve the ID
 * of the original lesson created by a teacher
 * that a student has started.
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {

		const script = `
		DROP FUNCTION IF EXISTS fn_get_original_lesson(BIGINT);
    CREATE OR REPLACE FUNCTION fn_get_original_lesson(prm_lesson_id BIGINT)
    RETURNS bigint AS $$
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
							-- Check if it is from the teacher
							-- The code below will resolve issues in the scenario where Teacher A, copies a lesson from Teacher B.
							-- In this case, the original lesson for students from Teacher A should be the copy made by Teacher A, not Teacher B.
							-- Additionally, it will handle cases where there are long chains of copied lessons.
							
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
    $$ LANGUAGE plpgsql PARALLEL SAFE IMMUTABLE;`;

    return await queryInterface.sequelize.query(script);
		
  },
  down: async (queryInterface) => {
    return await queryInterface.sequelize.query('DROP FUNCTION get_original_lesson');
  }
};