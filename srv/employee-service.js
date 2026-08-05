const cds = require('@sap/cds');

class EmployeeService extends cds.ApplicationService {
  async init() {
    const { Employees, Departments } = this.entities;

    // Before CREATE on Employees: validate email format and set default hire date if missing
    this.before('CREATE', 'Employees', (req) => {
      const { email, hireDate } = req.data;
      if (email && !email.includes('@')) {
        req.error(400, `Invalid email address: ${email}`);
      }
      if (!hireDate) {
        req.data.hireDate = new Date().toISOString().slice(0, 10);
      }
    });

    // After READ on Employees: compute dynamic attributes if needed
    this.after('READ', 'Employees', (results) => {
      const records = Array.isArray(results) ? results : [results];
      records.forEach((emp) => {
        if (emp && emp.hireDate) {
          const hireYear = new Date(emp.hireDate).getFullYear();
          const currentYear = new Date().getFullYear();
          emp.yearsOfService = Math.max(0, currentYear - hireYear);
        }
      });
    });

    // After READ on Departments: dynamically compute real-time headCount
    this.after('READ', 'Departments', async (results) => {
      const depts = Array.isArray(results) ? (results.length > 0 ? results : []) : [results];
      if (!depts.length) return;

      for (const dept of depts) {
        if (!dept || !dept.ID) continue;
        const countResult = await SELECT.from(Employees)
          .columns('count(*) as count')
          .where({ department_ID: dept.ID });
        dept.headCount = countResult[0]?.count || 0;
      }
    });

    // Action: promoteEmployee
    this.on('promoteEmployee', 'Employees', async (req) => {
      const { newJobTitle, salaryIncreasePercent } = req.data;
      const param = req.params[0];
      const employeeId = typeof param === 'object' && param !== null ? param.ID : param;

      const emp = await SELECT.one.from(Employees).where({ ID: employeeId });
      if (!emp) {
        return req.error(404, `Employee with ID ${employeeId} not found.`);
      }

      let newSalary = Number(emp.salary || 0);
      if (salaryIncreasePercent && salaryIncreasePercent > 0) {
        newSalary += newSalary * (salaryIncreasePercent / 100);
      }

      await UPDATE(Employees)
        .set({
          jobTitle: newJobTitle || emp.jobTitle,
          salary: newSalary.toFixed(2)
        })
        .where({ ID: employeeId });

      return SELECT.one.from(Employees).where({ ID: employeeId });
    });

    // Action: updateStatus
    this.on('updateStatus', 'Employees', async (req) => {
      const { newStatus } = req.data;
      const param = req.params[0];
      const employeeId = typeof param === 'object' && param !== null ? param.ID : param;

      const validStatuses = ['Active', 'On Leave', 'Terminated'];
      if (!validStatuses.includes(newStatus)) {
        return req.error(400, `Invalid status ${newStatus}. Valid options: ${validStatuses.join(', ')}`);
      }

      await UPDATE(Employees).set({ status: newStatus }).where({ ID: employeeId });
      return SELECT.one.from(Employees).where({ ID: employeeId });
    });

    // Action: transferDepartment
    this.on('transferDepartment', 'Employees', async (req) => {
      const { newDepartment_ID } = req.data;
      const param = req.params[0];
      const employeeId = typeof param === 'object' && param !== null ? param.ID : param;

      if (!newDepartment_ID) {
        return req.error(400, 'Target department ID is required.');
      }

      const targetDept = await SELECT.one.from(Departments).where({ ID: newDepartment_ID });
      if (!targetDept) {
        return req.error(404, `Department with ID ${newDepartment_ID} not found.`);
      }

      await UPDATE(Employees).set({ department_ID: newDepartment_ID }).where({ ID: employeeId });
      return SELECT.one.from(Employees).where({ ID: employeeId });
    });

    // Function: getDepartmentSummary
    this.on('getDepartmentSummary', async () => {
      const depts = await SELECT.from(Departments);
      const summary = [];

      for (const dept of depts) {
        const empStats = await SELECT.from(Employees)
          .columns('count(*) as count', 'avg(salary) as avgSal')
          .where({ department_ID: dept.ID });

        const count = empStats[0]?.count || 0;
        const avgSalary = empStats[0]?.avgSal || 0;

        summary.push({
          departmentId: dept.ID,
          departmentName: dept.name,
          totalEmployees: count,
          avgSalary: Number(avgSalary).toFixed(2)
        });
      }

      return summary;
    });

    return super.init();
  }
}

module.exports = EmployeeService;
