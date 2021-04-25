CREATE USER 'externaluser'@'localhost' IDENTIFIED BY 'password';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, ALTER, SHOW VIEW ON `bangerandco`.* TO 'externaluser'@'localhost';

USE BangerAndCo;

SELECT * FROM User;

CREATE ALGORITHM=UNDEFINED DEFINER=`externaluser`@`localhost` SQL SECURITY DEFINER VIEW FraudulentUser AS (SELECT User._id, User.NIC, User.DLN, User.address, Fraudulent_Customers.fraudID, Fraudulent_Customers.description FROM User JOIN insurerassociation.fraudulent_customers ON User.NIC = Fraudulent_Customers.NIC OR User.DLN = Fraudulent_Customers.DLN);

SELECT * from FraudulentUser;