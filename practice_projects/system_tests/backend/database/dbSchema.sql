DROP TABLE IF EXISTS devices;
DROP TABLE IF EXISTS tests;
DROP TABLE IF EXISTS tests_for_systems;


CREATE TABLE systems (
    id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    hardwareMake VARCHAR(20) NOT NULL,
    hardwareModel VARCHAR(20) NOT NULL,
    softwareName VARCHAR(20) NOT NULL,
    softwareVersion VARCHAR(50) NOT NULL,
    PRIMARY KEY (`id`)
);

CREATE TABLE tests (
    id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    name VARCHAR(100) NOT NULL,
    PRIMARY KEY (`id`)
);

CREATE TABLE tests_for_systems (
    id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    systems_id INT UNSIGNED NOT NULL,
    tests_id INT UNSIGNED NOT NULL,
    signature VARCHAR(100),
    signedOn DATETIME,
    PRIMARY KEY (`id`)
);

ALTER TABLE tests_for_systems ADD CONSTRAINT tests_for_systems_const_systems_id_systems_id FOREIGN KEY (systems_id) REFERENCES systems(id);
ALTER TABLE tests_for_systems ADD CONSTRAINT tests_for_systems_const_tests_id_tests_id FOREIGN KEY (tests_id) REFERENCES tests(id);