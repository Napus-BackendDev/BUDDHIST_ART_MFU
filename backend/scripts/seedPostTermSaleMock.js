'use strict';

const path = require('path');
const mongoose = require('mongoose');

require('dotenv').config({ path: path.join(__dirname, '../.env.dev') });

const User = require('../server/Project/User/models/user.model');
const Artwork = require('../server/Project/Artwork/models/artwork.model');
const Status = require('../server/Project/Settings/models/status.model');
const Category = require('../server/Project/Artwork/models/category.model');

async function seedPostTermSale() {
    const mongoURI = process.env.MONGODB;
    if (!mongoURI) {
        throw new Error('MONGODB URI not found in backend/.env.dev');
    }

    await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');

    // 1. Fetch available Artists (Users with role Artist or students)
    const artists = await User.find().lean();
    console.log(`Found ${artists.length} users`);
    const artistUsers = artists.filter(u => {
        if (!u.role) return false;
        const roleStr = JSON.stringify(u.role).toLowerCase();
        return roleStr.includes('artist') || roleStr.includes('ศิลปิน') || u.studentId;
    });
    console.log(`Found ${artistUsers.length} artist users`);

    const defaultArtist = artistUsers[0] || artists[0];

    // 2. Fetch Statuses
    const availableStatus = await Status.findOne({ title: { $elemMatch: { key: 'en', value: 'Available' } } });
    const exhibitionStatus = await Status.findOne({ title: { $elemMatch: { key: 'en', value: 'Exhibition' } } });
    const soldOutStatus = await Status.findOne({ title: { $elemMatch: { key: 'en', value: 'Sold Out' } } });
    const approvedStatus = await Status.findOne({ title: { $elemMatch: { key: 'en', value: 'Approved' } } });

    console.log('Statuses:', {
        available: availableStatus?._id,
        exhibition: exhibitionStatus?._id,
        soldOut: soldOutStatus?._id,
        approved: approvedStatus?._id
    });

    // 3. Fetch Categories
    const categories = await Category.find().lean();
    console.log(`Found ${categories.length} categories`);
    const defaultCat = categories[0] || null;

    // 4. Define Mock Artworks for Post-Term Sale
    const now = new Date('2026-08-19T23:15:00.000Z');

    const mockArtworks = [
        // 1. ใกล้ครบ 30 วัน & รอคำตอบ (Due in 15 days, Pending decision)
        {
            title: [
                { key: 'th', value: 'พระพุทธสิริสัตตนาคราชเรืองรอง' },
                { key: 'en', value: 'Radiant Buddha with Seven Serpents' }
            ],
            description: [
                { key: 'th', value: 'ภาพเขียนสีอะคริลิกผสมทองคำเปลวบริสุทธิ์บนผืนผ้าใบ ถ่ายทอดความสงบสุขและความศรัทธา' },
                { key: 'en', value: 'Acrylic and gold leaf on canvas capturing serenity and spiritual devotion.' }
            ],
            artworkCode: 'ART-2025-001',
            artworkPiece: '01/01',
            price: 45000,
            technique: [{ key: 'th', value: 'สีอะคริลิกและทองคำเปลว' }, { key: 'en', value: 'Acrylic and Gold Leaf on Canvas' }],
            size: [{ key: 'th', value: '80 x 100 ซม.' }, { key: 'en', value: '80 x 100 cm' }],
            academicYear: '2568',
            courseLevel: '03',
            artist: artistUsers[0]?._id || defaultArtist._id,
            category: categories[0]?._id || defaultCat?._id,
            status: {
                approval: approvedStatus?._id,
                sale: availableStatus?._id
            },
            image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
            postTermSale: {
                applicable: true,
                needsReview: false,
                initialSaleEndsAt: new Date('2026-09-04T17:00:00.000Z'), // ~16 days left
                mode: 'initial_term',
                decision: 'pending',
                effectiveAt: new Date('2026-09-04T17:00:00.000Z'),
                note: 'แจ้งเตือนรอบ 30 วันแล้ว ศิลปินกำลังพิจารณา',
                history: []
            }
        },

        // 2. ใกล้ครบ 30 วัน & รอคำตอบ (Due in 6 days, urgent warning, Pending)
        {
            title: [
                { key: 'th', value: 'จิตวิญญาณแห่งล้านนาบูรพา' },
                { key: 'en', value: 'Soul of Eastern Lanna' }
            ],
            description: [
                { key: 'th', value: 'ประติมากรรมสำริดรมดำลายรดน้ำแบบดั้งเดิม' },
                { key: 'en', value: 'Blackened bronze sculpture with traditional gold leaf stencil.' }
            ],
            artworkCode: 'ART-2025-002',
            artworkPiece: '01/05',
            price: 68000,
            technique: [{ key: 'th', value: 'ประติมากรรมสำริดรมดำ' }, { key: 'en', value: 'Bronze Sculpture' }],
            size: [{ key: 'th', value: '45 x 30 x 60 ซม.' }, { key: 'en', value: '45 x 30 x 60 cm' }],
            academicYear: '2568',
            courseLevel: '04',
            artist: artistUsers[1]?._id || defaultArtist._id,
            category: categories[1]?._id || defaultCat?._id,
            status: {
                approval: approvedStatus?._id,
                sale: availableStatus?._id
            },
            image: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=600&auto=format&fit=crop&q=80',
            postTermSale: {
                applicable: true,
                needsReview: false,
                initialSaleEndsAt: new Date('2026-08-25T17:00:00.000Z'), // ~6 days left
                mode: 'initial_term',
                decision: 'pending',
                effectiveAt: new Date('2026-08-25T17:00:00.000Z'),
                note: 'ส่งอีเมลเตือน 7 วันแล้ว ติดต่อทางโทรศัพท์เมื่อ 18/08/2026',
                history: []
            }
        },

        // 3. ขายต่อปกติ (Standard Sale / Continue Sale - Expired term)
        {
            title: [
                { key: 'th', value: 'มณฑปแก้วทิพยพิมาน' },
                { key: 'en', value: 'Celestial Glass Pavilion' }
            ],
            description: [
                { key: 'th', value: 'งานจิตรกรรมไทยร่วมสมัย ประดับมุกและกระจกเกรียบ' },
                { key: 'en', value: 'Contemporary Thai painting adorned with mother-of-pearl and traditional stained glass.' }
            ],
            artworkCode: 'ART-2024-008',
            artworkPiece: '01/01',
            price: 120000,
            technique: [{ key: 'th', value: 'สีฝุ่นผสมกาวกระถินบนไม้สัก' }, { key: 'en', value: 'Tempera on Teak Wood' }],
            size: [{ key: 'th', value: '120 x 150 ซม.' }, { key: 'en', value: '120 x 150 cm' }],
            academicYear: '2567',
            courseLevel: '04',
            artist: artistUsers[2]?._id || defaultArtist._id,
            category: categories[0]?._id || defaultCat?._id,
            status: {
                approval: approvedStatus?._id,
                sale: availableStatus?._id
            },
            image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&auto=format&fit=crop&q=80',
            postTermSale: {
                applicable: true,
                needsReview: false,
                initialSaleEndsAt: new Date('2026-06-30T17:00:00.000Z'), // Expired
                mode: 'standard_sale',
                decision: 'continue_sale',
                decisionAt: new Date('2026-06-15T10:30:00.000Z'),
                effectiveAt: new Date('2026-06-30T17:00:00.000Z'),
                recordedAs: 'artist',
                contactMethod: 'portal',
                note: 'ศิลปินกดยืนยันขายต่อผ่านระบบ Artist Portal',
                history: [
                    {
                        decision: 'continue_sale',
                        mode: 'standard_sale',
                        recordedAt: new Date('2026-06-15T10:30:00.000Z'),
                        recordedAs: 'artist',
                        contactMethod: 'portal',
                        note: 'ศิลปินกดยืนยันขายต่อผ่านระบบ Artist Portal'
                    }
                ]
            }
        },

        // 4. แสดงเฉย ๆ (Display Only - Expired term)
        {
            title: [
                { key: 'th', value: 'รอยพระพุทธบาทสี่รอยจำลอง' },
                { key: 'en', value: 'Replica of Four Holy Footprints' }
            ],
            description: [
                { key: 'th', value: 'งานแกะสลักหินทรายเชียงแสนจำลองลายมงคล 108 ประการ' },
                { key: 'en', value: 'Chiang Saen sandstone carving with 108 auspicious Buddhist symbols.' }
            ],
            artworkCode: 'ART-2024-012',
            artworkPiece: '01/01',
            price: 85000,
            technique: [{ key: 'th', value: 'แกะสลักหินทราย' }, { key: 'en', value: 'Sandstone Carving' }],
            size: [{ key: 'th', value: '60 x 120 x 15 ซม.' }, { key: 'en', value: '60 x 120 x 15 cm' }],
            academicYear: '2567',
            courseLevel: '03',
            artist: artistUsers[3]?._id || defaultArtist._id,
            category: categories[1]?._id || defaultCat?._id,
            status: {
                approval: approvedStatus?._id,
                sale: exhibitionStatus?._id
            },
            image: 'https://images.unsplash.com/photo-1582561424760-0321d75e81fa?w=600&auto=format&fit=crop&q=80',
            postTermSale: {
                applicable: true,
                needsReview: false,
                initialSaleEndsAt: new Date('2026-07-15T17:00:00.000Z'), // Expired
                mode: 'display_only',
                decision: 'display_only',
                decisionAt: new Date('2026-07-02T14:20:00.000Z'),
                effectiveAt: new Date('2026-07-15T17:00:00.000Z'),
                recordedAs: 'admin',
                contactMethod: 'phone',
                note: 'ศิลปินประสงค์เก็บเป็นผลงานสะสมเพื่อจัดแสดงในนิทรรศการถาวร',
                history: [
                    {
                        decision: 'display_only',
                        mode: 'display_only',
                        recordedAt: new Date('2026-07-02T14:20:00.000Z'),
                        recordedAs: 'admin',
                        contactMethod: 'phone',
                        note: 'ศิลปินประสงค์เก็บเป็นผลงานสะสมเพื่อจัดแสดงในนิทรรศการถาวร'
                    }
                ]
            }
        },

        // 5. ขายแล้ว (Sold Out)
        {
            title: [
                { key: 'th', value: 'ท้าวจตุโลกบาลรักษาทิศ' },
                { key: 'en', value: 'Four Heavenly Kings of Guardians' }
            ],
            description: [
                { key: 'th', value: 'จิตรกรรมลายเส้นหมึกจีนผสมสีเอกรงค์ ถ่ายทอดความเกรงขามและความคุ้มครอง' },
                { key: 'en', value: 'Monochrome ink and mineral pigments illustrating divine protection.' }
            ],
            artworkCode: 'ART-2024-003',
            artworkPiece: '01/01',
            price: 95000,
            technique: [{ key: 'th', value: 'หมึกจีนและสีเอกรงค์' }, { key: 'en', value: 'Chinese Ink & Mineral Pigments' }],
            size: [{ key: 'th', value: '90 x 120 ซม.' }, { key: 'en', value: '90 x 120 cm' }],
            academicYear: '2567',
            courseLevel: '04',
            artist: artistUsers[0]?._id || defaultArtist._id,
            category: categories[0]?._id || defaultCat?._id,
            status: {
                approval: approvedStatus?._id,
                sale: soldOutStatus?._id
            },
            image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=600&auto=format&fit=crop&q=80',
            postTermSale: {
                applicable: true,
                needsReview: false,
                initialSaleEndsAt: new Date('2026-05-10T17:00:00.000Z'), // Expired & Sold
                mode: 'standard_sale',
                decision: 'continue_sale',
                decisionAt: new Date('2026-04-20T11:00:00.000Z'),
                effectiveAt: new Date('2026-05-10T17:00:00.000Z'),
                recordedAs: 'artist',
                contactMethod: 'portal',
                note: 'ผลงานได้รับการสั่งซื้อและชำระเงินเรียบร้อยแล้ว',
                history: [
                    {
                        decision: 'continue_sale',
                        mode: 'standard_sale',
                        recordedAt: new Date('2026-04-20T11:00:00.000Z'),
                        recordedAs: 'artist',
                        contactMethod: 'portal',
                        note: 'บันทึกขายต่อ และต่อมามีคำสั่งซื้อสำเร็จ'
                    }
                ]
            }
        },

        // 6. รอคำตอบทั่วไป (Pending - Term ends in 45 days)
        {
            title: [
                { key: 'th', value: 'บัวสวรรค์เหนือน้ำน่าน' },
                { key: 'en', value: 'Heavenly Lotus over Nan Waters' }
            ],
            description: [
                { key: 'th', value: 'ภาพจิตรกรรมสีน้ำมันสไตล์ล้านนาร่วมสมัย' },
                { key: 'en', value: 'Contemporary Lanna oil painting on linen.' }
            ],
            artworkCode: 'ART-2025-015',
            artworkPiece: '01/01',
            price: 52000,
            technique: [{ key: 'th', value: 'สีน้ำมันบนผ้าลินิน' }, { key: 'en', value: 'Oil on Linen' }],
            size: [{ key: 'th', value: '70 x 90 ซม.' }, { key: 'en', value: '70 x 90 cm' }],
            academicYear: '2568',
            courseLevel: '02',
            artist: artistUsers[4]?._id || defaultArtist._id,
            category: categories[0]?._id || defaultCat?._id,
            status: {
                approval: approvedStatus?._id,
                sale: availableStatus?._id
            },
            image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
            postTermSale: {
                applicable: true,
                needsReview: false,
                initialSaleEndsAt: new Date('2026-10-05T17:00:00.000Z'), // ~47 days left
                mode: 'initial_term',
                decision: 'pending',
                effectiveAt: new Date('2026-10-05T17:00:00.000Z'),
                note: 'อยู่ในช่วงขายปกติ 1 ปีแรก',
                history: []
            }
        },

        // 7. ขายต่อปกติ (Standard Sale / Admin Recorded via In-Person)
        {
            title: [
                { key: 'th', value: 'พระธาตุเจดีย์ศรีลานนาทอง' },
                { key: 'en', value: 'Golden Lanna Pagoda of Grace' }
            ],
            description: [
                { key: 'th', value: 'ภาพพิมพ์โลหะผสมการปิดทองคำเปลวและสีอะคริลิก' },
                { key: 'en', value: 'Etching with gold leaf gilding and acrylic accents.' }
            ],
            artworkCode: 'ART-2024-019',
            artworkPiece: '02/10',
            price: 38000,
            technique: [{ key: 'th', value: 'ภาพพิมพ์โลหะและปิดทอง' }, { key: 'en', value: 'Metal Etching & Gold Leaf' }],
            size: [{ key: 'th', value: '50 x 70 ซม.' }, { key: 'en', value: '50 x 70 cm' }],
            academicYear: '2567',
            courseLevel: '03',
            artist: artistUsers[1]?._id || defaultArtist._id,
            category: categories[2]?._id || defaultCat?._id,
            status: {
                approval: approvedStatus?._id,
                sale: availableStatus?._id
            },
            image: 'https://images.unsplash.com/photo-1578925518470-4def7a0f08bb?w=600&auto=format&fit=crop&q=80',
            postTermSale: {
                applicable: true,
                needsReview: false,
                initialSaleEndsAt: new Date('2026-07-20T17:00:00.000Z'), // Expired
                mode: 'standard_sale',
                decision: 'continue_sale',
                decisionAt: new Date('2026-07-18T15:00:00.000Z'),
                effectiveAt: new Date('2026-07-20T17:00:00.000Z'),
                recordedAs: 'admin',
                contactMethod: 'in_person',
                note: 'ศิลปินเข้ามาติดต่อด้วยตนเองที่ศูนย์บริการพุทธศิลปกรรม มฟล.',
                history: [
                    {
                        decision: 'continue_sale',
                        mode: 'standard_sale',
                        recordedAt: new Date('2026-07-18T15:00:00.000Z'),
                        recordedAs: 'admin',
                        contactMethod: 'in_person',
                        note: 'ศิลปินเข้ามาติดต่อด้วยตนเองที่ศูนย์บริการพุทธศิลปกรรม มฟล.'
                    }
                ]
            }
        },

        // 8. แสดงเฉย ๆ (Display Only - Recorded via Email)
        {
            title: [
                { key: 'th', value: 'เงาสะท้อนสัจธรรมในสายธาร' },
                { key: 'en', value: 'Reflections of Truth in the Stream' }
            ],
            description: [
                { key: 'th', value: 'สื่อผสมบนผ้าใบ ถ่ายทอดความไม่เที่ยงของสรรพสิ่ง' },
                { key: 'en', value: 'Mixed media on canvas portraying the impermanence of existence.' }
            ],
            artworkCode: 'ART-2024-025',
            artworkPiece: '01/01',
            price: 72000,
            technique: [{ key: 'th', value: 'สื่อผสมบนผืนผ้าใบ' }, { key: 'en', value: 'Mixed Media on Canvas' }],
            size: [{ key: 'th', value: '100 x 100 ซม.' }, { key: 'en', value: '100 x 100 cm' }],
            academicYear: '2567',
            courseLevel: '04',
            artist: artistUsers[2]?._id || defaultArtist._id,
            category: categories[0]?._id || defaultCat?._id,
            status: {
                approval: approvedStatus?._id,
                sale: exhibitionStatus?._id
            },
            image: 'https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?w=600&auto=format&fit=crop&q=80',
            postTermSale: {
                applicable: true,
                needsReview: false,
                initialSaleEndsAt: new Date('2026-08-01T17:00:00.000Z'), // Expired
                mode: 'display_only',
                decision: 'display_only',
                decisionAt: new Date('2026-07-28T09:15:00.000Z'),
                effectiveAt: new Date('2026-08-01T17:00:00.000Z'),
                recordedAs: 'admin',
                contactMethod: 'email',
                note: 'ศิลปินตอบกลับอีเมลแจ้งเปลี่ยนเป็นจัดแสดงเพื่อเป็นผลงานตัวอย่างของหลักสูตร',
                history: [
                    {
                        decision: 'display_only',
                        mode: 'display_only',
                        recordedAt: new Date('2026-07-28T09:15:00.000Z'),
                        recordedAs: 'admin',
                        contactMethod: 'email',
                        note: 'ศิลปินตอบกลับอีเมลแจ้งเปลี่ยนเป็นจัดแสดงเพื่อเป็นผลงานตัวอย่างของหลักสูตร'
                    }
                ]
            }
        }
    ];

    console.log(`Inserting/Updating ${mockArtworks.length} mock artworks for post-term sale...`);

    let createdCount = 0;
    let updatedCount = 0;

    for (const artData of mockArtworks) {
        const existing = await Artwork.findOne({ artworkCode: artData.artworkCode });
        if (existing) {
            Object.assign(existing, artData);
            await existing.save();
            updatedCount++;
        } else {
            await Artwork.create(artData);
            createdCount++;
        }
    }

    console.log(`Seeding complete: ${createdCount} created, ${updatedCount} updated.`);
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
}

seedPostTermSale().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
