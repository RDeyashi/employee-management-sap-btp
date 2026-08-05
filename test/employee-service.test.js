const cds = require('@sap/cds');
const assert = require('node:assert');
const { describe, it, before } = require('node:test');

describe('EmployeeService', () => {
  const test = cds.test(__dirname + '/..');

  before(async () => {
    const db = await cds.connect.to('db');
    await cds.deploy(__dirname + '/../srv/employee-service.cds').to(db);
  });

  it('should serve $metadata', async () => {
    const res = await test.GET('/service/employee/$metadata');
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.includes('EmployeeService'));
  });

  it('should read departments', async () => {
    const getRes = await test.GET('/service/employee/Departments');
    assert.strictEqual(getRes.status, 200);
    assert.ok(Array.isArray(getRes.data.value || getRes.data));
  });

  it('should create an employee and auto-set hireDate', async () => {
    const empRes = await test.POST('/service/employee/Employees', {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      jobTitle: 'Software Engineer',
      salary: 85000.00
    });

    assert.strictEqual(empRes.status, 201);
    assert.strictEqual(empRes.data.firstName, 'John');
    assert.ok(empRes.data.hireDate, 'hireDate should be auto-set');
  });

  it('should reject employee creation with invalid email', async () => {
    try {
      await test.POST('/service/employee/Employees', {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'invalid-email-format',
        jobTitle: 'Manager'
      });
      assert.fail('Should have failed with 400 Bad Request');
    } catch (err) {
      assert.strictEqual(err.response ? err.response.status : err.status || err.code, 400);
    }
  });

  it('should promote an employee via custom action', async () => {
    const empRes = await test.POST('/service/employee/Employees', {
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice.smith@example.com',
      jobTitle: 'Junior Developer',
      salary: 60000.00
    });
    assert.strictEqual(empRes.status, 201);
    const empId = empRes.data.ID;

    const actionRes = await test.POST(`/service/employee/Employees(${empId})/EmployeeService.promoteEmployee`, {
      newJobTitle: 'Senior Developer',
      salaryIncreasePercent: 10
    });

    assert.strictEqual(actionRes.status, 200);
    assert.strictEqual(actionRes.data.jobTitle, 'Senior Developer');
    assert.strictEqual(Number(actionRes.data.salary), 66000.00);
  });

  it('should update employee status via custom action and reject invalid status', async () => {
    const empRes = await test.POST('/service/employee/Employees', {
      firstName: 'Bob',
      lastName: 'Wilson',
      email: 'bob.wilson@example.com',
      jobTitle: 'QA Engineer',
      salary: 70000.00
    });
    assert.strictEqual(empRes.status, 201);
    const empId = empRes.data.ID;

    const statusRes = await test.POST(`/service/employee/Employees(${empId})/EmployeeService.updateStatus`, {
      newStatus: 'On Leave'
    });
    assert.strictEqual(statusRes.status, 200);
    assert.strictEqual(statusRes.data.status, 'On Leave');

    try {
      await test.POST(`/service/employee/Employees(${empId})/EmployeeService.updateStatus`, {
        newStatus: 'InvalidStatus'
      });
      assert.fail('Should have failed with 400 Bad Request');
    } catch (err) {
      assert.strictEqual(err.response ? err.response.status : err.status || err.code, 400);
    }
  });

  it('should transfer employee department via custom action', async () => {
    const dept1Res = await test.GET('/service/employee/Departments');
    assert.strictEqual(dept1Res.status, 200);
    const depts = dept1Res.data.value || dept1Res.data;
    assert.ok(depts.length >= 2, 'Need at least 2 departments for transfer test');

    const targetDeptId = depts[1].ID;

    const empRes = await test.POST('/service/employee/Employees', {
      firstName: 'Charlie',
      lastName: 'Brown',
      email: 'charlie.brown@example.com',
      jobTitle: 'Analyst',
      department_ID: depts[0].ID
    });
    assert.strictEqual(empRes.status, 201);
    const empId = empRes.data.ID;

    const transferRes = await test.POST(`/service/employee/Employees(${empId})/EmployeeService.transferDepartment`, {
      newDepartment_ID: targetDeptId
    });
    assert.strictEqual(transferRes.status, 200);
    assert.strictEqual(transferRes.data.department_ID, targetDeptId);
  });

  it('should return department summary via custom function', async () => {
    const summaryRes = await test.GET('/service/employee/getDepartmentSummary()');
    assert.strictEqual(summaryRes.status, 200);
    assert.ok(Array.isArray(summaryRes.data.value || summaryRes.data));
  });
});
