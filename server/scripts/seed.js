/**
 * Database Seed Script
 * Populates the database with sample data for development
 * Run with: node scripts/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Service = require('../models/Service');
const Project = require('../models/Project');
const Contact = require('../models/Contact');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sgrs_security', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Service.deleteMany({});
    await Project.deleteMany({});
    await Contact.deleteMany({});

    // Create Admin User
    console.log('👤 Creating admin user...');
    const admin = await User.create({
      username: 'admin',
      email: 'admin@sgrs.com',
      password: 'admin123',
    });
    console.log(`✅ Admin user created: ${admin.email} / admin123`);

    // Create Services
    console.log('🔧 Creating services...');
    const services = await Service.insertMany([
      {
        title: 'Security Camera Systems',
        shortDescription: 'Advanced surveillance solutions for complete property protection',
        description: 'Professional security camera systems with HD/4K resolution, night vision, motion detection, and remote monitoring capabilities. We offer both wired and wireless solutions tailored to your needs.',
        icon: '📹',
        image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800',
        features: [
          'HD/4K Resolution Cameras',
          'Night Vision Technology',
          'Motion Detection & Alerts',
          'Remote Mobile Access',
          'Cloud Storage Options',
          '24/7 Monitoring Support'
        ],
        order: 1,
        isActive: true,
      },
      {
        title: 'Fire Protection Systems',
        shortDescription: 'Comprehensive fire detection and suppression systems',
        description: 'Complete fire protection solutions including smoke detectors, fire alarms, sprinkler systems, and fire extinguishers. We ensure your property meets all safety regulations and standards.',
        icon: '🔥',
        image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800',
        features: [
          'Smoke & Heat Detectors',
          'Fire Alarm Systems',
          'Sprinkler Installation',
          'Fire Extinguisher Service',
          'Emergency Lighting',
          'Regular Safety Inspections'
        ],
        order: 2,
        isActive: true,
      },
      {
        title: 'Access Control Systems',
        shortDescription: 'Smart access control for enhanced security and convenience',
        description: 'Modern access control systems including keycard readers, biometric scanners, smart locks, and intercom systems. Control who enters your property with advanced technology.',
        icon: '🔐',
        image: 'https://images.unsplash.com/photo-1614064641938-2c6d4e5a5c3a?w=800',
        features: [
          'Keycard & RFID Systems',
          'Biometric Access',
          'Smart Lock Integration',
          'Intercom Systems',
          'Visitor Management',
          'Access Logs & Reports'
        ],
        order: 3,
        isActive: true,
      },
      {
        title: 'Intrusion Alarm Systems',
        shortDescription: 'Reliable alarm systems to protect against unauthorized entry',
        description: 'Professional intrusion detection systems with sensors, motion detectors, and 24/7 monitoring. Get instant alerts when security is compromised.',
        icon: '🚨',
        image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800',
        features: [
          'Door & Window Sensors',
          'Motion Detectors',
          'Glass Break Sensors',
          '24/7 Monitoring',
          'Mobile App Alerts',
          'Police Dispatch Integration'
        ],
        order: 4,
        isActive: true,
      },
      {
        title: 'Solar Water Heaters',
        shortDescription: 'Eco-friendly solar water heating solutions',
        description: 'Energy-efficient solar water heating systems that reduce electricity costs and environmental impact. Professional installation and maintenance services.',
        icon: '☀️',
        image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
        features: [
          'Solar Panel Installation',
          'Energy Efficient',
          'Cost Savings',
          'Eco-Friendly',
          'Professional Installation',
          'Maintenance Services'
        ],
        order: 5,
        isActive: true,
      },
      {
        title: 'Air Conditioning Systems',
        shortDescription: 'Complete HVAC solutions for optimal climate control',
        description: 'Professional air conditioning installation, repair, and maintenance services. We provide solutions for residential and commercial properties.',
        icon: '❄️',
        image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800',
        features: [
          'AC Installation',
          'Repair & Maintenance',
          'Energy Efficient Units',
          'Smart Thermostats',
          'Duct Cleaning',
          '24/7 Emergency Service'
        ],
        order: 6,
        isActive: true,
      },
      {
        title: 'Maintenance Services',
        shortDescription: 'Comprehensive maintenance for all security and climate systems',
        description: 'Regular maintenance and repair services to keep all your security and climate control systems running smoothly. Preventive maintenance plans available.',
        icon: '🔧',
        image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800',
        features: [
          'Regular Inspections',
          'Preventive Maintenance',
          'Emergency Repairs',
          'System Updates',
          'Performance Optimization',
          'Maintenance Contracts'
        ],
        order: 7,
        isActive: true,
      },
    ]);
    console.log(`✅ Created ${services.length} services`);

    // Create Projects
    console.log('📁 Creating projects...');
    const projects = await Project.insertMany([
      {
        title: 'Corporate Office Security System',
        description: 'Complete security system installation for a 10-story corporate building including cameras, access control, and alarm systems.',
        category: 'Security Cameras',
        location: 'Business District, City',
        year: 2024,
        images: [
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
          'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800',
        ],
        isActive: true,
      },
      {
        title: 'Residential Fire Protection',
        description: 'Fire detection and suppression system installation for luxury residential complex with 50 units.',
        category: 'Fire Protection',
        location: 'Residential Area',
        year: 2024,
        images: [
          'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800',
        ],
        isActive: true,
      },
      {
        title: 'Smart Access Control Installation',
        description: 'Modern biometric access control system for high-security facility with keycard and fingerprint readers.',
        category: 'Access Control',
        location: 'Industrial Zone',
        year: 2023,
        images: [
          'https://images.unsplash.com/photo-1614064641938-2c6d4e5a5c3a?w=800',
        ],
        isActive: true,
      },
      {
        title: 'Retail Store Alarm System',
        description: 'Comprehensive intrusion alarm system with motion detectors and 24/7 monitoring for retail chain.',
        category: 'Alarms',
        location: 'Shopping Mall',
        year: 2024,
        images: [
          'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800',
        ],
        isActive: true,
      },
      {
        title: 'Solar Water Heater Installation',
        description: 'Eco-friendly solar water heating system installation for residential complex reducing energy costs by 60%.',
        category: 'Solar Water Heaters',
        location: 'Suburban Area',
        year: 2023,
        images: [
          'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
        ],
        isActive: true,
      },
      {
        title: 'Commercial HVAC System',
        description: 'Complete air conditioning and ventilation system for large commercial building with smart controls.',
        category: 'Air Conditioning',
        location: 'Commercial District',
        year: 2024,
        images: [
          'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800',
        ],
        isActive: true,
      },
      {
        title: 'Annual Maintenance Contract',
        description: 'Comprehensive maintenance contract covering all security and climate systems for corporate headquarters.',
        category: 'Maintenance',
        location: 'Various Locations',
        year: 2024,
        images: [
          'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800',
        ],
        isActive: true,
      },
      {
        title: 'Warehouse Security Upgrade',
        description: 'Upgraded security camera system with AI-powered motion detection for large warehouse facility.',
        category: 'Security Cameras',
        location: 'Industrial Area',
        year: 2023,
        images: [
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
        ],
        isActive: true,
      },
    ]);
    console.log(`✅ Created ${projects.length} projects`);

    // Create Sample Contact Messages
    console.log('📧 Creating sample contact messages...');
    const contacts = await Contact.insertMany([
      {
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '+1 (555) 123-4567',
        subject: 'Quote Request for Security System',
        message: 'I am interested in installing a security camera system for my business. Could you please provide a quote?',
        isRead: false,
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.j@example.com',
        phone: '+1 (555) 234-5678',
        subject: 'Fire Protection Consultation',
        message: 'We need to upgrade our fire protection system. Can we schedule a consultation?',
        isRead: true,
      },
      {
        name: 'Mike Davis',
        email: 'mike.davis@example.com',
        phone: '+1 (555) 345-6789',
        subject: 'AC Maintenance Service',
        message: 'Our air conditioning system needs maintenance. When can you send a technician?',
        isRead: false,
      },
    ]);
    console.log(`✅ Created ${contacts.length} contact messages`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Admin User: ${admin.email} / admin123`);
    console.log(`   - Services: ${services.length}`);
    console.log(`   - Projects: ${projects.length}`);
    console.log(`   - Contact Messages: ${contacts.length}`);
    console.log('\n🔗 You can now:');
    console.log('   - Login at: http://localhost:3000/admin/login');
    console.log('   - Email: admin@sgrs.com');
    console.log('   - Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
