-- Adds JSON columns if missing and copies FAQ/SystemRequirements into them.
-- Safe to run once; uses INFORMATION_SCHEMA checks and GROUP_CONCAT (works on MySQL/MariaDB).

START TRANSACTION;

-- 1) Ensure longDesc can hold large HTML (only if not already LONGTEXT)
SET @need_longtext := (
  SELECT IF(
    (SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Software' AND COLUMN_NAME = 'longDesc') <> 'longtext',
    'ALTER TABLE `Software` MODIFY COLUMN `longDesc` LONGTEXT NULL',
    'SELECT 1'
  )
);
PREPARE stmt1 FROM @need_longtext; EXECUTE stmt1; DEALLOCATE PREPARE stmt1;

-- 2) Add Software.faqs if missing
SET @add_faqs := (
  SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Software' AND COLUMN_NAME = 'faqs') = 0,
    'ALTER TABLE `Software` ADD COLUMN `faqs` JSON NULL',
    'SELECT 1'
  )
);
PREPARE stmt2 FROM @add_faqs; EXECUTE stmt2; DEALLOCATE PREPARE stmt2;

-- 3) Add Software.systemRequirements if missing
SET @add_sys := (
  SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Software' AND COLUMN_NAME = 'systemRequirements') = 0,
    'ALTER TABLE `Software` ADD COLUMN `systemRequirements` JSON NULL',
    'SELECT 1'
  )
);
PREPARE stmt3 FROM @add_sys; EXECUTE stmt3; DEALLOCATE PREPARE stmt3;

-- 4) Build JSON arrays via GROUP_CONCAT (MySQL/MariaDB friendly)
SET SESSION group_concat_max_len = 1024 * 1024;

-- FAQs -> Software.faqs  (JSON: [{q,a,order}, ...])
UPDATE `Software` s
LEFT JOIN (
  SELECT
    f.softwareId,
    CAST(
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
      ) AS JSON
    ) AS faqs_json
  FROM `FAQ` f
  GROUP BY f.softwareId
) fq ON fq.softwareId = s.id
SET s.faqs = fq.faqs_json
WHERE fq.faqs_json IS NOT NULL;

-- System Requirements -> Software.systemRequirements (JSON: [{os,min,rec}, ...])
UPDATE `Software` s
LEFT JOIN (
  SELECT
    r.softwareId,
    CAST(
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
      ) AS JSON
    ) AS sys_json
  FROM `SystemRequirement` r
  GROUP BY r.softwareId
) sr ON sr.softwareId = s.id
SET s.systemRequirements = sr.sys_json
WHERE sr.sys_json IS NOT NULL;

COMMIT;
