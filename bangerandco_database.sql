/*CREATE DATABASE*/
CREATE DATABASE BangerAndCo;

/*CREATE USER FOR BANGER&CO DATABASE*/
CREATE USER 'externaluser'@'localhost' IDENTIFIED BY 'password';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER, CREATE TEMPORARY TABLES, CREATE VIEW, EVENT, TRIGGER, SHOW VIEW, CREATE ROUTINE, ALTER ROUTINE, EXECUTE ON `bangerandco`.* TO 'externaluser'@'localhost';

USE BangerAndCo;

/*CREATE VIEW*/
CREATE ALGORITHM=UNDEFINED DEFINER=`externaluser`@`localhost` SQL SECURITY DEFINER VIEW FraudulentUser AS (SELECT User._id, User.NIC, User.DLN, User.address, Fraudulent_Customers.fraudID, Fraudulent_Customers.description FROM User JOIN insurerassociation.fraudulent_customers ON User.NIC = Fraudulent_Customers.NIC OR User.DLN = Fraudulent_Customers.DLN);

SELECT * from FraudulentUser;