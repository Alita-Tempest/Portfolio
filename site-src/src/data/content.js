// Site copy. Experience, summary, publication and education follow CV.pdf (Sep 2026);
// capability lists are generated from C:\LocalLLM\jobs\profile.json (core + extras)
// by jobs/_gen_caps.py - the CV prints the core subset, the site shows the full set.

export const person = {
  name: 'Kotupalli Venkata Siva Teja',
  short: 'K. V. Siva Teja',
  role: 'IoT Embedded Hardware & PCB Design Engineer',
  location: 'Guntur, Andhra Pradesh, India',
  email: 'k.v.shivateja06@outlook.com',
  phone: '+91 89771 22533',
  linkedin: { label: 'in/kvsivateja2706', href: 'https://linkedin.com/in/kvsivateja2706' },
  github: { label: 'Alita-Tempest', href: 'https://github.com/Alita-Tempest' },
  summary:
    'Embedded hardware and PCB design engineer who takes boards from schematic and layout through ' +
    'bring-up, and systems from sensor to dashboard. Designs 2- and 4-layer PCBs in Altium Designer, ' +
    'EasyEDA and KiCad — impedance-controlled routing, RF and mixed-signal layout, and solar, battery ' +
    'and protection power paths — and writes the ESP32-S3 firmware in C / C++ that runs on them over ' +
    'UART, I²C, SPI, RS-485 (Modbus-RTU) and LoRa.',
};

export const stats = [
  { n: 12, label: 'Boards designed', sub: '2- and 4-layer' },
  { n: 4, label: 'Copper layers', sub: 'on the current node' },
  { n: 194, label: 'Parts placed', sub: 'AgroSense rev 3' },
];

export const disciplines = [
  {
    n: '01', h: 'PCB design',
    p: 'Schematic capture, 2- and 4-layer layout, impedance control, RF and mixed-signal partitioning, power-path design, DFM and manufacturing hand-off.',
  },
  {
    n: '02', h: 'Hardware design',
    p: 'Analogue and digital circuit design — regulator topology and part selection, protection and filtering, thermal management — then bench bring-up, functional testing and system-level fault diagnosis.',
  },
  {
    n: '03', h: 'Embedded firmware',
    p: 'Embedded C on ESP32-S3 under ESP-IDF and FreeRTOS. USB host, peripheral bring-up, low-power scheduling, sensor and display drivers.',
  },
  {
    n: '04', h: 'Field protocols',
    p: 'LoRa links with matched front ends, Modbus-RTU over RS-485, plus the usual board-level buses — UART, SPI, I²C, I²S and CAN.',
  },
  {
    n: '05', h: 'Digital / VLSI',
    p: 'Verilog RTL, synthesis and static timing, place-and-route through to GDSII, and FPGA work in Vivado. Real training, but boards are what I do.',
  },
];

export const experience = [
  {
    from: 'Mar 2026', to: 'Present', current: true,
    role: 'Embedded Electronics Engineer & PCB Designer',
    org: 'Dletabotix Private Limited',
    where: 'Guntur, India',
    points: [
      'Design <b>schematics and cost-optimised 2-layer PCBs</b> for educational robotics kits — microcontroller boards, motor-driver modules, sensor breakouts and power management — built for low-cost manufacture, student-friendly through-hole and SMD assembly and clear silkscreen for classroom handling.',
      'Delivered a <b>multi-function robotics controller board</b>: an Arduino Nano carrier with dual H-bridge drivers across four motor channels, keyed connectors for ultrasonic, IR, light and RGB modules, switching regulators, and a two-cell Li-ion charger with protection, USB-C and barrel-jack inputs.',
      'Built an <b>ESP32-S3 USB-host programmer for BBC micro:bit boards</b>: a custom PCB with Li-ion charging and a switched 5 V rail that powers the target, plus a TFT and button interface and firmware that mounts the micro:bit’s USB drive and flashes .hex files over Wi-Fi or from on-board storage — no PC needed.',
      'Bringing up an <b>ESP32-S3 robotics main control board</b> (camera, audio codec, TFT display, I/O expander, microSD) one subsystem at a time; traced a camera that returned no frames to stuck data lines at its flex connector, and resolved an I²C port conflict between the camera driver and the I/O expander.',
      'Defined the <b>two-board architecture for a classroom humanoid robot</b>: an ESP32-S3 main controller and an ESP32-C6 motion companion for encoder motors and servos, joined by a CRC-checked link with a motor fail-safe, OTA updates over a classroom network, and a battery sized from a stall-current budget.',
      'Perform <b>first-article bring-up and signal-level debug</b> with DSO, logic analyser and multimeter — rail validation, UART, I²C and SPI checks, current-draw characterisation, isolating shorts, regulator instability and brown-outs — and document failure modes and recovery steps for production handover.',
    ],
    tags: ['EasyEDA', '2-layer PCB', 'ESP32-S3', 'USB host', 'Li-ion charging', 'H-bridge drive', 'Board bring-up', 'DSO / logic analyser', 'DFM'],
  },
  {
    from: 'Sep 2025', to: 'Mar 2026',
    role: 'PCB Design Intern',
    org: 'Unnova Systems Pvt Ltd — Grid OS',
    where: 'On-site · Noida, Uttar Pradesh',
    points: [
      'Adopted <b>Altium Designer</b> as the primary EDA tool, setting up hierarchical schematics, parameterised symbols and footprints, layer-stack definitions and rule-driven PCB design flows.',
      'Designed <b>2- and 4-layer PCBs</b> for LTE telematics units, OBD trackers and cellular sound-box devices, integrating LTE, GSM, GNSS, Wi-Fi and Bluetooth modules with antenna keepouts, ground fencing and board-level shielding for EMC.',
      'Implemented <b>impedance-controlled routing</b> (50 Ω single-ended / 90 Ω differential), differential-pair tuning, length matching and via stitching for high-speed USB and RF lines, choosing stripline or microstrip to limit insertion loss and crosstalk.',
      'Designed the <b>GNSS receiver front-end</b> for OBD variants — active-antenna LNA bias, RF feed-point matching and antenna keepout to protect radiation efficiency and receive sensitivity.',
      'Laid out <b>switching regulators and audio codec circuits</b> with careful bulk / HF decoupling, thermal vias, ferrite beads and RC and Pi filtering to keep power-rail noise out of the RF and audio paths.',
      'Released <b>manufacturing deliverables</b> — Gerber X2, NC drill, test-point map, impedance profile and BOM — after DRC, DFM and DFA rule checks.',
    ],
    tags: ['Altium Designer', '4-layer PCB', 'Impedance control', 'GNSS / LTE', 'RF matching', 'EMC', 'Gerber X2', 'DFM / DFA'],
  },
  {
    from: '2018', to: '2022',
    role: 'Electronics Hardware Designer',
    org: 'Amigos Embedded',
    where: 'Guntur, India',
    points: [
      'Designed and prototyped <b>embedded electronics and single-layer PCBs</b> for STEM education and experimental IoT and microcontroller projects, covering circuit design, component selection, assembly and debugging.',
      'Ran <b>hands-on electronics workshops</b> that built practical embedded-systems and hardware skills.',
    ],
    tags: ['Prototyping', 'Single-layer PCB', 'STEM education', 'Workshops'],
  },
];

export const publication = {
  title: 'AgroSense ARIA: An Edge-AI Farming Operating System over a Self-Healing LoRa Mesh for Smallholder Agriculture',
  authors: 'Kotupalli Venkata Siva Teja, R. V. H. Prasad',
  venue: '4th International Conference on Intelligent Cyber Physical Systems and Internet of Things (ICoICI 2026), IEEE',
  where: 'Coimbatore, India',
  when: 'Sep 2026',
  note: 'First author',
};

export const education = [
  {
    from: 'Jan 2024', to: 'Jul 2026',
    degree: 'M.Tech — VLSI Design & Embedded Systems',
    org: 'Siddhartha Academy of Higher Education · V R S School of Engineering, Vijayawada',
    result: 'CGPA 7.58 / 10',
    tags: ['Semiconductor fabrication & packaging', 'FPGA & ML in VLSI', 'Cadence Virtuoso', 'Vivado', 'Capstone: AgroSense 1.0', 'Capstone: AgroSense 2.0'],
  },
  {
    from: 'Jan 2014', to: 'Dec 2018',
    degree: 'B.Tech — Electronics & Communication Engineering',
    org: 'Kalinga University, Raipur',
    result: '65 %',
    tags: ['Xilinx ISE 14.7', 'NI Circuit Design Suite', 'Final year: Network Rover', 'Night Vision Rover', 'Home Automation'],
  },
  {
    from: 'Jun 2012', to: 'Mar 2014',
    degree: 'Intermediate — MPC',
    org: 'Jupiter Junior College, Guntur',
    result: '70.1 %', tags: [],
  },
  {
    from: '', to: 'Mar 2012',
    degree: 'SSC',
    org: 'The Central Public School, Guntur',
    result: '8.7 GPA', tags: [],
  },
];

export const certifications = [
  { h: 'VLSI Design Flow — RTL to GDSII', org: 'NIELIT Centre of Excellence, Noida', when: 'Jul – Aug 2025' },
  { h: 'FPGA-Accelerated Machine Learning in VLSI', org: 'E&ICT', when: 'Feb 2025' },
  { h: 'Semiconductor Fabrication & Packaging Technology', org: 'E&ICT, under MeitY', when: 'Jan 2025' },
  { h: 'PCB Design Internship', org: 'Unnova Systems · Grid OS', when: '2025 – 2026' },
  { h: 'PCB Design Apprenticeship', org: 'Unnova Systems · Grid OS', when: '2025' },
  { h: 'AutoCAD 2015 — Certified User', org: 'Autodesk', when: '2015' },
  { h: 'Campus Ambassador Programme', org: 'IIT Delhi', when: '2018 – 2019' },
  { h: 'TCS iON Qualifier', org: 'Tata Consultancy Services', when: '2018' },
];

// core = bold in the CV
export const capabilities = [
  {
    h: 'PCB design',
    items: [
      ['Altium Designer', 1], ['EasyEDA', 0], ['KiCad', 0], ['Schematic capture', 0],
      ['2 / 4-layer PCB layout', 1], ['Impedance-controlled routing', 1],
      ['Differential pairs & length matching', 0], ['High-speed USB routing', 0],
      ['RF & mixed-signal layout', 1], ['Stackup design', 0], ['Power integrity', 0], ['DFM / DFA', 0],
      ['EMC-aware layout', 0], ['BOM & library management', 0], ['Antenna matching', 0],
      ['Component selection', 0]
    ],
  },
  {
    h: 'Power & protection',
    items: [
      ['Solar MPPT & Li-ion charging', 1], ['Power-path & load switching', 1],
      ['Buck, Boost & LDO regulators', 0], ['Current & power monitoring', 0],
      ['Overvoltage & undervoltage protection', 0], ['ESD & surge protection', 0],
      ['H-bridge motor drivers', 0], ['Reverse-polarity protection', 0],
      ['Power & thermal budgeting', 0]
    ],
  },
  {
    h: 'Embedded firmware',
    items: [
      ['ESP32-S3', 1], ['STM32', 0], ['Embedded C / C++', 1], ['Python', 0], ['ESP-IDF', 1],
      ['FreeRTOS', 0], ['Arduino', 0], ['USB host', 0], ['Sensor & peripheral drivers', 0],
      ['Low-power design', 0], ['Bootloaders & OTA updates', 0], ['AVR', 0], ['Raspberry Pi', 0],
      ['AES-128 encryption', 0], ['STM32CubeIDE', 0]
    ],
  },
  {
    h: 'Interfaces & protocols',
    items: [
      ['LoRa & mesh networking', 1], ['RS-485 / Modbus-RTU', 1], ['UART', 0], ['SPI', 0], ['I²C', 0],
      ['I²S', 0], ['USB', 0], ['CAN', 0], ['Wi-Fi', 0], ['BLE', 0], ['MQTT', 0], ['LTE / GSM', 0],
      ['GNSS', 0], ['RS-232', 0], ['REST APIs', 0], ['Ethernet', 0], ['TDMA scheduling', 0]
    ],
  },
  {
    h: 'Bring-up & test',
    items: [
      ['Board bring-up', 1], ['DSO & logic analyzer', 1], ['Fault isolation & debugging', 0],
      ['Signal integrity', 0], ['Functional & environmental testing', 0],
      ['Gerber, BOM & assembly outputs', 0], ['IPC-2221 / IPC-7351', 0], ['Multimeter', 0],
      ['Diagnostic test firmware', 0], ['IPC-A-610', 0], ['Design reviews', 0], ['Documentation', 0]
    ],
  },
  {
    h: 'VLSI & edge AI',
    items: [
      ['Verilog', 0], ['RTL-to-GDSII flow', 0], ['Static timing analysis', 0], ['Cadence Virtuoso', 0],
      ['Xilinx Vivado', 0], ['scikit-learn', 0], ['TensorFlow Lite', 0], ['LLM integration', 0],
      ['Yosys, Qrouter & Magic', 0], ['Flask', 0]
    ],
  },
  {
    h: 'Sensors & RF',
    items: [
      ['GNSS receiver front-end', 1], ['LNA bias networks', 0], ['Antenna matching', 1],
      ['U.FL / PCB antenna launch', 0], ['LTE / GSM modules', 0], ['IMU / accelerometer', 0],
      ['Environmental sensors', 0], ['Soil & NPK probes (RS-485)', 0],
      ['RTC with coin-cell backup', 0], ['microSD (SPI)', 0], ['Audio codecs & I²S amplifiers', 0],
      ['ADC / DAC', 0]
    ],
  },
  {
    h: 'AI & tooling',
    items: [
      ['Claude API (Anthropic SDK)', 1], ['Claude Code CLI integration', 0],
      ['LLM tool routing & function calling', 0], ['MCP tool servers', 1], ['3-tier LLM cascade', 0],
      ['Ollama / local LLMs', 0], ['System-prompt design', 0], ['Voice I/O (Vosk STT, Edge-TTS)', 0],
      ['Edge model deployment (TensorFlow Lite)', 1]
    ],
  },
];

// slug -> filter categories for the work grid
export const projectFilters = {
  'agrosense-aria': ['firmware', 'iot'],
  'agrosense-3': ['pcb', 'firmware'],
  'agrosense-2': ['pcb'],
  'agrosense-1': ['pcb'],
  'dletabotix': ['pcb', 'firmware', 'employer'],
  'grid-os': ['pcb', 'employer'],
  'alu-32bit': ['vlsi'],
  'arduino-nano-12v': ['pcb'],
  'network-rover': ['robotics', 'iot'],
  'night-vision-rover': ['robotics'],
  'bluetooth-rover': ['robotics'],
  'home-automation': ['iot'],
  'vacuum-robot': ['robotics'],
  'colophon': ['web'],
};

export const filters = [
  ['all', 'All'], ['pcb', 'PCB design'], ['firmware', 'Firmware'], ['iot', 'IoT'],
  ['robotics', 'Robotics'], ['vlsi', 'VLSI'], ['employer', 'Employer work'], ['web', 'Web'],
];

// extra detail from the current CV that the old case studies predate
export const projectExtras = {
  'agrosense-aria': [
    'Seven on-device ML models with rule-based fallbacks: crop recommendation at 99.5 % across 22 classes, an FAO-56 evapotranspiration engine matching an independent reference at R² 0.97, disease detection, yield, fertiliser scheduling, and anomaly detection raised from F1 0.42 to 0.96.',
    'A 3-tier LLM cascade (cloud → CLI → local model) with speech in and out for an English / Hindi / Telugu farmer assistant, plus a safety-gated four-level autonomy controller for pump automation with audit logging and 60 s undo.',
    '~9,400-line ESP32-S3 node firmware — environmental, IMU, soil-moisture and Modbus-RTU NPK sensors, fall and tilt detection, RTC-alarm deep sleep — ported to each board revision, with a Python desktop flasher that sets each node’s role, ID and channel at build time.',
    'A four-node outdoor deployment held about 30 dB of link margin.',
  ],
  'agrosense-3': [
    'The latest revision is being taken from prototype toward a field-ready product in Altium Designer: an input over-voltage disconnect, a hardware battery under-voltage cutoff that still lets the pack charge, load switches that remove sleep leakage through the boost rails, and solar and battery power monitoring.',
    'Backed with worst-case calculations for every protection threshold, charge current, timing margin and thermal hotspot, plus a full netlist-vs-BOM audit that caught a MOSFET whose gate threshold would have nuisance-tripped battery protection on a low pack.',
  ],
};
