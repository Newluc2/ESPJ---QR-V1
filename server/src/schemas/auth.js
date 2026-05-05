/**
 * Schéma de validation pour login
 */
export const loginSchema = {
  type: 'object',
  required: ['firstName', 'lastName'],
  properties: {
    firstName: {
      type: 'string',
      minLength: 2,
      maxLength: 50,
      pattern: '^[a-zA-Zàâäçèéêëìîïòôöùûüæœ\\s\'-]+$',
    },
    lastName: {
      type: 'string',
      minLength: 2,
      maxLength: 50,
      pattern: '^[a-zA-Zàâäçèéêëìîïòôöùûüæœ\\s\'-]+$',
    },
    deviceName: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
    },
  },
};

/**
 * Schéma de validation pour attendanceRegister
 */
export const attendanceRegisterSchema = {
  type: 'object',
  required: ['deviceToken'],
  properties: {
    deviceToken: {
      type: 'string',
      minLength: 10,
    },
  },
};

/**
 * Schéma de validation pour admin addUser
 */
export const adminAddUserSchema = {
  type: 'object',
  required: ['firstName', 'lastName', 'email'],
  properties: {
    firstName: {
      type: 'string',
      minLength: 2,
      maxLength: 50,
    },
    lastName: {
      type: 'string',
      minLength: 2,
      maxLength: 50,
    },
    email: {
      type: 'string',
      pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
    },
    dateOfBirth: {
      type: 'string',
      pattern: '^\\d{4}-\\d{2}-\\d{2}$',
    },
  },
};

export default {
  loginSchema,
  attendanceRegisterSchema,
  adminAddUserSchema,
};
