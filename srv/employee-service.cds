using { sap.hr.employee as my } from '../db/schema';

@path: '/service/employee'
service EmployeeService {

  entity Departments as projection on my.Departments;

  entity Employees as projection on my.Employees {
    *,
    firstName || ' ' || lastName as fullName : String(101)
  } actions {
    action promoteEmployee(newJobTitle: String(100), salaryIncreasePercent: Decimal(5,2)) returns Employees;
    action updateStatus(newStatus: String(20)) returns Employees;
    action transferDepartment(newDepartment_ID: UUID) returns Employees;
  };

  entity Projects as projection on my.Projects;

  entity EmployeeProjects as projection on my.EmployeeProjects;

  function getDepartmentSummary() returns array of {
    departmentId: UUID;
    departmentName: String(100);
    totalEmployees: Integer;
    avgSalary: Decimal(12,2);
  };
}
