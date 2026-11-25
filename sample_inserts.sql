-- ========================================================
-- SkillGauge - Sample Data INSERT Script for phpMyAdmin
-- Database: dbweb
-- สามารถ Copy ไปรันในแท็บ SQL ของ phpMyAdmin ได้ทันที
-- ========================================================

USE `dbweb`;

-- 1. เพิ่มผู้ใช้งานตัวอย่าง (dbuser)
-- รหัสผ่านในตัวอย่างนี้คือ '1234' (Hash: $2a$12$K1qgYwZpGvh9lq3.Bhy0e.v1n8Y01hWjK9rGv8F.tZ4Oa.8hN4jWy)
INSERT INTO `dbuser` (
  `id`, `citizen_id`, `full_name`, `birth_date`, `age`, `role`, 
  `technician_type`, `experience_years`, `phone`, `address_id_card`, 
  `province_id`, `district_id`, `subdistrict_id`, `zip_code`, 
  `address_current`, `card_issue_date`, `card_expiry_date`, 
  `email`, `password`
) VALUES
(101, '1100100000001', 'นายสมชาย ช่างทอง (ช่างทดสอบ)', '1995-05-15', 30, 'worker', 'ช่างโครงสร้าง', 5, '0812345678', '123 ม.1 ต.ในเมือง', 1, 1, 1, '10200', '123 ม.1 ต.ในเมือง', '2020-01-01', '2029-01-01', 'worker.test@skillgauge.com', '$2a$12$K1qgYwZpGvh9lq3.Bhy0e.v1n8Y01hWjK9rGv8F.tZ4Oa.8hN4jWy'),
(102, '1100100000002', 'นายสมศักดิ์ คุมงาน (โฟร์แมน)', '1990-08-20', 35, 'foreman', 'ไม่มี', 8, '0898765432', '456 ม.2', 1, 1, 1, '10200', '456 ม.2', '2018-05-10', '2028-05-10', 'foreman.test@skillgauge.com', '$2a$12$K1qgYwZpGvh9lq3.Bhy0e.v1n8Y01hWjK9rGv8F.tZ4Oa.8hN4jWy'),
(103, '1100100000003', 'นายอำนาจ จัดการ (ผู้จัดการโครงการ)', '1985-03-12', 40, 'projectmanager', 'ไม่มี', 12, '0855554444', '789 ม.3', 1, 1, 1, '10200', '789 ม.3', '2015-02-14', '2027-02-14', 'pm.test@skillgauge.com', '$2a$12$K1qgYwZpGvh9lq3.Bhy0e.v1n8Y01hWjK9rGv8F.tZ4Oa.8hN4jWy')
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`);

-- 2. ระดับฝีมือช่าง (worker_level)
INSERT INTO `worker_level` (`user_id`, `LV`, `updated_at`)
VALUES
(101, '1', NOW())
ON DUPLICATE KEY UPDATE `LV` = VALUES(`LV`), `updated_at` = NOW();

-- 3. โครงการก่อสร้าง (projects)
INSERT INTO `projects` (`pj_id`, `manager_id`, `project_name`, `project_type`, `site_location`, `description`, `start_date`, `end_date`)
VALUES
(101, 103, 'โครงการก่อสร้างอาคารชุด SkillGauge Tower', 'อาคารพาณิชย์', 'เขตจตุจักร กรุงเทพฯ', 'งานโครงสร้างคอนกรีตเสริมเหล็กและระบบอาคาร', '2026-01-01', '2026-12-31')
ON DUPLICATE KEY UPDATE `project_name` = VALUES(`project_name`);

-- 4. งานย่อยในโครงการ (project_tasks)
INSERT INTO `project_tasks` (`pj_t_id`, `pj_id`, `task_name`, `technician_type`, `priority`, `required_workers`, `description`)
VALUES
(201, 101, 'งานผูกเหล็กเสาและคาน ชั้น 2', 'ช่างโครงสร้าง', 'ชำนาญ', 3, 'ผูกเหล็กข้ออ้อยตามแบบวิศวกรรม')
ON DUPLICATE KEY UPDATE `task_name` = VALUES(`task_name`);

-- 5. มอบหมายงานให้ช่าง (project_task_workers)
INSERT INTO `project_task_workers` (`pj_t_id`, `user_id`, `status`)
VALUES
(201, 101, 'accepted')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- 6. งานประเมินทักษะภาคปฏิบัติ (task_assessment)
INSERT INTO `task_assessment` (`t_a_id`, `task_name`, `task_type`, `site_location`, `description`, `start_date`, `end_date`, `status`, `manager_id`, `worker_id`)
VALUES
(301, 'ทดสอบประกอบแบบหล่อคานและเสา', 'ช่างโครงสร้าง', 'ศูนย์ทดสอบหน้างาน A1', 'ทดสอบการตั้งแบบและค้ำยันตามมาตรฐานความปลอดภัย', '2026-03-01', '2026-03-05', 'กำลังดำเนินการ', 103, 101)
ON DUPLICATE KEY UPDATE `task_name` = VALUES(`task_name`);

-- 7. ผลการประเมินทักษะ (skill_assessment_results)
INSERT INTO `skill_assessment_results` (`user_id`, `theory_score`, `practical_score`, `assessment_total`, `skill_level`, `assessment_comment`, `fm_id`)
VALUES
(101, 75.50, 80.00, 77.75, 'ระดับ 1', 'ผ่านเกณฑ์มาตรฐานฝีมือแรงงานภาคปฏิบัติ', 102)
ON DUPLICATE KEY UPDATE `assessment_total` = VALUES(`assessment_total`);

-- 8. การแจ้งปัญหาหน้างานของช่าง (worker_issues)
INSERT INTO `worker_issues` (`worker_id`, `task_id`, `category`, `description`, `status`)
VALUES
(101, 301, 'อุปกรณ์ไม่เพียงพอ', 'เหล็กเส้นขนาด RB9 ไม่พอสำหรับผูกคาน', 'รอดำเนินการ')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- 9. กำหนดเวลารอสอบใหม่ (timewait)
INSERT INTO `timewait` (`id`, `time_days`)
VALUES (1, 30)
ON DUPLICATE KEY UPDATE `time_days` = VALUES(`time_days`);

-- 10. ตั้งค่าเกณฑ์ข้อสอบ (exam_settings)
INSERT INTO `exam_settings` (`difficulty_level`, `passing_score`, `question_count`, `duration_minutes`)
VALUES
('1', 60, 20, 30),
('2', 70, 30, 45),
('3', 80, 40, 60)
ON DUPLICATE KEY UPDATE `passing_score` = VALUES(`passing_score`);

-- 11. โครงสร้างชุดข้อสอบ (examset_structure)
INSERT INTO `examset_structure` (`level`, `rebar_percent`, `concrete_percent`, `formwork_percent`, `element_percent`, `theory_percent`)
VALUES
('1', 25, 25, 25, 15, 10),
('2', 20, 25, 25, 20, 10),
('3', 20, 20, 25, 25, 10)
ON DUPLICATE KEY UPDATE `rebar_percent` = VALUES(`rebar_percent`);

-- 12. คลังข้อสอบตัวอย่าง (question_Structural)
INSERT INTO `question_Structural` (
  `question_text`, `choice_a`, `choice_b`, `choice_c`, `choice_d`, `answer`, `difficulty_level`, `skill_type`
) VALUES
('เหล็กเสริมในคอนกรีตทำหน้าที่รับแรงชนิดใดเป็นหลัก?', 'แรงอัด', 'แรงดึง', 'แรงเฉือน', 'แรงบิด', 'B', 1, 'งานเหล็กเสริม'),
('คอนกรีตมาตรฐานมีคุณสมบัติเด่นในการรับแรงชนิดใด?', 'แรงดึง', 'แรงอัด', 'แรงดัด', 'แรงเฉือน', 'B', 1, 'งานคอนกรีต')
ON DUPLICATE KEY UPDATE `question_text` = VALUES(`question_text`);
