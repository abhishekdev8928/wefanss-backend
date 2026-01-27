// scripts/seedStaticData.js

const mongoose = require('mongoose');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const Role = require('../models/role-model');
const Privilege = require('../models/previlege-model');
const User = require('../models/user-model');
const { STATIC_ROLES, STATIC_PRIVILEGES } = require('../config/role-config');

// Static users configuration
const STATIC_USERS = {
  SUPER_ADMIN: {
    name: 'Super Admin',
    email: 'abhishekreact.dev@gmail.com',
    password: 'Abhishek@123',
    role: STATIC_ROLES.SUPER_ADMIN,
    isVerified: true,
    isActive: true
  },
  ADMIN: {
    name: 'Admin User',
    email: 'abhishekshaxma8356@gmail.com',
    password: 'Abhishek@123',
    role: STATIC_ROLES.ADMIN,
    isVerified: true,
    isActive: true
  }
};

// Helper: Generate slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '');
};

// Helper: Generate TOTP credentials
const generateTOTPCredentials = async (email) => {
  const secret = speakeasy.generateSecret({
    name: `WeFans (${email})`,
    issuer: 'WeFans'
  });

  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

  return {
    totpSecret: secret.base32,
    totpQrCode: qrCodeUrl
  };
};

// Seed roles
const seedRoles = async () => {
  const superAdminRole = await Role.findOneAndUpdate(
    { name: STATIC_ROLES.SUPER_ADMIN },
    {
      name: STATIC_ROLES.SUPER_ADMIN,
      slug: generateSlug(STATIC_ROLES.SUPER_ADMIN),
      description: 'System administrator with full access',
      isActive: true
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const adminRole = await Role.findOneAndUpdate(
    { name: STATIC_ROLES.ADMIN },
    {
      name: STATIC_ROLES.ADMIN,
      slug: generateSlug(STATIC_ROLES.ADMIN),
      description: 'Administrator with limited access',
      isActive: true
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return { superAdminRole, adminRole };
};

// Seed privileges
const seedPrivileges = async (superAdminRole, adminRole) => {
  await Privilege.findOneAndUpdate(
    { role: STATIC_ROLES.SUPER_ADMIN },
    {
      ...STATIC_PRIVILEGES[STATIC_ROLES.SUPER_ADMIN],
      roleId: superAdminRole._id
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Privilege.findOneAndUpdate(
    { role: STATIC_ROLES.ADMIN },
    {
      ...STATIC_PRIVILEGES[STATIC_ROLES.ADMIN],
      roleId: adminRole._id
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

// Seed users
const seedUsers = async (superAdminRole, adminRole) => {
  // Super Admin
  const existingSuperAdmin = await User.findOne({ email: STATIC_USERS.SUPER_ADMIN.email });
  if (!existingSuperAdmin) {
    const totpCreds = await generateTOTPCredentials(STATIC_USERS.SUPER_ADMIN.email);
    
    const superAdminUser = new User({
      name: STATIC_USERS.SUPER_ADMIN.name,
      email: STATIC_USERS.SUPER_ADMIN.email,
      password: STATIC_USERS.SUPER_ADMIN.password,
      roleId: superAdminRole._id,
      isActive: true,
      isVerified: true,
      totpSecret: totpCreds.totpSecret,
      totpQrCode: totpCreds.totpQrCode
    });
    
    await superAdminUser.save();
  }

  // Admin
  const existingAdmin = await User.findOne({ email: STATIC_USERS.ADMIN.email });
  if (!existingAdmin) {
    const totpCreds = await generateTOTPCredentials(STATIC_USERS.ADMIN.email);
    
    const adminUser = new User({
      name: STATIC_USERS.ADMIN.name,
      email: STATIC_USERS.ADMIN.email,
      password: STATIC_USERS.ADMIN.password,
      roleId: adminRole._id,
      isActive: true,
      isVerified: true,
      totpSecret: totpCreds.totpSecret,
      totpQrCode: totpCreds.totpQrCode
    });
    
    await adminUser.save();
  }
};

// Main seed function
const seedStaticData = async () => {
  const { superAdminRole, adminRole } = await seedRoles();
  await seedPrivileges(superAdminRole, adminRole);
  await seedUsers(superAdminRole, adminRole);
};

// Execute
const run = async () => {
  const DB_URI = "mongodb://127.0.0.1:27017/wefans-dev";

  try {
    await mongoose.connect(DB_URI);
    await seedStaticData();
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

run();