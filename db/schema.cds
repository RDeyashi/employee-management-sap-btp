namespace sap.hr.employee;

using { cuid, managed, Country } from '@sap/cds/common';

entity Departments : cuid, managed {
  name        : String(100) not null;
  code        : String(10) not null;
  description : String(255);
  headCount   : Integer default 0;
  employees   : Association to many Employees on employees.department = $self;
}

entity Employees : cuid, managed {
  firstName   : String(50) not null;
  lastName    : String(50) not null;
  email       : String(100) not null;
  phone       : String(20);
  hireDate    : Date;
  jobTitle    : String(100);
  salary      : Decimal(12, 2);
  currency    : String(3) default 'USD';
  status      : String(20) enum {
    Active = 'Active';
    OnLeave = 'On Leave';
    Terminated = 'Terminated';
  } default 'Active';
  department  : Association to Departments;
  projects    : Association to many EmployeeProjects on projects.employee = $self;
}

entity Projects : cuid, managed {
  name        : String(100) not null;
  code        : String(20) not null;
  budget      : Decimal(15, 2);
  startDate   : Date;
  endDate     : Date;
  members     : Association to many EmployeeProjects on members.project = $self;
}

entity EmployeeProjects : cuid {
  employee    : Association to Employees;
  project     : Association to Projects;
  role        : String(50);
  allocation  : Integer default 100; // Allocation percentage (0-100%)
}
