DROP DATABASE InsurerAssociation;

CREATE DATABASE InsurerAssociation;

USE InsurerAssociation;

CREATE TABLE Customer(
	customerID INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    NIC VARCHAR(20) NOT NULL UNIQUE,
    DLN VARCHAR(20) NOT NULL UNIQUE,
	contactNumber VARCHAR(20) NOT NULL UNIQUE,
    address VARCHAR(255) NOT NULL
);

CREATE TABLE Vehicle(
	vehicleNumber VARCHAR(20) PRIMARY KEY,
    type VARCHAR(20) NOT NULL,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    transmission VARCHAR(20) NOT NULL,
    fuelType VARCHAR(20) NOT NULL
);

CREATE TABLE Policy(
	policyID INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(20) NOT NULL,
    effectiveDate DATE NOT NULL,
    expiryDate DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    description VARCHAR(255),
    customerID INT NOT NULL,
    vehicleNumber VARCHAR(20) NOT NULL,
    FOREIGN KEY (customerID) REFERENCES Customer(customerID),
    FOREIGN KEY (vehicleNumber) REFERENCES Vehicle(vehicleNumber)
);

CREATE TABLE Claim(
	claimID INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    claimedAmount FLOAT NOT NULL,
    paidAmount FLOAT NOT NULL,
    description VARCHAR(255),
    policyID INT NOT NULL,
    FOREIGN KEY (policyID) REFERENCES Policy(policyID)
);

CREATE TABLE Fraud(
	fraudID INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(255),
    claimID INT NOT NULL,
    FOREIGN KEY (claimID) REFERENCES Claim(claimID)
);

/*CONSTRAINTS*/
ALTER TABLE Vehicle
ADD CONSTRAINT CHK_transmission CHECK (transmission = 'auto' OR transmission = 'manual'),
ADD CONSTRAINT CHK_fuel CHECK (fuelType = 'petrol' OR fuelType = 'diesel' OR fuelType = 'hybrid' or fuelType = 'electric');

ALTER TABLE Policy
ADD CONSTRAINT CHK_type CHECK (type = 'full' OR type = '3rd party'),
ADD CONSTRAINT CHK_status CHECK (status = 'pending' OR status = 'active' OR status = 'expired');

ALTER TABLE Claim
ADD CONSTRAINT CHK_claimedAmount CHECK (claimedAmount >= 0),
ADD CONSTRAINT CHK_paidAmount CHECK (paidAmount >= 0);

ALTER TABLE Claim
ALTER paidAmount SET DEFAULT 0;

/*INSERT DATA*/
INSERT INTO Customer(firstName, lastName, NIC, DLN, contactNumber, address) VALUES 
('Gayanga', 'Kuruppu', '983526472V', 'B42342354', '0777647382', '69B/1, 2nd Lane, Down\'s Street'),
('Kamal', 'Prasanna', '987453627V', 'B69573352', '0777635425', '51/5, Mahamadura'),
('Sam', 'Mendis', '945364756V', 'B54545454', '0776546355', '92/3, Abunugama street, Mahamadura'),
('Alice', 'Smith', '956567658V', 'B66665957', '0716758475', '69A, Redlight district'),
('Elisa', 'Sanches', '912345646V', 'B95768576', '0715342534', '69B, Redlight district'),
('Alex', 'Anderson', '937465758V', 'B45463746', '0776456576', 'No 50, Westford apartments, Colombo'),
('Morty', 'Smith', '998465746V', 'B65768576', '0715656675', '69A, Redlight district'),
('Rick', 'Sanches', '685768573V', 'B86749375', '0777656766', '69B, Redlight district'),
('Susan', 'Lianna', '896756478V', 'B76768798', '0777656555', 'A/6, Samsonville'),
('Helen', 'Peiris', '985667586V', 'B98463527', '07154096748', 'No 34/5, Lewis road, Fastnam');

INSERT INTO Vehicle(vehicleNumber, type, brand, model, transmission, fuelType) VALUES
('KC-5675', 'hatchback', 'Honda', 'Fit', 'auto', 'hybrid'),
('KV-6875', 'towncar', 'Toyota', 'Corolla', 'auto', 'petrol'),
('CAR-8674', 'sports', 'Mazda', 'RX8', 'manual', 'petrol'),
('CAR-9867', 'towncar', 'Tesla', 'Model 8', 'auto', 'electric'),
('LD-8576', 'lorry', 'Tata', 'Bigmac', 'manual', 'diesel'),
('VN-8749', 'van', 'Toyota', 'KDH', 'auto', 'diesel'),
('VN-8574', 'van', 'Mercedes', 'Sprinter', 'auto', 'diesel'),
('32-0062', '4wd', 'Mitsubushi', 'Jeep', 'manual', 'diesel'),
('KX-8573', 'suv', 'KIA', 'Sorento', 'auto', 'diesel'),
('LD-7583', 'lorry', 'Tata', 'Gala', 'manual', 'diesel');

INSERT INTO Policy(type, effectiveDate, expiryDate, status, customerID, vehicleNumber, description) VALUES
('full', '2020-09-11', '2022-09-11', 'active', 1, 'KX-8573', 'Senectus et netus et malesuada fames ac turpis egestas. Nibh tortor id aliquet lectus proin nibh nisl condimentum id. Sed libero enim sed faucibus turpis in eu.'),
('3rd party', '2020-10-21', '2022-10-21', 'active', 1, 'KC-5675', null),
('full', '2020-10-10', '2022-01-10', 'active', 2, 'KV-6875', 'Cursus mattis molestie a iaculis. Varius morbi enim nunc faucibus a pellentesque sit amet porttitor. Molestie nunc non blandit massa enim.'),
('full', '2020-06-16', '2022-06-16', 'active', 3, 'CAR-8674', null),
('3rd party', '2018-05-15', '2020-05-15', 'expired', 3, 'CAR-8674', null),
('full', '2020-09-22', '2022-09-22', 'active', 4, 'CAR-9867', 'Viverra ipsum nunc aliquet bibendum enim. Odio euismod lacinia at quis risus sed vulputate odio ut.'),
('3rd party', '2020-11-10', '2022-11-10', 'active', 5, 'LD-8576', null),
('3rd party', '2018-09-11', '2020-09-11', 'expired', 6, 'VN-8749', null),
('full', '2018-02-22', '2020-02-22', 'expired', 7, 'VN-8574', null),
('full', '2020-08-12', '2022-08-12', 'active', 8, '32-0062', 'Suspendisse faucibus interdum posuere lorem ipsum dolor sit amet. Arcu vitae elementum curabitur vitae nunc sed velit dignissim sodales.'),
('3rd party', '2021-02-11', '2023-02-11', 'active', 9, 'KX-8573', null),
('full', '2020-12-01', '2022-12-01', 'active', 10, 'LD-7583', 'Quisque sagittis purus sit amet volutpat consequat mauris. Massa ultricies mi quis hendrerit dolor magna eget est lorem.');

INSERT INTO Claim(date, claimedAmount, paidAmount, policyID, description) VALUES
('2021-03-20', 40, 40, 1, 'Molestie ac feugiat sed lectus vestibulum mattis ullamcorper velit sed. Dapibus ultrices in iaculis nunc sed.'),
('2021-02-10', 800, 700, 1, 'Faucibus ornare suspendisse sed nisi lacus sed viverra tellus. Eget duis at tellus at urna condimentum mattis. Euismod in pellentesque massa placerat duis ultricies lacus sed turpis.'),
('2021-01-11', 600, 600, 2, null),
('2021-01-30', 1000, 0, 3, 'Quam pellentesque nec nam aliquam. Erat velit scelerisque in dictum non consectetur a. Vel pretium lectus quam id leo. Lectus quam id leo in vitae turpis massa sed elementum.'),
('2020-09-11', 600, 600, 4, null),
('2018-03-22', 700, 200, 5, null),
('2021-04-10', 500, 500, 6, 'Cursus risus at ultrices mi tempus imperdiet. Sit amet consectetur adipiscing elit pellentesque habitant morbi.'),
('2020-01-01', 1200, 1000, 6, null),
('2021-02-20', 2300, 2300, 11, null),
('2020-12-02', 4000, 0, 12, null);

INSERT INTO Fraud(claimID, description) VALUES
(4, 'Mi eget mauris pharetra et ultrices neque. Rhoncus urna neque viverra justo nec ultrices dui sapien eget.'),
(4, 'Rhoncus mattis rhoncus urna neque. Feugiat sed lectus vestibulum mattis ullamcorper velit sed. Volutpat odio facilisis mauris sit amet massa. Aliquet nibh praesent tristique magna sit amet purus gravida quis.'),
(5, 'Euismod elementum nisi quis eleifend quam adipiscing vitae. Ultrices vitae auctor eu augue.'),
(7, 'Nunc mi ipsum faucibus vitae aliquet nec ullamcorper sit amet.'),
(10, 'Volutpat ac tincidunt vitae semper quis. Condimentum lacinia quis vel eros donec ac odio. Quis vel eros donec ac odio tempor.');

/*View to get all fraudulent customers*/
CREATE VIEW Fraudulent_Customers AS SELECT Customer.firstName, Customer.lastName, Customer.NIC, Customer.DLN, Customer.address, Fraud.fraudID, Fraud.description FROM Fraud JOIN Claim ON Fraud.claimID = Claim.claimID JOIN Policy ON claim.policyID = Policy.policyID JOIN Customer ON Policy.customerID = Customer.customerID;

SELECT * FROM Fraudulent_Customers;

GRANT SELECT ON insurerassociation.fraudulent_customers TO 'externaluser'@'localhost';