-- MariaDB-safe patch: add columns if missing and copy FAQ/SystemRequirements into them.
-- Uses GROUP_CONCAT + JSON_OBJECT (no CAST AS JSON).

START TRANSACTION;

-- Ensure longDesc can hold large HTML (only if not already LONGTEXT)
SET @need_longtext := (
  SELECT IF(
    (SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Software' AND COLUMN_NAME = 'longDesc') <> 'longtext',
    'ALTER TABLE `Software` MODIFY COLUMN `longDesc` LONGTEXT NULL',
    'SELECT 1'
  )
);
PREPARE s1 FROM @need_longtext; EXECUTE s1; DEALLOCATE PREPARE s1;

-- Add Software.faqs if missing (LONGTEXT works fine for JSON in MariaDB)
SET @add_faqs := (
  SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Software' AND COLUMN_NAME = 'faqs') = 0,
    'ALTER TABLE `Software` ADD COLUMN `faqs` LONGTEXT NULL',
    'SELECT 1'
  )
);
PREPARE s2 FROM @add_faqs; EXECUTE s2; DEALLOCATE PREPARE s2;

-- Add Software.systemRequirements if missing
SET @add_sys := (
  SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Software' AND COLUMN_NAME = 'systemRequirements') = 0,
    'ALTER TABLE `Software` ADD COLUMN `systemRequirements` LONGTEXT NULL',
    'SELECT 1'
  )
);
PREPARE s3 FROM @add_sys; EXECUTE s3; DEALLOCATE PREPARE s3;

-- Build large arrays safely
SET SESSION group_concat_max_len = 1024 * 1024;

-- FAQs -> Software.faqs  (JSON: [{q,a,order}, ...])
UPDATE `Software` s
LEFT JOIN (
  SELECT
    f.softwareId,
    CONCAT(
      '[',
      GROUP_CONCAT(
        JSON_OBJECT(
          'q', f.question,
          'a', f.answer,
          'order', f.`order`
        )
        ORDER BY f.`order` ASC
        SEPARATOR ','
      ),
      ']'
    ) AS faqs_text
  FROM `FAQ` f
  GROUP BY f.softwareId
) fq ON fq.softwareId = s.id
SET s.faqs = fq.faqs_text
WHERE fq.faqs_text IS NOT NULL;

-- System Requirements -> Software.systemRequirements (JSON: [{os,min,rec}, ...])
UPDATE `Software` s
LEFT JOIN (
  SELECT
    r.softwareId,
    CONCAT(
      '[',
      GROUP_CONCAT(
        JSON_OBJECT(
          'os',  r.os,
          'min', r.minimum,
          'rec', r.recommended
        )
        SEPARATOR ','
      ),
      ']'
    ) AS sys_text
  FROM `SystemRequirement` r
  GROUP BY r.softwareId
) sr ON sr.softwareId = s.id
SET s.systemRequirements = sr.sys_text
WHERE sr.sys_text IS NOT NULL;

COMMIT;
