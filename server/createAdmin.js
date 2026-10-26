const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');
const User = require('./models/User');

dotenv.config();

function prompt(question, { hidden = false } = {}) {
    return new Promise((resolve, reject) => {
        if (hidden && !process.stdin.isTTY) {
            reject(new Error('Run this command in an interactive terminal so the password can be entered securely.'));
            return;
        }

        process.stdout.write(question);
        if (!hidden) {
            const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
            rl.once('line', (answer) => {
                rl.close();
                resolve(answer.trim());
            });
            return;
        }

        const stdin = process.stdin;
        const previousRawMode = stdin.isRaw;
        let answer = '';
        const finish = (error) => {
            stdin.removeListener('data', onData);
            stdin.setRawMode(previousRawMode);
            stdin.pause();
            process.stdout.write('\n');
            if (error) reject(error);
            else resolve(answer);
        };
        const onData = (chunk) => {
            for (const character of chunk.toString('utf8')) {
                if (character === '\u0003') {
                    finish(new Error('Admin setup cancelled.'));
                    return;
                }
                if (character === '\r' || character === '\n') {
                    finish();
                    return;
                }
                if (character === '\u007f' || character === '\b') {
                    answer = answer.slice(0, -1);
                } else if (character >= ' ') {
                    answer += character;
                }
            }
        };

        stdin.setRawMode(true);
        stdin.resume();
        stdin.on('data', onData);
    });
}

async function createOrPromoteAdmin() {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not set in server/.env.');
    }

    const email = (await prompt('Admin email: ')).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Enter a valid email address.');
    }

    await mongoose.connect(process.env.MONGO_URI);
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        const confirmation = await prompt(`Promote the existing account ${email} to admin? Type yes to confirm: `);
        if (confirmation.toLowerCase() !== 'yes') {
            console.log('No changes made.');
            return;
        }
        existingUser.role = 'admin';
        existingUser.isVerified = true;
        await existingUser.save();
        console.log(`Admin access enabled for ${email}. Sign in with that account's existing password.`);
        return;
    }

    const name = await prompt('Admin name: ');
    if (!name) throw new Error('Admin name is required.');
    const password = await prompt('New admin password (input hidden): ', { hidden: true });
    if (password.length < 12) {
        throw new Error('Use a password with at least 12 characters.');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'admin',
        isVerified: true
    });
    console.log(`Admin account created for ${email}.`);
}

createOrPromoteAdmin()
    .catch((error) => {
        console.error(`Admin setup failed: ${error.message}`);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect().catch(() => {});
    });
