require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');

const User     = require('../src/models/User');
const Stop     = require('../src/models/Stop');
const Route    = require('../src/models/Route');
const Shuttle  = require('../src/models/Shuttle');
const Trip     = require('../src/models/Trip');
const Notification = require('../src/models/Notification');
const Complaint    = require('../src/models/Complaint');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_transport';

// ─────────────────────────────────────────────────────────────
//  Lovely Professional University (LPU) - Campus Transport Master Data
//  Location: NH-44, Phagwara, Punjab (600+ Acres)
//  Campus Centre: ~31.2536°N, 75.7037°E
//
//  HOSTEL BLOCKS:
//    • Boys Hostels: BH-1 to BH-12 (12 blocks + South Towers)
//    • Girls Hostels: GH-1 to GH-9 (9 blocks + North Apartments)
//
//  ACADEMIC BLOCKS:
//    • Block 1 (Origin - Central Administration & Registrar)
//    • Block 2 & 3 (Uni-Hospital, OPD & Health Sciences)
//    • Block 13 & 14 (School of Design, Architecture, Fashion, Fine Arts)
//    • Block 18 (School of Agriculture & Education)
//    • Block 25 to 29 (School of CSE & IT Hub)
//    • Block 32 (Uni-Mall, Shopping Centre & Multi-Cuisine Food Court)
//    • Block 33 & 34 (Academic Quad - Sciences & Technology)
//    • Block 36, 37, 38 (Central Library, ECE, Robotics & Automation)
//    • Block 40, 41, 42 (Mittal School of Business - MBA, Commerce, Management)
//    • Block 55, 56, 57 (School of Pharmaceutical Sciences & BioTech)
//    • Block 60 (School of Law & Legal Studies)
//
//  OFFICIAL FLEET SCHEDULES & CATEGORIES:
//    1. Campus Electric Buggy Train (LPU Mini-Train): 08:30 AM - 06:00 PM (Class hours only)
//    2. Campus Express (Large AC Buses - 50 seats): 07:00 AM - 08:00 PM
//    3. Campus Feeder (Mini Buses - 35 seats): 07:30 AM - 08:30 PM
//    4. Hostel Hop (E-Rickshaws - 6 seats): 06:30 AM - 10:00 PM
//    5. Night Safety Shuttles (50 seats): 08:00 PM - 11:00 PM
//    6. Uni-Hospital Emergency Care (Ambulance): 24/7 Continuous
// ─────────────────────────────────────────────────────────────

async function seedDatabase() {
  try {
    console.log('[Seed] Connecting to MongoDB at', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Connected.');

    await User.deleteMany({});
    await Stop.deleteMany({});
    await Route.deleteMany({});
    await Shuttle.deleteMany({});
    await Trip.deleteMany({});
    await Notification.deleteMany({});
    await Complaint.deleteMany({});
    console.log('[Seed] Cleared collections.');

    // ─── 1. USERS ────────────────────────────────────────────
    await User.create({
      name: 'LPU Transport Control Center',
      email: 'admin@demo.com',
      password: 'password123',
      role: 'admin',
      phone: '+91 98765-01001',
      studentId: 'LPU-ADM-01',
    });

    const driverRows = [
      { name: 'Jagjit Singh',     email: 'driver@demo.com',             phone: '+91 98765-02001', id: 'LPU-DRV-101' },
      { name: 'Harpreet Singh',   email: 'driver.harpreet@demo.com',    phone: '+91 98765-02002', id: 'LPU-DRV-102' },
      { name: 'Gurpreet Singh',   email: 'driver.gurpreet@demo.com',    phone: '+91 98765-02003', id: 'LPU-DRV-103' },
      { name: 'Balwinder Kaur',   email: 'driver.balwinder@demo.com',   phone: '+91 98765-02004', id: 'LPU-DRV-104' },
      { name: 'Sukhchain Singh',  email: 'driver.sukhchain@demo.com',   phone: '+91 98765-02005', id: 'LPU-DRV-105' },
      { name: 'Amarjit Rana',     email: 'driver.amarjit@demo.com',     phone: '+91 98765-02006', id: 'LPU-DRV-106' },
      { name: 'Dalbir Sidhu',     email: 'driver.dalbir@demo.com',      phone: '+91 98765-02007', id: 'LPU-DRV-107' },
      { name: 'Manjit Dhaliwal',  email: 'driver.manjit@demo.com',      phone: '+91 98765-02008', id: 'LPU-DRV-108' },
      { name: 'Kulwant Bhullar',  email: 'driver.kulwant@demo.com',     phone: '+91 98765-02009', id: 'LPU-DRV-109' },
      { name: 'Paramjit Grewal',  email: 'driver.paramjit@demo.com',    phone: '+91 98765-02010', id: 'LPU-DRV-110' },
      { name: 'Satnam Gill',      email: 'driver.satnam@demo.com',      phone: '+91 98765-02011', id: 'LPU-DRV-111' },
      { name: 'Lakhwinder Brar',  email: 'driver.lakhwinder@demo.com',  phone: '+91 98765-02012', id: 'LPU-DRV-112' },
      { name: 'Ravinder Kumar',   email: 'driver.ravinder@demo.com',    phone: '+91 98765-02013', id: 'LPU-DRV-113' },
      { name: 'Sukhjinder Maan',  email: 'driver.sukhjinder@demo.com',  phone: '+91 98765-02014', id: 'LPU-DRV-114' },
      { name: 'Gurjinder Toor',   email: 'driver.gurjinder@demo.com',   phone: '+91 98765-02015', id: 'LPU-DRV-115' },
      { name: 'Parminder Bains',  email: 'driver.parminder@demo.com',   phone: '+91 98765-02016', id: 'LPU-DRV-116' },
      { name: 'Tejinder Sekhon',  email: 'driver.tejinder@demo.com',    phone: '+91 98765-02017', id: 'LPU-DRV-117' },
      { name: 'Navdeep Dhillon',  email: 'driver.navdeep@demo.com',     phone: '+91 98765-02018', id: 'LPU-DRV-118' },
      { name: 'Amritpal Sandhu',  email: 'driver.amritpal@demo.com',    phone: '+91 98765-02019', id: 'LPU-DRV-119' },
      { name: 'Jaswant Cheema',   email: 'driver.jaswant@demo.com',     phone: '+91 98765-02020', id: 'LPU-DRV-120' },
    ];
    const drivers = [];
    for (const d of driverRows) {
      drivers.push(await User.create({ ...d, password: 'password123', role: 'driver' }));
    }

    const studentRows = [
      { name: 'Aman Sharma',     email: 'student@demo.com',         id: '12108542', phone: '+91 98765-10001' },
      { name: 'Simran Kaur',     email: 'simran.kaur@demo.com',     id: '12109431', phone: '+91 98765-10002' },
      { name: 'Rohan Verma',     email: 'rohan.verma@demo.com',     id: '12204519', phone: '+91 98765-10003' },
      { name: 'Priya Patel',     email: 'priya.patel@demo.com',     id: '12205678', phone: '+91 98765-10004' },
      { name: 'Aryan Mehta',     email: 'aryan.mehta@demo.com',     id: '12111245', phone: '+91 98765-10005' },
      { name: 'Ananya Roy',      email: 'ananya.roy@demo.com',      id: '12113490', phone: '+91 98765-10006' },
      { name: 'Manpreet Sandhu', email: 'manpreet.sandhu@demo.com', id: '12218765', phone: '+91 98765-10007' },
      { name: 'Rahul Joshi',     email: 'rahul.joshi@demo.com',     id: '12102984', phone: '+91 98765-10008' },
      { name: 'Divya Nair',      email: 'divya.nair@demo.com',      id: '12207831', phone: '+91 98765-10009' },
      { name: 'Gurkirat Singh',  email: 'gurkirat.singh@demo.com',  id: '12106721', phone: '+91 98765-10010' },
    ];
    const students = [];
    for (const s of studentRows) {
      students.push(await User.create({
        name: s.name,
        email: s.email,
        password: 'password123',
        role: 'student',
        studentId: s.id,
        phone: s.phone,
      }));
    }
    console.log(`[Seed] Created 1 admin, ${drivers.length} drivers, ${students.length} students.`);

    // ─── 2. STOPS & LANDMARKS (Accurate LPU Phagwara Campus) ───
    const stopsData = [
      // ── GATES ──────────────────────────────────────────────
      { name: 'Gate 1 – Main Entrance (GT Road / NH-44)', code: 'STP-G1', category: 'GATE',
        lat: 31.2558, lng: 75.7033,
        fac: ['Shelter', 'Turnstiles', 'Security Post', 'Auto Stand', 'Lighting', 'CCTV'],
        desc: 'Primary main gate on NH-44 highway; turnstile student entry & bus drop' },

      { name: 'Gate 2 – Hospital & Visitor Entry (North-East)', code: 'STP-G2', category: 'GATE',
        lat: 75.7045 ? 31.2575 : 31.2575, lng: 75.7045,
        fac: ['Shelter', 'Visitor Desk', 'Lighting', 'Wheelchair Ramp', 'Ambulance Bay'],
        desc: 'North-east gate; direct vehicular access to Uni-Hospital & GH complex' },

      { name: 'Gate 3 – Staff & Faculty Entry (West)', code: 'STP-G3', category: 'GATE',
        lat: 31.2542, lng: 75.7008,
        fac: ['Barrier Gate', 'Security Post', 'Staff Parking', 'Fleet Access'],
        desc: 'Western gate near vehicle maintenance depot and faculty residences' },

      { name: 'Gate 4 – Transport Terminal & Bus Bay', code: 'STP-G4', category: 'GATE',
        lat: 31.2540, lng: 75.7015,
        fac: ['Large Canopy', 'Bus Bay', 'Ticket Counter', 'Restroom', 'Waiting Lounge', 'Charging'],
        desc: 'Main internal transit depot and inter-city bus terminal (Jalandhar/Ludhiana)' },

      { name: 'Gate 5 – Sports & Agriculture Entry (South)', code: 'STP-G5', category: 'GATE',
        lat: 31.2462, lng: 75.7050,
        fac: ['Shelter', 'Security Post', 'Greenery'],
        desc: 'Southern entrance near athletic stadium, cricket ground and research farms' },

      // ── ACADEMIC BLOCKS ────────────────────────────────────
      { name: 'Block 1 – Origin Block (Admin & Registrar)', code: 'STP-BLK1', category: 'ACADEMIC',
        lat: 31.2548, lng: 75.7038,
        fac: ['Shelter', 'Bench', 'Admin Office', 'Registrar', 'Examination Cell'],
        desc: 'Oldest block (est. 2001); houses central university leadership & registrar' },

      { name: 'Uni-Mall & Food Court (Block 32 Zone)', code: 'STP-MALL', category: 'AMENITY',
        lat: 31.2538, lng: 75.7035,
        fac: ['Shelter', 'Food Court', 'ATM', 'Shopping Arcade', 'WiFi', 'Post Office', 'Banks'],
        desc: 'Central four-storey commercial hub with cafes, stationery, salons and ATMs' },

      { name: 'Baldev Raj Mittal Unipolis (Open Amphitheatre)', code: 'STP-UNIP', category: 'AMENITY',
        lat: 31.2530, lng: 75.7042,
        fac: ['Shelter', 'Open Stage', 'Mega Seating', 'Lighting', 'Water Station', 'Buggy Stop'],
        desc: 'Iconic 10,000-seat amphitheatre; key buggy train & shuttle junction' },

      { name: 'Central Library – Block 36 & 37', code: 'STP-LIB', category: 'ACADEMIC',
        lat: 31.2533, lng: 75.7028,
        fac: ['Shelter', '24/7 Access', 'High-Speed WiFi', 'Quiet Reading Halls', 'Digital Labs'],
        desc: 'Nine-storey central university library with digital research resource centers' },

      { name: 'CSE & IT Wing – Block 25 to 29 Complex', code: 'STP-CSE', category: 'ACADEMIC',
        lat: 31.2520, lng: 75.7022,
        fac: ['Shelter', 'Bench', 'Coding Labs', 'EV Charging', 'Water Station', 'Bike Bay'],
        desc: 'School of Computer Science & Engineering complex (Blocks 25, 26, 27, 28, 29)' },

      { name: 'ECE & Robotics Lab – Block 38', code: 'STP-B38', category: 'ACADEMIC',
        lat: 31.2545, lng: 75.7040,
        fac: ['Shelter', 'Robotics Lab Entry', 'EV Charging', 'Lighting'],
        desc: 'School of Electronics, Electrical & Automation engineering (Block 38)' },

      { name: 'Design, Fashion & Fine Arts – Block 13 & 14', code: 'STP-B13', category: 'ACADEMIC',
        lat: 31.2550, lng: 75.7018,
        fac: ['Shelter', 'Art Studio Entry', 'Bench', 'Display Gallery'],
        desc: 'School of Design, Architecture, Fashion, Photography & Film (Blocks 13 & 14)' },

      { name: 'Pharmacy & BioTech – Block 55, 56 & 57', code: 'STP-B55', category: 'ACADEMIC',
        lat: 31.2510, lng: 75.7050,
        fac: ['Shelter', 'Pharmacy Lab Bay', 'Bench', 'Clean Room Access'],
        desc: 'School of Pharmaceutical Sciences, Biotechnology & Chemical Sciences' },

      { name: 'Shanti Devi Mittal (SDM) Auditorium', code: 'STP-SDM', category: 'AMENITY',
        lat: 31.2525, lng: 75.7055,
        fac: ['Shelter', 'Auditorium Bay', 'AC Waiting Area', 'Lighting'],
        desc: 'Air-conditioned auditorium for international conferences, convocations & plays' },

      { name: 'Mittal School of Business – Block 40, 41 & 42', code: 'STP-B40', category: 'ACADEMIC',
        lat: 31.2543, lng: 75.7026,
        fac: ['Shelter', 'Seminar Halls', 'WiFi', 'Finance Lab Entry'],
        desc: 'MBA, Business Analytics, Commerce, Economics & Hotel Management' },

      { name: 'School of Law – Block 60', code: 'STP-B60', category: 'ACADEMIC',
        lat: 31.2527, lng: 75.7016,
        fac: ['Shelter', 'Moot Court Entry', 'Bench', 'Lighting'],
        desc: 'Faculty of Law & Legal Studies; moot court complex (Block 60)' },

      { name: 'School of Agriculture & Education – Block 18', code: 'STP-AGRI-BLK', category: 'ACADEMIC',
        lat: 31.2535, lng: 75.7062,
        fac: ['Shelter', 'Greenhouse Entry', 'Soil Lab Bay', 'Bench'],
        desc: 'School of Agriculture, Agronomy & Department of Education (Block 18)' },

      // ── MEDICAL ────────────────────────────────────────────
      { name: 'Uni-Hospital & Medical Centre (Block 2 & 3)', code: 'STP-HOSP', category: 'MEDICAL',
        lat: 31.2565, lng: 75.7058,
        fac: ['24/7 Emergency', 'OPD', 'ICU', 'Ambulance Bay', 'Wheelchair Ramps', '24/7 Pharmacy'],
        desc: '24/7 Multi-specialty hospital; round-the-clock emergency medical response' },

      // ── BOYS HOSTELS — BH-1 to BH-12 (VERIFIED COMPLETE FLEET) ──
      { name: 'Boys Hostel BH-1 & BH-2', code: 'STP-BH1', category: 'HOSTEL_BOYS',
        lat: 31.2518, lng: 75.7068,
        fac: ['Shelter', 'Mess Hall', 'Night Lighting', 'Warden Office', 'ATM', 'Laundry'],
        desc: 'BH-1 & BH-2: Undergraduate boys residential complex, east campus sector' },

      { name: 'Boys Hostel BH-3 & BH-4', code: 'STP-BH3', category: 'HOSTEL_BOYS',
        lat: 31.2503, lng: 75.7063,
        fac: ['Shelter', 'Gymnasium', 'Mess Hall', 'Common Room', 'Laundry Hub'],
        desc: 'BH-3 & BH-4: Central boys residential cluster with gym, badminton court & canteen' },

      { name: 'Boys Hostel BH-5 & BH-6', code: 'STP-BH5', category: 'HOSTEL_BOYS',
        lat: 31.2490, lng: 75.7072,
        fac: ['Shelter', 'Sports Court', '24/7 Canteen', 'Study Rooms', 'Security Bay'],
        desc: 'BH-5 & BH-6: Senior undergraduate residential towers adjacent to sports ground' },

      { name: 'Boys Hostel BH-7 & BH-8', code: 'STP-BH7', category: 'HOSTEL_BOYS',
        lat: 31.2478, lng: 75.7080,
        fac: ['Shelter', 'Mess Hall', 'Night Lighting', 'Security Bay', 'WiFi Lounge'],
        desc: 'BH-7 & BH-8: South-east residential wing on transit perimeter route' },

      { name: 'Boys Hostel BH-9 (South Wing)', code: 'STP-BH9', category: 'HOSTEL_BOYS',
        lat: 31.2466, lng: 75.7086,
        fac: ['Shelter', 'AC Mess', 'Gym', 'WiFi', 'Snack Bar', 'Biometric Turnstile'],
        desc: 'BH-9: Multi-storey boys hostel tower with dedicated mess and gymnasium' },

      { name: 'Boys Hostel BH-10 (New South Tower)', code: 'STP-BH10', category: 'HOSTEL_BOYS',
        lat: 31.2458, lng: 75.7090,
        fac: ['Shelter', 'Modern Mess', 'AC Lounge', 'Gym', 'Laundry', 'EV Shuttle Bay'],
        desc: 'BH-10: Modern multi-storey residential tower in south campus sector' },

      { name: 'Boys Hostel BH-11 (New High-Rise)', code: 'STP-BH11', category: 'HOSTEL_BOYS',
        lat: 31.2450, lng: 75.7095,
        fac: ['Shelter', 'Food Court', 'High-Speed WiFi', '24/7 Study Hall', 'Security Bay'],
        desc: 'BH-11: Newly constructed high-rise boys hostel with dedicated transit drop' },

      { name: 'Boys Hostel BH-12 (South Residential Hub)', code: 'STP-BH12', category: 'HOSTEL_BOYS',
        lat: 31.2442, lng: 75.7100,
        fac: ['Shelter', 'Mess Hall', 'Sports Arena Access', 'Security Post', 'Turnstile'],
        desc: 'BH-12: South residential hub boys hostel tower near sports agriculture perimeter' },

      // ── GIRLS HOSTELS — GH-1 to GH-9 (VERIFIED COMPLETE FLEET) ─
      { name: 'Girls Hostel GH-1 & GH-2', code: 'STP-GH1', category: 'HOSTEL_GIRLS',
        lat: 31.2568, lng: 75.7040,
        fac: ['Shelter', 'Dedicated 24/7 Security', 'Tuck Shop', 'CCTV Surveillance', 'ATM'],
        desc: 'GH-1 & GH-2: North campus girls residential complex with round-the-clock security' },

      { name: 'Girls Hostel GH-3 & GH-4', code: 'STP-GH3', category: 'HOSTEL_GIRLS',
        lat: 31.2578, lng: 75.7047,
        fac: ['Shelter', 'Biometric Access', 'Common Room', 'Reading Lounge', 'Gym'],
        desc: 'GH-3 & GH-4: Senior and postgraduate girls residential wings' },

      { name: 'Girls Hostel GH-5 & GH-6', code: 'STP-GH5', category: 'HOSTEL_GIRLS',
        lat: 31.2585, lng: 75.7054,
        fac: ['Shelter', 'Study Hall', 'Night Lighting', 'Mess Hall', 'Canteen'],
        desc: 'GH-5 & GH-6: Postgraduate and international girls residential towers' },

      { name: 'Girls Hostel GH-7 (North Tower)', code: 'STP-GH7', category: 'HOSTEL_GIRLS',
        lat: 31.2592, lng: 75.7060,
        fac: ['Shelter', 'AC Common Lounge', 'Modern Mess', 'WiFi', 'Biometric Turnstile'],
        desc: 'GH-7: Modern multi-storey girls residential block in north campus' },

      { name: 'Girls Hostel GH-8 & GH-9 / Luxury Apartments', code: 'STP-GH8', category: 'HOSTEL_GIRLS',
        lat: 31.2598, lng: 75.7066,
        fac: ['Shelter', '24/7 Security', 'AC Lounges', 'Gym', 'Convenience Store', 'EV Stop'],
        desc: 'GH-8 & GH-9: North-east luxury residential apartments and international girls complex' },

      // ── SPORTS, FARMS & LOGISTICS ─────────────────────────
      { name: 'Olympic Sports Complex & Indoor Stadium', code: 'STP-SPT', category: 'AMENITY',
        lat: 31.2483, lng: 75.7038,
        fac: ['Shelter', 'Olympic Track', 'Indoor Stadium', 'Swimming Pool', 'Cricket Pavilion'],
        desc: 'World-class sports stadium, synthetic athletic track & indoor sports arenas' },

      { name: 'Agriculture Research Farm & Greenhouses', code: 'STP-AGRI', category: 'AMENITY',
        lat: 31.2460, lng: 75.7068,
        fac: ['Shelter', 'Field Pavilion', 'Greenhouse Complex', 'Agronomy Station'],
        desc: 'Experimental farming fields, research greenhouses and agricultural plots' },

      { name: 'Fuel Station & Fleet Maintenance Depot', code: 'STP-DEPOT', category: 'SERVICE',
        lat: 31.2542, lng: 75.7006,
        fac: ['Fuel Pumps', 'EV Charging Station', 'Maintenance Bays', 'Fleet Parking'],
        desc: 'Internal fuel dispensing station and campus vehicle maintenance depot' },

      { name: 'Lovely International School (LIS Campus)', code: 'STP-LIS', category: 'ACADEMIC',
        lat: 31.2570, lng: 75.7025,
        fac: ['Shelter', 'Parent Waiting Zone', 'Barrier Gate', 'Security Post'],
        desc: 'Affiliated K-12 school on northern perimeter of LPU campus' },
    ];

    const stops = [];
    for (const s of stopsData) {
      stops.push(await Stop.create({
        name: s.name,
        code: s.code,
        latitude: s.lat,
        longitude: s.lng,
        facilities: s.fac,
        description: s.desc,
        active: true,
      }));
    }
    const byCode = (c) => stops.find((s) => s.code === c);
    console.log(`[Seed] Created ${stops.length} LPU stops.`);

    // ─── 3. ROUTES ───────────────────────────────────────────
    const routeDefs = [
      {
        num: 'LPU-01',
        name: 'Campus Express Loop – Main Arterial',
        desc: 'Full arterial loop: Gate 1 → Block 1 → Uni-Mall → Library → CSE → Unipolis → Pharmacy → ECE → BH-1 → BH-3 → Gate 4',
        codes: ['STP-G1', 'STP-BLK1', 'STP-MALL', 'STP-LIB', 'STP-CSE', 'STP-UNIP', 'STP-B55', 'STP-B38', 'STP-BH1', 'STP-BH3', 'STP-G4'],
        dur: 22,
        color: '#4f46e5',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      },
      {
        num: 'LPU-02',
        name: 'Academic Quad Rapid Shuttle',
        desc: 'Academic connector: Gate 1 → Design (B13) → CSE (B25-29) → Library → Business (B40) → Law (B60) → Unipolis → Pharmacy',
        codes: ['STP-G1', 'STP-B13', 'STP-CSE', 'STP-LIB', 'STP-B40', 'STP-B60', 'STP-UNIP', 'STP-B55'],
        dur: 18,
        color: '#059669',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      },
      {
        num: 'LPU-03',
        name: 'Boys Hostels BH-1 to BH-12 Mega Loop',
        desc: 'All Boys Hostels: Gate 4 → BH-1 → BH-3 → BH-5 → BH-7 → BH-9 → BH-10 → BH-11 → BH-12 → Sports → SDM → Unipolis → Library',
        codes: ['STP-G4', 'STP-BH1', 'STP-BH3', 'STP-BH5', 'STP-BH7', 'STP-BH9', 'STP-BH10', 'STP-BH11', 'STP-BH12', 'STP-SPT', 'STP-SDM', 'STP-UNIP', 'STP-LIB'],
        dur: 26,
        color: '#d97706',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      },
      {
        num: 'LPU-04',
        name: 'Girls Hostels GH-1 to GH-9 Direct Connector',
        desc: 'All Girls Hostels: GH-8/9 → GH-7 → GH-5 → GH-3 → GH-1 → Hospital → Unipolis → Uni-Mall → Library → CSE',
        codes: ['STP-GH8', 'STP-GH7', 'STP-GH5', 'STP-GH3', 'STP-GH1', 'STP-HOSP', 'STP-UNIP', 'STP-MALL', 'STP-LIB', 'STP-CSE'],
        dur: 20,
        color: '#7c3aed',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      },
      {
        num: 'LPU-05',
        name: 'Night Owl Safety Perimeter Shuttle (8 PM - 11 PM)',
        desc: 'Late-night safe transit: Gate 1 → Uni-Mall → Library → Hospital → GH-1 → GH-5 → BH-1 → BH-5 → BH-9 → BH-12 → Sports → Gate 4',
        codes: ['STP-G1', 'STP-MALL', 'STP-LIB', 'STP-HOSP', 'STP-GH1', 'STP-GH5', 'STP-BH1', 'STP-BH5', 'STP-BH9', 'STP-BH12', 'STP-SPT', 'STP-G4'],
        dur: 30,
        color: '#dc2626',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      },
      {
        num: 'LPU-06',
        name: 'New South Hostels BH-9/10/11/12 Rapid Express',
        desc: 'South residential express: Gate 4 → BH-5 → BH-7 → BH-9 → BH-10 → BH-11 → BH-12 → Sports → Agriculture → Gate 5',
        codes: ['STP-G4', 'STP-BH5', 'STP-BH7', 'STP-BH9', 'STP-BH10', 'STP-BH11', 'STP-BH12', 'STP-SPT', 'STP-AGRI', 'STP-G5'],
        dur: 22,
        color: '#0891b2',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      },
      {
        num: 'LPU-07',
        name: 'South Campus & Sports Arena Connector',
        desc: 'Sports zone shuttle: Unipolis → SDM → Pharmacy → Sports Complex → Agriculture → BH-12 → BH-10 → BH-7',
        codes: ['STP-UNIP', 'STP-SDM', 'STP-B55', 'STP-SPT', 'STP-AGRI', 'STP-BH12', 'STP-BH10', 'STP-BH7'],
        dur: 20,
        color: '#16a34a',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      },
      {
        num: 'LPU-08',
        name: 'Gate 2 Hospital & GH North Feeder',
        desc: 'Hospital & North Girls Hostels: Gate 2 → LIS → Hospital → GH-1 → GH-3 → GH-5 → GH-7 → GH-8/9',
        codes: ['STP-G2', 'STP-LIS', 'STP-HOSP', 'STP-GH1', 'STP-GH3', 'STP-GH5', 'STP-GH7', 'STP-GH8'],
        dur: 15,
        color: '#be185d',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      },
      {
        num: 'LPU-09',
        name: 'Staff, Faculty & Admin Express',
        desc: 'Faculty & staff transit: Gate 3 → Depot → Gate 4 → Business (B40) → Law (B60) → CSE → Library → SDM → Design',
        codes: ['STP-G3', 'STP-DEPOT', 'STP-G4', 'STP-B40', 'STP-B60', 'STP-CSE', 'STP-LIB', 'STP-SDM', 'STP-B13'],
        dur: 16,
        color: '#92400e',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      },
      {
        num: 'LPU-10',
        name: 'Full Perimeter Cross-Campus Connector',
        desc: 'Complete 600-acre perimeter: Gate 1 → Gate 4 → BH-1 → BH-5 → BH-9 → BH-12 → Sports → Gate 5 → GH-8 → GH-5 → Hospital → Gate 2',
        codes: ['STP-G1', 'STP-G4', 'STP-BH1', 'STP-BH5', 'STP-BH9', 'STP-BH12', 'STP-SPT', 'STP-AGRI', 'STP-G5', 'STP-GH8', 'STP-GH5', 'STP-HOSP', 'STP-G2'],
        dur: 36,
        color: '#6d28d9',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      },
      {
        num: 'LPU-11',
        name: 'Electric Buggy Train – Campus Interior (8:30 AM - 6:00 PM)',
        desc: 'Daytime multi-coach buggy train: Unipolis → Block 1 → Library → CSE → ECE → Uni-Mall (Academic quad only; off-duty at night)',
        codes: ['STP-UNIP', 'STP-BLK1', 'STP-LIB', 'STP-CSE', 'STP-B38', 'STP-MALL', 'STP-UNIP'],
        dur: 10,
        color: '#0284c7',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      },
    ];

    const routes = [];
    for (const r of routeDefs) {
      const stopIds = r.codes.map((c) => byCode(c)?._id).filter(Boolean);
      routes.push(await Route.create({
        routeName: r.name,
        routeNumber: r.num,
        description: r.desc,
        stops: stopIds,
        estimatedDuration: r.dur,
        active: true,
        operatingDays: r.days,
        color: r.color,
      }));
    }
    console.log(`[Seed] Created ${routes.length} LPU routes.`);

    // ─── 4. SHUTTLES FLEET — 48 vehicles ─────────────────────
    // Categories:
    // • Large AC Buses (50 pax) - 15 vehicles
    // • Mini Buses (35 pax) - 12 vehicles
    // • Electric Buggy Trains (8 pax) - 6 vehicles (Daytime only 08:30-18:00)
    // • E-Rickshaws (6 pax) - 11 vehicles
    // • Night Safety Buses (50 pax) - 4 vehicles (Night 20:00-23:00)
    const shuttleRows = [
      // ── Large AC Buses (50 pax) — Routes LPU-01, 02, 03, 04, 10
      ['LPU-Shuttle-101', 'PB-08-LP-1001', 0, 0, 50, 38, 'ACTIVE', 31.2538, 75.7035],
      ['LPU-Shuttle-102', 'PB-08-LP-1002', 1, 1, 50, 44, 'ACTIVE', 31.2520, 75.7022],
      ['LPU-Shuttle-103', 'PB-08-LP-1003', 2, 2, 50, 20, 'ACTIVE', 31.2503, 75.7063],
      ['LPU-Shuttle-104', 'PB-08-LP-1004', 3, 3, 50, 30, 'ACTIVE', 31.2568, 75.7040],
      ['LPU-Shuttle-105', 'PB-08-LP-1005', 4, 4, 50, 5,  'ACTIVE', 31.2558, 75.7033],
      ['LPU-Shuttle-106', 'PB-08-LP-1006', 5, 5, 50, 42, 'ACTIVE', 31.2478, 75.7080],
      ['LPU-Shuttle-107', 'PB-08-LP-1007', 6, 6, 50, 33, 'ACTIVE', 31.2483, 75.7038],
      ['LPU-Shuttle-108', 'PB-08-LP-1008', 7, 7, 50, 18, 'ACTIVE', 31.2575, 75.7047],
      ['LPU-Shuttle-109', 'PB-08-LP-1009', 8, 8, 50, 25, 'ACTIVE', 31.2543, 75.7026],
      ['LPU-Shuttle-110', 'PB-08-LP-1010', 9, 9, 50, 40, 'ACTIVE', 31.2558, 75.7033],
      ['LPU-Shuttle-111', 'PB-08-LP-1011', 10, 0, 50, 10, 'ACTIVE', 31.2533, 75.7028],
      ['LPU-Shuttle-112', 'PB-08-LP-1012', 11, 1, 50, 28, 'ACTIVE', 31.2545, 75.7040],
      ['LPU-Shuttle-113', 'PB-08-LP-1013', 12, 2, 50, 16, 'DELAYED', 31.2510, 75.7050],
      ['LPU-Shuttle-114', 'PB-08-LP-1014', 13, 3, 50, 48, 'ACTIVE', 31.2578, 75.7047],
      ['LPU-Shuttle-115', 'PB-08-LP-1015', 14, 4, 50, 0,  'INACTIVE', 31.2540, 75.7015],

      // ── Mini Buses (35 pax) — Mixed & Feeder routes
      ['LPU-Mini-201', 'PB-08-LM-2001', 0, 5, 35, 22, 'ACTIVE', 31.2466, 75.7086],
      ['LPU-Mini-202', 'PB-08-LM-2002', 1, 6, 35, 35, 'ACTIVE', 31.2490, 75.7072],
      ['LPU-Mini-203', 'PB-08-LM-2003', 2, 7, 35, 10, 'ACTIVE', 31.2585, 75.7054],
      ['LPU-Mini-204', 'PB-08-LM-2004', 3, 8, 35, 17, 'ACTIVE', 31.2550, 75.7018],
      ['LPU-Mini-205', 'PB-08-LM-2005', 4, 9, 35, 30, 'ACTIVE', 31.2560, 75.7035],
      ['LPU-Mini-206', 'PB-08-LM-2006', 5, 0, 35, 15, 'ACTIVE', 31.2525, 75.7055],
      ['LPU-Mini-207', 'PB-08-LM-2007', 6, 1, 35, 8,  'ACTIVE', 31.2530, 75.7042],
      ['LPU-Mini-208', 'PB-08-LM-2008', 7, 2, 35, 28, 'DELAYED', 31.2503, 75.7060],
      ['LPU-Mini-209', 'PB-08-LM-2009', 8, 3, 35, 34, 'ACTIVE', 31.2568, 75.7047],
      ['LPU-Mini-210', 'PB-08-LM-2010', 9, 4, 35, 0,  'INACTIVE', 31.2540, 75.7015],
      ['LPU-Mini-211', 'PB-08-LM-2011', 10, 5, 35, 20, 'ACTIVE', 31.2458, 75.7090],
      ['LPU-Mini-212', 'PB-08-LM-2012', 11, 6, 35, 12, 'ACTIVE', 31.2442, 75.7100],

      // ── Electric Buggy Trains (8 pax) — LPU-11 Academic Quad (08:30 AM - 06:00 PM)
      // Note: In evening / night (after 18:00), these are parked & OFF_DUTY
      ['LPU-BuggyTrain-501', 'PB-08-BT-5001', 12, 10, 8, 0, 'OFF_DUTY', 31.2540, 75.7015],
      ['LPU-BuggyTrain-502', 'PB-08-BT-5002', 13, 10, 8, 0, 'OFF_DUTY', 31.2540, 75.7015],
      ['LPU-BuggyTrain-503', 'PB-08-BT-5003', 14, 10, 8, 0, 'OFF_DUTY', 31.2540, 75.7015],
      ['LPU-BuggyTrain-504', 'PB-08-BT-5004', 15, 10, 8, 0, 'OFF_DUTY', 31.2540, 75.7015],
      ['LPU-BuggyTrain-505', 'PB-08-BT-5005', 16, 10, 8, 0, 'OFF_DUTY', 31.2540, 75.7015],
      ['LPU-BuggyTrain-506', 'PB-08-BT-5006', 17, 10, 8, 0, 'OFF_DUTY', 31.2540, 75.7015],

      // ── E-Rickshaws (6 pax) — Hostel hops (06:30 AM - 10:00 PM)
      ['LPU-ERick-301', 'PB-08-ER-3001', 0, 2, 6, 6, 'ACTIVE', 31.2503, 75.7063],
      ['LPU-ERick-302', 'PB-08-ER-3002', 1, 3, 6, 4, 'ACTIVE', 31.2568, 75.7040],
      ['LPU-ERick-303', 'PB-08-ER-3003', 2, 5, 6, 5, 'ACTIVE', 31.2466, 75.7086],
      ['LPU-ERick-304', 'PB-08-ER-3004', 3, 6, 6, 3, 'ACTIVE', 31.2490, 75.7072],
      ['LPU-ERick-305', 'PB-08-ER-3005', 4, 7, 6, 6, 'ACTIVE', 31.2585, 75.7054],
      ['LPU-ERick-306', 'PB-08-ER-3006', 5, 0, 6, 2, 'ACTIVE', 31.2538, 75.7035],
      ['LPU-ERick-307', 'PB-08-ER-3007', 6, 1, 6, 5, 'ACTIVE', 31.2520, 75.7022],
      ['LPU-ERick-308', 'PB-08-ER-3008', 7, 2, 6, 4, 'ACTIVE', 31.2510, 75.7068],
      ['LPU-ERick-309', 'PB-08-ER-3009', 8, 3, 6, 0, 'INACTIVE', 31.2540, 75.7015],
      ['LPU-ERick-310', 'PB-08-ER-3010', 9, 4, 6, 6, 'ACTIVE', 31.2558, 75.7033],
      ['LPU-ERick-311', 'PB-08-ER-3011', 10, 5, 6, 3, 'ACTIVE', 31.2478, 75.7080],

      // ── Night Safety Buses (50 pax) — LPU-05 (08:00 PM - 11:00 PM)
      ['LPU-Night-401', 'PB-08-LN-4001', 12, 4, 50, 0, 'INACTIVE', 31.2540, 75.7015],
      ['LPU-Night-402', 'PB-08-LN-4002', 13, 4, 50, 0, 'INACTIVE', 31.2541, 75.7015],
      ['LPU-Night-403', 'PB-08-LN-4003', 14, 4, 50, 0, 'INACTIVE', 31.2542, 75.7015],
      ['LPU-Night-404', 'PB-08-LN-4004', 15, 9, 50, 0, 'INACTIVE', 31.2543, 75.7015],
    ];

    const shuttles = [];
    for (const r of shuttleRows) {
      const [num, reg, drvIdx, ri, cap, pax, status, lat, lng] = r;
      shuttles.push(await Shuttle.create({
        shuttleNumber: num,
        registrationNumber: reg,
        driver: drivers[drvIdx % drivers.length]._id,
        assignedRoute: routes[ri % routes.length]._id,
        capacity: cap,
        currentPassengerCount: pax,
        status,
        currentLocation: {
          latitude: lat,
          longitude: lng,
          speed: status === 'INACTIVE' || status === 'OFF_DUTY' ? 0 : Math.floor(Math.random() * 18) + 10,
          heading: Math.floor(Math.random() * 360),
          lastUpdated: new Date(),
        },
      }));
    }
    console.log(`[Seed] Created ${shuttles.length} LPU vehicles.`);

    // ─── 5. TRIPS ────────────────────────────────────────────
    const now = Date.now();
    const trips = [];

    const active = shuttles.filter((s) => s.status === 'ACTIVE').slice(0, 15);
    for (let i = 0; i < active.length; i++) {
      const sh = active[i];
      trips.push(await Trip.create({
        route: sh.assignedRoute,
        shuttle: sh._id,
        driver: sh.driver,
        startTime: new Date(now - (i + 3) * 60000),
        expectedEndTime: new Date(now + (20 - i) * 60000),
        actualStartTime: new Date(now - (i + 3) * 60000),
        status: 'IN_PROGRESS',
        currentStop: stops[i % stops.length]._id,
        passengerCount: sh.currentPassengerCount,
      }));
    }
    for (let i = 1; i <= 20; i++) {
      trips.push(await Trip.create({
        route: routes[i % routes.length]._id,
        shuttle: shuttles[(i + 5) % shuttles.length]._id,
        driver: drivers[i % drivers.length]._id,
        startTime: new Date(now + i * 20 * 60000),
        expectedEndTime: new Date(now + (i * 20 + 25) * 60000),
        status: 'SCHEDULED',
        passengerCount: 0,
      }));
    }
    for (let i = 1; i <= 15; i++) {
      const s = new Date(now - (i * 90 + 30) * 60000);
      const e = new Date(s.getTime() + 22 * 60000);
      trips.push(await Trip.create({
        route: routes[(i + 2) % routes.length]._id,
        shuttle: shuttles[(i + 3) % shuttles.length]._id,
        driver: drivers[i % drivers.length]._id,
        startTime: s,
        expectedEndTime: e,
        actualStartTime: s,
        actualEndTime: e,
        status: 'COMPLETED',
        passengerCount: Math.floor(Math.random() * 35) + 10,
      }));
    }
    console.log(`[Seed] Created ${trips.length} trips.`);

    // ─── 6. NOTIFICATIONS ────────────────────────────────────
    await Notification.create([
      {
        title: 'LPU Transit Schedule Notice: Campus Buggy Train',
        message: 'The Electric Buggy Train runs between 08:30 AM and 06:00 PM during class hours. For evening commute, please use regular AC Shuttles or E-Rickshaws.',
        type: 'info',
      },
      {
        title: 'New Boys Hostel Stops Added: BH-10, 11 & 12',
        message: 'Transit route LPU-03 & LPU-06 now include dedicated pickup bays at new South Campus hostel towers BH-10, BH-11, and BH-12.',
        type: 'info',
      },
      {
        title: 'Night Safety Shuttles Active (08:00 PM - 11:00 PM)',
        message: 'Safe perimeter shuttles connect all hostel blocks, Uni-Hospital, and Gate 1 every 15 minutes with campus security escort.',
        type: 'alert',
      },
    ]);
    console.log('[Seed] Created default notifications.');

    console.log('\n==================================================');
    console.log('  LPU CAMPUS TRANSIT DATABASE SEEDED SUCCESSFULLY');
    console.log('==================================================\n');
  } catch (err) {
    console.error('[Seed] Error during seeding:', err);
  } finally {
    await mongoose.disconnect();
    console.log('[Seed] Disconnected.');
  }
}

seedDatabase();
