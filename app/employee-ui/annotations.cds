using EmployeeService as service from '../../srv/employee-service';

annotate service.Employees with @(
  UI.HeaderInfo : {
    TypeName       : 'Employee',
    TypeNamePlural : 'Employees',
    Title          : { $Type : 'UI.DataField', Value : fullName },
    Description    : { $Type : 'UI.DataField', Value : jobTitle }
  },
  UI.SelectionFields : [
    department_ID,
    status,
    jobTitle
  ],
  UI.LineItem : [
    { $Type : 'UI.DataField', Value : firstName, Label : 'First Name' },
    { $Type : 'UI.DataField', Value : lastName, Label : 'Last Name' },
    { $Type : 'UI.DataField', Value : email, Label : 'Email Address' },
    { $Type : 'UI.DataField', Value : jobTitle, Label : 'Job Title' },
    { $Type : 'UI.DataField', Value : department.name, Label : 'Department' },
    { $Type : 'UI.DataField', Value : salary, Label : 'Base Salary' },
    { $Type : 'UI.DataField', Value : currency, Label : 'Currency' },
    { $Type : 'UI.DataField', Value : status, Label : 'Status' }
  ],
  UI.HeaderFacets : [
    {
      $Type  : 'UI.ReferenceFacet',
      Target : '@UI.FieldGroup#HeaderStatus'
    }
  ],
  UI.FieldGroup #HeaderStatus : {
    Data : [
      { $Type : 'UI.DataField', Value : status, Label : 'Employment Status' },
      { $Type : 'UI.DataField', Value : hireDate, Label : 'Hire Date' }
    ]
  },
  UI.Facets : [
    {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'EmployeeGeneralInfo',
      Label  : 'Personal Information',
      Target : '@UI.FieldGroup#GeneralInfo'
    },
    {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'EmployeeEmploymentDetails',
      Label  : 'Employment & Compensation',
      Target : '@UI.FieldGroup#EmploymentDetails'
    }
  ],
  UI.FieldGroup #GeneralInfo : {
    Data : [
      { $Type : 'UI.DataField', Value : firstName, Label : 'First Name' },
      { $Type : 'UI.DataField', Value : lastName, Label : 'Last Name' },
      { $Type : 'UI.DataField', Value : email, Label : 'Email Address' },
      { $Type : 'UI.DataField', Value : phone, Label : 'Phone Number' }
    ]
  },
  UI.FieldGroup #EmploymentDetails : {
    Data : [
      { $Type : 'UI.DataField', Value : jobTitle, Label : 'Job Title' },
      { $Type : 'UI.DataField', Value : department_ID, Label : 'Department' },
      { $Type : 'UI.DataField', Value : hireDate, Label : 'Hire Date' },
      { $Type : 'UI.DataField', Value : salary, Label : 'Base Salary' },
      { $Type : 'UI.DataField', Value : currency, Label : 'Currency' },
      { $Type : 'UI.DataField', Value : status, Label : 'Status' }
    ]
  }
);

annotate service.Departments with @(
  UI.HeaderInfo : {
    TypeName       : 'Department',
    TypeNamePlural : 'Departments',
    Title          : { $Type : 'UI.DataField', Value : name },
    Description    : { $Type : 'UI.DataField', Value : code }
  },
  UI.LineItem : [
    { $Type : 'UI.DataField', Value : code, Label : 'Department Code' },
    { $Type : 'UI.DataField', Value : name, Label : 'Department Name' },
    { $Type : 'UI.DataField', Value : headCount, Label : 'Headcount' },
    { $Type : 'UI.DataField', Value : description, Label : 'Description' }
  ]
);
