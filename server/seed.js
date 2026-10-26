const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Event = require('./models/Event');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const events = [
    {
        title: 'React & Node.js Developer Retreat',
        description: 'Join us for a 3-day deep dive into modern full-stack web development. Perfect for developers looking to take their skills to the next level.',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        location: 'Silicon Valley Innovation Center, CA',
        category: 'Technology',
        totalSeats: 200,
        ticketPrice: 0,
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Neon Nights EDM Festival',
        description: 'Experience an unforgettable night of EDM, techno, and dazzling light shows with top DJs from around the globe.',
        date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        location: 'Grand Arena, New York',
        category: 'Music',
        totalSeats: 500,
        ticketPrice: 1500,
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Global Leaders Business Summit',
        description: 'A premium gathering of CEOs, founders, and investors discussing the future of global commerce and AI integration.',
        date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        location: 'The Ritz-Carlton, London',
        category: 'Business',
        totalSeats: 150,
        ticketPrice: 5000,
        image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Modern Art Expo 2024',
        description: 'Discover breathtaking contemporary and modern arts from underground and trending artists this season.',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        location: 'Downtown Art Museum',
        category: 'Art',
        totalSeats: 300,
        ticketPrice: 200,
        image: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Startup Pitch & Pitch Competition',
        description: 'Watch 25 startups pitch for 1 million dollars in seed funding. Great networking for entrepreneurs and angel investors.',
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        location: 'Convention Center, Miami',
        category: 'Business',
        totalSeats: 250,
        ticketPrice: 100,
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Cloud Computing Architecture Seminar',
        description: 'A purely technical breakdown of scalable cloud solutions, multi-region routing, and serverless compute processing.',
        date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
        location: 'Tech Hub, Seattle',
        category: 'Technology',
        totalSeats: 100,
        ticketPrice: 600,
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800'
    }
];

const seedDatabase = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not set in server/.env.');
        }

        await mongoose.connect(process.env.MONGO_URI);
        let adminUser = await User.findOne({ role: 'admin' }).select('_id');
        const adminName = process.env.ADMIN_NAME?.trim();
        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const adminPassword = process.env.ADMIN_PASSWORD;
        const hasAdminSettings = adminName || adminEmail || adminPassword;

        if (hasAdminSettings && (!adminName || !adminEmail || !adminPassword)) {
            throw new Error('Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD together in server/.env.');
        }

        if (!adminUser && hasAdminSettings) {
            const existingUser = await User.findOne({ email: adminEmail });
            if (existingUser) {
                throw new Error(`An account already exists for ${adminEmail}; use npm run create-admin to promote it safely.`);
            }
            if (adminPassword.length < 12) {
                throw new Error('ADMIN_PASSWORD must contain at least 12 characters.');
            }

            adminUser = await User.create({
                name: adminName,
                email: adminEmail,
                password: await bcrypt.hash(adminPassword, 12),
                role: 'admin',
                isVerified: true
            });
            console.log(`Admin account created for ${adminEmail}.`);
        }

        const operations = events.map((event) => ({
            updateOne: {
                filter: { title: event.title },
                update: {
                    $set: event,
                    $setOnInsert: {
                        availableSeats: event.totalSeats,
                        ...(adminUser ? { createdBy: adminUser._id } : {})
                    }
                },
                upsert: true
            }
        }));

        const result = await Event.bulkWrite(operations);
        console.log(
            `Seeded ${events.length} events (${result.upsertedCount} added, ${result.modifiedCount} updated). Existing users, bookings, and other events were preserved.`
        );
    } catch (error) {
        console.error('Event seeding failed:', error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

seedDatabase();