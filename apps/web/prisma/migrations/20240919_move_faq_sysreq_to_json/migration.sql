START TRANSACTION;

-- Make sure longDesc can hold large HTML (safe if already long)
ALTER TABLE `Software`
  MODIFY COLUMN `longDesc` LONGTEXT NULL;

-- Copy FAQs → Software.faqs (JSON [{q,a,order}, ...])
UPDATE `Software` s
LEFT JOIN (
  SELECT
    f.softwareId,
    JSON_ARRAYAGG(
      JSON_OBJECT(
        'q', f.question,
        'a', f.answer,
        'order', f.`order`
      ) ORDER BY f.`order` ASC
    ) AS faqs_json
  FROM `FAQ` f
  GROUP BY f.softwareId
) fq ON fq.softwareId = s.id
SET s.faqs = fq.faqs_json
WHERE fq.faqs_json IS NOT NULL;

-- Copy System Requirements → Software.systemRequirements
-- JSON [{os,min,rec}, ...]
UPDATE `Software` s
LEFT JOIN (
  SELECT
    r.softwareId,
    JSON_ARRAYAGG(
      JSON_OBJECT(
        'os',  r.os,
        'min', r.minimum,
        'rec', r.recommended
      )
    ) AS sys_json
  FROM `SystemRequirement` r
  GROUP BY r.softwareId
) sr ON sr.softwareId = s.id
SET s.systemRequirements = sr.sys_json
WHERE sr.sys_json IS NOT NULL;

COMMIT;

-- Optional: after you verify data on a backup, you may archive/drop the old tables
-- CREATE TABLE IF NOT EXISTS `_FAQ_backup` LIKE `FAQ`;
-- INSERT INTO `_FAQ_backup` SELECT * FROM `FAQ`;
-- CREATE TABLE IF NOT EXISTS `_SystemRequirement_backup` LIKE `SystemRequirement`;
-- INSERT INTO `_SystemRequirement_backup` SELECT * FROM `SystemRequirement`;
-- DROP TABLE `FAQ`;
-- DROP TABLE `SystemRequirement`;
